# =============================================================================
# agent.py — Kore Deck — Agent PC v2.0 — Bridge WebSocket UI
# =============================================================================

import argparse, json, signal, sys, time, threading
from config          import config
from logger          import log, setup_logger
from serial_manager  import SerialManager
from system_monitor  import SystemMonitor
from spotify_monitor import SpotifyMonitor
from audio_manager   import AudioManager
from pomodoro        import PomodoroTimer
from action_executor import ActionExecutor
from ws_bridge       import WebSocketBridge


class KoreDeckAgent:
    def __init__(self) -> None:
        self._system    = SystemMonitor()
        self._spotify   = SpotifyMonitor()
        self._audio     = AudioManager()
        self._pomodoro  = PomodoroTimer()
        self._executor  = ActionExecutor(self._audio, self._pomodoro)
        self._serial    = SerialManager(on_line_received=self._on_line_received)
        self._bridge    = WebSocketBridge()
        self._bridge.on_config_update = self._on_config_update
        self._bridge.on_action        = self._on_ui_action
        self._current_category : int  = 0
        self._dnd_active       : bool = False
        self._obs_active       : bool = False
        self._last_send_time    = self._last_spotify_time = 0.0
        self._last_fps_time     = self._last_ws_push_time = 0.0
        self._cached_track : str = "Aucune lecture"
        self._cached_fps   : int = 0
        self._running    : bool = False
        self._stop_event = threading.Event()

    def start(self) -> None:
        log.info("=" * 60)
        log.info("Kore Deck — Agent PC v2.0")
        log.info(f"Port : {config.serial.port} | WS : ws://localhost:8765")
        log.info("=" * 60)
        self._bridge.start()
        self._serial.start()
        self._running = True
        self._bridge.send_agent_status("running")
        try:
            self._main_loop()
        except KeyboardInterrupt:
            log.info("Arrêt Ctrl+C")
        finally:
            self.stop()

    def stop(self) -> None:
        self._running = False
        self._bridge.send_agent_status("stopped")
        self._bridge.send_connection_status("disconnected")
        self._serial.stop()
        self._bridge.stop()
        log.info("Agent arrêté")

    def _main_loop(self) -> None:
        while self._running and not self._stop_event.is_set():
            now = time.monotonic()
            self._pomodoro.update()

            if now - self._last_spotify_time >= config.timing.spotify_interval:
                self._last_spotify_time = now
                self._cached_track = self._spotify.get_current_track()

            if now - self._last_fps_time >= config.timing.fps_interval:
                self._last_fps_time = now
                self._cached_fps = self._system.get_fps()

            if now - self._last_send_time >= config.timing.send_interval:
                self._last_send_time = now
                if self._serial.is_connected():
                    self._send_system_frame()
                    self._bridge.send_connection_status("connected")
                else:
                    self._bridge.send_connection_status("disconnected")

            if now - self._last_ws_push_time >= 0.2:
                self._last_ws_push_time = now
                if self._bridge.get_client_count() > 0:
                    self._push_stats_to_ui()

            time.sleep(0.005)

    def _push_stats_to_ui(self) -> None:
        cpu  = self._system.get_cpu_usage()
        ram  = self._system.get_ram_usage()
        mins, secs = self._pomodoro.get_remaining()
        sess = self._pomodoro.get_session_count()
        track = self._cached_track
        artist = ""
        if " - " in track:
            parts = track.split(" - ", 1)
            artist, track = parts[0], parts[1]
        self._bridge.send_stats({
            "cpu": cpu, "ram": ram, "fps": self._cached_fps,
            "mic": self._audio.is_mic_muted(),
            "dnd": self._dnd_active, "obs": self._obs_active,
            "track": f"{artist} - {track}" if artist else track,
            "pomo": {"min": mins, "sec": secs, "session": sess,
                     "running": self._pomodoro.is_running()},
        })

    def _send_system_frame(self) -> None:
        cpu  = self._system.get_cpu_usage()
        ram  = self._system.get_ram_usage()
        mins, secs = self._pomodoro.get_remaining()
        sess = self._pomodoro.get_session_count()
        frame = (f"CPU:{cpu}|RAM:{ram:.1f}|TRACK:{self._cached_track}"
                 f"|FPS:{self._cached_fps}"
                 f"|MIC:{1 if self._audio.is_mic_muted() else 0}"
                 f"|DND:{1 if self._dnd_active else 0}"
                 f"|OBS:{1 if self._obs_active else 0}"
                 f"|POMO:{mins}:{secs}:{sess}")
        self._serial.send(frame)

    def _on_line_received(self, line: str) -> None:
        log.debug(f"← ESP32 : {line}")
        if line.startswith("ACTION:"):
            self._executor.execute_action(line[7:])
        elif line.startswith("POT:"):
            parts = line[4:].split(":")
            if len(parts) == 2:
                try: self._executor.execute_pot(parts[0], int(parts[1]))
                except ValueError: pass
        elif line.startswith("CAT:"):
            try: self._current_category = int(line[4:])
            except ValueError: pass
        elif line == "READY":
            log.info("ESP32 prêt")
            self._bridge.send_connection_status("connected")
        elif line == "PING":
            pass

    def _on_config_update(self, data: dict) -> None:
        log.info(f"Hot-reload config depuis UI")

    def _on_ui_action(self, action: str) -> None:
        log.info(f"Action UI : {action}")
        self._executor.execute_action(action)


def main() -> None:
    parser = argparse.ArgumentParser(description="Kore Deck — Agent PC v2.0")
    parser.add_argument("--port",  type=str, default=None)
    parser.add_argument("--debug", action="store_true")
    args = parser.parse_args()
    if args.port:  config.serial.port = args.port
    if args.debug: setup_logger(level="DEBUG")

    agent = KoreDeckAgent()
    def _sig(sig, frame):
        agent.stop(); sys.exit(0)
    signal.signal(signal.SIGINT, _sig)
    signal.signal(signal.SIGTERM, _sig)
    agent.start()

if __name__ == "__main__":
    main()

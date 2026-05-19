# =============================================================================
# ws_bridge.py — Pont entre l'interface Tauri (App) et l'agent Python (Software)
#
# L'interface Tauri se connecte sur ws://localhost:8765
# Le bridge reçoit les stats de l'agent et les pousse vers l'UI en JSON.
# Il reçoit aussi les commandes UI (config_update, action) et les dispatche.
#
# Format messages → UI  : { "type": "stats",      "payload": {...} }
#                          { "type": "connection", "payload": "connected"|"disconnected" }
#                          { "type": "agent",      "payload": "running"|"stopped" }
#
# Format messages ← UI  : { "type": "config_update", "data": {...} }
#                          { "type": "action",         "action": "MEDIA_PLAY" }
#                          { "type": "hello",          "version": "2.0" }
# =============================================================================

import asyncio
import json
import logging
import threading
from typing import Set, Optional, Callable

import websockets
from websockets.server import WebSocketServerProtocol

log = logging.getLogger("ws_bridge")

WS_HOST = "localhost"
WS_PORT = 8765


class WebSocketBridge:
    """
    Serveur WebSocket local exposé à l'interface Tauri.
    Gère plusieurs clients simultanés (au cas où).
    Thread-safe via asyncio.
    """

    def __init__(self) -> None:
        self._clients:      Set[WebSocketServerProtocol] = set()
        self._loop:         Optional[asyncio.AbstractEventLoop] = None
        self._server:       Optional[websockets.WebSocketServer] = None
        self._thread:       Optional[threading.Thread] = None

        # Callbacks appelés par le bridge quand l'UI envoie quelque chose
        self.on_config_update: Optional[Callable[[dict], None]] = None
        self.on_action:        Optional[Callable[[str], None]]   = None

    # =========================================================================
    # Cycle de vie
    # =========================================================================

    def start(self) -> None:
        """Démarre le serveur WebSocket dans un thread dédié."""
        self._thread = threading.Thread(
            target=self._run_loop, daemon=True, name="ws-bridge"
        )
        self._thread.start()
        log.info(f"WebSocket bridge démarré sur ws://{WS_HOST}:{WS_PORT}")

    def stop(self) -> None:
        """Arrête le serveur proprement."""
        if self._loop and self._server:
            self._loop.call_soon_threadsafe(self._server.close)
        log.info("WebSocket bridge arrêté")

    # =========================================================================
    # Envoi de données vers l'UI (thread-safe)
    # =========================================================================

    def send_stats(self, stats: dict) -> None:
        """Envoie les stats système à tous les clients connectés."""
        self._broadcast({
            "type":    "stats",
            "payload": stats,
        })

    def send_connection_status(self, status: str) -> None:
        """Envoie le statut de connexion ESP32 à l'UI."""
        self._broadcast({
            "type":    "connection",
            "payload": status,
        })

    def send_agent_status(self, status: str) -> None:
        """Envoie le statut de l'agent Python à l'UI."""
        self._broadcast({
            "type":    "agent",
            "payload": status,
        })

    def get_client_count(self) -> int:
        return len(self._clients)

    # =========================================================================
    # Privé
    # =========================================================================

    def _broadcast(self, message: dict) -> None:
        """Envoie un message JSON à tous les clients connectés."""
        if not self._clients or not self._loop:
            return
        raw = json.dumps(message)
        asyncio.run_coroutine_threadsafe(
            self._broadcast_async(raw), self._loop
        )

    async def _broadcast_async(self, raw: str) -> None:
        """Envoi asyncio à tous les clients."""
        if not self._clients:
            return
        disconnected = set()
        for client in self._clients.copy():
            try:
                await client.send(raw)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)
        self._clients -= disconnected

    async def _handler(self, websocket: WebSocketServerProtocol) -> None:
        """Gère une connexion client."""
        self._clients.add(websocket)
        log.info(f"UI connectée ({len(self._clients)} client(s))")

        # Message de bienvenue
        await websocket.send(json.dumps({
            "type": "agent", "payload": "running"
        }))

        try:
            async for raw in websocket:
                await self._handle_message(raw)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self._clients.discard(websocket)
            log.info(f"UI déconnectée ({len(self._clients)} client(s))")

    async def _handle_message(self, raw: str) -> None:
        """Parse et dispatche un message reçu de l'UI."""
        try:
            msg = json.loads(raw)
            msg_type = msg.get("type")

            if msg_type == "hello":
                log.info(f"UI connectée — version {msg.get('version', '?')}")

            elif msg_type == "config_update":
                if self.on_config_update:
                    self.on_config_update(msg.get("data", {}))

            elif msg_type == "action":
                action = msg.get("action", "")
                if action and self.on_action:
                    self.on_action(action)

            else:
                log.debug(f"Message UI inconnu : {msg_type}")

        except json.JSONDecodeError:
            log.warning(f"Message non-JSON reçu : {raw[:100]}")

    def _run_loop(self) -> None:
        """Boucle asyncio dans le thread dédié."""
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)

        async def _serve():
            async with websockets.serve(
                self._handler, WS_HOST, WS_PORT,
                ping_interval=20,
                ping_timeout=10,
            ) as server:
                self._server = server
                await asyncio.Future()  # Tourne indéfiniment

        try:
            self._loop.run_until_complete(_serve())
        except Exception as e:
            log.error(f"WebSocket bridge erreur : {e}")

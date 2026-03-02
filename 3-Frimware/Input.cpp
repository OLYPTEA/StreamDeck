#include "Input.h"

#include "Config.h"
#include "Dwin.h"
#include "HidActions.h"
#include "State.h"
#include "Ui.h"

void applyPotActions() {
  int z = g_pots[0].percent;
  int delta0 = z - g_lastPotActionValue[0];
  if (abs(delta0) >= 3) {
    uint8_t steps = min<uint8_t>(8, abs(delta0) / 3);
    uint8_t key = (delta0 > 0) ? '=' : '-';
    for (uint8_t i = 0; i < steps; ++i) {
      Keyboard.press(KEY_LEFT_CTRL);
      Keyboard.press(key);
      delay(2);
      Keyboard.releaseAll();
      delay(1);
    }
    g_lastPotActionValue[0] = z;
  }

  int rot = map(g_pots[1].percent, 0, 100, 0, 360);
  if (abs(rot - g_lastPotActionValue[1]) >= 4) {
    Serial.printf("ROT:%d\n", rot);
    g_lastPotActionValue[1] = rot;
  }

  int vol = g_pots[2].percent;
  int delta2 = vol - g_lastPotActionValue[2];
  if (abs(delta2) >= 2) {
    uint8_t steps = min<uint8_t>(8, abs(delta2) / 2);
    sendConsumerRepeat(delta2 > 0 ? HID_USAGE_CONSUMER_VOLUME_INCREMENT : HID_USAGE_CONSUMER_VOLUME_DECREMENT, steps);
    g_lastPotActionValue[2] = vol;
  }

  int bri = g_pots[3].percent;
  int delta3 = bri - g_lastPotActionValue[3];
  if (abs(delta3) >= 3) {
    uint8_t steps = min<uint8_t>(8, abs(delta3) / 3);
    sendConsumerRepeat(delta3 > 0 ? HID_USAGE_CONSUMER_BRIGHTNESS_INCREMENT : HID_USAGE_CONSUMER_BRIGHTNESS_DECREMENT,
                       steps);
    g_lastPotActionValue[3] = bri;
  }
}

void readButtons() {
  const uint32_t now = millis();
  for (uint8_t i = 0; i < 4; ++i) {
    bool raw = (digitalRead(BTN_PINS[i]) == LOW);
    if (raw != g_btns[i].lastRead) {
      g_btns[i].lastRead = raw;
      g_btns[i].lastChangeMs = now;
    }

    if ((now - g_btns[i].lastChangeMs) >= DEBOUNCE_MS && raw != g_btns[i].stable) {
      g_btns[i].stable = raw;
      if (g_btns[i].stable) {
        if (i == 3) {
          goMainMenu();
          continue;
        }

        if (g_uiState == UiState::MODE_ACTIVE) {
          const auto& m = g_macros[static_cast<uint8_t>(g_currentMode)][i];
          sendShortcut(m);
        }
      }
    }
  }
}

void readPots() {
  for (uint8_t i = 0; i < 4; ++i) {
    int raw = analogRead(POT_PINS[i]);
    g_pots[i].raw = raw;
    g_pots[i].filtered = (g_pots[i].filtered * 7 + raw) / 8;
    g_pots[i].percent = map(g_pots[i].filtered, 0, 4095, 0, 100);
    g_pots[i].percent = constrain(g_pots[i].percent, 0, 100);
  }
}

void pushPotValuesToDwin() {
  for (uint8_t i = 0; i < 4; ++i) {
    if (abs(g_pots[i].percent - g_pots[i].lastPercentSent) >= POT_SEND_DELTA) {
      dwinWriteWord(VP::POT_VALUE_BASE + i * 2, static_cast<uint16_t>(g_pots[i].percent));
      g_pots[i].lastPercentSent = g_pots[i].percent;
    }
  }
}

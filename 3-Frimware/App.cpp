#include "App.h"

#include <USB.h>

#include "Config.h"
#include "Dwin.h"
#include "Input.h"
#include "SerialConfig.h"
#include "State.h"
#include "Ui.h"

void setupApp() {
  Serial.begin(115200);
  delay(400);

  USB.begin();
  Keyboard.begin();
  Consumer.begin();

  for (uint8_t i = 0; i < 4; ++i) {
    pinMode(BTN_PINS[i], INPUT_PULLUP);
    g_btns[i].lastRead = (digitalRead(BTN_PINS[i]) == LOW);
    g_btns[i].stable = g_btns[i].lastRead;

    pinMode(POT_PINS[i], INPUT);
    g_pots[i].filtered = analogRead(POT_PINS[i]);
    g_lastPotActionValue[i] = map(g_pots[i].filtered, 0, 4095, 0, 100);
  }

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  DWIN.begin(DWIN_BAUD, SERIAL_8N1, DWIN_RX_PIN, DWIN_TX_PIN);
  delay(200);

  goMainMenu();
  Serial.println("StreamDeck DIY ready");
}

void loopApp() {
  static uint32_t lastPotScan = 0;
  static uint32_t lastUiPush = 0;

  pollDwin();
  handleSerialConfig();
  readButtons();

  const uint32_t now = millis();
  if (now - lastPotScan >= POT_SCAN_MS) {
    lastPotScan = now;
    readPots();

    if (g_uiState == UiState::MODE_ACTIVE) {
      applyPotActions();
    }
  }

  if (now - lastUiPush >= DWIN_REFRESH_MS) {
    lastUiPush = now;
    if (g_uiState == UiState::MODE_ACTIVE) {
      pushPotValuesToDwin();
    }
  }
}

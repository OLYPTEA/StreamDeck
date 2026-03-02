#include "Ui.h"

#include "Dwin.h"
#include "State.h"

const char* modeName(Mode m) {
  switch (m) {
    case Mode::MODE_3D:
      return "3D";
    case Mode::MODE_GAME:
      return "Jeux";
    case Mode::MODE_FOCUS:
      return "Focus";
    default:
      return "Default";
  }
}

const char* potLabelFor(uint8_t idx) {
  switch (idx) {
    case 0:
      return "Zoom 0-100%";
    case 1:
      return "Rotation 0-360";
    case 2:
      return "Volume Win";
    default:
      return "Luminosite";
  }
}

void syncModeScreen() {
  dwinWriteText16(VP::CURRENT_MODE, modeName(g_currentMode));
  for (uint8_t i = 0; i < 4; ++i) {
    dwinWriteText16(VP::POT_LABEL_BASE + i * 0x10, potLabelFor(i));
  }

  const uint8_t m = static_cast<uint8_t>(g_currentMode);
  for (uint8_t b = 0; b < 3; ++b) {
    dwinWriteText16(VP::BTN_LABEL_BASE + b * 0x10, g_macros[m][b].label);
  }
  dwinWriteText16(VP::BTN_LABEL_BASE + 3 * 0x10, "HOME menu");
}

void goMainMenu() {
  g_uiState = UiState::MAIN_MENU;
  dwinSetPage(0x0001);
}

void goModeSelect() {
  g_uiState = UiState::MODE_SELECT;
  dwinSetPage(0x0002);
}

void goModeActive(Mode m) {
  g_currentMode = m;
  g_uiState = UiState::MODE_ACTIVE;
  dwinSetPage(0x0010 + static_cast<uint16_t>(m));
  syncModeScreen();
}

void goAnimationSelect() {
  g_uiState = UiState::ANIMATION_SELECT;
  dwinSetPage(0x0003);
}

void handleMenuTouch(uint16_t value) {
  if (value == 1) {
    goModeSelect();
  } else if (value == 2) {
    goAnimationSelect();
  }
}

void handleModeTouch(uint16_t value) {
  switch (value) {
    case 1:
      goModeActive(Mode::MODE_3D);
      break;
    case 2:
      goModeActive(Mode::MODE_GAME);
      break;
    case 3:
      goModeActive(Mode::MODE_FOCUS);
      break;
    case 4:
      goModeActive(Mode::MODE_DEFAULT);
      break;
    default:
      break;
  }
}

void handleAnimationTouch(uint16_t value) { Serial.printf("ANIM:%u\n", value); }

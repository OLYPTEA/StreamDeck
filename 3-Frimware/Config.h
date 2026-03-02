#pragma once

#include <Arduino.h>

namespace VP {
static constexpr uint16_t PAGE = 0x0084;

static constexpr uint16_t MENU_TOUCH = 0x1000;
static constexpr uint16_t MODE_TOUCH = 0x1010;
static constexpr uint16_t ANIM_TOUCH = 0x1020;

static constexpr uint16_t CURRENT_MODE = 0x1100;
static constexpr uint16_t POT_VALUE_BASE = 0x1200;
static constexpr uint16_t POT_LABEL_BASE = 0x1300;
static constexpr uint16_t BTN_LABEL_BASE = 0x1400;
}  // namespace VP

static constexpr uint8_t BTN_PINS[4] = {9, 10, 15, 16};
static constexpr uint8_t POT_PINS[4] = {4, 5, 6, 7};

static constexpr int DWIN_RX_PIN = 44;
static constexpr int DWIN_TX_PIN = 43;
static constexpr uint32_t DWIN_BAUD = 115200;

static constexpr uint32_t DEBOUNCE_MS = 20;
static constexpr uint32_t POT_SCAN_MS = 8;
static constexpr uint32_t DWIN_REFRESH_MS = 80;
static constexpr int POT_SEND_DELTA = 2;

enum class UiState : uint8_t {
  MAIN_MENU,
  MODE_SELECT,
  MODE_ACTIVE,
  ANIMATION_SELECT,
};

enum class Mode : uint8_t {
  MODE_3D = 0,
  MODE_GAME,
  MODE_FOCUS,
  MODE_DEFAULT,
};

struct Macro {
  uint8_t mod1;
  uint8_t mod2;
  uint8_t mod3;
  uint8_t key;
  const char* label;
};

struct ButtonState {
  bool stable = false;
  bool lastRead = false;
  uint32_t lastChangeMs = 0;
};

struct PotState {
  int raw = 0;
  int filtered = 0;
  int percent = 0;
  int lastPercentSent = -100;
};

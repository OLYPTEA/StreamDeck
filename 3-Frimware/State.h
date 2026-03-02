#pragma once

#include <HardwareSerial.h>
#include <USBHIDConsumerControl.h>
#include <USBHIDKeyboard.h>

#include "Config.h"

extern USBHIDKeyboard Keyboard;
extern USBHIDConsumerControl Consumer;
extern HardwareSerial DWIN;

extern UiState g_uiState;
extern Mode g_currentMode;

extern ButtonState g_btns[4];
extern PotState g_pots[4];
extern int g_lastPotActionValue[4];

extern Macro g_macros[4][3];

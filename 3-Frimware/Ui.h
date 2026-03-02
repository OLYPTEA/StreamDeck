#pragma once

#include "Config.h"

const char* modeName(Mode m);
const char* potLabelFor(uint8_t idx);

void syncModeScreen();

void goMainMenu();
void goModeSelect();
void goModeActive(Mode m);
void goAnimationSelect();

void handleMenuTouch(uint16_t value);
void handleModeTouch(uint16_t value);
void handleAnimationTouch(uint16_t value);

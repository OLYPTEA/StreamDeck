#include "State.h"

USBHIDKeyboard Keyboard;
USBHIDConsumerControl Consumer;
HardwareSerial DWIN(1);

UiState g_uiState = UiState::MAIN_MENU;
Mode g_currentMode = Mode::MODE_DEFAULT;

ButtonState g_btns[4];
PotState g_pots[4];
int g_lastPotActionValue[4] = {0, 0, 0, 0};

Macro g_macros[4][3] = {
    {
        {KEY_LEFT_CTRL, 0, 0, 'z', "Undo"},
        {KEY_LEFT_CTRL, 0, 0, 'c', "Copy"},
        {KEY_LEFT_CTRL, 0, 0, 'n', "Nouveau"},
    },
    {
        {KEY_LEFT_CTRL, 0, 0, 'z', "Ctrl+Z"},
        {KEY_LEFT_CTRL, 0, 0, 'c', "Ctrl+C"},
        {KEY_LEFT_CTRL, 0, 0, 'o', "Ctrl+O"},
    },
    {
        {KEY_LEFT_CTRL, 0, 0, 'z', "Undo"},
        {KEY_LEFT_CTRL, KEY_LEFT_SHIFT, 0, 's', "SaveAs"},
        {KEY_LEFT_CTRL, 0, 0, 'o', "Open"},
    },
    {
        {KEY_LEFT_CTRL, 0, 0, 'z', "Undo"},
        {KEY_LEFT_CTRL, 0, 0, 'c', "Copy"},
        {KEY_LEFT_CTRL, 0, 0, 'v', "Paste"},
    },
};

#include "Dwin.h"

#include <cstring>

#include "Config.h"
#include "State.h"
#include "Ui.h"

void dwinWriteWord(uint16_t vp, uint16_t value) {
  uint8_t frame[8] = {0x5A, 0xA5, 0x05, 0x82, static_cast<uint8_t>(vp >> 8), static_cast<uint8_t>(vp & 0xFF),
                      static_cast<uint8_t>(value >> 8), static_cast<uint8_t>(value & 0xFF)};
  DWIN.write(frame, sizeof(frame));
}

void dwinWriteText16(uint16_t vp, const char* txt) {
  char buf[16];
  memset(buf, ' ', sizeof(buf));
  size_t n = strlen(txt);
  if (n > 16) n = 16;
  memcpy(buf, txt, n);

  uint8_t frame[3 + 1 + 2 + 16] = {0};
  frame[0] = 0x5A;
  frame[1] = 0xA5;
  frame[2] = 0x13;
  frame[3] = 0x82;
  frame[4] = static_cast<uint8_t>(vp >> 8);
  frame[5] = static_cast<uint8_t>(vp & 0xFF);
  memcpy(&frame[6], buf, 16);
  DWIN.write(frame, sizeof(frame));
}

void dwinSetPage(uint16_t pageId) { dwinWriteWord(VP::PAGE, pageId); }

void parseDwinFrame(const uint8_t* f, size_t len) {
  if (len < 8) return;
  if (f[0] != 0x5A || f[1] != 0xA5 || f[3] != 0x83) return;
  uint16_t vp = (uint16_t(f[4]) << 8) | f[5];
  uint16_t value = (uint16_t(f[6]) << 8) | f[7];

  if (vp == VP::MENU_TOUCH)
    handleMenuTouch(value);
  else if (vp == VP::MODE_TOUCH)
    handleModeTouch(value);
  else if (vp == VP::ANIM_TOUCH)
    handleAnimationTouch(value);
}

void pollDwin() {
  static uint8_t buf[64];
  static size_t pos = 0;

  while (DWIN.available()) {
    uint8_t b = DWIN.read();
    if (pos == 0 && b != 0x5A) continue;
    buf[pos++] = b;
    if (pos == 2 && buf[1] != 0xA5) pos = 0;

    if (pos >= 3) {
      uint8_t total = buf[2] + 3;
      if (total > sizeof(buf)) {
        pos = 0;
        continue;
      }
      if (pos >= total) {
        parseDwinFrame(buf, total);
        pos = 0;
      }
    }
  }
}

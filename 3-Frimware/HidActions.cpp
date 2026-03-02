#include "HidActions.h"

#include "State.h"

void sendShortcut(const Macro& m) {
  if (m.mod1) Keyboard.press(m.mod1);
  if (m.mod2) Keyboard.press(m.mod2);
  if (m.mod3) Keyboard.press(m.mod3);
  Keyboard.press(m.key);
  delay(8);
  Keyboard.releaseAll();
}

void sendConsumerRepeat(uint16_t usage, uint8_t count) {
  for (uint8_t i = 0; i < count; ++i) {
    Consumer.press(usage);
    delay(3);
    Consumer.release();
    delay(3);
  }
}

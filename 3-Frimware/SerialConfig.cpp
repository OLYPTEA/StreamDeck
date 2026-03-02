#include "SerialConfig.h"

#include <cstdio>

#include "State.h"
#include "Ui.h"

void handleSerialConfig() {
  if (!Serial.available()) return;
  String line = Serial.readStringUntil('\n');
  line.trim();
  if (!line.startsWith("MACRO")) return;

  int m, b;
  unsigned int mod1, mod2, mod3;
  char key;
  if (sscanf(line.c_str(), "MACRO %d %d %i %i %i %c", &m, &b, &mod1, &mod2, &mod3, &key) == 6) {
    if (m >= 0 && m < 4 && b >= 0 && b < 3) {
      g_macros[m][b].mod1 = static_cast<uint8_t>(mod1);
      g_macros[m][b].mod2 = static_cast<uint8_t>(mod2);
      g_macros[m][b].mod3 = static_cast<uint8_t>(mod3);
      g_macros[m][b].key = static_cast<uint8_t>(key);
      Serial.println("OK");
      syncModeScreen();
      return;
    }
  }
  Serial.println("ERR");
}

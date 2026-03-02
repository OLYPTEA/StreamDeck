#pragma once

#include <Arduino.h>

void dwinWriteWord(uint16_t vp, uint16_t value);
void dwinWriteText16(uint16_t vp, const char* txt);
void dwinSetPage(uint16_t pageId);

void parseDwinFrame(const uint8_t* f, size_t len);
void pollDwin();

# BOM - ESP32-S3 Stream Deck / Control Panel

## Microcontroller
| Quantity | Component | Reference |
|---|---|---|
| 1 | ESP32-S3 DevKit | ESP32-S3 DevKit N16R8 |

---

## User Interface

### Potentiometers
| Quantity | Component | Value |
|---|---|---|
| 4 | Linear Potentiometer | B10K |

### Mechanical Switches
| Quantity | Component | Reference |
|---|---|---|
| 7 | Mechanical Keyboard Switch | Cherry MX |

### Display
| Quantity | Component | Reference |
|---|---|---|
| 1 | DWIN Display | DMG96240C037_03W |

---

## Transistors
| Quantity | Component | Reference |
|---|---|---|
| 2 | N-Channel MOSFET | BSS138 |

---

## Capacitors
| Quantity | Component | Value |
|---|---|---|
| 7 | Ceramic Capacitor | 10nF |
| 5 | Ceramic Capacitor | 100nF |
| 1 | Electrolytic Capacitor | 10µF |

---

## Resistors
| Quantity | Component | Value |
|---|---|---|
| 4 | Resistor | 10kΩ |
| 4 | Resistor | 1kΩ |
| 2 | Resistor | 5.1kΩ |

---

## Connectivity
| Quantity | Component | Reference |
|---|---|---|
| 1 | USB Type-C Connector | USB-C Port |

---

# Notes
- The 5.1kΩ resistors are used for USB-C CC1/CC2 configuration.
- The 100nF capacitors are used for power supply decoupling.
- The BSS138 MOSFETs are be used for logic level shifting (5V to 3.3V).
- The DWIN display generally communicates with the ESP32-S3 through UART.

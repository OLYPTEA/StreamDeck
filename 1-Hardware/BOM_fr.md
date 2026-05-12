# BOM - ESP32-S3 Stream Deck / Control Panel

## Microcontrôleur
| Quantité | Composant | Référence |
|---|---|---|
| 1 | ESP32-S3 DevKit | ESP32-S3 DevKit N16R8 |

---

## Interface utilisateur

### Potentiomètres
| Quantité | Composant | Valeur |
|---|---|---|
| 4 | Potentiomètre linéaire | B10K |

### Switchs mécaniques
| Quantité | Composant | Référence |
|---|---|---|
| 7 | Switch mécanique Cherry MX | Cherry MX |

### Écran
| Quantité | Composant | Référence |
|---|---|---|
| 1 | Écran DWIN | DMG96240C037_03W |

---

## Transistors
| Quantité | Composant | Référence |
|---|---|---|
| 2 | MOSFET N-Channel | BSS138 |

---

## Condensateurs
| Quantité | Composant | Valeur |
|---|---|---|
| 7 | Condensateur céramique | 10nF |
| 5 | Condensateur céramique | 100nF |
| 1 | Condensateur électrolytique | 10µF |

---

## Résistances
| Quantité | Composant | Valeur |
|---|---|---|
| 4 | Résistance | 10kΩ |
| 4 | Résistance | 1kΩ |
| 2 | Résistance | 5.1kΩ |

---

## Connectique
| Quantité | Composant | Référence |
|---|---|---|
| 1 | Connecteur USB Type-C | USB-C Port |

---

# Notes
- Les résistances 5.1kΩ sont utilisées pour la configuration CC1/CC2 du port USB-C.
- Les condensateurs 100nF servent au découplage de l’alimentation.
- Les BSS138 peuvent sont utilisés pour du level shifting (L'écran DWIN communique en 5v et l'ESP32-S3 en 3.3V).
- L’écran DWIN communique via UART avec l’ESP32-S3.

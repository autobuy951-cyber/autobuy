# AutoBuy - Fogalmak és definíciók

Ez a dokumentum a rendszerben használt fontosabb fogalmakat és azok jelentését tartalmazza.

---

## 📋 Foglalás (Foglalás/Reservation)

**Definíció:** Egy ügyfél által leadott kérés egy adott autó meghatározott időszakra történő bérlésére.

**Foglalás állapotai:**

| Állapot | Jelentés |
|---------|----------|
| **Jövőbeli** | A foglalás kezdete még nem érkezett el. Az ügyfél még nem vehette át az autót. |
| **Aktív** | A foglalás időszaka alatt vagyunk. Az ügyfél birtokolja az autót. |
| **Lejárt** | A foglalás vége napja elmúlt, de az ügyfél még nem hozta vissza az autót. |

**Foglalás adatai:**
- **Foglalás ID**: Egyedi azonosító szám
- **Ügyfél**: Aki a foglalást leadta
- **Autó**: A lefoglalt jármű
- **Tervezett elvitel**: Mikor kellene átvenni az autót
- **Tervezett visszahozatal**: Mikor kellene visszahozni az autót

---

## 🚗 Elvitel (Pickup)

**Definíció:** Az a folyamat, amikor az ügyfél fizikailag átveszi az autót a kölcsönzőtől.

**Fontos mezők:**
- **Tervezett elvitel**: A foglaláskor megadott dátum
- **Valós elvitel**: A tényleges átvétel dátuma (lehet eltérő a tervezettől)
- **Elvitve státusz**: Jelzi, hogy az ügyfél már átvette-e az autót

**Folyamat:**
1. Ügyfél megérkezik a kölcsönzőbe
2. Dolgozó ellenőrzi a foglalást
3. Dolgozó rögzíti az elvitelt a rendszerben
4. Autó státusza "Elvitve"-re változik
5. Az autó elérhetetlenné válik más foglalások számára

---

## 🔄 Visszahozatal (Return)

**Definíció:** Az a folyamat, amikor az ügyfél visszaviszi a bérelt autót a kölcsönzőbe.

**Fontos mezők:**
- **Tervezett visszahozatal**: A foglaláskor megadott dátum
- **Valós visszahozatal**: A tényleges visszahozatal dátuma
- **Kilométer állás**: Az autó kilométerórájának állapota visszahozatalkor
- **Visszahozva státusz**: Jelzi, hogy az autó már visszaérkezett

**Folyamat:**
1. Ügyfél visszahozza az autót
2. Dolgozó ellenőrzi az autó állapotát
3. Dolgozó rögzíti a kilométer állást
4. Dolgozó rögzíti a visszahozatalt a rendszerben
5. Autó státusza "Visszahozva"-ra változik
6. Az autó újra elérhetővé válik más foglalásokhoz

---

## 👥 Szerepkörök

### Admin (Adminisztrátor)
**Jogosultságok:**
- Minden funkció elérése
- Dolgozók és ügyfelek kezelése
- Teljes jogkör a foglalások felett
- Autók teljes körű kezelése
- Statisztikák megtekintése

### Dolgozó
**Jogosultságok:**
- Autók listázása
- Ügyfelek kezelése (csak "ügyfél" jogosultságot adhat)
- Foglalások megtekintése
- **Elvitel rögzítése**
- **Visszahozatal rögzítése**
- Elvitt autók nyilvántartása

### Ügyfél
**Jogosultságok:**
- Saját profil kezelése
- Autók böngészése
- Foglalás leadása
- Saját foglalások megtekintése
- Jövőbeli foglalások lemondása

---

## 🚙 Autó állapotok

| Állapot | Jelentés |
|---------|----------|
| **Elérhető** | Az autó szabad, foglalható |
| **Foglalt** | Az autó már le van foglalva valakinek |
| **Kölcsönözve** | Az autót kivitték, jelenleg ügyfélnél van |
| **Szervizben** | Az autó nem elérhető műszaki okok miatt |

---

## 📅 Dátum típusok a foglalásban

### Tervezett dátumok
- **Tervezett elvitel**: Az az időpont, amikor az ügyfél szeretné átvenni az autót
- **Tervezett visszahozatal**: Az az időpont, amikor az ügyfél szeretné visszahozni az autót

### Valós dátumok
- **Valós elvitel**: Az az időpont, amikor ténylegesen átvette az ügyfél az autót
- **Valós visszahozatal**: Az az időpont, amikor ténylegesen visszahozta az ügyfél az autót

**Fontos:** A valós dátumok eltérhetnek a tervezettektől (pl. késés, korábbi átvétel, stb.)

---

## 💰 Árazási fogalmak

### Napi ár (NapiAr)
Az autó bérlési díja naponta. Minden autónak saját napi ára van.

### Teljes ár (Ar)
A foglalás teljes költsége, amit az ügyfél fizet.

**Számítás:**
```
Teljes ár = Napi ár × Bérlés napjainak száma
```

---

## 📊 Státusz badge-ek színei

| Szín | Jelentés | Használat |
|------|----------|-----------|
| 🟢 Zöld | Aktív / Elvitve / Visszahozva | Sikeres műveletek |
| 🔴 Piros | Lejárt / Nem elérhető | Figyelmeztetések |
| 🔵 Kék | Jövőbeli / Elvitelre vár | Információ |
| 🟠 Narancs | Visszahozatalra vár | Várakozás |
| ⚪ Szürke | Visszahozva | Befejezett |

---

## 🔐 Fontos azonosítók

- **AutoID**: Autó egyedi azonosítója
- **Foglalasokid**: Foglalás egyedi azonosítója
- **Ugyfel ID**: Ügyfél egyedi azonosítója
- **Dolgozo ID**: Dolgozó egyedi azonosítója

---

## 📝 Egyéb fogalmak

### AutoKibe tábla
A rendszer egyik adattáblája, amely az autók ki- és behozatalát rögzíti (kilométer állással együtt).

### Visszahozva (Visszahozva)
Jelző, ami azt mutatja, hogy az ügyfél visszahozta-e már az autót.

### Elvitve (Elvitve)
Jelző, ami azt mutatja, hogy az ügyfél átvette-e már az autót.

---

*Utolsó frissítés: 2026.02.05.*

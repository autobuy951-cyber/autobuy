# User Stories - AutoBuy Autókölcsönző Rendszer

## 1️⃣ Szituáció – Autókölcsönzés (Foglalás)
**Szereplők**: Kovács Péter (ügyfél), Ügyintéző, Toyota Corolla (autó)

**Történet**:
1.  Péter bemegy a kölcsönzőbe (vagy telefonál), mert 5 napra autót szeretne.
2.  Az ügyintéző megkeresi Pétert az **Ugyfelek** táblában.
    -   Ha új ügyfél, akkor rögzíti: *Név, Cím, Telefonszám, Email, Igazolványszám*.
3.  Kiválasztanak egy szabad autót az **Autok** táblából (pl. Toyota Corolla, Napi ár: 10 000 Ft).
4.  Rögzítik a kölcsönzést a **Foglalasok** táblába:
    -   Ügyfél: Kovács Péter
    -   Autó: Toyota Corolla
    -   Kezdő dátum: 2026.05.10
    -   Végdátum: 2026.05.15
    -   Ár: 5 × 10 000 = 50 000 Ft
5.  Az autó állapota a rendszerben "foglalt"-ra változik (bár a foglalás tábla önmagában jelzi az időszakot, az autó státusza is frissülhet).

**Lekérdezés példa (SQL)**:
```sql
SELECT u.Nev, a.Marka, a.Modell, f.foglalaskezdete, f.foglalas_vege, f.Ar
FROM Foglalasok f
JOIN Ugyfelek u ON f.ugyfel_id = u.ID
JOIN Autok a ON f.auto_id = a.AutoID
WHERE u.Nev = 'Kovács Péter';
```

---

## 2️⃣ Szituáció – Autó Kiadása és Visszavétele
**Szereplők**: Ügyintéző, Karbantartó, Toyota Corolla

**Történet**:
1.  Eljön a kölcsönzés napja. Az ügyintéző átadja a kulcsot.
2.  Rögzítik az **AutoKibe** (Kiadás/Visszavétel) táblában a kiadást:
    -   Dátum: 2026.05.10
    -   Km óra állás: 45 200 km
3.  Péter visszahozza az autót 5 nap múlva.
4.  Az ügyintéző rögzíti a visszavételt ugyanahhoz a bejegyzéshez:
    -   Visszavétel dátuma: 2026.05.15
    -   Km óra állás: 45 800 km
5.  Az autó állapota "elérhető"-re változik.

**Lekérdezés példa (SQL)**:
```sql
SELECT a.Rendszam, k.elvitel, k.Kilometer_kezdet, k.vissza, k.Kilometer_veg
FROM AutoKibe k
JOIN Autok a ON k.auto_id = a.AutoID
WHERE k.vissza IS NOT NULL; 
-- Visszavett autók listája
```

---

## 3️⃣ Szituáció – Új Autó Beszerzése
**Szereplők**: Beszerzési Menedzser (Dolgozó), Új Ford Focus

**Történet**:
1.  A cég vásárol egy új Ford Focust a flottába.
2.  A menedzser belép a rendszerbe és felveszi az új autót az **Autok** táblába.
3.  Adatok: Rendszám (AA-BB-123), Márka (Ford), Modell (Focus), Évjárat (2024), Alvázszám, Állapot (elérhető).
4.  Az autó azonnal megjelenik a kereshető listában.

**Lekérdezés példa (SQL)**:
```sql
INSERT INTO Autok (Rendszam, Marka, Modell, Evjarat, Allapot, Alvazszam)
VALUES ('AA-BB-123', 'Ford', 'Focus', 2024, 'elérhető', 'WF0CXX...');
```

---

## 4️⃣ Szituáció – Új Alkalmazott Felvétele
**Szereplők**: Adminisztrátor (Főnök), Új kolléga (János)

**Történet**:
1.  János most kezd a cégnél mint ügyintéző.
2.  Az Adminisztrátor belép a saját fiókjával.
3.  Létrehozza János fiókját a **Dolgozok** táblában:
    -   Név: Nagy János
    -   Jelszó: (kezdeti jelszó)
    -   Jogosultság: 'dolgozo' (nem admin)
4.  János mostantól be tud lépni és tud foglalásokat kezelni, de nem törölhet más dolgozókat.

**Lekérdezés példa (SQL)**:
```sql
SELECT nev, jogosultsag FROM Dolgozok WHERE jogosultsag = 'admin';
-- Adminok listázása ellenőrzésképpen
```

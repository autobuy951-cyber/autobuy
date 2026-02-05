# User Stories - AutoBuy Autókölcsönző Rendszer


## 2️⃣ user story – Autó Kiadása
**Szereplők**: Ügyintéző, Karbantartó, Toyota Corolla

**Történet**:

2.  Rögzítik az **AutoKibe** (Kiadás/Visszavétel) táblában a kiadást:
    -   Dátum: 2026.05.10
    -   Km óra állás: 45 200 km
5.  Az autó állapota "foglalt "-re változik.



## 2️⃣ user story – Autó visszavetel
**Szereplők**: Ügyintéző, Karbantartó, Toyota Corolla

**Történet**:

3.  Péter visszahozza az autót 5 nap múlva.
4.  Az ügyintéző rögzíti a visszavételt
    -   Visszavétel dátuma: 2026.05.15
    -   Km óra állás: 45 800 km
5.  Az autó állapota ujra elerheto


## 3️⃣ User story – Új Autó Beszerzése
**Szereplők**: Beszerzési Menedzser (Dolgozó), Új Ford Focus

**Történet**:
1.  A cég vásárol egy új Ford Focust a flottába.
2.  A menedzser belép a rendszerbe és felveszi az új autót az **Autok** táblába.
3.  Adatok: Rendszám (AA-BB-123), Márka (Ford), Modell (Focus), Évjárat (2024), Alvázszám, Állapot (elérhető).
4.  Az autó azonnal megjelenik a kereshető listában.


## 4️⃣ User story – Új Alkalmazott Felvétele
**Szereplők**: Adminisztrátor (Főnök), Új kolléga (János)

**Történet**:
2.  Az Adminisztrátor belép a saját fiókjával.
3.  Létrehozza János fiókját a **Dolgozok** táblában:
    -   Név: Nagy János
    -   Jelszó: (kezdeti jelszó)
    -   Jogosultság: 'dolgozo' (nem admin)
4.  János mostantól be tud lépni


## 4️⃣ User story – Új Alkalmazott belépés
**Szereplők**: Adminisztrátor (Főnök), Új kolléga (János)

**Történet**:
2.  a dolgozo bejelentkezik
3.  oldal megnezi miyen jogosultsága van
4.  János dolgozó jogosultsaggal tud intezkedni




## 5️⃣ User story – Ügyfél Regisztrációja
**Szereplők**: Új ügyfél (Mária), Online felület

**Történet**:
1.  Mária meglátogatja az AutoBuyt
2.  A dolgozó beregisztrálja

## 5️⃣ User story – Ügyfél bejelentkezés
**Szereplők**: Új ügyfél (Mária), Online felület

**Történet**:
1.  Mária meglátogatja az AutoBuy weblapot
2.  az odal ellenőrzi van e már regisztráció
3. Mária betud lépni és akár autot kölcsönözni



## 6️⃣ User story – Autó Állapotának Frissítése
**Szereplők**: Karbantartó, Sérült autó

**Történet**:
1.  Egy autó visszajön sérülten a kölcsönzésből.
2.  A karbantartó megvizsgálja az autót és rögzíti a sérülés részleteit.
3.  Frissíti az autó állapotát az **Autok** táblában "javítás alatt"-ra.
4.  A rendszer automatikusan kizárja ezt az autót a foglalható autók listájából.


## 7️⃣ User story – Foglalás Módosítása
**Szereplők**: Ügyfél, Ügyintéző

**Történet**:
1.  Egy ügyfél szeretné módosítani a foglalását
3.  Az ügyintéző ellenőrzi az autó elérhetőségét
4.  Ha szabad, akkor módosítja a foglalás végdátumát és az árat.


## 8️⃣ User story – Statisztikák Lekérése
**Szereplők**: Üzletvezető

**Történet**:
1.  Az ügyvezető szeretné látni a havi bevételt és a legnépszerűbb autókat.
2.  Belép a rendszer admin felületére.
3.  Kiválasztja a "Statisztikák" menüpontot.
4.  A rendszer generálja a statisztikat
5.  Az ügyvezető ezek alapján dönt


## 9️⃣ User story – Dolgozó Jogosultságának Módosítása
**Szereplők**: Adminisztrátor, Dolgozó

**Történet**:
1.  Egy dolgozó előrelépést kap, és adminisztrátori jogosultságot kap.
2.  A főnök belép az admin kezelő felületére.
3.  Kiválasztja a dolgozót és módosítja a jogosultságot "admin"-ra.
4.  A dolgozó mostantól hozzáfér a teljes rendszerhez,



## 🔟 User story – Autó felvetele
**Szereplők**: Adminisztrátor,

**Történet**:
 
1.  Az adminisztrátor belép a rendszerbe.
2. Egy uj autot regisztarulk a rendszerbe


## 🔟 User story – Autó Törlése a Rendszerből
**Szereplők**: Adminisztrátor, Elavult autó

**Történet**:
2.  Az adminisztrátor belép a rendszerbe.
3.  Kiválasztja az autót az autók listájából.
4.  Ellenőrzi, hogy nincs aktív foglalása.
5.  Törli az autót az **Autok** táblából,


## 1️⃣1️⃣ User story – Dolgozó Törlése a Rendszerből
**Szereplők**: Adminisztrátor, Elbocsátott dolgozó

**Történet**:
1.  Egy dolgozó elbocsátásra kerül
2.  Az adminisztrátor belép a dolgozók kezelő felületére.
3.  Kiválasztja a dolgozót a listából.
5.  Törli a dolgozót a **Dolgozok** táblából,


## 1️⃣2️⃣ User story – Ügyfél Törlése a Rendszerből
**Szereplők**: Adminisztrátor, Ügyfél

**Történet**:
1.  Egy ügyfél kérésére vagy hosszú ideje inaktív státusz miatt törölni kell az adatait.
2.  Az adminisztrátor belép az ügyfelek kezelő felületére.
3.  Kiválasztja az ügyfelet a listából.
4.  Ellenőrzi, hogy nincs aktív vagy jövőbeni foglalása.
5.  Törli az ügyfelet az **Ugyfelek** táblából, vagy "törölt"-re állítja az állapotát


## 1️⃣3️⃣ User story – Ügyfél Előzmények Megtekintése
**Szereplők**: Adminisztrátor, Dolgozó, Ügyfél

**Történet**:
1.  Az adminisztrátor vagy dolgozó szeretné megtekinteni egy ügyfél korábbi foglalásait.
2.  Belép az "Ügyfél Előzmények" menüpontba.
3.  Keres az ügyfél neve alapján.
4.  Kiválasztja az ügyfelet a listából.
5.  A rendszer megjeleníti az ügyfél összes foglalását:
    -   Melyik autókat bérelte
    -   Mikor vette át és hozta vissza az autókat
    -   Mennyit fizetett
    -   Milyen állapotban hozta vissza az autókat
    -   Megjegyzések a kölcsönzésről


## 1️⃣4️⃣ User story – Megjegyzés Rögzítése Visszahozatalnál
**Szereplők**: Dolgozó, Ügyfél

**Történet**:
1.  Az ügyfél visszahozza a bérelt autót.
2.  A dolgozó átvizsgálja az autót és észrevesz egy karcolást a bal első sárvédőn.
3.  A dolgozó rögzíti a visszahozatalt a rendszerben.
4.  Megjegyzés mezőbe beírja: "Karcolás a bal első sárvédőn, belső tiszta."
5.  A megjegyzés eltárolódik az AutoKibe táblában.


## 1️⃣5️⃣ User story – Autó Megjegyzés Kezelése
**Szereplők**: Adminisztrátor, Dolgozó

**Történet**:
1.  Egy autónál fontos információt kell rögzíteni (pl. "Új féktárcsák", "Speciális üzemanyag").
2.  Az adminisztrátor szerkeszti az autó adatait.
3.  Megjegyzés mezőbe beírja a fontos információt.
4.  A megjegyzés megjelenik az autók listájában és az ügyfélnél is.


## 1️⃣6️⃣ User story – Bérelhető Állapot Jelzése
**Szereplők**: Adminisztrátor, Dolgozó

**Történet**:
1.  Az adminisztrátor szeretné látni, hogy mely autók bérelhetőek az ügyfelek számára.
2.  Az autók listájában látja a "Bérelhető" oszlopot.
3.  Ha egy autó nem bérelhető (pl. szervizben van), azt azonnal látja.
4.  A rendszer automatikusan csak a bérelhető autókat mutatja az ügyfeleknek.


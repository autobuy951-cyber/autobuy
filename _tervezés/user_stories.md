# User Stories - AutoBuy Autókölcsönző Rendszer

## 1️⃣ User story – Autókölcsönzés (Foglalás)
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



## 2️⃣ user story – Autó Kiadása és Visszavétele
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
1.  János most kezd a cégnél mint ügyintéző.
2.  Az Adminisztrátor belép a saját fiókjával.
3.  Létrehozza János fiókját a **Dolgozok** táblában:
    -   Név: Nagy János
    -   Jelszó: (kezdeti jelszó)
    -   Jogosultság: 'dolgozo' (nem admin)
4.  János mostantól be tud lépni és tud foglalásokat kezelni, de nem törölhet más dolgozókat.


## 5️⃣ User story – Ügyfél Regisztrációja
**Szereplők**: Új ügyfél (Mária), Online felület

**Történet**:
1.  Mária meglátogatja az AutoBuy weboldalát, mert autót szeretne bérelni.
2.  Kattint a "Regisztráció" gombra.
3.  Kitölti az űrlapot: Név, Cím, Telefonszám, Email, Jogosítvány szám.
4.  A rendszer ellenőrzi az adatok helyességét és egyediségét.
5.  Sikeres regisztráció után Mária kap egy megerősítő emailt, és már be tud lépni a rendszerbe.


## 6️⃣ User story – Autó Állapotának Frissítése
**Szereplők**: Karbantartó, Sérült autó

**Történet**:
1.  Egy autó visszajön sérülten a kölcsönzésből.
2.  A karbantartó megvizsgálja az autót és rögzíti a sérülés részleteit.
3.  Frissíti az autó állapotát az **Autok** táblában "javítás alatt"-ra.
4.  A rendszer automatikusan kizárja ezt az autót a foglalható autók listájából.
5.  Miután a javítás kész, az állapotot "elérhető"-re állítja vissza.


## 7️⃣ User story – Foglalás Módosítása
**Szereplők**: Ügyfél, Ügyintéző

**Történet**:
1.  Egy ügyfél szeretné módosítani a foglalását, mert meghosszabbítaná a bérlési időszakot.
2.  Felhívja a kölcsönzőt vagy bejelentkezik a fiókjába.
3.  Az ügyintéző ellenőrzi az autó elérhetőségét az új időszakra.
4.  Ha szabad, akkor módosítja a foglalás végdátumát és az árat.
5.  Az ügyfélnek frissített számlát küldenek.


## 8️⃣ User story – Statisztikák Lekérése
**Szereplők**: Üzletvezető

**Történet**:
1.  Az ügyvezető szeretné látni a havi bevételt és a legnépszerűbb autókat.
2.  Belép a rendszer admin felületére.
3.  Kiválasztja a "Statisztikák" menüpontot.
4.  A rendszer generálja a jelentést: bevétel összesítés, autók kölcsönzési gyakorisága, ügyfelek aktivitása.
5.  Az ügyvezető ezek alapján dönt a flotta bővítéséről vagy akciókról.


## 9️⃣ User story – Dolgozó Jogosultságának Módosítása
**Szereplők**: Adminisztrátor, Dolgozó

**Történet**:
1.  Egy dolgozó előrelépést kap, és adminisztrátori jogosultságot kap.
2.  A főnök belép a dolgozók kezelő felületére.
3.  Kiválasztja a dolgozót és módosítja a jogosultságot "admin"-ra.
4.  A dolgozó mostantól hozzáfér a teljes rendszerhez, beleértve a dolgozók kezelését is.


## 🔟 User story – Autó Törlése a Rendszerből
**Szereplők**: Adminisztrátor, Elavult autó

**Történet**:
1.  Egy autó elavulttá válik vagy eladásra kerül.
2.  Az adminisztrátor belép a rendszerbe.
3.  Kiválasztja az autót az autók listájából.
4.  Ellenőrzi, hogy nincs aktív foglalása.
5.  Törli az autót az **Autok** táblából, vagy "eladva"-ra állítja az állapotát.


## 1️⃣1️⃣ User story – Dolgozó Törlése a Rendszerből
**Szereplők**: Adminisztrátor, Elbocsátott dolgozó

**Történet**:
1.  Egy dolgozó elbocsátásra kerül vagy áthelyezik másik részlegbe.
2.  Az adminisztrátor belép a dolgozók kezelő felületére.
3.  Kiválasztja a dolgozót a listából.
4.  Ellenőrzi, hogy nincs aktív foglalása vagy kiadott autója.
5.  Törli a dolgozót a **Dolgozok** táblából, vagy "inaktív"-ra állítja az állapotát.


## 1️⃣2️⃣ User story – Ügyfél Törlése a Rendszerből
**Szereplők**: Adminisztrátor, Ügyfél

**Történet**:
1.  Egy ügyfél kérésére vagy hosszú ideje inaktív státusz miatt törölni kell az adatait.
2.  Az adminisztrátor belép az ügyfelek kezelő felületére.
3.  Kiválasztja az ügyfelet a listából.
4.  Ellenőrzi, hogy nincs aktív vagy jövőbeni foglalása.
5.  Törli az ügyfelet az **Ugyfelek** táblából, vagy "törölt"-re állítja az állapotát.


## 1️⃣3️⃣ User story – Ügyfél Autókeresése és Összehasonlítása
**Szereplők**: Ügyfél (Mária), Webes felület

**Történet**:
1.  Mária bejelentkezik a rendszerbe, és meg szeretné nézni a rendelkezésre álló autókat.
2.  A főoldalon látja a különböző kategóriákat: Kompakt, Családi, Sport, Luxus.
3.  Kiválasztja a "Kompakt" kategóriát, és megjelenik az összes elérhető autó ebből a kategóriából.
4.  Szűrheti az autókat ár, évjárat vagy üzemanyag típus alapján.
5.  Kattint egy autóra, és megjelenik a részletes leírás, képek és a napi ár.
6.  Összehasonlítja több autó adatait, majd kiválasztja a legmegfelelőbbet.


## 1️⃣4️⃣ User story – Dolgozó Munkanapja a Boltban
**Szereplők**: Dolgozó (János), Ügyfelek, Autók

**Történet**:
1.  János bemegy az irodába, bekapcsolja a számítógépet és belép a rendszerbe.
2.  Megnyitja a napi foglalások listáját, hogy lássa, mely autókat kell kiadni és visszafogadni.
3.  Egy ügyfél érkezik, aki szeretne autót bérelni.
4.  János ellenőrzi az ügyfél adatait a rendszerben, majd megmutatja a szabad autók listáját.
5.  Kiválasztanak egy autót, és János rögzíti a foglalást a rendszerben.
6.  Kiadja az autót az ügyfélnek, rögzíti a kilométeróra állást és a kiadás dátumát.
7.  Délután egy másik ügyfél visszahozza az autót, János ellenőrzi a kilométeróra állást és rögzíti a visszavételt.
8.  A nap végén lezárja a munkanapot, és ellenőrzi a napi bevételt a rendszerben.


## 1️⃣5️⃣ User story – Adminisztrátor Napi Felügyelete
**Szereplők**: Adminisztrátor (Adin), Dolgozók, Ügyfelek, Autók

**Történet**:
1.  Adin reggel belép a rendszerbe adminisztrátori jogosultsággal.
2.  Megnyitja a dashboardot, ahol látja a napi összesítő statisztikákat: bevétel, foglalások száma, autók állapota.
3.  Ellenőrzi, hogy vannak-e problémás foglalások vagy sérült autók.
4.  Felügyeli a dolgozók munkáját, ellenőrzi a bejegyzéseiket.
5.  Ha szükséges, jóváhagyja a dolgozók által javasolt változtatásokat.
6.  Délután ellenőrzi az ügyfelek értékeléseit és panaszait.
7.  Frissíti a rendszerben a fontos beállításokat vagy akciókat.
8.  A nap végén generál egy összegzést a munkáról és elküldi a vezetőségnek.


## 1️⃣6️⃣ User story – Ügyfél foglalasa
**Szereplők**: Ügyfél (Péter), Online fizetési rendszer

**Történet**:
1.  Péter befejezte az autókölcsönzést és szeretne online fizetni.
2.  Bejelentkezik a fiókjába a weboldalon.
3.  Megnyitja a "Fizetések" szakaszt, ahol látja a lezárt foglalásokat és azok összegét.
4.  Kiválasztja a legutóbbi foglalást és kattint a "Fizetés" gombra.
5.  A rendszer átirányítja a biztonságos fizetési oldalra.






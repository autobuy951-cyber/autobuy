# API Végpontok Dokumentáció

Ez a dokumentum a `requests_2026-01-13.http` fájl alapján készült összegzést tartalmazza.

**Base URL**: `http://localhost:3000/api`

## 1. Hitelesítés (Auth)

| Metódus | Végpont | Leírás | Paraméterek / Body |
|:---|:---|:---|:---|
| `POST` | `/dolgozok` | Új dolgozó létrehozása | `nev`, `jelszo`, `jogosultsag` |
| `POST` | `/auth/login` | Bejelentkezés | `nev`, `jelszo` |
| `GET` | `/auth/verify` | Token ellenőrzés | Header: Authorization Bearer token |

## 2. Dashboard

| Metódus | Végpont | Leírás | Paraméterek |
|:---|:---|:---|:---|
| `GET` | `/dashboard/stats` | Statisztikák | - |
| `GET` | `/dashboard/tevekenysegek` | Tevékenységnapló | `limit` |

## 3. Autók

| Metódus | Végpont | Leírás | Paraméterek / Body |
|:---|:---|:---|:---|
| `GET` | `/autok` | Lista és szűrés | `page`, `limit`, `marka`, `sort_by`, `sort_order` |
| `GET` | `/autok/elerheto` | Elérhető autók keresése | `kezdet`, `veg` (Dátumok) |
| `GET` | `/autok/:id` | Egy autó adatai | - |
| `POST` | `/autok` | Új autó felvétele | `Rendszam`, `Marka`, `Modell`, `Evjarat`, `Allapot`, `Alvazszam` |
| `PUT` | `/autok/:id` | Autó frissítése | (Ugyanaz, mint POST) |
| `DELETE` | `/autok/:id` | Autó törlése | - |

## 4. Ügyfelek

| Metódus | Végpont | Leírás | Paraméterek / Body |
|:---|:---|:---|:---|
| `GET` | `/ugyfelek` | Lista és szűrés | `page`, `limit`, `search`, `sort_by`, `sort_order` |
| `GET` | `/ugyfelek/search` | Keresés | `q` (Query string), `limit` |
| `GET` | `/ugyfelek/tartomany/:range` | Szűrés név kezdőbetűre | pl. `A-E` |
| `GET` | `/ugyfelek/:id` | Egy ügyfél adatai | - |
| `POST` | `/ugyfelek` | Új ügyfél | `Nev`, `Cim`, `Telefonszam`, `Email`, `igSzam`, `SzuletesiDatum`, `Jogosultsag` |
| `PUT` | `/ugyfelek/:id` | Ügyfél módosítása | (Ugyanaz, mint POST) |
| `DELETE` | `/ugyfelek/:id` | Ügyfél törlése | - |

## 5. Dolgozók (Admin)

| Metódus | Végpont | Leírás | Paraméterek |
|:---|:---|:---|:---|
| `GET` | `/dolgozok` | Dolgozók listája | - |
| `DELETE` | `/dolgozok/:id` | Dolgozó törlése | - |

## 6. Foglalások

| Metódus | Végpont | Leírás | Paraméterek / Body |
|:---|:---|:---|:---|
| `GET` | `/foglalasok` | Foglalások listája | `status`, `sort_by`, `sort_order` |
| `POST` | `/foglalasok` | Új foglalás | `auto_id`, `ugyfel_id`, `foglalaskezdete`, `foglalas_vege` |
| `DELETE` | `/foglalasok/:id` | Foglalás törlése | - |

## 7. Autókiadás / Visszavétel (Autókibe)

| Metódus | Végpont | Leírás | Paraméterek / Body |
|:---|:---|:---|:---|
| `GET` | `/autokibe` | Kiadások listája | `status`, `auto_id` |
| `POST` | `/autokibe` | Kiadás rögzítése | `auto_id`, `elvitel` (dátum), `Kilometer_kezdet` |
| `PUT` | `/autokibe/:id` | Visszavétel rögzítése | `vissza` (dátum), `Kilometer_veg` |
| `DELETE` | `/autokibe/:id` | Törlés | - |

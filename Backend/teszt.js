const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';
let autoId = null;
let ugyfelId = null;
let foglalasId = null;
let kibeId = null;

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
    try {
        await fn();
        log('green', `✓ ${name}`);
        return true;
    } catch (err) {
        log('red', `✗ ${name}`);
        log('red', `  Hiba: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
        return false;
    }
}

async function cleanup() {
    try {
        // Törlések fordított sorrendben
        if (kibeId) {
            await axios.delete(`${BASE_URL}/autokibe/${kibeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        if (foglalasId) {
            await axios.delete(`${BASE_URL}/foglalasok/${foglalasId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        if (autoId) {
            await axios.delete(`${BASE_URL}/autok/${autoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        if (ugyfelId) {
            await axios.delete(`${BASE_URL}/ugyfelek/${ugyfelId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        log('blue', '\n✓ Teszt adatok törölve');
    } catch (err) {
        log('yellow', '\n⚠ Nem sikerült minden teszt adatot törölni');
    }
}

async function runTests() {
    log('blue', '=== AUTOBUY API TELJES TESZT ===\n');

    // 1. Dolgozó létrehozása
    await test('1. Dolgozó létrehozása', async () => {
        const response = await axios.post(`${BASE_URL}/dolgozok`, {
            nev: 'testuser',
            jelszo: 'test123',
            jogosultsag: 'admin'
        });
        if (!response.data.id) throw new Error('Nincs ID a válaszban');
    });

    // 2. Bejelentkezés
    await test('2. Bejelentkezés', async () => {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            nev: 'testuser',
            jelszo: 'test123'
        });
        token = response.data.token;
        if (!token) throw new Error('Nincs token a válaszban');
    });

    // 3. Token ellenőrzés
    await test('3. Token ellenőrzés', async () => {
        const response = await axios.get(`${BASE_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.valid) throw new Error('Token nem érvényes');
    });

    // 4. Autó létrehozása
    await test('4. Autó létrehozása', async () => {
        const response = await axios.post(`${BASE_URL}/autok`, {
            Rendszam: 'TEST-999',
            Marka: 'Toyota',
            Modell: 'TestCar',
            Evjarat: 2020,
            Allapot: 'elérhető',
            Alvazszam: 'TEST123456'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        autoId = response.data.AutoID;
        if (!autoId) throw new Error('Nincs AutoID a válaszban');
    });

    // 5. Autók listázása
    await test('5. Autók listázása', async () => {
        const response = await axios.get(`${BASE_URL}/autok`);
        if (!response.data.data || response.data.data.length === 0) {
            throw new Error('Nincs autó a listában');
        }
    });

    // 6. Autó lekérése ID alapján
    await test('6. Autó lekérése ID alapján', async () => {
        const response = await axios.get(`${BASE_URL}/autok/${autoId}`);
        if (response.data.Rendszam !== 'TEST-999') {
            throw new Error('Hibás autó adatok');
        }
    });

    // 7. Ügyfél létrehozása
    await test('7. Ügyfél létrehozása', async () => {
        const response = await axios.post(`${BASE_URL}/ugyfelek`, {
            Nev: 'Teszt Elek',
            Cim: 'Budapest, Teszt u. 1.',
            Telefonszam: '+36301234567',
            Email: 'test@test.com',
            igSzam: '12345678',
            SzuletesiDatum: '1990-01-01',
            Jogosultsag: 'B'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        ugyfelId = response.data.ID;
        if (!ugyfelId) throw new Error('Nincs ID a válaszban');
    });

    // 8. Ügyfelek listázása
    await test('8. Ügyfelek listázása', async () => {
        const response = await axios.get(`${BASE_URL}/ugyfelek`);
        if (!response.data.data || response.data.data.length === 0) {
            throw new Error('Nincs ügyfél a listában');
        }
    });

    // 9. Ügyfél keresés
    await test('9. Ügyfél keresés', async () => {
        const response = await axios.get(`${BASE_URL}/ugyfelek/search?q=Teszt`);
        if (!response.data || response.data.length === 0) {
            throw new Error('Keresés nem talált eredményt');
        }
    });

    // 10. Foglalás létrehozása
    await test('10. Foglalás létrehozása', async () => {
        const response = await axios.post(`${BASE_URL}/foglalasok`, {
            auto_id: autoId,
            ugyfel_id: ugyfelId,
            foglalaskezdete: '2026-02-01',
            foglalas_vege: '2026-02-05'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        foglalasId = response.data.Foglalasokid;
        if (!foglalasId) throw new Error('Nincs Foglalasokid a válaszban');
    });

    // 11. Foglalások listázása
    await test('11. Foglalások listázása', async () => {
        const response = await axios.get(`${BASE_URL}/foglalasok`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.data || response.data.data.length === 0) {
            throw new Error('Nincs foglalás a listában');
        }
    });

    // 12. Elérhető autók lekérése
    await test('12. Elérhető autók lekérése', async () => {
        const response = await axios.get(`${BASE_URL}/autok/elerheto?kezdet=2026-03-01&veg=2026-03-05`);
        if (!response.data || response.data.length === 0) {
            throw new Error('Nincs elérhető autó');
        }
    });

    // 13. AutoKibe létrehozása
    await test('13. AutoKibe létrehozása', async () => {
        const response = await axios.post(`${BASE_URL}/autokibe`, {
            auto_id: autoId,
            elvitel: '2026-01-15 10:00:00',
            Kilometer_kezdet: 50000
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        kibeId = response.data.Id;
        if (!kibeId) throw new Error('Nincs Id a válaszban');
    });

    // 14. AutoKibe listázása
    await test('14. AutoKibe listázása', async () => {
        const response = await axios.get(`${BASE_URL}/autokibe`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.data || response.data.data.length === 0) {
            throw new Error('Nincs kibe rekord a listában');
        }
    });

    // 15. AutoKibe lezárása
    await test('15. AutoKibe lezárása', async () => {
        await axios.put(`${BASE_URL}/autokibe/${kibeId}`, {
            vissza: '2026-01-20 14:00:00',
            Kilometer_veg: 50500
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    });

    // 16. Dashboard statisztikák
    await test('16. Dashboard statisztikák', async () => {
        const response = await axios.get(`${BASE_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (typeof response.data.osszesAuto === 'undefined') {
            throw new Error('Hiányzó statisztika adat');
        }
    });

    // 17. Dashboard tevékenységek
    await test('17. Dashboard tevékenységek', async () => {
        const response = await axios.get(`${BASE_URL}/dashboard/tevekenysegek?limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!Array.isArray(response.data)) {
            throw new Error('Nem tömb a válasz');
        }
    });

    // Törlések
    await cleanup();

    log('blue', '\n=== TESZT BEFEJEZVE ===');
}

// Főprogram
runTests().catch(err => {
    log('red', `\nFatális hiba: ${err.message}`);
    process.exit(1);
});

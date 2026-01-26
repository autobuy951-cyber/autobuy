const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth';

async function testLoginFlow() {
    const testUser = {
        nev: `TestUser_${Date.now()}`,
        jelszo: 'Secret123!',
        email: `test_${Date.now()}@example.com`
    };

    try {
        console.log('1. Regisztráció megkísérlése:', testUser.nev);
        const regResponse = await axios.post(`${API_URL}/register/customer`, testUser);
        console.log('Regisztráció sikeres:', regResponse.status);

        console.log('2. Bejelentkezés megkísérlése (helyes adatokkal)');
        const loginResponse = await axios.post(`${API_URL}/login/customer`, {
            nev: testUser.nev,
            jelszo: testUser.jelszo
        });
        console.log('Bejelentkezés sikeres. Token:', loginResponse.data.token ? 'KAPOTT' : 'NINCS');

        console.log('3. Bejelentkezés megkísérlése (rossz jelszóval)');
        try {
            await axios.post(`${API_URL}/login/customer`, {
                nev: testUser.nev,
                jelszo: 'WrongPass'
            });
            console.error('Hibás: A bejelentkezésnek el kellett volna buknia!');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('Sikeres teszt: Rossz jelszóval elutasítva (401).');
            } else {
                console.error('Hiba:', err.message);
            }
        }

        console.log('4. Bejelentkezés megkísérlése (nem létező felhasználó)');
        try {
            await axios.post(`${API_URL}/login/customer`, {
                nev: 'NonExistentUser',
                jelszo: 'Secret123!'
            });
            console.error('Hibás: A bejelentkezésnek el kellett volna buknia!');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('Sikeres teszt: Nem létező felhasználóval elutasítva (401).');
            } else {
                console.error('Hiba:', err.message);
            }
        }

    } catch (error) {
        console.error('Teszt hiba:', error.response ? error.response.data : error.message);
    }
}

testLoginFlow();

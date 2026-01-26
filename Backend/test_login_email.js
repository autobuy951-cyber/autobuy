const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth';

async function testEmailLogin() {
    // Unique data for test
    const timestamp = Date.now();
    const testUser = {
        nev: `TestUser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        jelszo: 'Secret123!'
    };

    try {
        console.log('--- 1. Felhasználó Regisztráció ---');
        // Register still takes 'nev' and 'jelszo', but we can send extra fields if supported, or rely on auto-generated
        // Actually, registerCustomer likely takes what we give it.
        // Let's see authController.js: registerCustomer takes { nev, jelszo, jogosultsag, ...otherFields }
        // So we can pass email.
        const regResponse = await axios.post(`${API_URL}/register/customer`, testUser);
        console.log('Regisztráció sikeres:', regResponse.status);

        console.log('\n--- 2. Bejelentkezés EMAIL címmel (Helyes) ---');
        const loginResponse = await axios.post(`${API_URL}/login/customer`, {
            email: testUser.email,
            jelszo: testUser.jelszo
        });
        console.log('Siker! Token kapva:', loginResponse.data.token ? 'IGEN' : 'NEM');
        console.log('Visszakapott Név:', loginResponse.data.nev);

        console.log('\n--- 3. Bejelentkezés NÉVVEL (Helytelen - már nem támogatott, elvileg) ---');
        try {
            await axios.post(`${API_URL}/login/customer`, {
                email: testUser.nev, // Sending name in email field
                jelszo: testUser.jelszo
            });
            console.error('HIBA: Sikerült belépni névvel az email mezőben! (Ez nem baj, ha az email validáció nem szigorú, de a user email alapú belépést kért)');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('Helyes viselkedés: Névvel nem engedett be (mert nem talált ilyen emailt).');
            } else {
                console.error('Váratlan hiba:', err.message);
            }
        }

        console.log('\n--- 4. Bejelentkezés ROSSZ emaillel ---');
        try {
            await axios.post(`${API_URL}/login/customer`, {
                email: 'rossz@email.com',
                jelszo: testUser.jelszo
            });
            console.error('HIBA: Beengedett rossz emaillel!');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('Helyes viselkedés: Rossz emailre 401.');
            }
        }

    } catch (error) {
        console.error('TESZT HIBA:', error.response ? error.response.data : error.message);
    }
}

testEmailLogin();

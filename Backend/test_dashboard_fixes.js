const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
// User credentials from request
const KUPI = { email: 'kupi@gmail.com', jelszo: 'kupi' };
const ADMIN = { nev: 'admin', jelszo: 'admin123' }; // Assuming admin uses Name login still, or check authController

async function testDashboardFixes() {
    try {
        console.log('--- 1. Ügyfél Bejelentkezés (kupi) ---');
        const loginRes = await axios.post(`${API_URL}/auth/login/customer`, {
            email: KUPI.email,
            jelszo: KUPI.jelszo
        });
        const kupiToken = loginRes.data.token;
        console.log('Siker! Token kapva.');

        console.log('\n--- 2. Elérhető autók lekérdezése (Dátum nélkül) ---');
        try {
            const carsRes = await axios.get(`${API_URL}/autok/elerheto`);
            console.log(`Siker! ${carsRes.data.length} db autó elérhető.`);
            if (carsRes.data.length > 0) {
                console.log('Első autó:', carsRes.data[0].Marka, carsRes.data[0].Modell);
            }
        } catch (err) {
            console.error('HIBA: Nem sikerült lekérni az autókat dátum nélkül!', err.response ? err.response.data : err.message);
        }

        console.log('\n--- 3. Foglalások lekérdezése (Ügyfélként) ---');
        try {
            const foglalasRes = await axios.get(`${API_URL}/foglalasok`, {
                headers: { Authorization: `Bearer ${kupiToken}` }
            });
            console.log(`Siker! ${foglalasRes.data.data.length} db foglalás látható.`);
            // Ellenőrizzük, hogy minden foglalás az övé-e (bár a backend szűri, mi csak a számot látjuk)
            // Ha lenne source code access a response-hoz, látnánk az ugyfel_id-t? 
            // A foglalasController.js include-olja az Ugyfel Nev-et.
        } catch (err) {
            console.error('HIBA:', err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error('TESZT FATAL ERROR:', error.response ? error.response.data : error.message);
    }
}

testDashboardFixes();

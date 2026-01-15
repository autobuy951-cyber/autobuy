const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function addCars() {
    try {
        // First create a user
        console.log('Creating user...');
        await axios.post(`${BASE_URL}/dolgozok`, {
            nev: 'testuser',
            jelszo: 'test123',
            jogosultsag: 'admin'
        });

        // Login
        console.log('Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            nev: 'testuser',
            jelszo: 'test123'
        });
        const token = loginResponse.data.token;

        // Add multiple cars
        const cars = [
            { Rendszam: 'ABC-123', Marka: 'Toyota', Modell: 'Corolla', Evjarat: 2020, Allapot: 'elérhető', Alvazszam: 'TOY123456789' },
            { Rendszam: 'DEF-456', Marka: 'Honda', Modell: 'Civic', Evjarat: 2019, Allapot: 'elérhető', Alvazszam: 'HON123456789' },
            { Rendszam: 'GHI-789', Marka: 'Ford', Modell: 'Focus', Evjarat: 2021, Allapot: 'foglalt', Alvazszam: 'FOR123456789' },
            { Rendszam: 'JKL-012', Marka: 'BMW', Modell: 'X3', Evjarat: 2022, Allapot: 'elérhető', Alvazszam: 'BMW123456789' },
            { Rendszam: 'MNO-345', Marka: 'Audi', Modell: 'A4', Evjarat: 2020, Allapot: 'karbantartás', Alvazszam: 'AUD123456789' },
            { Rendszam: 'PQR-678', Marka: 'Mercedes', Modell: 'C-Class', Evjarat: 2021, Allapot: 'elérhető', Alvazszam: 'MER123456789' },
            { Rendszam: 'STU-901', Marka: 'Volkswagen', Modell: 'Golf', Evjarat: 2019, Allapot: 'elérhető', Alvazszam: 'VOL123456789' },
            { Rendszam: 'VWX-234', Marka: 'Nissan', Modell: 'Qashqai', Evjarat: 2022, Allapot: 'foglalt', Alvazszam: 'NIS123456789' },
            { Rendszam: 'YZA-567', Marka: 'Hyundai', Modell: 'Tucson', Evjarat: 2020, Allapot: 'elérhető', Alvazszam: 'HYU123456789' },
            { Rendszam: 'BCD-890', Marka: 'Kia', Modell: 'Sportage', Evjarat: 2021, Allapot: 'elérhető', Alvazszam: 'KIA123456789' },
            { Rendszam: 'EFG-123', Marka: 'Mazda', Modell: 'CX-5', Evjarat: 2019, Allapot: 'karbantartás', Alvazszam: 'MAZ123456789' },
            { Rendszam: 'HIJ-456', Marka: 'Subaru', Modell: 'Forester', Evjarat: 2022, Allapot: 'elérhető', Alvazszam: 'SUB123456789' },
            { Rendszam: 'KLM-789', Marka: 'Jeep', Modell: 'Compass', Evjarat: 2020, Allapot: 'foglalt', Alvazszam: 'JEE123456789' },
            { Rendszam: 'NOP-012', Marka: 'Renault', Modell: 'Captur', Evjarat: 2021, Allapot: 'elérhető', Alvazszam: 'REN123456789' },
            { Rendszam: 'QRS-345', Marka: 'Peugeot', Modell: '3008', Evjarat: 2019, Allapot: 'elérhető', Alvazszam: 'PEU123456789' },
            { Rendszam: 'TUV-678', Marka: 'Citroen', Modell: 'C5 Aircross', Evjarat: 2022, Allapot: 'karbantartás', Alvazszam: 'CIT123456789' },
            { Rendszam: 'WXY-901', Marka: 'Opel', Modell: 'Grandland X', Evjarat: 2020, Allapot: 'elérhető', Alvazszam: 'OPE123456789' }
        ];

        console.log('Adding cars...');
        for (const car of cars) {
            try {
                const response = await axios.post(`${BASE_URL}/autok`, car, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(`Added car: ${car.Marka} ${car.Modell}`);
            } catch (error) {
                console.error(`Failed to add ${car.Marka} ${car.Modell}:`, error.response?.data || error.message);
            }
        }

        console.log('All cars added successfully!');
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

addCars();

const { sequelize, Auto, Dolgozo, Ugyfel, Foglalas, AutoKibe } = require('./models');

const BATCH_SIZE = 1000;
const TOTAL_RECORDS = 100000;

// --- DATA ARRAYS ---
const lastNames = ['Kovács', 'Nagy', 'Szabó', 'Tóth', 'Varga', 'Kiss', 'Horváth', 'Molnár', 'Németh', 'Farkas', 'Balogh', 'Papp', 'Takács', 'Juhász', 'Lakatos', 'Mészáros', 'Simon', 'Rácz', 'Fekete', 'Szalai'];
const firstNamesMale = ['László', 'István', 'József', 'János', 'Zoltán', 'Sándor', 'Gábor', 'Ferenc', 'Tamás', 'Attila', 'Péter', 'Gyula', 'Csaba', 'Tibor', 'András', 'Zsolt', 'Imre', 'Balázs', 'Gergely', 'Ádám'];
const firstNamesFemale = ['Mária', 'Erzsébet', 'Katalin', 'Ilona', 'Julianna', 'Éva', 'Zsuzsanna', 'Anna', 'Judit', 'Ágnes', 'Andrea', 'Erika', 'Krisztina', 'Gabriella', 'Szilvia', 'Viktória', 'Monika', 'Ildikó', 'Tímea', 'Anita'];
const cities = ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Székesfehérvár', 'Szombathely', 'Szolnok', 'Tatabánya', 'Kaposvár', 'Érd', 'Veszprém', 'Békéscsaba', 'Zalaegerszeg', 'Eger', 'Nagykanizsa', 'Dunaújváros'];
const streetTypes = ['utca', 'út', 'tér', 'körút', 'köz', 'fasor', 'sétány'];
const carBrands = {
    'Toyota': ['Corolla', 'Yaris', 'RAV4', 'Camry', 'C-HR'],
    'Ford': ['Focus', 'Fiesta', 'Mondeo', 'Puma', 'Kuga'],
    'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'T-Roc'],
    'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Crossland'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', '1 Series'],
    'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q3'],
    'Mercedes': ['C-Class', 'E-Class', 'A-Class', 'GLC', 'GLE'],
    'Suzuki': ['Vitara', 'Swift', 'S-Cross', 'Ignis'],
    'Kia': ['Ceed', 'Sportage', 'Rio', 'Niro'],
    'Hyundai': ['i30', 'Tucson', 'i20', 'Kona']
};
const domains = ['gmail.com', 'freemail.hu', 'citromail.hu', 'outlook.com', 'yahoo.com'];

// --- HELPERS ---
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().slice(0, 10);
}

function generateName() {
    const lastName = getRandomItem(lastNames);
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? getRandomItem(firstNamesMale) : getRandomItem(firstNamesFemale);
    return { fullName: `${lastName} ${firstName}`, firstName, lastName };
}

function generateCar() {
    const brand = getRandomItem(Object.keys(carBrands));
    const model = getRandomItem(carBrands[brand]);
    return { brand, model };
}

function generatePlate() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let p = '';
    for (let i = 0; i < 3; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
    p += '-';
    for (let i = 0; i < 3; i++) p += nums.charAt(Math.floor(Math.random() * nums.length));
    return p;
}

function generateVin() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 17; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// --- CLEAR DB ---
async function clearDatabase() {
    console.log('Clearing database...');
    // Delete in order of dependencies (if strict, but we have constraints: false)
    await AutoKibe.destroy({ where: {}, truncate: true });
    await Foglalas.destroy({ where: {}, truncate: true });
    await Auto.destroy({ where: {}, truncate: true });
    await Ugyfel.destroy({ where: {}, truncate: true });
    await Dolgozo.destroy({ where: {}, truncate: true });

    // Reset sequences
    await sequelize.query("DELETE FROM sqlite_sequence");
    console.log('Database cleared and IDs reset.');
}

// --- SEEDER ---
async function seedTable(model, generator, count, label) {
    console.log(`Starting seed for ${label}...`);
    let inserted = 0;
    for (let i = 0; i < count; i += BATCH_SIZE) {
        const batch = [];
        const currentBatchSize = Math.min(BATCH_SIZE, count - i);
        for (let j = 0; j < currentBatchSize; j++) {
            batch.push(generator());
        }
        await model.bulkCreate(batch);
        inserted += currentBatchSize;
        process.stdout.write(`\r${label}: ${inserted}/${count}`);
    }
    console.log(`\n${label} seeding completed.`);
}

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 0. Clean slate
        await clearDatabase();

        // 1. Dolgozok (Mixed realistic names)
        await seedTable(Dolgozo, () => {
            const { fullName } = generateName();
            return {
                nev: fullName,
                jelszo: 'jelszo123',
                jogosultsag: Math.random() > 0.9 ? 'admin' : 'dolgozo'
            };
        }, TOTAL_RECORDS, 'Dolgozok');

        // 2. Autok (Realistic cars)
        await seedTable(Auto, () => {
            const { brand, model } = generateCar();
            return {
                Rendszam: generatePlate(),
                Marka: brand,
                Modell: model,
                Evjarat: getRandomInt(2010, 2024),
                berleheto: true,
                elerheto: Math.random() > 0.2 ? true : false, // true = elvihető, false = nem elvihető
                Megjegyzes: Math.random() > 0.8 ? 'Kisebb sérülés' : null,
                Alvazszam: generateVin()
            };
        }, TOTAL_RECORDS, 'Autok');

        // Get ID range for Auto
        const minAutoId = await Auto.min('AutoID');
        const maxAutoId = await Auto.max('AutoID');

        // 3. Ugyfelek (Realistic personal data)
        await seedTable(Ugyfel, () => {
            const { fullName, firstName, lastName } = generateName();
            const city = getRandomItem(cities);
            const street = getRandomItem(lastNames) + ' ' + getRandomItem(streetTypes);
            const houseNum = getRandomInt(1, 150);
            const slug = `${lastName}.${firstName}`.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ö/g, 'o').replace(/ő/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u').replace(/ű/g, 'u');
            const email = `${slug}${getRandomInt(1, 99)}@${getRandomItem(domains)}`;

            return {
                Nev: fullName,
                Cim: `${city}, ${street} ${houseNum}.`,
                Telefonszam: '+36' + getRandomItem(['20', '30', '70']) + getRandomInt(1000000, 9999999),
                Email: email,
                igSzam: getRandomInt(100000, 999999) + getRandomItem(['AA', 'BA', 'CA', 'DA']),
                SzuletesiDatum: getRandomDate(new Date(1960, 0, 1), new Date(2004, 11, 31)),
                Jogosultsag: 'ugyfel',
                Jelszo: 'jelszo123'
            };
        }, TOTAL_RECORDS, 'Ugyfelek');

        // Get ID range for Ugyfel
        const minUgyfelId = await Ugyfel.min('ID');
        const maxUgyfelId = await Ugyfel.max('ID');

        // 4. Foglalasok
        await seedTable(Foglalas, () => {
            const start = getRandomDate(new Date(2023, 0, 1), new Date(2024, 0, 1));
            const startDate = new Date(start);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + getRandomInt(1, 14));

            return {
                auto_id: getRandomInt(minAutoId, maxAutoId),
                ugyfel_id: getRandomInt(minUgyfelId, maxUgyfelId),
                foglalaskezdete: start,
                foglalas_vege: endDate.toISOString().slice(0, 10),
                Ar: getRandomInt(5000, 30000) * getRandomInt(1, 14),
                Letrehozasdatuma: new Date().toISOString().slice(0, 10)
            };
        }, TOTAL_RECORDS, 'Foglalasok');

        // 5. AutoKibe (Car Log)
        await seedTable(AutoKibe, () => {
            const startKm = getRandomInt(10000, 200000);
            return {
                auto_id: getRandomInt(minAutoId, maxAutoId),
                elvitel: getRandomDate(new Date(2023, 0, 1), new Date(2024, 0, 1)),
                vissza: getRandomDate(new Date(2024, 1, 1), new Date(2025, 0, 1)), // simplified random dates
                Kilometer_kezdet: startKm,
                Kilometer_veg: startKm + getRandomInt(100, 2000)
            };
        }, TOTAL_RECORDS, 'AutoKibe');


        console.log('ALL TABLES seeded successfully!');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

run();

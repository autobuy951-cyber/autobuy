const { sequelize } = require('./models');
const { QueryTypes } = require('sequelize');

async function testStats() {
    try {
        console.log('Statisztika API tesztelése...\n');
        
        // Teszteljük a lekérdezéseket
        const osszesAuto = await sequelize.query('SELECT COUNT(*) as count FROM autok', { type: QueryTypes.SELECT });
        console.log('Összes autó:', osszesAuto[0].count);
        
        const osszesFoglalas = await sequelize.query('SELECT COUNT(*) as count FROM foglalasok', { type: QueryTypes.SELECT });
        console.log('Összes foglalás:', osszesFoglalas[0].count);
        
        const osszesUgyfel = await sequelize.query('SELECT COUNT(*) as count FROM ugyfelek', { type: QueryTypes.SELECT });
        console.log('Összes ügyfél:', osszesUgyfel[0].count);
        
        // Mai bevétel
        const today = new Date().toISOString().slice(0, 10);
        console.log('\nMai dátum:', today);
        
        const maiBevetel = await sequelize.query(
            "SELECT SUM(Ar) as bevetel FROM foglalasok WHERE Letrehozasdatuma LIKE ?",
            { 
                replacements: [`${today}%`],
                type: QueryTypes.SELECT 
            }
        );
        console.log('Mai bevétel:', maiBevetel[0].bevetel || 0);
        
        // Havi bontás teszt
        const currentYear = '2026';
        console.log('\nHavi bontás 2026:');
        for (let month = 1; month <= 3; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const result = await sequelize.query(
                "SELECT SUM(Ar) as bevetel FROM foglalasok WHERE Letrehozasdatuma LIKE ?",
                { 
                    replacements: [`${currentYear}-${monthStr}%`],
                    type: QueryTypes.SELECT 
                }
            );
            console.log(`  ${currentYear}-${monthStr}: ${result[0].bevetel || 0} Ft`);
        }
        
        // Legnépszerűbb autók
        console.log('\nLegnépszerűbb autók:');
        const topCars = await sequelize.query(`
            SELECT 
                a.AutoID,
                a.Marka,
                a.Modell,
                a.Rendszam,
                COUNT(f.Foglalasokid) as foglalasok_szama,
                SUM(f.Ar) as osszes_bevetel
            FROM autok a
            LEFT JOIN foglalasok f ON a.AutoID = f.auto_id
            GROUP BY a.AutoID
            ORDER BY foglalasok_szama DESC
            LIMIT 5
        `, { type: QueryTypes.SELECT });
        
        topCars.forEach((car, i) => {
            console.log(`  ${i+1}. ${car.Marka} ${car.Modell} (${car.Rendszam}) - ${car.foglalasok_szama} foglalás, ${car.osszes_bevetel || 0} Ft`);
        });
        
        await sequelize.close();
        console.log('\n✅ Teszt sikeres!');
    } catch (err) {
        console.error('\n❌ Hiba:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

testStats();

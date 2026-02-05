const { sequelize, Dolgozo } = require('./models');

async function testDolgozok() {
    try {
        console.log('Dolgozok API tesztelése...\n');
        
        // Összes dolgozó lekérdezése
        const dolgozok = await Dolgozo.findAll();
        console.log('Összes dolgozó:', dolgozok.length);
        
        if (dolgozok.length > 0) {
            console.log('\nElső 3 dolgozó:');
            dolgozok.slice(0, 3).forEach(d => {
                console.log(`  - ${d.nev} (${d.jogosultsag})`);
            });
        }
        
        await sequelize.close();
        console.log('\n✅ Teszt sikeres!');
    } catch (err) {
        console.error('\n❌ Hiba:', err.message);
        process.exit(1);
    }
}

testDolgozok();

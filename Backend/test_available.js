const { Auto } = require('./models');

async function testAvailable() {
    try {
        console.log('Elérhető autók ellenőrzése (berleheto = true):\n');
        
        // Összes autó
        const allCars = await Auto.findAll();
        console.log('Összes autó:', allCars.length);
        
        // Csak a berleheto = true autók
        const berlehetoCars = await Auto.findAll({
            where: { berleheto: true }
        });
        console.log('Bérelhető autók (berleheto = true):', berlehetoCars.length);
        
        // Az endpoint által visszaadott autók
        const availableCars = await Auto.findAll({
            where: {
                elerheto: true,
                berleheto: true,
                Allapot: 'elerheto'
            }
        });
        console.log('Teljesen elérhető autók (elerheto=true, berleheto=true, Allapot=elerheto):', availableCars.length);
        
        // Autók állapot szerint
        const byStatus = await Auto.findAll({
            attributes: ['Allapot', 'elerheto', 'berleheto'],
            raw: true
        });
        
        console.log('\nAutók állapot szerint:');
        const stats = {};
        byStatus.forEach(car => {
            const key = `${car.Allapot || 'nincs'} (e:${car.elerheto}, b:${car.berleheto})`;
            stats[key] = (stats[key] || 0) + 1;
        });
        
        Object.entries(stats).forEach(([key, count]) => {
            console.log(`  ${key}: ${count} db`);
        });
        
    } catch (err) {
        console.error('Hiba:', err);
    } finally {
        process.exit(0);
    }
}

testAvailable();

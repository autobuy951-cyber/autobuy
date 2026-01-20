const { sequelize, Auto, Dolgozo, Ugyfel, Foglalas, AutoKibe } = require('./models');

async function clearDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        console.log('Clearing tables...');

        // Delete in order to avoid potential constraint issues (though constraints: false in code)

        // 1. Foglalasok
        await Foglalas.destroy({ where: {}, truncate: true });
        console.log('Foglalasok table cleared.');

        // AutoKibe
        await AutoKibe.destroy({ where: {}, truncate: true });
        console.log('AutoKibe table cleared.');

        // 2. Autok
        await Auto.destroy({ where: {}, truncate: true });
        console.log('Autok table cleared.');

        // 3. Ugyfelek
        await Ugyfel.destroy({ where: {}, truncate: true });
        console.log('Ugyfelek table cleared.');

        // 4. Dolgozok
        await Dolgozo.destroy({ where: {}, truncate: true });
        console.log('Dolgozok table cleared.');

        // 5. Reset SQLite AutoIncrement Sequences
        await sequelize.query("DELETE FROM sqlite_sequence");
        console.log('Auto-increment counters reset.');

        console.log('All tables cleared successfully!');
    } catch (error) {
        console.error('Error clearing database:', error);
    } finally {
        await sequelize.close();
    }
}

clearDatabase();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'adatbazis.sqlite'
});

async function fixDatabase() {
    try {
        await sequelize.query('DROP TABLE IF EXISTS ugyfelek_backup');
        console.log('ugyfelek_backup tábla törölve');
        await sequelize.query('DROP TABLE IF EXISTS ugyfelek_backup_old');
        console.log('ugyfelek_backup_old tábla törölve');
        await sequelize.close();
        console.log('Kész!');
    } catch (err) {
        console.error('Hiba:', err);
        process.exit(1);
    }
}

fixDatabase();

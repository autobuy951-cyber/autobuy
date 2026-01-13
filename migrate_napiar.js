const { sequelize } = require('./models');

async function addNapiAr() {
    try {
        await sequelize.query(`
            ALTER TABLE autok ADD COLUMN NapiAr INTEGER DEFAULT 15000;
        `);
        console.log('NapiAr mező hozzáadva!');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('NapiAr mező már létezik');
        } else {
            console.error('Hiba:', err.message);
        }
    }
    process.exit(0);
}

addNapiAr();

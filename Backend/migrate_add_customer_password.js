const { sequelize } = require('./models');

async function addCustomerPassword() {
    try {
        await sequelize.query(`
            ALTER TABLE ugyfelek ADD COLUMN Jelszo TEXT;
        `);
        console.log('Jelszo mező hozzáadva az ugyfelek táblához!');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('Jelszo mező már létezik az ugyfelek táblában');
        } else {
            console.error('Hiba:', err.message);
        }
    }
    process.exit(0);
}

addCustomerPassword();

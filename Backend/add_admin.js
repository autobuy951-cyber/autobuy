const { Dolgozo } = require('./models');
const bcrypt = require('bcrypt');

async function addAdmin() {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        const admin = await Dolgozo.create({
            nev: 'admin',
            jelszo: hashedPassword,
            jogosultsag: 'admin'
        });

        console.log('Admin user created:', admin.toJSON());
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        process.exit();
    }
}

addAdmin();

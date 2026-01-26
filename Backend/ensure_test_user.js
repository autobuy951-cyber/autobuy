const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './adatbazis.sqlite'
});

const Ugyfel = sequelize.define('Ugyfel', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Nev: { type: DataTypes.TEXT },
    Email: { type: DataTypes.TEXT },
    Jelszo: { type: DataTypes.TEXT },
    Jogosultsag: { type: DataTypes.TEXT }
}, { tableName: 'ugyfelek', timestamps: false });

(async () => {
    try {
        await sequelize.authenticate();

        const email = 'kupi@gmail.com';
        const rawPassword = 'kupi';

        let user = await Ugyfel.findOne({ where: { Email: email } });

        if (user) {
            console.log('User already exists:', user.toJSON());
            // Update password just in case
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            user.Jelszo = hashedPassword;
            await user.save();
            console.log('Password updated.');
        } else {
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            user = await Ugyfel.create({
                Nev: 'Kupi Teszt',
                Email: email,
                Jelszo: hashedPassword,
                Jogosultsag: 'customer'
            });
            console.log('User created:', user.toJSON());
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
})();

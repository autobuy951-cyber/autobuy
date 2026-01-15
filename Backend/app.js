const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { sequelize, Dolgozo } = require('./models');
const bcrypt = require('bcrypt');

// Szinkronizálás az adatbázissal
sequelize.sync()
    .then(async () => {
        console.log('Adatbázis szinkronizálva');
        // Admin felhasználó létrehozása ha nem létezik
        const existingAdmin = await Dolgozo.findOne({ where: { nev: 'admin' } });
        if (!existingAdmin) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('admin123', saltRounds);
            await Dolgozo.create({
                nev: 'admin',
                jelszo: hashedPassword,
                jogosultsag: 'admin'
            });
            console.log('Admin felhasználó létrehozva');
        }
    })
    .catch(err => console.error('Hiba az adatbázis szinkronizálásakor:', err));

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Útvonalak importálása
const authRoutes = require('./routes/authRoutes');
const ugyfelRoutes = require('./routes/ugyfelRoutes');
const dolgozoRoutes = require('./routes/dolgozoRoutes');
const autoRoutes = require('./routes/autoRoutes');
const foglalasRoutes = require('./routes/foglalasRoutes');
const autoKibeRoutes = require('./routes/autoKibeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Útvonalak használata
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ugyfelek', ugyfelRoutes);
app.use('/api/dolgozok', dolgozoRoutes);
app.use('/api/autok', autoRoutes);
app.use('/api/foglalasok', foglalasRoutes);
app.use('/api/autokibe', autoKibeRoutes);

app.listen(port, () => {
    console.log(`Szerver fut a http://localhost:${port} címen`);
});

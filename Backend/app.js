const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Szinkronizálás az adatbázissal
sequelize.sync()
    .then(() => console.log('Adatbázis szinkronizálva (újraépítve)'))
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

const express = require('express');
const { sequelize } = require('./models');

// Szinkronizálás az adatbázissal
sequelize.sync()
    .then(() => console.log('Adatbázis szinkronizálva (újraépítve)'))
    .catch(err => console.error('Hiba az adatbázis szinkronizálásakor:', err));

const app = express();
const port = 3000;

app.use(express.json());

// Útvonalak importálása
const ugyfelRoutes = require('./routes/ugyfelRoutes');
const dolgozoRoutes = require('./routes/dolgozoRoutes');
const autoRoutes = require('./routes/autoRoutes');
const foglalasRoutes = require('./routes/foglalasRoutes');
const autoKibeRoutes = require('./routes/autoKibeRoutes');

// Útvonalak használata
app.use('/api/ugyfelek', ugyfelRoutes);
app.use('/api/dolgozok', dolgozoRoutes);
app.use('/api/autok', autoRoutes);
app.use('/api/foglalasok', foglalasRoutes);
app.use('/api/autokibe', autoKibeRoutes);

app.listen(port, () => {
    console.log(`Szerver fut a http://localhost:${port} címen`);
});

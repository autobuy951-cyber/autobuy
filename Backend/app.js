const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { sequelize, Dolgozo } = require('./models');
const bcrypt = require('bcrypt');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Szinkronizálás az adatbázissal
sequelize.sync()
  .then(async () => {
    logger.info('Adatbázis szinkronizálva');
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
      logger.info('Admin felhasználó létrehozva');
    }
  })
  .catch(err => logger.error('Hiba az adatbázis szinkronizálásakor:', err));

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Lekérdezések loggolása middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Kérés loggolása
  let logMessage = `➤ ${req.method} ${req.path}`;

  if (Object.keys(req.query).length > 0) {
    logMessage += ` | Query: ${JSON.stringify(req.query)}`;
  }

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    logMessage += ` | Body: ${JSON.stringify(req.body)}`;
  }

  if (req.headers.authorization) {
    logMessage += ` | Auth: ✓`;
  }

  logger.info(logMessage);

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    logger.info(`← ${req.method} ${req.path} | Státusz: ${res.statusCode} | Idő: ${duration}ms`);
    originalSend.call(this, data);
  };

  next();
});

// Útvonalak importálása
const authRoutes = require('./routes/authRoutes');
const ugyfelRoutes = require('./routes/ugyfelRoutes');
const dolgozoRoutes = require('./routes/dolgozoRoutes');
const autoRoutes = require('./routes/autoRoutes');
const foglalasRoutes = require('./routes/foglalasRoutes');
const autoKibeRoutes = require('./routes/autoKibeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Útvonalak használata
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ugyfelek', ugyfelRoutes);
app.use('/api/dolgozok', dolgozoRoutes);
app.use('/api/autok', autoRoutes);
app.use('/api/foglalasok', foglalasRoutes);
app.use('/api/autokibe', autoKibeRoutes);
app.use('/api/stats', statsRoutes);

app.listen(port, () => {
  logger.info(`Szerver fut a http://localhost:${port} címen`);
});

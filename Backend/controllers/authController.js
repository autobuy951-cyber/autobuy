const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Dolgozo, Ugyfel } = require('../models');

exports.login = async (req, res) => {
    try {
        const { nev, jelszo } = req.body;
        const user = await Dolgozo.findOne({ where: { nev } });

        if (!user) {
            return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó' });
        }

        // Admin és dolgozó is beléphet
        if (user.jogosultsag !== 'admin' && user.jogosultsag !== 'dolgozo') {
            return res.status(403).json({ message: 'Nincs jogosultsága a belépéshez.' });
        }

        // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        let isValid = false;
        if (user.jelszo.startsWith('$2')) {
            // Hashed password
            isValid = await bcrypt.compare(jelszo, user.jelszo);
        } else {
            // Plain text password (legacy support)
            isValid = jelszo === user.jelszo;
        }

        if (!isValid) {
            return res.status(401).json({ message: 'Hibás felhasználónév vagy jelszó' });
        }

        const token = jwt.sign(
            { id: user.id, nev: user.nev, jogosultsag: user.jogosultsag },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token: token,
            expiresIn: 86400,
            userId: user.id,
            jogosultsag: user.jogosultsag
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a bejelentkezés során' });
    }
};

exports.register = async (req, res) => {
    try {
        const { nev, jelszo, jogosultsag = 'user' } = req.body;

        // Check if user already exists
        const existingUser = await Dolgozo.findOne({ where: { nev } });
        if (existingUser) {
            return res.status(400).json({ message: 'Ez a felhasználónév már foglalt' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(jelszo, saltRounds);

        // Create new user
        const newUser = await Dolgozo.create({
            nev,
            jelszo: hashedPassword,
            jogosultsag
        });

        // Generate token for auto-login after registration
        const token = jwt.sign(
            { id: newUser.id, nev: newUser.nev, jogosultsag: newUser.jogosultsag },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Felhasználó sikeresen létrehozva',
            token: token,
            expiresIn: 86400,
            userId: newUser.id,
            jogosultsag: newUser.jogosultsag
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a regisztráció során' });
    }
};

exports.verify = async (req, res) => {
    try {
        // The token is already verified in middleware
        res.status(200).json({
            valid: true,
            user: req.userData
        });
    } catch (err) {
        res.status(401).json({ message: 'Érvénytelen token' });
    }
};

exports.loginCustomer = async (req, res) => {
    try {
        const { email, jelszo } = req.body;
        // Keresés Email alapján
        const user = await Ugyfel.findOne({ where: { Email: email } });

        if (!user) {
            return res.status(401).json({ message: 'Hibás email cím vagy jelszó' });
        }

        // Check if password is hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        let isValid = false;
        if (user.Jelszo && user.Jelszo.startsWith('$2')) {
            // Hashed password
            isValid = await bcrypt.compare(jelszo, user.Jelszo);
        } else {
            // Plain text password (legacy support) or no password set
            isValid = jelszo === user.Jelszo;
        }

        if (!isValid) {
            return res.status(401).json({ message: 'Hibás email cím vagy jelszó' });
        }

        const token = jwt.sign(
            { id: user.ID, nev: user.Nev, jogosultsag: user.Jogosultsag || 'customer', type: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token: token,
            expiresIn: 86400,
            userId: user.ID,
            jogosultsag: user.Jogosultsag || 'customer',
            nev: user.Nev // Visszaküldjük a nevet is, ha a frontendnek kellene
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a bejelentkezés során' });
    }
};

exports.registerCustomer = async (req, res) => {
    try {
        const { nev, jelszo, email, jogosultsag = 'customer', ...otherFields } = req.body;

        // Check if user already exists (by Name OR Email)
        const existingUser = await Ugyfel.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { Nev: nev },
                    { Email: email || '' }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Ez a felhasználónév vagy email már foglalt' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(jelszo, saltRounds);

        // Create new customer
        const newUser = await Ugyfel.create({
            Nev: nev,
            Email: email, // Explicitly map email
            Jelszo: hashedPassword,
            Jogosultsag: jogosultsag,
            ...otherFields
        });

        // Generate token for auto-login after registration
        const token = jwt.sign(
            { id: newUser.ID, nev: newUser.Nev, jogosultsag: newUser.Jogosultsag, type: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Ügyfél sikeresen létrehozva',
            token: token,
            expiresIn: 86400,
            userId: newUser.ID,
            jogosultsag: newUser.Jogosultsag
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a regisztráció során' });
    }
};

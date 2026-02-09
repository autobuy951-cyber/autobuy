const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sequelize, Dolgozo, Ugyfel, PasswordReset, EmailVerification } = require('../models');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../services/emailService');

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

        // Check if user is inactive (email not verified)
        if (user.Jogosultsag === 'inactive') {
            return res.status(403).json({ 
                message: 'Email cím még nincs megerősítve. Kérjük, erősítse meg email címét a bejelentkezéshez.',
                needsVerification: true
            });
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

        // Átalakítjuk 'customer'-t 'ugyfel'-re a frontend kompatibilitás miatt
        const jogosultsag = user.Jogosultsag === 'customer' ? 'ugyfel' : (user.Jogosultsag || 'ugyfel');
        
        const token = jwt.sign(
            { id: user.ID, nev: user.Nev, jogosultsag: jogosultsag, type: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token: token,
            expiresIn: 86400,
            userId: user.ID,
            jogosultsag: jogosultsag,
            nev: user.Nev // Visszaküldjük a nevet is, ha a frontendnek kellene
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a bejelentkezés során' });
    }
};

exports.registerCustomer = async (req, res) => {
    try {
        // A frontend nagybetűs kulcsokat küld (Nev, Jelszo, Email stb.)
        const { Nev, Jelszo, Email, Jogosultsag = 'customer', ...otherFields } = req.body;

        console.log('[REGISTER] Beérkezett adatok:', { Nev, Email });

        // Check if user already exists (by Name OR Email)
        const existingUser = await Ugyfel.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { Nev: Nev },
                    { Email: Email || '' }
                ]
            }
        });

        if (existingUser) {
            console.log('[REGISTER] Már létező felhasználó:', existingUser.Email);
            return res.status(400).json({ message: 'Ez a felhasználónév vagy email már foglalt' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Jelszo, saltRounds);

        // Create new customer (inactive until email verified)
        const newUser = await Ugyfel.create({
            Nev: Nev,
            Email: Email,
            Jelszo: hashedPassword,
            Jogosultsag: 'inactive', // Inaktív amíg nem erősíti meg az emailt
            ...otherFields
        });

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 3600000); // 24 óra

        // Save verification token
        await EmailVerification.create({
            email: Email,
            token: verificationToken,
            expiresAt: expiresAt,
            used: false
        });

        // Send verification email
        const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}&email=${encodeURIComponent(Email)}`;
        
        try {
            await sendVerificationEmail(Email, verificationLink, Nev);
        } catch (emailErr) {
            console.error('[REGISTER] Hiba a megerősítő email küldésekor:', emailErr);
        }

        res.status(201).json({
            message: 'Sikeres regisztráció! Kérjük, erősítse meg email címét.',
            devLink: verificationLink // Csak fejlesztési célra
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a regisztráció során' });
    }
};

// Email megerősítés
exports.verifyEmail = async (req, res) => {
    try {
        const { email, token } = req.body;
        
        // Find verification record
        const verification = await EmailVerification.findOne({
            where: {
                email: email,
                token: token,
                used: false
            }
        });
        
        if (!verification) {
            return res.status(400).json({ error: 'Érvénytelen vagy lejárt token' });
        }
        
        // Check expiration
        if (new Date() > verification.expiresAt) {
            return res.status(400).json({ error: 'A megerősítő link lejárt' });
        }
        
        // Activate user
        const user = await Ugyfel.findOne({ where: { Email: email } });
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található' });
        }
        
        await user.update({ Jogosultsag: 'ugyfel' });
        
        // Mark token as used
        await verification.update({ used: true });
        
        res.json({ message: 'Email sikeresen megerősítve! Most már bejelentkezhet.' });
    } catch (err) {
        console.error('[VERIFY EMAIL] Hiba:', err);
        res.status(500).json({ error: 'Hiba az email megerősítése során' });
    }
};

// Jelszó visszaállítás kérése - email küldése tokennel
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('[FORGOT PASSWORD] Email kapva:', email);
        
        // Keressük az ügyfelet email alapján (case-insensitive)
        const user = await Ugyfel.findOne({ 
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('Email')),
                sequelize.fn('LOWER', email)
            )
        });
        
        // Ha nem találtuk, nézzük meg mi van az adatbázisban
        if (!user) {
            const allUsers = await Ugyfel.findAll({ attributes: ['Email'] });
            console.log('[FORGOT PASSWORD] Az adatbázisban lévő emailek:');
            allUsers.forEach((u, i) => {
                console.log(`  ${i + 1}. "${u.Email}"`);
                if (u.Email.toLowerCase().trim() === email.toLowerCase().trim()) {
                    console.log(`     ^^^ EGYEZIK a keresettel!`);
                }
            });
            console.log('[FORGOT PASSWORD] Keresett email hossza:', email.length);
            console.log('[FORGOT PASSWORD] Keresett email (hex):', Buffer.from(email).toString('hex'));
        }
        
        console.log('[FORGOT PASSWORD] User találat:', user ? 'IGEN' : 'NEM');
        
        if (!user) {
            // Biztonsági okokból nem áruljuk el, hogy létezik-e az email
            console.log('[FORGOT PASSWORD] User nem található, email küldés megszakítva');
            return res.json({ message: 'Ha a megadott email cím regisztrálva van, küldtünk egy visszaállítási linket.' });
        }
        
        // Generáljunk egy random tokent
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 óra
        console.log('[FORGOT PASSWORD] Token generálva:', token.substring(0, 10) + '...');
        
        // Töröljük a korábbi tokeneket ehhez az emailhez
        await PasswordReset.destroy({ where: { email: email } });
        
        // Mentsük az új tokent
        await PasswordReset.create({
            email: email,
            token: token,
            expiresAt: expiresAt,
            used: false
        });
        console.log('[FORGOT PASSWORD] Token elmentve az adatbázisba');
        
        // Email küldés
        const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        console.log('[FORGOT PASSWORD] Reset link:', resetLink);
        
        try {
            console.log('[FORGOT PASSWORD] Email küldés megkezdése...');
            await sendPasswordResetEmail(email, resetLink);
            console.log('[FORGOT PASSWORD] Email elküldve!');
        } catch (emailErr) {
            console.error('[FORGOT PASSWORD] Hiba az email küldésekor:', emailErr);
        }
        
        // Fejlesztési módban visszaadjuk a linket a válaszban is
        res.json({ 
            message: 'Ha a megadott email cím regisztrálva van, küldtünk egy visszaállítási linket.',
            devLink: resetLink // Csak fejlesztési célra
        });
    } catch (err) {
        console.error('[FORGOT PASSWORD] Hiba:', err);
        res.status(500).json({ error: 'Hiba a kérés feldolgozása során' });
    }
};

// Jelszó visszaállítás - új jelszó beállítása
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        
        // Keressük a token-t
        const resetRecord = await PasswordReset.findOne({
            where: {
                email: email,
                token: token,
                used: false
            }
        });
        
        if (!resetRecord) {
            return res.status(400).json({ error: 'Érvénytelen vagy lejárt token' });
        }
        
        // Ellenőrizzük, hogy nem járt-e le
        if (new Date() > resetRecord.expiresAt) {
            return res.status(400).json({ error: 'A token lejárt' });
        }
        
        // Keressük az ügyfelet
        const user = await Ugyfel.findOne({ where: { Email: email } });
        
        if (!user) {
            return res.status(404).json({ error: 'Felhasználó nem található' });
        }
        
        // Hash-eljük az új jelszót
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Frissítjük a jelszót
        await user.update({ Jelszo: hashedPassword });
        
        // Jelöljük a token-t használtként
        await resetRecord.update({ used: true });
        
        res.json({ message: 'Jelszó sikeresen megváltoztatva' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a jelszó visszaállítása során' });
    }
};

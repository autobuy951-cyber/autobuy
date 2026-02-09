const nodemailer = require('nodemailer');

// SMTP transporter létrehozása
const createTransporter = () => {
    // Ha nincs beállítva az email, fejlesztési módban konzolra logolunk
    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'ide_ird_az_app_passwordot') {
        console.log('[EMAIL] Nincs email beállítva, konzolra logolás mód');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const transporter = createTransporter();

const sendEmail = async (to, subject, html) => {
    // Ha nincs transporter (nincs beállítva email), konzolra logolunk
    if (!transporter) {
        console.log('========================================');
        console.log('📧 EMAIL (KONZOL MÓD - nincs SMTP beállítva)');
        console.log('========================================');
        console.log('Címzett:', to);
        console.log('Tárgy:', subject);
        console.log('========================================');
        console.log('HTML Tartalom:');
        console.log(html);
        console.log('========================================');
        return { success: true, messageId: 'mock-' + Date.now() };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'AutoBuy <autobuy951@gmail.com>',
            to: to,
            subject: subject,
            html: html
        });
        
        console.log('[EMAIL] Elküldve:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL] Hiba küldéskor:', error);
        throw error;
    }
};

// Foglalás visszaigazoló email
const sendBookingConfirmation = async (userEmail, bookingDetails) => {
    const subject = 'Foglalás visszaigazolás - AutoBuy';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ff4757;">Kedves Ügyfelünk!</h2>
            <p>Foglalását sikeresen rögzítettük. Az alábbiakban találja a részleteket:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>🚗 Autó:</strong> ${bookingDetails.carName}</p>
                <p><strong>🔢 Rendszám:</strong> ${bookingDetails.plate}</p>
                <p><strong>📅 Elvitel:</strong> ${bookingDetails.startDate}</p>
                <p><strong>📅 Visszahozatal:</strong> ${bookingDetails.endDate}</p>
                <p><strong>💰 Fizetendő összeg:</strong> ${bookingDetails.price.toLocaleString('hu-HU')} Ft</p>
            </div>
            <p>Köszönjük, hogy minket választott!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;"><strong>AutoBuy Csapat</strong><br>
            📧 autobuy951@gmail.com</p>
        </div>
    `;
    
    return await sendEmail(userEmail, subject, html);
};

// Foglalás emlékeztető email
const sendBookingReminder = async (userEmail, bookingDetails) => {
    const subject = 'Emlékeztető - Holnapi autó átvétel - AutoBuy';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3742fa;">Emlékeztető</h2>
            <p>Kedves Ügyfelünk!</p>
            <p>Emlékeztetjük, hogy <strong>holnap</strong> átveheti a lefoglalt autóját:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>🚗 Autó:</strong> ${bookingDetails.carName}</p>
                <p><strong>🔢 Rendszám:</strong> ${bookingDetails.plate}</p>
                <p><strong>📅 Átvétel időpontja:</strong> ${bookingDetails.startDate}</p>
            </div>
            <p>Várjuk Önt!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;"><strong>AutoBuy Csapat</strong><br>
            📧 autobuy951@gmail.com</p>
        </div>
    `;
    
    return await sendEmail(userEmail, subject, html);
};

// Email megerősítés
const sendVerificationEmail = async (userEmail, verificationLink, userName) => {
    const subject = 'Email megerősítés - AutoBuy';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2ed573;">Üdvözlünk az AutoBuy-nál!</h2>
            <p>Kedves ${userName || 'Ügyfelünk'}!</p>
            <p>Köszönjük a regisztrációt. Kérjük, erősítse meg email címét az alábbi gombra kattintva:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background: #2ed573; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Email megerősítése</a>
            </div>
            <p style="color: #666;">A link <strong>24 órán</strong> belül lejár.</p>
            <p style="color: #666;">Ha Ön nem regisztrált az oldalunkon, kérjük, hagyja figyelmen kívül ezt az emailt.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Ha a gomb nem működik, másolja be ezt a linket a böngészőbe:<br>
            <a href="${verificationLink}" style="color: #2ed573;">${verificationLink}</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;"><strong>AutoBuy Csapat</strong><br>
            📧 autobuy951@gmail.com</p>
        </div>
    `;
    
    return await sendEmail(userEmail, subject, html);
};

// Jelszó visszaállítási email
const sendPasswordResetEmail = async (userEmail, resetLink) => {
    const subject = 'Jelszó visszaállítás - AutoBuy';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ff4757;">Jelszó visszaállítás</h2>
            <p>Kedves Ügyfelünk!</p>
            <p>Kattintson az alábbi gombra a jelszó visszaállításához:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: #ff4757; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Jelszó visszaállítása</a>
            </div>
            <p style="color: #666;">A link <strong>1 órán</strong> belül lejár.</p>
            <p style="color: #666;">Ha Ön nem kérte a jelszó visszaállítást, kérjük, hagyja figyelmen kívül ezt az emailt.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Ha a gomb nem működik, másolja be ezt a linket a böngészőbe:<br>
            <a href="${resetLink}" style="color: #ff4757;">${resetLink}</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;"><strong>AutoBuy Csapat</strong><br>
            📧 autobuy951@gmail.com</p>
        </div>
    `;
    
    return await sendEmail(userEmail, subject, html);
};

module.exports = {
    sendEmail,
    sendBookingConfirmation,
    sendBookingReminder,
    sendPasswordResetEmail,
    sendVerificationEmail
};

const { Auto, Foglalas, Ugyfel, AutoKibe, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const currentMonth = today.slice(0, 7); // YYYY-MM format
        const currentYear = today.slice(0, 4);  // YYYY format

        // Alap statisztikák
        const osszesAuto = await Auto.count();
        const elerhetoAuto = await Auto.count({ where: { elerheto: true, berleheto: true } });
        const aktivFoglalas = await Foglalas.count({
            where: {
                foglalaskezdete: { [Op.lte]: today },
                foglalas_vege: { [Op.gte]: today }
            }
        });

        // Mai bevétel
        const maiBevetelResult = await Foglalas.sum('Ar', {
            where: {
                Letrehozasdatuma: { [Op.like]: `${today}%` }
            }
        });
        const maiBevetel = maiBevetelResult || 0;

        // Havi bevétel
        const haviBevetelResult = await Foglalas.sum('Ar', {
            where: {
                Letrehozasdatuma: { [Op.like]: `${currentMonth}%` }
            }
        });
        const haviBevetel = haviBevetelResult || 0;

        // Éves bevétel
        const evesBevetelResult = await Foglalas.sum('Ar', {
            where: {
                Letrehozasdatuma: { [Op.like]: `${currentYear}%` }
            }
        });
        const evesBevetel = evesBevetelResult || 0;

        // Összes bevétel
        const osszesBevetelResult = await Foglalas.sum('Ar');
        const osszesBevetel = osszesBevetelResult || 0;

        // Legnépszerűbb autók (Top 5)
        const legnepszerubbAutok = await Foglalas.findAll({
            attributes: [
                'auto_id',
                [sequelize.fn('COUNT', sequelize.col('auto_id')), 'foglalasok_szama'],
                [sequelize.fn('SUM', sequelize.col('Ar')), 'osszes_bevetel']
            ],
            include: [{
                model: Auto,
                attributes: ['Marka', 'Modell', 'Rendszam']
            }],
            group: ['auto_id'],
            order: [[sequelize.literal('foglalasok_szama'), 'DESC']],
            limit: 5
        });

        // Havi bontás az aktuális évre (grafikonhoz)
        const haviBontas = [];
        for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const monthKey = `${currentYear}-${monthStr}`;
            
            const monthRevenue = await Foglalas.sum('Ar', {
                where: {
                    Letrehozasdatuma: { [Op.like]: `${monthKey}%` }
                }
            });
            
            haviBontas.push({
                honap: monthStr,
                bevetel: monthRevenue || 0
            });
        }

        // Statisztikák foglalásokról
        const osszesFoglalas = await Foglalas.count();
        const lejartFoglalas = await Foglalas.count({
            where: {
                foglalas_vege: { [Op.lt]: today }
            }
        });
        const jovobeliFoglalas = await Foglalas.count({
            where: {
                foglalaskezdete: { [Op.gt]: today }
            }
        });

        // Ügyfelek száma
        const osszesUgyfel = await Ugyfel.count();

        res.json({
            osszesAuto,
            elerhetoAuto,
            aktivFoglalas,
            osszesFoglalas,
            lejartFoglalas,
            jovobeliFoglalas,
            osszesUgyfel,
            bevetelek: {
                mai: maiBevetel,
                havi: haviBevetel,
                eves: evesBevetel,
                osszes: osszesBevetel
            },
            haviBontas,
            legnepszerubbAutok: legnepszerubbAutok.map(a => ({
                autoId: a.auto_id,
                marka: a.Auto.Marka,
                modell: a.Auto.Modell,
                rendszam: a.Auto.Rendszam,
                foglalasokSzama: parseInt(a.get('foglalasok_szama')),
                osszesBevetel: parseInt(a.get('osszes_bevetel')) || 0
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getActivities = async (req, res) => {
    try {
        // Combine recent bookings and handovers
        // Since we can't easily UNION with sequelize in a simple way cross-table with different schemas
        // We'll fetch 5 of each and sort in JS

        const bookings = await Foglalas.findAll({
            limit: 5,
            order: [['Letrehozasdatuma', 'DESC']],
            include: [{ model: Auto }, { model: Ugyfel }]
        });

        const handovers = await AutoKibe.findAll({
            limit: 5,
            order: [['elvitel', 'DESC']],
            include: [{ model: Auto }]
        });

        const activities = [
            ...bookings.map(f => ({
                id: f.Foglalasokid,
                type: 'foglalas',
                date: f.Letrehozasdatuma,
                desc: `Foglalás: ${f.Auto.Rendszam} - ${f.Ugyfel.Nev}`
            })),
            ...handovers.map(h => ({
                id: h.Id,
                type: 'kibe',
                date: h.elvitel,
                desc: `Kiadás: ${h.Auto.Rendszam}`
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

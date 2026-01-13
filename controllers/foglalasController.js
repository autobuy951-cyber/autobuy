const { Foglalas, Auto, Ugyfel } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort_by = 'Letrehozasdatuma', sort_order = 'DESC', auto_id, ugyfel_id, kezdet, veg, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (auto_id) whereClause.auto_id = auto_id;
        if (ugyfel_id) whereClause.ugyfel_id = ugyfel_id;
        if (kezdet) whereClause.foglalaskezdete = { [Op.gte]: kezdet };
        if (veg) whereClause.foglalas_vege = { [Op.lte]: veg };

        // Status filter is complex because it depends on date comparison
        const today = new Date().toISOString().slice(0, 10);
        if (status === 'aktiv') {
            whereClause.foglalaskezdete = { [Op.lte]: today };
            whereClause.foglalas_vege = { [Op.gte]: today };
        } else if (status === 'lejart') {
            whereClause.foglalas_vege = { [Op.lt]: today };
        } else if (status === 'jovobeli') {
            whereClause.foglalaskezdete = { [Op.gt]: today };
        }

        const { count, rows } = await Foglalas.findAndCountAll({
            where: whereClause,
            include: [
                { model: Auto, attributes: ['Rendszam', 'Marka', 'Modell'] },
                { model: Ugyfel, attributes: ['Nev', 'Telefonszam'] }
            ],
            order: [[sort_by, sort_order]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Post-process status
        const result = rows.map(f => {
            const row = f.toJSON();
            if (row.foglalas_vege < today) row.status = 'lejart';
            else if (row.foglalaskezdete <= today && row.foglalas_vege >= today) row.status = 'aktiv';
            else row.status = 'jovobeli';
            return row;
        });

        res.json({
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { auto_id, ugyfel_id, foglalaskezdete, foglalas_vege } = req.body;

        // Validate overlap
        const overlaps = await Foglalas.findAll({
            where: {
                auto_id,
                [Op.or]: [
                    {
                        foglalaskezdete: { [Op.lte]: foglalas_vege },
                        foglalas_vege: { [Op.gte]: foglalaskezdete }
                    }
                ]
            }
        });

        if (overlaps.length > 0) {
            return res.status(400).json({ error: 'Az autó már foglalt ebben az időszakban' });
        }

        // Calculate price - fixed rate 15000 per day
        const start = new Date(foglalaskezdete);
        const end = new Date(foglalas_vege);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
        const Ar = diffDays * 15000;

        const newFoglalas = await Foglalas.create({
            auto_id,
            ugyfel_id,
            foglalaskezdete,
            foglalas_vege,
            Ar,
            Letrehozasdatuma: new Date().toISOString()
        });

        res.status(201).json(newFoglalas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const foglalas = await Foglalas.findByPk(req.params.id);
        if (!foglalas) return res.status(404).json({ error: 'Foglalás nem található' });

        const today = new Date().toISOString().slice(0, 10);
        if (foglalas.foglalaskezdete <= today) {
            return res.status(400).json({ error: 'Csak jövőbeli foglalások törölhetők' });
        }

        await foglalas.destroy();
        res.json({ message: 'Foglalás törölve' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

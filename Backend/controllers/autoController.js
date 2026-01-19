const { Auto, Foglalas } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort_by = 'AutoID', sort_order = 'ASC', search, marka, modell, elerheto, evjarat_min, evjarat_max } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { Rendszam: { [Op.like]: `%${search}%` } },
                { Marka: { [Op.like]: `%${search}%` } },
                { Modell: { [Op.like]: `%${search}%` } }
            ];
        }

        if (marka) whereClause.Marka = { [Op.like]: `%${marka}%` };
        if (modell) whereClause.Modell = { [Op.like]: `%${modell}%` };
        if (elerheto !== undefined) whereClause.elerheto = elerheto === 'true';

        if (evjarat_min || evjarat_max) {
            whereClause.Evjarat = {};
            if (evjarat_min) whereClause.Evjarat[Op.gte] = evjarat_min;
            if (evjarat_max) whereClause.Evjarat[Op.lte] = evjarat_max;
        }

        const { count, rows } = await Auto.findAndCountAll({
            where: whereClause,
            order: [[sort_by, sort_order]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            data: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba az adatok lekérésekor' });
    }
};

exports.getById = async (req, res) => {
    try {
        const auto = await Auto.findByPk(req.params.id);
        if (!auto) return res.status(404).json({ error: 'Autó nem található' });
        res.json(auto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newAuto = await Auto.create(req.body);
        res.status(201).json(newAuto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Auto.update(req.body, {
            where: { AutoID: req.params.id }
        });
        if (updated) {
            const updatedAuto = await Auto.findByPk(req.params.id);
            res.json(updatedAuto);
        } else {
            res.status(404).json({ error: 'Autó nem található' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Auto.destroy({
            where: { AutoID: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'Autó törölve' });
        } else {
            res.status(404).json({ error: 'Autó nem található' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAvailable = async (req, res) => {
    try {
        const { kezdet, veg } = req.query;
        if (!kezdet || !veg) {
            return res.status(400).json({ error: 'Kezdő és vég dátum megadása kötelező' });
        }

        const foglaltAutoIds = await Foglalas.findAll({
            attributes: ['auto_id'],
            where: {
                [Op.or]: [
                    {
                        foglalaskezdete: { [Op.lte]: veg },
                        foglalas_vege: { [Op.gte]: kezdet }
                    }
                ]
            },
            raw: true
        });

        const ids = foglaltAutoIds.map(f => f.auto_id);

        const availableAutos = await Auto.findAll({
            where: {
                AutoID: { [Op.notIn]: ids },
                elerheto: true,
                berleheto: true
            }
        });

        res.json(availableAutos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

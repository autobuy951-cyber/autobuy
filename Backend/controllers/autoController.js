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
        const autoData = { ...req.body };
        if (req.file) {
            // Construct the full URL for the image
            const protocol = req.protocol;
            const host = req.get('host');
            autoData.KepURL = `${protocol}://${host}/uploads/cars/${req.file.filename}`;
        }

        const newAuto = await Auto.create(autoData);
        res.status(201).json(newAuto);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const autoData = { ...req.body };
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            autoData.KepURL = `${protocol}://${host}/uploads/cars/${req.file.filename}`;
        }

        const [updated] = await Auto.update(autoData, {
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

        // Alap where feltétel - csak a berleheto = true autók látszódjanak az ügyfélnek
        const baseWhere = {
            berleheto: true  // Csak ez a feltétel számít az ügyfél számára
        };

        // Ha nincs dátum megadva, adjuk vissza az összes alapvetően elérhető autót
        if (!kezdet || !veg) {
            const availableAutos = await Auto.findAll({
                where: baseWhere
            });
            return res.json(availableAutos);
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
                ...baseWhere
            }
        });

        res.json(availableAutos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getBrands = async (req, res) => {
    try {
        const brands = await Auto.findAll({
            attributes: ['Marka'],
            group: ['Marka'],
            order: [['Marka', 'ASC']]
        });

        const brandList = brands.map(brand => brand.Marka);
        res.json(brandList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a márkák lekérésekor' });
    }
};

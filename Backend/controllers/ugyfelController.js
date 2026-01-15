const { Ugyfel } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort_by = 'ID', sort_order = 'ASC', search, jogosultsag, nev, telefonszam, email } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { Nev: { [Op.like]: `%${search}%` } },
                { Telefonszam: { [Op.like]: `%${search}%` } },
                { Email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (jogosultsag) whereClause.Jogosultsag = jogosultsag;
        if (nev) whereClause.Nev = { [Op.like]: `%${nev}%` };
        if (telefonszam) whereClause.Telefonszam = { [Op.like]: `%${telefonszam}%` };
        if (email) whereClause.Email = { [Op.like]: `%${email}%` };

        const { count, rows } = await Ugyfel.findAndCountAll({
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
        res.status(500).json({ error: err.message });
    }
};

exports.search = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        const customers = await Ugyfel.findAll({
            where: {
                Nev: { [Op.like]: `%${q}%` }
            },
            limit: parseInt(limit),
            attributes: ['ID', 'Nev', 'Telefonszam']
        });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const ugyfel = await Ugyfel.findByPk(req.params.id);
        if (!ugyfel) return res.status(404).json({ error: 'Ügyfél nem található' });
        res.json(ugyfel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAlphabetical = async (req, res) => {
    // Deprecated? Or just list sorted by name?
    // Implementing as list sorted by name
    req.query.sort_by = 'Nev';
    req.query.sort_order = 'ASC';
    exports.getAll(req, res);
};

exports.getByLetter = async (req, res) => {
    try {
        const { betu } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Ugyfel.findAndCountAll({
            where: {
                Nev: { [Op.like]: `${betu}%` }
            },
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
        res.status(500).json({ error: err.message });
    }
};

exports.getByLetterRange = async (req, res) => {
    try {
        const { tartomany } = req.params; // e.g. A-E
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [startLetter, endLetter] = tartomany.split('-');

        // This is a bit complex with regex or range in SQL on text. 
        // Simplest is >= start and < next char after end? Or just regex `^[A-E]`
        // Since sqlite/sequelize support comparison on text:

        const { count, rows } = await Ugyfel.findAndCountAll({
            where: {
                Nev: {
                    [Op.and]: [
                        { [Op.gte]: startLetter },
                        { [Op.lte]: endLetter + 'zzzz' } // hacky suffix to include matches starting with endLetter
                    ]
                }
            },
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
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const newUgyfel = await Ugyfel.create(req.body);
        res.status(201).json(newUgyfel);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Ugyfel.update(req.body, {
            where: { ID: req.params.id }
        });
        if (updated) {
            const updatedUgyfel = await Ugyfel.findByPk(req.params.id);
            res.json(updatedUgyfel);
        } else {
            res.status(404).json({ error: 'Ügyfél nem található' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        // Check if any booking exists?
        // Let SQL handle constraint or do manual check if generic
        const deleted = await Ugyfel.destroy({
            where: { ID: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'Ügyfél törölve' });
        } else {
            res.status(404).json({ error: 'Ügyfél nem található' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

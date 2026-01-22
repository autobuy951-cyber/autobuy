const { Dolgozo } = require('../models');
const bcrypt = require('bcrypt');

exports.getAll = async (req, res) => {
    try {
        if (req.userData.jogosultsag !== 'admin') {
            return res.status(403).json({ message: 'Hozzáférés megtagadva' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sort_by || 'nev';
        const sortOrder = req.query.sort_order || 'ASC';

        const where = {};

        // Search filter
        if (req.query.search) {
            where.nev = { [require('sequelize').Op.like]: `%${req.query.search}%` };
        }

        // Jogosultsag filter
        if (req.query.jogosultsag) {
            where.jogosultsag = req.query.jogosultsag;
        }

        const { count, rows } = await Dolgozo.findAndCountAll({
            where,
            attributes: { exclude: ['jelszo'] },
            order: [[sortBy, sortOrder]],
            limit,
            offset
        });

        res.json({
            data: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        if (req.userData && req.userData.jogosultsag !== 'admin') {
            // Only admin should create users ideally, or initial setup
        }

        const { nev, jelszo, jogosultsag } = req.body;
        const hashedPassword = await bcrypt.hash(jelszo, 10);

        const newDolgozo = await Dolgozo.create({
            nev,
            jelszo: hashedPassword,
            jogosultsag
        });

        // Remove password from response
        const response = newDolgozo.toJSON();
        delete response.jelszo;

        res.status(201).json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        if (req.userData.jogosultsag !== 'admin') {
            return res.status(403).json({ message: 'Hozzáférés megtagadva' });
        }

        const { nev, jelszo, jogosultsag } = req.body;
        const updateData = { nev, jogosultsag };

        // Only update password if provided
        if (jelszo) {
            updateData.jelszo = await bcrypt.hash(jelszo, 10);
        }

        const [updated] = await Dolgozo.update(updateData, {
            where: { id: req.params.id }
        });

        if (updated) {
            const updatedDolgozo = await Dolgozo.findByPk(req.params.id, {
                attributes: { exclude: ['jelszo'] }
            });
            res.json(updatedDolgozo);
        } else {
            res.status(404).json({ error: 'Dolgozó nem található' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        if (req.userData.jogosultsag !== 'admin') {
            return res.status(403).json({ message: 'Hozzáférés megtagadva' });
        }
        const deleted = await Dolgozo.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'Dolgozó törölve' });
        } else {
            res.status(404).json({ error: 'Dolgozó nem található' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

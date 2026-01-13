const { Dolgozo } = require('../models');
const bcrypt = require('bcrypt');

exports.getAll = async (req, res) => {
    try {
        if (req.userData.jogosultsag !== 'admin') {
            return res.status(403).json({ message: 'Hozzáférés megtagadva' });
        }
        const users = await Dolgozo.findAll({
            attributes: { exclude: ['jelszo'] }
        });
        res.json(users);
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

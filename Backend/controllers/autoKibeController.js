const { AutoKibe, Auto, Foglalas } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, auto_id, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (auto_id) whereClause.auto_id = auto_id;
        if (status === 'aktiv') whereClause.vissza = null;
        if (status === 'lezart') whereClause.vissza = { [Op.ne]: null };

        const { count, rows } = await AutoKibe.findAndCountAll({
            where: whereClause,
            include: [{ model: Auto, attributes: ['Rendszam'] }],
            order: [['elvitel', 'DESC']],
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
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { auto_id, elvitel, Kilometer_kezdet } = req.body;

        const newKibe = await AutoKibe.create({
            auto_id,
            elvitel,
            Kilometer_kezdet
        });

        res.status(201).json(newKibe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { vissza, Kilometer_veg } = req.body;
        const { id } = req.params;

        const [updated] = await AutoKibe.update({
            vissza,
            Kilometer_veg
        }, {
            where: { Id: id }
        });

        if (updated) {
            // If vissza is provided, update car availability
            if (vissza) {
                const autoKibe = await AutoKibe.findByPk(id);
                if (autoKibe) {
                    const today = new Date().toISOString().slice(0, 10);

                    // Check if there are any active reservations for this car
                    const activeReservations = await Foglalas.findAll({
                        where: {
                            auto_id: autoKibe.auto_id,
                            foglalaskezdete: { [Op.lte]: today },
                            foglalas_vege: { [Op.gte]: today }
                        }
                    });

                    if (activeReservations.length === 0) {
                        // No active reservations, set availability back to true
                        await Auto.update(
                            { elerheto: true, berleheto: true },
                            { where: { AutoID: autoKibe.auto_id } }
                        );
                    }
                }
            }

            res.json({ message: 'Rögzítve' });
        } else {
            res.status(404).json({ error: 'Nem található' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await AutoKibe.destroy({
            where: { Id: req.params.id }
        });
        if (deleted) res.json({ message: 'Törölve' });
        else res.status(404).json({ error: 'Nem található' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const { Foglalas, Auto, Ugyfel, AutoKibe } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort_by = 'Letrehozasdatuma', sort_order = 'DESC', auto_id, ugyfel_id, kezdet, veg, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (auto_id) whereClause.auto_id = auto_id;

        // Ha nem admin és nem dolgozó, csak a saját foglalásait láthatja
        if (req.userData && req.userData.jogosultsag !== 'admin' && req.userData.jogosultsag !== 'dolgozo') {
            whereClause.ugyfel_id = req.userData.id;
        } else if (ugyfel_id) {
            // Ha admin és kért specific ügyfelet
            whereClause.ugyfel_id = ugyfel_id;
        }

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
                { model: Auto, attributes: ['Rendszam', 'Marka', 'Modell', 'KepURL'] },
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
        // Support both snake_case (Backend standard) and PascalCase (Frontend standard)
        let { auto_id, ugyfel_id, foglalaskezdete, foglalas_vege } = req.body;

        // Fallback for Frontend inputs
        if (!auto_id) auto_id = req.body.AutoId;
        if (!ugyfel_id) ugyfel_id = req.body.UgyfelId;
        if (!foglalaskezdete) foglalaskezdete = req.body.FoglalasDatuma;
        if (!foglalas_vege) foglalas_vege = req.body.VisszahozasDatuma;

        if (!auto_id || !ugyfel_id || !foglalaskezdete || !foglalas_vege) {
            return res.status(400).json({ error: 'Hiányzó adatok (auto_id, ugyfel_id, kezdés, vég)' });
        }

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

        // Fetch the car to get its daily rate (NapiAr)
        const car = await Auto.findByPk(auto_id);
        if (!car) {
            return res.status(404).json({ error: 'Az autó nem található' });
        }

        // Calculate price using car's daily rate
        const start = new Date(foglalaskezdete);
        const end = new Date(foglalas_vege);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
        const Ar = diffDays * (car.NapiAr || 15000); // Use car's NapiAr or fallback to 15000

        const newFoglalas = await Foglalas.create({
            auto_id,
            ugyfel_id,
            foglalaskezdete,
            foglalas_vege,
            Ar,
            Letrehozasdatuma: new Date().toISOString()
        });

        // Set auto availability to false
        await Auto.update(
            { elerheto: false, berleheto: false },
            { where: { AutoID: auto_id } }
        );

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

        // Security check: Only owner or admin can delete
        if (req.userData && req.userData.jogosultsag !== 'admin') {
            if (foglalas.ugyfel_id !== req.userData.id) {
                return res.status(403).json({ error: 'Nincs jogosultsága törölni más foglalását' });
            }
        }

        const today = new Date().toISOString().slice(0, 10);

        // Admin user can delete any reservation, but customers can only delete future ones
        if (!req.userData || req.userData.jogosultsag !== 'admin') {
            if (foglalas.foglalaskezdete <= today) {
                return res.status(400).json({ error: 'Csak jövőbeli foglalások törölhetők' });
            }
        }

        const auto_id = foglalas.auto_id;

        await foglalas.destroy();

        // Check if there are any active reservations for this car
        const activeReservations = await Foglalas.findAll({
            where: {
                auto_id,
                foglalaskezdete: { [Op.lte]: today },
                foglalas_vege: { [Op.gte]: today }
            }
        });

        if (activeReservations.length === 0) {
            // No active reservations, set availability back to true
            await Auto.update(
                { elerheto: true, berleheto: true },
                { where: { AutoID: auto_id } }
            );
        }

        res.json({ message: 'Foglalás törölve' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.return = async (req, res) => {
    try {
        const foglalas = await Foglalas.findByPk(req.params.id);
        if (!foglalas) return res.status(404).json({ error: 'Foglalás nem található' });

        const { kilometer_veg } = req.body;
        if (kilometer_veg === undefined) {
            return res.status(400).json({ error: 'Kilometer vég szükséges' });
        }

        const today = new Date().toISOString().slice(0, 10);

        // Add to AutoKibe
        await AutoKibe.create({
            auto_id: foglalas.auto_id,
            elvitel: foglalas.foglalaskezdete,
            vissza: today,
            Kilometer_kezdet: 0, // Placeholder, as not tracked
            Kilometer_veg: kilometer_veg
        });

        // Check if there are any active reservations for this car
        const activeReservations = await Foglalas.findAll({
            where: {
                auto_id: foglalas.auto_id,
                foglalaskezdete: { [Op.lte]: today },
                foglalas_vege: { [Op.gte]: today }
            }
        });

        if (activeReservations.length === 0) {
            // No active reservations, set availability back to true
            await Auto.update(
                { elerheto: true, berleheto: true },
                { where: { AutoID: foglalas.auto_id } }
            );
        }

        res.json({ message: 'Autó visszaadva' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

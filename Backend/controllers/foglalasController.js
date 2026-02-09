const { Foglalas, Auto, Ugyfel, AutoKibe } = require('../models');
const { Op } = require('sequelize');
const { sendBookingConfirmation } = require('../services/emailService');

exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort_by = 'Letrehozasdatuma', sort_order = 'DESC', auto_id, ugyfel_id, kezdet, veg, status, name_search, date_search } = req.query;
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

        const includeOptions = [
            { model: Auto, attributes: ['Rendszam', 'Marka', 'Modell', 'KepURL'] },
            { model: Ugyfel, attributes: ['Nev', 'Telefonszam'] }
        ];

        // Add search functionality
        if (name_search) {
            includeOptions[1] = {
                model: Ugyfel,
                attributes: ['Nev', 'Telefonszam'],
                where: {
                    Nev: { [Op.like]: `%${name_search}%` }
                }
            };
        }

        if (date_search) {
            whereClause[Op.or] = [
                { foglalaskezdete: { [Op.like]: `%${date_search}%` } },
                { foglalas_vege: { [Op.like]: `%${date_search}%` } }
            ];
        }

        const { count, rows } = await Foglalas.findAndCountAll({
            where: whereClause,
            include: includeOptions,
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
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

        // Email értesítés küldése
        try {
            const customer = await Ugyfel.findByPk(ugyfel_id);
            if (customer && customer.Email) {
                await sendBookingConfirmation(customer.Email, {
                    carName: `${car.Marka} ${car.Modell}`,
                    plate: car.Rendszam,
                    startDate: foglalaskezdete,
                    endDate: foglalas_vege,
                    price: Ar
                });
            }
        } catch (emailErr) {
            console.error('Hiba az email küldésekor:', emailErr);
            // Ne szakítsuk meg a kérést, ha az email küldés sikertelen
        }

        res.status(201).json(newFoglalas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const foglalas = await Foglalas.findByPk(req.params.id);
        if (!foglalas) return res.status(404).json({ error: 'Foglalás nem található' });

        // Security check: Only admin can update
        if (req.userData && req.userData.jogosultsag !== 'admin' && req.userData.jogosultsag !== 'dolgozo') {
            return res.status(403).json({ error: 'Nincs jogosultsága szerkeszteni a foglalást' });
        }

        const { auto_id, ugyfel_id, foglalaskezdete, foglalas_vege, Ar } = req.body;

        // Check if reservation is already picked up or returned
        if (foglalas.Elvitve || foglalas.Visszahozva) {
            return res.status(400).json({ error: 'Elvitt vagy visszahozott foglalást nem lehet szerkeszteni' });
        }

        // If car or dates changed, check for overlaps
        const carChanged = auto_id && auto_id !== foglalas.auto_id;
        const datesChanged = foglalaskezdete && foglalas_vege && 
            (foglalaskezdete !== foglalas.foglalaskezdete || foglalas_vege !== foglalas.foglalas_vege);

        if ((carChanged || datesChanged) && auto_id && foglalaskezdete && foglalas_vege) {
            const overlaps = await Foglalas.findAll({
                where: {
                    auto_id,
                    Foglalasokid: { [Op.ne]: req.params.id }, // Exclude current reservation
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
        }

        // Update the old car's availability if car changed
        if (carChanged) {
            const today = new Date().toISOString().slice(0, 10);
            const oldAutoId = foglalas.auto_id;
            
            // Set old car availability back
            const activeReservations = await Foglalas.findAll({
                where: {
                    auto_id: oldAutoId,
                    Foglalasokid: { [Op.ne]: req.params.id },
                    foglalaskezdete: { [Op.lte]: today },
                    foglalas_vege: { [Op.gte]: today }
                }
            });

            if (activeReservations.length === 0) {
                await Auto.update(
                    { elerheto: true, berleheto: true },
                    { where: { AutoID: oldAutoId } }
                );
            }

            // Set new car availability
            await Auto.update(
                { elerheto: false, berleheto: false },
                { where: { AutoID: auto_id } }
            );
        }

        // Calculate new price if dates or car changed
        let newAr = Ar;
        if (!newAr && (carChanged || datesChanged) && foglalaskezdete && foglalas_vege) {
            const car = await Auto.findByPk(auto_id || foglalas.auto_id);
            const start = new Date(foglalaskezdete);
            const end = new Date(foglalas_vege);
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            newAr = diffDays * (car.NapiAr || 15000);
        }

        await foglalas.update({
            auto_id: auto_id || foglalas.auto_id,
            ugyfel_id: ugyfel_id || foglalas.ugyfel_id,
            foglalaskezdete: foglalaskezdete || foglalas.foglalaskezdete,
            foglalas_vege: foglalas_vege || foglalas.foglalas_vege,
            Ar: newAr || foglalas.Ar
        });

        res.json({ message: 'Foglalás sikeresen frissítve', foglalas });
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
            elvitel: foglalas.valos_elvitel || foglalas.foglalaskezdete,
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

// Új metódus: Elvitel rögzítése (amikor az ügyfél átveszi az autót)
exports.recordPickup = async (req, res) => {
    try {
        const foglalas = await Foglalas.findByPk(req.params.id, {
            include: [
                { model: Auto, attributes: ['Rendszam', 'Marka', 'Modell'] },
                { model: Ugyfel, attributes: ['Nev', 'Telefonszam'] }
            ]
        });
        
        if (!foglalas) {
            return res.status(404).json({ error: 'Foglalás nem található' });
        }

        // Ellenőrzés: csak admin vagy dolgozó rögzíthet elvitelt
        if (req.userData && req.userData.jogosultsag !== 'admin' && req.userData.jogosultsag !== 'dolgozo') {
            return res.status(403).json({ error: 'Nincs jogosultsága az elvitel rögzítéséhez' });
        }

        // Ha már elvitte, nem lehet újra rögzíteni
        if (foglalas.Elvitve) {
            return res.status(400).json({ error: 'Ez a foglalás már el lett véve korábban' });
        }

        const { valos_elvitel } = req.body;
        const pickupDate = valos_elvitel || new Date().toISOString().slice(0, 10);

        // Frissítés
        await foglalas.update({
            Elvitve: true,
            valos_elvitel: pickupDate
        });

        res.json({
            message: 'Elvitel sikeresen rögzítve',
            foglalas: {
                ...foglalas.toJSON(),
                Elvitve: true,
                valos_elvitel: pickupDate
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Új metódus: Visszahozatal rögzítése (amikor az ügyfél visszahozza az autót)
exports.recordReturn = async (req, res) => {
    try {
        const foglalas = await Foglalas.findByPk(req.params.id, {
            include: [
                { model: Auto, attributes: ['Rendszam', 'Marka', 'Modell', 'AutoID'] },
                { model: Ugyfel, attributes: ['Nev', 'Telefonszam'] }
            ]
        });
        
        if (!foglalas) {
            return res.status(404).json({ error: 'Foglalás nem található' });
        }

        // Ellenőrzés: csak admin vagy dolgozó rögzíthet visszahozatalt
        if (req.userData && req.userData.jogosultsag !== 'admin' && req.userData.jogosultsag !== 'dolgozo') {
            return res.status(403).json({ error: 'Nincs jogosultsága a visszahozatal rögzítéséhez' });
        }

        // Ha még el sem vitte, nem lehet visszahozatalt rögzíteni
        if (!foglalas.Elvitve) {
            return res.status(400).json({ error: 'Ez a foglalás még nem lett elvéve, előbb az elvitelt kell rögzíteni' });
        }

        // Ha már visszahozta, nem lehet újra rögzíteni
        if (foglalas.Visszahozva) {
            return res.status(400).json({ error: 'Ez a foglalás már vissza lett hozva korábban' });
        }

        const { valos_visszahozatal, kilometer_veg } = req.body;
        const returnDate = valos_visszahozatal || new Date().toISOString().slice(0, 10);

        // Frissítés a foglalasok táblában
        await foglalas.update({
            Visszahozva: true,
            valos_visszahozatal: returnDate
        });

        // Hozzáadás az AutoKibe táblához (kilométer adatokkal és megjegyzéssel)
        const { megjegyzes } = req.body;
        if (kilometer_veg !== undefined) {
            await AutoKibe.create({
                auto_id: foglalas.auto_id,
                elvitel: foglalas.valos_elvitel || foglalas.foglalaskezdete,
                vissza: returnDate,
                Kilometer_kezdet: 0,
                Kilometer_veg: kilometer_veg,
                Megjegyzes: megjegyzes || null
            });
        }

        // Autó elérhetőségének visszaállítása
        const { auto_allapot } = req.body;
        let updateData = {};
        
        // Ha meg van adva az autó állapota a kérésben
        if (auto_allapot) {
            updateData.Allapot = auto_allapot;
            // Ha sérült vagy szervizben, akkor ne legyen elérhető
            if (auto_allapot === 'serult' || auto_allapot === 'szervizben') {
                updateData.elerheto = false;
                updateData.berleheto = false;
            } else {
                updateData.elerheto = true;
                updateData.berleheto = true;
            }
        } else {
            // Ha nincs megadva, alapértelmezett: elérhető
            updateData = { 
                Allapot: 'elerheto',
                elerheto: true, 
                berleheto: true 
            };
        }
        
        await Auto.update(updateData, { where: { AutoID: foglalas.auto_id } });

        res.json({
            message: 'Visszahozatal sikeresen rögzítve',
            foglalas: {
                ...foglalas.toJSON(),
                Visszahozva: true,
                valos_visszahozatal: returnDate
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

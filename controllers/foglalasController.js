const foglalasRepository = require('../repositories/foglalasRepository');

exports.getAll = (req, res) => {
    foglalasRepository.getAll((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.create = (req, res) => {
    foglalasRepository.create(req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: id, message: "Foglalás hozzáadva" });
    });
};

const dolgozoRepository = require('../repositories/dolgozoRepository');

exports.getAll = (req, res) => {
    dolgozoRepository.getAll((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.create = (req, res) => {
    dolgozoRepository.create(req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: id, message: "Dolgozó hozzáadva" });
    });
};

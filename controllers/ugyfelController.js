const ugyfelRepository = require('../repositories/ugyfelRepository');

exports.getAll = (req, res) => {
    ugyfelRepository.getAll((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.create = (req, res) => {
    ugyfelRepository.create(req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: id, message: "Ügyfél hozzáadva" });
    });
};

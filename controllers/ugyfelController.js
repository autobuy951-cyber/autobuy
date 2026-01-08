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

exports.delete = (req, res) => {
    ugyfelRepository.delete(req.params.id, (err, deleted) => {
        if (err) return res.status(500).json({ error: err.message });
        if (deleted === 0) return res.status(404).json({ error: "Ügyfél nem található" });
        res.json({ message: "Ügyfél törölve" });
    });
};

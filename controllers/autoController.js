const autoRepository = require('../repositories/autoRepository');

exports.getAll = (req, res) => {
    autoRepository.getAll((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.create = (req, res) => {
    autoRepository.create(req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: id, message: "Autó hozzáadva" });
    });
};

exports.delete = (req, res) => {
    autoRepository.delete(req.params.id, (err, deleted) => {
        if (err) return res.status(500).json({ error: err.message });
        if (deleted === 0) return res.status(404).json({ error: "Autó nem található" });
        res.json({ message: "Autó törölve" });
    });
};

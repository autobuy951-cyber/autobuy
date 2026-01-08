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

exports.delete = (req, res) => {
    dolgozoRepository.delete(req.params.id, (err, deleted) => {
        if (err) return res.status(500).json({ error: err.message });
        if (deleted === 0) return res.status(404).json({ error: "Dolgozó nem található" });
        res.json({ message: "Dolgozó törölve" });
    });
};

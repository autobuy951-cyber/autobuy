const autoKibeRepository = require('../repositories/autoKibeRepository');

exports.getAll = (req, res) => {
    autoKibeRepository.getAll((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.create = (req, res) => {
    autoKibeRepository.create(req.body, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: id, message: "Ki/Be adás rögzítve" });
    });
};

exports.delete = (req, res) => {
    autoKibeRepository.delete(req.params.id, (err, deleted) => {
        if (err) return res.status(500).json({ error: err.message });
        if (deleted === 0) return res.status(404).json({ error: "Ki/Be adás nem található" });
        res.json({ message: "Ki/Be adás törölve" });
    });
};

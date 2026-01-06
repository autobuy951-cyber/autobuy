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

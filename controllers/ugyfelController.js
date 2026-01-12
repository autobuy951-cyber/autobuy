const ugyfelRepository = require('../repositories/ugyfelRepository');

exports.getAll = (req, res) => {
    ugyfelRepository.getAll((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.getAlphabetical = (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    ugyfelRepository.getAlphabeticalPaginated(parseInt(page), parseInt(limit), (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.getByLetter = (req, res) => {
    const { betu } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!betu || betu.length !== 1) {
        return res.status(400).json({ error: 'Egy betűt kell megadni' });
    }

    ugyfelRepository.getByLetter(betu.toUpperCase(), parseInt(page), parseInt(limit), (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
};

exports.getByLetterRange = (req, res) => {
    const { tartomany } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Parse range like "A-E"
    const rangeMatch = tartomany.match(/^([A-Z])-([A-Z])$/i);
    if (!rangeMatch) {
        return res.status(400).json({ error: 'Helytelen tartomány formátum. Használj: A-E' });
    }

    const startLetter = rangeMatch[1].toUpperCase();
    const endLetter = rangeMatch[2].toUpperCase();

    if (startLetter > endLetter) {
        return res.status(400).json({ error: 'A kezdő betű nem lehet nagyobb a végzőnél' });
    }

    ugyfelRepository.getByLetterRange(startLetter, endLetter, parseInt(page), parseInt(limit), (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
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

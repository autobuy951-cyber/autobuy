const { Ugyfel } = require('../models');

exports.getAll = (callback) => {
    Ugyfel.findAll({ raw: true })
        .then(ugyfelek => callback(null, ugyfelek))
        .catch(err => callback(err));
};

exports.create = (data, callback) => {
    Ugyfel.create(data)
        .then(ugyfel => callback(null, ugyfel.ID))
        .catch(err => callback(err));
};

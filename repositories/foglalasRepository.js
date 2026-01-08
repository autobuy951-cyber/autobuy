const { Foglalas } = require('../models');

exports.getAll = (callback) => {
    Foglalas.findAll({ raw: true })
        .then(foglalasok => callback(null, foglalasok))
        .catch(err => callback(err));
};

exports.create = (data, callback) => {
    Foglalas.create(data)
        .then(foglalas => callback(null, foglalas.Foglalasokid))
        .catch(err => callback(err));
};

exports.delete = (id, callback) => {
    Foglalas.destroy({ where: { Foglalasokid: id } })
        .then(deleted => callback(null, deleted))
        .catch(err => callback(err));
};

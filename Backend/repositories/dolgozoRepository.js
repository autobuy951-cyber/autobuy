const { Dolgozo } = require('../models');

exports.getAll = (callback) => {
    Dolgozo.findAll({ raw: true })
        .then(dolgozok => callback(null, dolgozok))
        .catch(err => callback(err));
};

exports.create = (data, callback) => {
    Dolgozo.create(data)
        .then(dolgozo => callback(null, dolgozo.id))
        .catch(err => callback(err));
};

exports.delete = (id, callback) => {
    Dolgozo.destroy({ where: { id: id } })
        .then(deleted => callback(null, deleted))
        .catch(err => callback(err));
};

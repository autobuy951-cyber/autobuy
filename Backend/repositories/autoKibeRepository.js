const { AutoKibe } = require('../models');

exports.getAll = (callback) => {
    AutoKibe.findAll({ raw: true })
        .then(autokibek => callback(null, autokibek))
        .catch(err => callback(err));
};

exports.create = (data, callback) => {
    AutoKibe.create(data)
        .then(autokibe => callback(null, autokibe.Id))
        .catch(err => callback(err));
};

exports.delete = (id, callback) => {
    AutoKibe.destroy({ where: { Id: id } })
        .then(deleted => callback(null, deleted))
        .catch(err => callback(err));
};

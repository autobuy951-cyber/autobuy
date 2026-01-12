const { Auto } = require('../models');

exports.getAll = (callback) => {
    Auto.findAll({ raw: true })
        .then(autos => callback(null, autos))
        .catch(err => callback(err));
};

exports.create = (data, callback) => {
    Auto.create(data)
        .then(auto => callback(null, auto.AutoID))
        .catch(err => callback(err));
};

exports.delete = (id, callback) => {
    Auto.destroy({ where: { AutoID: id } })
        .then(deleted => callback(null, deleted))
        .catch(err => callback(err));
};

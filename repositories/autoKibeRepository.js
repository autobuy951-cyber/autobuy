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

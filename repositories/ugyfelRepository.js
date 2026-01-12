const { Ugyfel } = require('../models');

exports.getAll = (callback) => {
    Ugyfel.findAll({ raw: true })
        .then(ugyfelek => callback(null, ugyfelek))
        .catch(err => callback(err));
};

exports.getAlphabetical = (callback) => {
    Ugyfel.findAll({
        raw: true,
        order: [['Nev', 'ASC']]
    })
    .then(ugyfelek => callback(null, ugyfelek))
    .catch(err => callback(err));
};

exports.getAlphabeticalPaginated = (page, limit, callback) => {
    const offset = (page - 1) * limit;

    // First get total count
    Ugyfel.count()
    .then(totalCount => {
        // Then get paginated results
        return Ugyfel.findAll({
            raw: true,
            limit: limit,
            offset: offset
        })
        .then(ugyfelek => {
            callback(null, {
                data: ugyfelek,
                pagination: {
                    page: page,
                    limit: limit,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limit)
                }
            });
        });
    })
    .catch(err => callback(err));
};

exports.getByLetter = (letter, page, limit, callback) => {
    const offset = (page - 1) * limit;

    // Count customers starting with the letter
    const countQuery = `SELECT COUNT(*) as total FROM ugyfelek WHERE UPPER(SUBSTR(Nev, 1, 1)) = ?`;
    const dataQuery = `SELECT ID, Nev, Cim, Telefonszam, Email, Jogosultsag FROM ugyfelek WHERE UPPER(SUBSTR(Nev, 1, 1)) = ? ORDER BY Nev LIMIT ? OFFSET ?`;

    const { sequelize } = require('../models');

    Promise.all([
        sequelize.query(countQuery, { replacements: [letter], type: sequelize.QueryTypes.SELECT }),
        sequelize.query(dataQuery, { replacements: [letter, limit, offset], type: sequelize.QueryTypes.SELECT })
    ])
    .then(([countResult, dataResult]) => {
        callback(null, {
            data: dataResult,
            pagination: {
                page: page,
                limit: limit,
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit),
                letter: letter
            }
        });
    })
    .catch(err => callback(err));
};

exports.getByLetterRange = (startLetter, endLetter, page, limit, callback) => {
    const offset = (page - 1) * limit;

    // Create a list of letters in the range
    const letters = [];
    for (let i = startLetter.charCodeAt(0); i <= endLetter.charCodeAt(0); i++) {
        letters.push(String.fromCharCode(i));
    }

    // Count customers starting with letters in the range
    const countQuery = `SELECT COUNT(*) as total FROM ugyfelek WHERE UPPER(SUBSTR(Nev, 1, 1)) IN (${letters.map(() => '?').join(',')})`;
    const dataQuery = `SELECT ID, Nev, Cim, Telefonszam, Email, Jogosultsag FROM ugyfelek WHERE UPPER(SUBSTR(Nev, 1, 1)) IN (${letters.map(() => '?').join(',')}) ORDER BY Nev LIMIT ? OFFSET ?`;

    const { sequelize } = require('../models');

    const params = [...letters, limit, offset];

    Promise.all([
        sequelize.query(countQuery, { replacements: letters, type: sequelize.QueryTypes.SELECT }),
        sequelize.query(dataQuery, { replacements: params, type: sequelize.QueryTypes.SELECT })
    ])
    .then(([countResult, dataResult]) => {
        callback(null, {
            data: dataResult,
            pagination: {
                page: page,
                limit: limit,
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit),
                range: `${startLetter}-${endLetter}`
            }
        });
    })
    .catch(err => callback(err));
};

exports.create = (data, callback) => {
    Ugyfel.create(data)
        .then(ugyfel => callback(null, ugyfel.ID))
        .catch(err => callback(err));
};

exports.delete = (id, callback) => {
    Ugyfel.destroy({ where: { ID: id } })
        .then(deleted => callback(null, deleted))
        .catch(err => callback(err));
};

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dolgozo = sequelize.define('Dolgozo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nev: {
        type: DataTypes.TEXT
    },
    jelszo: {
        type: DataTypes.TEXT
    },
    jogosultsag: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'dolgozok',
    timestamps: false
});

module.exports = Dolgozo;

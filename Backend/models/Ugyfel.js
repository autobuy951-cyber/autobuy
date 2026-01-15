const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ugyfel = sequelize.define('Ugyfel', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nev: {
        type: DataTypes.TEXT
    },
    Cim: {
        type: DataTypes.TEXT
    },
    Telefonszam: {
        type: DataTypes.TEXT
    },
    Email: {
        type: DataTypes.TEXT
    },
    igSzam: {
        type: DataTypes.TEXT
    },
    SzuletesiDatum: {
        type: DataTypes.TEXT
    },
    Jogosultsag: {
        type: DataTypes.TEXT
    },
    Jelszo: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'ugyfelek',
    timestamps: false
});

module.exports = Ugyfel;

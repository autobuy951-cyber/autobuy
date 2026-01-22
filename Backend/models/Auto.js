const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auto = sequelize.define('Auto', {
    AutoID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Rendszam: {
        type: DataTypes.TEXT
    },
    Marka: {
        type: DataTypes.TEXT
    },
    Modell: {
        type: DataTypes.TEXT
    },
    Evjarat: {
        type: DataTypes.INTEGER
    },
    elerheto: {
        type: DataTypes.BOOLEAN
    },
    Megjegyzes: {
        type: DataTypes.TEXT
    },
    berleheto: {
        type: DataTypes.BOOLEAN
    },
    Alvazszam: {
        type: DataTypes.TEXT
    },
    NapiAr: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'autok',
    timestamps: false
});

module.exports = Auto;

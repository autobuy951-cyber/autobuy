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
    Allapot: {
        type: DataTypes.TEXT
    },
    Alvazszam: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'autok',
    timestamps: false
});

module.exports = Auto;

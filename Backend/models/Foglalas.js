const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Foglalas = sequelize.define('Foglalas', {
    Foglalasokid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    auto_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ugyfel_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    foglalaskezdete: {
        type: DataTypes.TEXT
    },
    foglalas_vege: {
        type: DataTypes.TEXT
    },
    Ar: {
        type: DataTypes.INTEGER
    },
    Letrehozasdatuma: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'foglalasok',
    timestamps: false
});

module.exports = Foglalas;

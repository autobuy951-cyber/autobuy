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
        type: DataTypes.TEXT,
        comment: 'Tervezett elviteli idő'
    },
    foglalas_vege: {
        type: DataTypes.TEXT,
        comment: 'Tervezett visszahozatali idő'
    },
    valos_elvitel: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Valós elviteli idő (amikor a dolgozó átadta)'
    },
    Elvitve: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Elvitte-e már az ügyfél az autót'
    },
    valos_visszahozatal: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Valós visszahozatali idő (amikor az ügyfél visszahozta)'
    },
    Visszahozva: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Visszahozta-e már az ügyfél az autót'
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

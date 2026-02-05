const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AutoKibe = sequelize.define('AutoKibe', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    auto_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    elvitel: {
        type: DataTypes.TEXT
    },
    vissza: {
        type: DataTypes.TEXT
    },
    Kilometer_kezdet: {
        type: DataTypes.INTEGER
    },
    Kilometer_veg: {
        type: DataTypes.INTEGER
    },
    Megjegyzes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Megjegyzés a visszahozatalhoz (pl. sérülés, probléma)'
    }
}, {
    tableName: 'autokibe',
    timestamps: false
});

module.exports = AutoKibe;

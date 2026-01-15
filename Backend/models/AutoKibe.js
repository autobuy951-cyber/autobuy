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
    }
}, {
    tableName: 'autokibe',
    timestamps: false
});

module.exports = AutoKibe;

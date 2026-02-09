const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userType: {
        type: DataTypes.TEXT, // 'ugyfel', 'dolgozo', 'admin'
        allowNull: true
    },
    action: {
        type: DataTypes.TEXT, // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
        allowNull: false
    },
    entityType: {
        type: DataTypes.TEXT, // 'foglalas', 'auto', 'ugyfel', stb.
        allowNull: true
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    oldValues: {
        type: DataTypes.TEXT, // JSON string
        allowNull: true
    },
    newValues: {
        type: DataTypes.TEXT, // JSON string
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'audit_logs',
    timestamps: false
});

module.exports = AuditLog;

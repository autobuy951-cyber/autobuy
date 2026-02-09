const { AuditLog, sequelize } = require('../models');
const { Op } = require('sequelize');

// Összes audit log lekérdezése (csak admin)
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, action, entityType, from, to } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (userId) whereClause.userId = userId;
        if (action) whereClause.action = action;
        if (entityType) whereClause.entityType = entityType;
        if (from || to) {
            whereClause.timestamp = {};
            if (from) whereClause.timestamp[Op.gte] = new Date(from);
            if (to) whereClause.timestamp[Op.lte] = new Date(to);
        }

        const { count, rows } = await AuditLog.findAndCountAll({
            where: whereClause,
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            data: rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Egy adott entitás audit log-jai
exports.getByEntity = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        
        const logs = await AuditLog.findAll({
            where: {
                entityType,
                entityId
            },
            order: [['timestamp', 'DESC']]
        });

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Statisztikák
exports.getStats = async (req, res) => {
    try {
        const totalLogs = await AuditLog.count();
        const todayLogs = await AuditLog.count({
            where: {
                timestamp: {
                    [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        });
        
        const actionStats = await AuditLog.findAll({
            attributes: ['action', [sequelize.fn('COUNT', sequelize.col('action')), 'count']],
            group: ['action']
        });

        res.json({
            total: totalLogs,
            today: todayLogs,
            byAction: actionStats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

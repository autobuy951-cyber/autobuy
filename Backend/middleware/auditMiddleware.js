const { AuditLog } = require('../models');

// Audit middleware - naplózza a fontos műveleteket
const auditMiddleware = (action, entityType, getEntityId = null) => {
    return async (req, res, next) => {
        // Eltároljuk az eredeti json metódust
        const originalJson = res.json;
        
        // Felülírjuk a json metódust, hogy elkapjuk a választ
        res.json = function(data) {
            // Visszaállítjuk az eredeti metódust
            res.json = originalJson;
            
            // Naplózzuk a műveletet
            try {
                const entityId = getEntityId ? getEntityId(req, data) : (req.params.id || null);
                
                AuditLog.create({
                    userId: req.userData ? req.userData.id : null,
                    userType: req.userData ? req.userData.jogosultsag : null,
                    action: action,
                    entityType: entityType,
                    entityId: entityId,
                    oldValues: req.body ? JSON.stringify(req.body) : null,
                    newValues: data ? JSON.stringify(data) : null,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }).catch(err => {
                    console.error('Audit log error:', err);
                });
            } catch (err) {
                console.error('Audit middleware error:', err);
            }
            
            // Meghívjuk az eredeti json metódust
            return originalJson.call(this, data);
        };
        
        next();
    };
};

// Egyszerű log függvény manuális naplózáshoz
const logAudit = async (data) => {
    try {
        await AuditLog.create(data);
    } catch (err) {
        console.error('Manual audit log error:', err);
    }
};

module.exports = {
    auditMiddleware,
    logAudit
};

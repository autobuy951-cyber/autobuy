const sequelize = require('../config/database');
const Auto = require('./Auto');
const Ugyfel = require('./Ugyfel');
const Dolgozo = require('./Dolgozo');
const Foglalas = require('./Foglalas');
const AutoKibe = require('./AutoKibe');

// Associations
Auto.hasMany(Foglalas, { foreignKey: 'auto_id', onDelete: 'CASCADE' });
Foglalas.belongsTo(Auto, { foreignKey: 'auto_id' });

Ugyfel.hasMany(Foglalas, { foreignKey: 'ugyfel_id', onDelete: 'CASCADE' });
Foglalas.belongsTo(Ugyfel, { foreignKey: 'ugyfel_id' });

Auto.hasMany(AutoKibe, { foreignKey: 'auto_id', onDelete: 'CASCADE' });
AutoKibe.belongsTo(Auto, { foreignKey: 'auto_id' });

module.exports = {
    sequelize,
    Auto,
    Ugyfel,
    Dolgozo,
    Foglalas,
    AutoKibe
};

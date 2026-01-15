const sequelize = require('../config/database');
const Auto = require('./Auto');
const Ugyfel = require('./Ugyfel');
const Dolgozo = require('./Dolgozo');
const Foglalas = require('./Foglalas');
const AutoKibe = require('./AutoKibe');

// Associations WITHOUT foreign key constraints
Auto.hasMany(Foglalas, { foreignKey: 'auto_id', constraints: false });
Foglalas.belongsTo(Auto, { foreignKey: 'auto_id', constraints: false });

Ugyfel.hasMany(Foglalas, { foreignKey: 'ugyfel_id', constraints: false });
Foglalas.belongsTo(Ugyfel, { foreignKey: 'ugyfel_id', constraints: false });

Auto.hasMany(AutoKibe, { foreignKey: 'auto_id', constraints: false });
AutoKibe.belongsTo(Auto, { foreignKey: 'auto_id', constraints: false });

module.exports = {
    sequelize,
    Auto,
    Ugyfel,
    Dolgozo,
    Foglalas,
    AutoKibe
};

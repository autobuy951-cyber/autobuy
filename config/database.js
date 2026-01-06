const Sequelize = require('sequelize');
const path = require('path');

const dbPath = path.resolve(__dirname, '../adatbazis.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false, // Set to console.log to see SQL queries
    dialectOptions: {
        // Force SQLite to enforce foreign keys
        // Note: strict enforcement depends on the driver, but PRAGMA is the standard way
    }
});

// Enforce Foreign Keys for SQLite
sequelize.addHook('afterConnect', (connection, options) => {
    connection.run('PRAGMA foreign_keys = OFF;');
});

module.exports = sequelize;

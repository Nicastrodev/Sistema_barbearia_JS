const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('barbearia', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
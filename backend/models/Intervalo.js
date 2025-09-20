// models/Intervalo.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db"); // Certifique-se de que o caminho está correto

const Intervalo = sequelize.define(
  "Intervalo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dia_semana: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    fim: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Intervalo;

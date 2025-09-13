const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Agendamento = sequelize.define(
  "Agendamento",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    servico: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.DATEONLY, // Armazena apenas a data (YYYY-MM-DD)
      allowNull: false,
    },
    hora: {
      type: DataTypes.STRING, // Armazena a hora como "HH:MM"
      allowNull: false,
    },
  },
  {
    tableName: "agendamentos",
    timestamps: false, // Desativa as colunas createdAt e updatedAt
  }
);

// A linha mais importante!
module.exports = Agendamento;

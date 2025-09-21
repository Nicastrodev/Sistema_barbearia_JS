const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const HorarioConfiguracao = sequelize.define(
  "HorarioConfiguracao",
  {
    dia_semana: {
      type: DataTypes.STRING,
      primaryKey: true, // O dia da semana é a chave única
    },
    aberto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    abertura: {
      type: DataTypes.STRING, // Armazena a hora como "HH:MM"
      defaultValue: "09:00",
    },
    fechamento: {
      type: DataTypes.STRING, // Armazena a hora como "HH:MM"
      defaultValue: "18:00",
    },
  },
  {
    tableName: "horarios_configuracao",
    timestamps: false,
  }
);

// A linha mais importante!
module.exports = HorarioConfiguracao;

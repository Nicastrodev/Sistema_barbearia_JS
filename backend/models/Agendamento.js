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
    servicoId: {
      type: DataTypes.INTEGER,
      references: {
        model: "servicos",
        key: "id",
      },
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "agendamentos",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["data", "hora", "servicoId"], // previne duplicidade
      },
    ],
  }
);

module.exports = Agendamento;

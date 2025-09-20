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
<<<<<<< HEAD
    data: {
      type: DataTypes.DATEONLY, // Armazena apenas a data (YYYY-MM-DD)
      allowNull: false,
    },
    hora: {
      type: DataTypes.STRING, // Armazena a hora como "HH:MM"
=======
    // Adicione a nova coluna servicoId para a associação
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
>>>>>>> origin/master
      allowNull: false,
    },
  },
  {
    tableName: "agendamentos",
<<<<<<< HEAD
    timestamps: false, // Desativa as colunas createdAt e updatedAt
  }
);

// A linha mais importante!
module.exports = Agendamento;
=======
    timestamps: false,
  }
);

module.exports = Agendamento;
>>>>>>> origin/master

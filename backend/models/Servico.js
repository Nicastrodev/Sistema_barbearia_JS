const { DataTypes } = require("sequelize");
const sequelize = require("../db"); // Importa sua conexão com o banco de dados

// Define o modelo "Servico" que corresponde à sua tabela no banco
const Servico = sequelize.define(
  "Servico",
  {
    // Define as colunas da tabela
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false, // O nome do serviço não pode ser nulo
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2), // Preço com 2 casas decimais
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: true, // A descrição é opcional
    },
    duracao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30, // Duração padrão em minutos
    },
  },
  {
    // Opções do modelo
    tableName: "servicos", // Garante que o nome da tabela seja 'servicos'
    timestamps: false, // Desativa 'createdAt' e 'updatedAt'
  }
);

// Exporta o modelo para que outros arquivos (como o server.js) possam usá-lo
module.exports = Servico;

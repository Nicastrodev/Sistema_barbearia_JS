const { Sequelize } = require("sequelize");

// 1. Lê a variável de ambiente 'DATABASE_URL' que você configurou no Render.
//    Essa variável contém a URL completa do seu banco de dados no JawsDB.
const dbUrl = process.env.DATABASE_URL;

// 2. Se, por algum motivo, a variável não for encontrada, o programa irá parar com um erro claro.
//    Isso evita que a aplicação tente se conectar ao lugar errado.
if (!dbUrl) {
  throw new Error(
    "ERRO CRÍTICO: A variável de ambiente DATABASE_URL não foi definida."
  );
}

// 3. Cria a conexão do Sequelize usando a URL e adiciona as opções de SSL,
//    que são obrigatórias para se conectar a um banco de dados externo como o JawsDB.
const sequelize = new Sequelize(dbUrl, {
  dialect: "mysql",
  protocol: "mysql",
  logging: false, // Desativa os logs de SQL no terminal de produção
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = sequelize;

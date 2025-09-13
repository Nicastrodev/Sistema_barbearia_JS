// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL
// =================================================================
const express = require("express");
const session = require("express-session"); // Importação para o login/logout
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("./db");

// Importa todos os modelos necessários AQUI
const Agendamento = require("./models/Agendamento");
const Servico = require("./models/Servico");
const HorarioConfiguracao = require("./models/HorarioConfiguracao");

const app = express();
const PORT = 3000;

// =================================================================
// 2. MIDDLEWARE E CONFIGURAÇÕES DO EXPRESS
// =================================================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// Configuração da sessão, necessária para o login/logout
app.use(
  session({
    secret: "sua_chave_super_secreta",
    resave: false,
    saveUninitialized: true,
  })
);

// Configuração do EJS como motor de visualização
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Sincroniza os models com o banco de dados ao iniciar
sequelize.sync().then(() => {
  console.log("Banco de dados e tabelas sincronizados.");
});

// =================================================================
// 3. ROTAS PÚBLICAS E DE AGENDAMENTO (PARA CLIENTES)
// =================================================================

// Rota principal (GET): Exibe o formulário de agendamento com os serviços
app.get("/", async (req, res) => {
  try {
    const servicos = await Servico.findAll();
    res.render("index", { servicos });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    res.status(500).send("Erro ao carregar a página.");
  }
});

// Rota principal (POST): Cria um novo agendamento
app.post("/", async (req, res) => {
  try {
    const { nome, telefone, servico, data, hora } = req.body;
    const novoAgendamento = await Agendamento.create({
      id: uuidv4(),
      nome,
      telefone,
      servico,
      data,
      hora,
    });
    res.redirect(
      `/confirmacao?nome=${nome}&servico=${servico}&data=${data}&hora=${hora}&id=${novoAgendamento.id}`
    );
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    res.status(500).send("Erro ao processar o agendamento.");
  }
});

// Rota da página de confirmação de agendamento
app.get("/confirmacao", (req, res) => {
  const { nome, servico, data, hora, id } = req.query;
  let dataFormatada = data;
  if (data && data.includes("-")) {
    const [year, month, day] = data.split("-");
    dataFormatada = `${day}/${month}/${year}`;
  }
  res.render("confirmacao", { nome, servico, data: dataFormatada, hora, id });
});

// =================================================================
// 4. ROTAS DE CANCELAMENTO
// =================================================================

// Rota POST unificada para cancelar/remover agendamentos (vinda dos formulários)
app.post("/cancelar-agendamento", async (req, res) => {
  try {
    const idParaCancelar = req.body.agendamento_id || req.body.id_cancelar;
    const agendamento = await Agendamento.findByPk(idParaCancelar);
    if (agendamento) {
      await agendamento.destroy();
      res.redirect("/cancelamento-confirmado/sucesso");
    } else {
      res.redirect("/cancelamento-confirmado/nao_encontrado");
    }
  } catch (error) {
    console.error("Erro ao cancelar via formulário:", error);
    res.redirect("/cancelamento-confirmado/erro");
  }
});

// Rota GET para cancelar via link (ex: de um e-mail)
app.get("/cancelar/:id", async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (agendamento) {
      await agendamento.destroy();
      res.render("cancelamento_confirmacao", { status: "sucesso" });
    } else {
      res.render("cancelamento_confirmacao", { status: "nao_encontrado" });
    }
  } catch (error) {
    console.error("Erro ao cancelar via link:", error);
    res.render("cancelamento_confirmacao", { status: "erro" });
  }
});

// Rota para exibir a página de status do cancelamento
app.get("/cancelamento-confirmado/:status", (req, res) => {
  res.render("cancelamento_confirmacao", { status: req.params.status });
});

// =================================================================
// 5. ROTAS DO PAINEL DE ADMINISTRAÇÃO
// =================================================================

// Rota para exibir o painel com todos os agendamentos
app.get("/agendamentos", async (req, res) => {
  try {
    const todosAgendamentos = await Agendamento.findAll({
      order: [
        ["data", "ASC"],
        ["hora", "ASC"],
      ],
    });
    res.render("agendamentos", { agendamentos: todosAgendamentos });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).send("Erro ao carregar o painel de agendamentos.");
  }
});

// Rota GET para a página de gerenciamento de serviços e horários
app.get("/gerenciar-servicos", async (req, res) => {
  try {
    const servicos = await Servico.findAll({ order: [["nome", "ASC"]] });
    const configuracoes = await HorarioConfiguracao.findAll();
    const diasDaSemana = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    let configMap = {};
    diasDaSemana.forEach((dia) => {
      const configDia = configuracoes.find((c) => c.dia_semana === dia);
      configMap[dia] = configDia || {
        dia_semana: dia,
        aberto: false,
        abertura: "09:00",
        fechamento: "18:00",
      };
    });
    res.render("gerenciar_servicos", { servicos, configuracoes: configMap });
  } catch (error) {
    console.error("Erro ao carregar página de gerenciamento:", error);
    res.status(500).send("Erro ao carregar a página.");
  }
});

// Rota POST para as ações de gerenciamento (adicionar/remover serviço, salvar horários)
app.post("/gerenciar-servicos", async (req, res) => {
  try {
    if (req.body.acao === "adicionar") {
      await Servico.create({
        nome: req.body.nome,
        preco: req.body.preco,
        descricao: req.body.descricao,
      });
      return res.redirect("/gerenciar-servicos");
    }
    if (req.body.acao === "remover") {
      await Servico.destroy({ where: { id: req.body.servico_id } });
      return res.redirect("/gerenciar-servicos");
    }
    const horariosData = req.body;
    for (const dia in horariosData) {
      await HorarioConfiguracao.upsert({
        dia_semana: dia,
        aberto: horariosData[dia].aberto,
        abertura: horariosData[dia].abertura,
        fechamento: horariosData[dia].fechamento,
      });
    }
    return res.json({ message: "Horários salvos com sucesso!" });
  } catch (error) {
    console.error("Erro ao processar ação de gerenciamento:", error);
    return res.status(500).send("Ocorreu um erro na ação de gerenciamento.");
  }
});

// Rota para EXIBIR a página de login
app.get("/login", (req, res) => {
  res.render("login");
});

// Rota para PROCESSAR o formulário de login
app.post("/login", (req, res) => {
  const { password } = req.body;
  const SENHA_ADMIN = "admin123";
  if (password === SENHA_ADMIN) {
    req.session.isAdmin = true; // Marca a sessão como autenticada
    res.redirect("/agendamentos");
  } else {
    res.render("login", { error: "Senha inválida!" });
  }
});

// Rota para fazer logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao fazer logout:", err);
      return res.redirect("/agendamentos");
    }
    res.redirect("/");
  });
});

// =================================================================
// 6. ROTAS DE API (PARA O JAVASCRIPT DO CLIENTE)
// =================================================================

// Rota da API que retorna os horários disponíveis (VERSÃO DE DEPURAÇÃO)
app.get("/api/horarios/:data", async (req, res) => {
  const { data } = req.params;
  console.log(`\n--- INICIANDO BUSCA DE HORÁRIOS PARA DATA: ${data} ---`);

  try {
    const diaSelecionado = new Date(`${data}T12:00:00`);
    const diasDaSemana = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    const nomeDiaDaSemana = diasDaSemana[diaSelecionado.getDay()];
    console.log(`1. Dia da semana calculado: "${nomeDiaDaSemana}"`);

    const configDia = await HorarioConfiguracao.findOne({
      where: { dia_semana: nomeDiaDaSemana },
    });
    console.log(
      "2. Resultado da busca de configuração:",
      configDia ? configDia.toJSON() : null
    );

    if (!configDia || !configDia.aberto) {
      console.log(
        "3. CONCLUSÃO: Dia configurado como fechado ou não encontrado. Retornando lista vazia."
      );
      return res.json([]);
    }
    console.log(
      `3. Dia aberto. Horários: ${configDia.abertura} - ${configDia.fechamento}`
    );

    const agendamentosDoDia = await Agendamento.findAll({ where: { data } });
    const horariosOcupados = new Set(agendamentosDoDia.map((ag) => ag.hora));
    console.log(
      "4. Horários já ocupados neste dia:",
      Array.from(horariosOcupados)
    );

    const horariosDisponiveis = [];
    const intervalo = 60;
    let horaAtual = new Date(`${data}T${configDia.abertura}`);
    const horaFechamento = new Date(`${data}T${configDia.fechamento}`);

    while (horaAtual < horaFechamento) {
      const horaFormatada = horaAtual.toTimeString().substring(0, 5);
      if (!horariosOcupados.has(horaFormatada)) {
        horariosDisponiveis.push(horaFormatada);
      }
      horaAtual.setMinutes(horaAtual.getMinutes() + intervalo);
    }
    console.log(
      "5. Horários disponíveis (antes de filtrar passados):",
      horariosDisponiveis
    );

    const agora = new Date();
    if (diaSelecionado.toDateString() === agora.toDateString()) {
      const horaAtualString = agora.toTimeString().substring(0, 5);
      const horariosFiltrados = horariosDisponiveis.filter(
        (h) => h > horaAtualString
      );
      console.log(
        "6. CONCLUSÃO: Hoje. Filtrando horários passados. Enviando:",
        horariosFiltrados
      );
      return res.json(horariosFiltrados);
    }

    console.log(
      "6. CONCLUSÃO: Enviando lista de horários disponíveis:",
      horariosDisponiveis
    );
    res.json(horariosDisponiveis);
  } catch (error) {
    console.error("ERRO GRAVE NA ROTA DE HORÁRIOS:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// =================================================================
// 7. INICIALIZAÇÃO DO SERVIDOR
// =================================================================
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
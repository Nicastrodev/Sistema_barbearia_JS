// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL
// =================================================================
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("./db");

// Importa todos os modelos necessários AQUI
const Agendamento = require("./models/Agendamento");
const Servico = require("./models/Servico");
const HorarioConfiguracao = require("./models/HorarioConfiguracao");
const Intervalo = require("./models/Intervalo"); // CORREÇÃO: Certifique-se de que esta linha está aqui!

// =================================================================
// ADICIONE AS ASSOCIAÇÕES AQUI
// =================================================================
Servico.hasMany(Agendamento, {
  foreignKey: "servicoId",
  as: "agendamentos",
});
Agendamento.belongsTo(Servico, {
  foreignKey: "servicoId",
  as: "servicoAgendado",
});
// =================================================================

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

// =================================================================
// Sincronização do banco de dados
// =================================================================
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
// <<< INÍCIO DA MUDANÇA >>>
// Esta rota foi atualizada com a lógica de verificação e tratamento de erro do arquivo agendar.js
app.post("/", async (req, res) => {
  try {
    const { nome, telefone, servicoId, data, hora } = req.body; // 1. ADICIONADO: Verificação de duplicidade antes de tentar criar

    const existente = await Agendamento.findOne({
      where: { data, hora, servicoId },
    });

    if (existente) {
      // Se o horário já existe, envia uma mensagem de erro clara
      return res
        .status(409)
        .send("Este horário já foi agendado. Por favor, escolha outro.");
    } // Validação dos 20 minutos de antecedência

    const dataHoraAgendamento = new Date(`${data}T${hora}:00`);
    const agora = new Date();
    const diferencaEmMinutos =
      (dataHoraAgendamento.getTime() - agora.getTime()) / (1000 * 60);

    if (diferencaEmMinutos < 20) {
      return res
        .status(400)
        .send(
          "O agendamento deve ser feito com no mínimo 20 minutos de antecedência."
        );
    } // Busca o nome do serviço para a confirmação

    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      return res.status(400).send("Serviço não encontrado.");
    }

    const novoAgendamento = await Agendamento.create({
      id: uuidv4(),
      nome,
      telefone,
      servico: servico.nome,
      servicoId: servicoId,
      data,
      hora,
    });
    res.redirect(
      `/confirmacao?nome=${nome}&servico=${servico.nome}&data=${data}&hora=${hora}&id=${novoAgendamento.id}`
    );
  } catch (error) {
    console.error("Erro ao criar agendamento:", error); // 2. ADICIONADO: Captura específica do erro de duplicidade (condição de corrida)

    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409) // 409 significa "Conflito"
        .send(
          "Este horário acabou de ser agendado por outra pessoa. Por favor, escolha outro."
        );
    } // Mantém um erro genérico para outros problemas inesperados

    res.status(500).send("Erro ao processar o agendamento.");
  }
});
// <<< FIM DA MUDANÇA >>>

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

app.post("/cancelar-agendamento", async (req, res) => {
  try {
    const idParaCancelar = req.body.id_cancelar;
    const agendamento = await Agendamento.findByPk(idParaCancelar);

    if (agendamento) {
      await agendamento.destroy();
      res.json({
        success: true,
        message: "Agendamento cancelado com sucesso.",
      });
    } else {
      res.json({ success: false, message: "Agendamento não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

// Rota GET para cancelar via link (ex: de um e-mail)
app.get("/cancelar/:id", async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (agendamento) {
      await agendamento.destroy();
      res.render("cancelamento_confirmado", { status: "sucesso" });
    } else {
      res.render("cancelamento_confirmado", { status: "nao_encontrado" });
    }
  } catch (error) {
    console.error("Erro ao cancelar via link:", error);
    res.render("cancelamento_confirmado", { status: "erro" });
  }
});

// Rota para exibir a página de status do cancelamento
app.get("/cancelamento_confirmado/:status", (req, res) => {
  res.render("cancelamento_confirmado", { status: req.params.status });
});

// =================================================================
// 5. ROTAS DO PAINEL DE ADMINISTRAÇÃO
// (O restante do arquivo continua o mesmo, sem alterações)
// =================================================================

// Rota para exibir o painel com todos os agendamentos
app.get("/agendamentos", async (req, res) => {
  try {
    const todosAgendamentos = await Agendamento.findAll({
      order: [
        ["data", "ASC"],
        ["hora", "ASC"],
      ],
      include: [{ model: Servico, as: "servicoAgendado" }],
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
    const intervalos = await Intervalo.findAll();

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
    res.render("gerenciar_servicos", {
      servicos,
      configuracoes: configMap,
      intervalos,
    });
  } catch (error) {
    console.error("Erro ao carregar página de gerenciamento:", error);
    res.status(500).send("Erro ao carregar a página.");
  }
});

// Rota POST para as ações de gerenciamento
app.post("/gerenciar-servicos", async (req, res) => {
  try {
    if (req.body.acao === "adicionar") {
      const { nome, preco, descricao, duracao } = req.body;
      await Servico.create({
        nome,
        preco,
        descricao,
        duracao,
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

// Rota para adicionar um novo intervalo
app.post("/adicionar-intervalo", async (req, res) => {
  try {
    const { dia_semana, inicio, fim } = req.body;
    await Intervalo.create({
      dia_semana,
      inicio,
      fim,
    });
    res.redirect("/gerenciar-servicos");
  } catch (error) {
    console.error("Erro ao adicionar intervalo:", error);
    res.status(500).send("Erro ao adicionar intervalo.");
  }
});

// Rota para remover um intervalo
app.post("/remover-intervalo", async (req, res) => {
  try {
    const { id } = req.body;
    await Intervalo.destroy({ where: { id: id } });
    res.redirect("/gerenciar-servicos");
  } catch (error) {
    console.error("Erro ao remover intervalo:", error);
    res.status(500).send("Erro ao remover intervalo.");
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
    req.session.isAdmin = true;
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

// Rota da API que retorna os horários disponíveis
app.get("/api/horarios/:data/:servicoId", async (req, res) => {
  const { data, servicoId } = req.params;

  try {
    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }
    const duracaoServico = servico.duracao;

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
    const configDia = await HorarioConfiguracao.findOne({
      where: { dia_semana: nomeDiaDaSemana },
    });

    if (!configDia || !configDia.aberto) {
      return res.json([]);
    }

    const agendamentosDoDia = await Agendamento.findAll({
      where: { data },
      include: [{ model: Servico, as: "servicoAgendado" }],
    });

    const horariosOcupados = new Set();

    agendamentosDoDia.forEach((agendamento) => {
      const inicioOcupado = new Date(`${data}T${agendamento.hora}:00`);
      const duracaoAgendamento = agendamento.servicoAgendado
        ? agendamento.servicoAgendado.duracao
        : 30;

      for (let i = 0; i < duracaoAgendamento; i += 30) {
        const horaOcupada = new Date(inicioOcupado.getTime() + i * 60000);
        horariosOcupados.add(horaOcupada.toTimeString().substring(0, 5));
      }
    });

    const intervalosDoDia = await Intervalo.findAll({
      where: { dia_semana: nomeDiaDaSemana },
    });
    intervalosDoDia.forEach((intervalo) => {
      const inicioIntervalo = new Date(`${data}T${intervalo.inicio}`);
      const fimIntervalo = new Date(`${data}T${intervalo.fim}`);

      let horaAtualIntervalo = new Date(inicioIntervalo);
      while (horaAtualIntervalo < fimIntervalo) {
        horariosOcupados.add(horaAtualIntervalo.toTimeString().substring(0, 5));
        horaAtualIntervalo.setMinutes(horaAtualIntervalo.getMinutes() + 30);
      }
    });

    const horariosDisponiveis = [];
    let horaAtual = new Date(`${data}T${configDia.abertura}`);
    const horaFechamento = new Date(`${data}T${configDia.fechamento}`);
    const intervaloPadrao = 30;
    const numBlocosNecessarios = Math.ceil(duracaoServico / intervaloPadrao);

    while (horaAtual < horaFechamento) {
      const horaInicio = horaAtual.toTimeString().substring(0, 5);
      let todosBlocosLivres = true;

      for (let i = 0; i < numBlocosNecessarios; i++) {
        const bloco = new Date(
          horaAtual.getTime() + i * intervaloPadrao * 60000
        );
        const blocoFormatado = bloco.toTimeString().substring(0, 5);

        if (
          horariosOcupados.has(blocoFormatado) ||
          bloco.getTime() >= horaFechamento.getTime()
        ) {
          todosBlocosLivres = false;
          break;
        }
      }

      if (todosBlocosLivres) {
        horariosDisponiveis.push(horaInicio);
      }

      horaAtual.setMinutes(horaAtual.getMinutes() + intervaloPadrao);
    }

    const agora = new Date();
    if (diaSelecionado.toDateString() === agora.toDateString()) {
      const horariosFiltrados = horariosDisponiveis.filter((h) => {
        const dataHoraAgendamento = new Date(`${data}T${h}:00`);
        const diferencaEmMinutos =
          (dataHoraAgendamento.getTime() - agora.getTime()) / (1000 * 60);
        return diferencaEmMinutos >= 20;
      });
      return res.json(horariosFiltrados);
    }

    res.json(horariosDisponiveis);
  } catch (error) {
    console.error("ERRO GRAVE NA ROTA DE HORÁRIOS:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// =================================================================
// ROTA ADICIONAL: Cancelar Agendamento via POST (para o painel)
// =================================================================
app.post("/remover-agendamento", async (req, res) => {
  try {
    const idParaRemover = req.body.agendamento_id;
    const agendamento = await Agendamento.findByPk(idParaRemover);

    if (agendamento) {
      await agendamento.destroy();
      res.redirect("/agendamentos");
    } else {
      res.status(404).send("Agendamento não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao remover agendamento:", error);
    res.status(500).send("Erro interno do servidor.");
  }
});

// =================================================================
// 7. INICIALIZAÇÃO DO SERVIDOR
// =================================================================
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

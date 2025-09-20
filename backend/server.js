// =================================================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO INICIAL
// =================================================================
const express = require("express");
<<<<<<< HEAD
const session = require("express-session"); // Importação para o login/logout
=======
const session = require("express-session");
>>>>>>> origin/master
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("./db");

// Importa todos os modelos necessários AQUI
const Agendamento = require("./models/Agendamento");
const Servico = require("./models/Servico");
const HorarioConfiguracao = require("./models/HorarioConfiguracao");
<<<<<<< HEAD
=======
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
>>>>>>> origin/master

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
<<<<<<< HEAD
  session({
    secret: "sua_chave_super_secreta",
    resave: false,
    saveUninitialized: true,
  })
=======
  session({
    secret: "sua_chave_super_secreta",
    resave: false,
    saveUninitialized: true,
  })
>>>>>>> origin/master
);

// Configuração do EJS como motor de visualização
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

<<<<<<< HEAD
// Sincroniza os models com o banco de dados ao iniciar
sequelize.sync().then(() => {
  console.log("Banco de dados e tabelas sincronizados.");
=======
// =================================================================
// ATENÇÃO: Sincronize o banco de dados com a opção { force: true }
// REMOVA DEPOIS DO PRIMEIRO USO!
// =================================================================
sequelize.sync().then(() => {
  console.log("Banco de dados e tabelas sincronizados.");
>>>>>>> origin/master
});

// =================================================================
// 3. ROTAS PÚBLICAS E DE AGENDAMENTO (PARA CLIENTES)
// =================================================================

// Rota principal (GET): Exibe o formulário de agendamento com os serviços
app.get("/", async (req, res) => {
<<<<<<< HEAD
  try {
    const servicos = await Servico.findAll();
    res.render("index", { servicos });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    res.status(500).send("Erro ao carregar a página.");
  }
=======
  try {
    const servicos = await Servico.findAll();
    res.render("index", { servicos });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    res.status(500).send("Erro ao carregar a página.");
  }
>>>>>>> origin/master
});

// Rota principal (POST): Cria um novo agendamento
app.post("/", async (req, res) => {
<<<<<<< HEAD
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
=======
  try {
    // CORREÇÃO: Pegue o servicoId, não o nome
    const { nome, telefone, servicoId, data, hora } = req.body;

    // =========================================================
    // NOVO CÓDIGO: Validação dos 20 minutos de antecedência
    // =========================================================
    const dataHoraAgendamento = new Date(`${data}T${hora}:00`);
    const agora = new Date();
    const diferencaEmMinutos =
      (dataHoraAgendamento.getTime() - agora.getTime()) / (1000 * 60);

    // Se a diferença for menor que 20 minutos, bloqueia o agendamento
    if (diferencaEmMinutos < 20) {
      console.log(
        "Tentativa de agendamento bloqueada: menos de 20 min de antecedência."
      );
      return res
        .status(400)
        .send(
          "O agendamento deve ser feito com no mínimo 20 minutos de antecedência."
        );
    }
    // =========================================================
    // FIM DA VALIDAÇÃO
    // =========================================================

    // Busque o nome do serviço para a confirmação
    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      return res.status(400).send("Serviço não encontrado.");
    }

    const novoAgendamento = await Agendamento.create({
      id: uuidv4(),
      nome,
      telefone,
      servico: servico.nome, // Salva o nome para a confirmação, mas o ID é o que importa para a associação
      servicoId: servicoId, // Salva o ID do serviço na nova coluna
      data,
      hora,
    });
    res.redirect(
      `/confirmacao?nome=${nome}&servico=${servico.nome}&data=${data}&hora=${hora}&id=${novoAgendamento.id}`
    );
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    res.status(500).send("Erro ao processar o agendamento.");
  }
>>>>>>> origin/master
});

// Rota da página de confirmação de agendamento
app.get("/confirmacao", (req, res) => {
<<<<<<< HEAD
  const { nome, servico, data, hora, id } = req.query;
  let dataFormatada = data;
  if (data && data.includes("-")) {
    const [year, month, day] = data.split("-");
    dataFormatada = `${day}/${month}/${year}`;
  }
  res.render("confirmacao", { nome, servico, data: dataFormatada, hora, id });
=======
  const { nome, servico, data, hora, id } = req.query;
  let dataFormatada = data;
  if (data && data.includes("-")) {
    const [year, month, day] = data.split("-");
    dataFormatada = `${day}/${month}/${year}`;
  }
  res.render("confirmacao", { nome, servico, data: dataFormatada, hora, id });
>>>>>>> origin/master
});

// =================================================================
// 4. ROTAS DE CANCELAMENTO
// =================================================================

<<<<<<< HEAD
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
=======
app.post("/cancelar-agendamento", async (req, res) => {
  try {
    // Usa body.id_cancelar, que é o nome que seu script.js envia
    const idParaCancelar = req.body.id_cancelar;
    const agendamento = await Agendamento.findByPk(idParaCancelar);

    if (agendamento) {
      await agendamento.destroy();
      // Responde com um JSON de sucesso
      res.json({ success: true, message: "Agendamento cancelado com sucesso." });
    } else {
      // Responde com um JSON de falha (ID não encontrado)
      res.json({ success: false, message: "Agendamento não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    // Responde com um JSON de erro interno
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
>>>>>>> origin/master
});

// Rota GET para cancelar via link (ex: de um e-mail)
app.get("/cancelar/:id", async (req, res) => {
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/master
});

// =================================================================
// 5. ROTAS DO PAINEL DE ADMINISTRAÇÃO
// =================================================================

// Rota para exibir o painel com todos os agendamentos
app.get("/agendamentos", async (req, res) => {
<<<<<<< HEAD
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
=======
  try {
    const todosAgendamentos = await Agendamento.findAll({
      order: [
        ["data", "ASC"],
        ["hora", "ASC"],
      ],
      // Inclui o serviço associado para exibir o nome e duração na tabela
      include: [{ model: Servico, as: 'servicoAgendado' }],
    });
    res.render("agendamentos", { agendamentos: todosAgendamentos });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).send("Erro ao carregar o painel de agendamentos.");
  }
});

// Rota GET para a página de gerenciamento de serviços e horários
// MODIFICADO: Agora busca os intervalos também
>>>>>>> origin/master
app.get("/gerenciar-servicos", async (req, res) => {
  try {
    const servicos = await Servico.findAll({ order: [["nome", "ASC"]] });
    const configuracoes = await HorarioConfiguracao.findAll();
<<<<<<< HEAD
    const diasDaSemana = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
=======
    const intervalos = await Intervalo.findAll(); // <-- NOVO: Busca todos os intervalos

    const diasDaSemana = [
      "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
      "Quinta-feira", "Sexta-feira", "Sábado",
>>>>>>> origin/master
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
<<<<<<< HEAD
    res.render("gerenciar_servicos", { servicos, configuracoes: configMap });
=======
    // MODIFICADO: Passa os intervalos para a view EJS
    res.render("gerenciar_servicos", { servicos, configuracoes: configMap, intervalos });
>>>>>>> origin/master
  } catch (error) {
    console.error("Erro ao carregar página de gerenciamento:", error);
    res.status(500).send("Erro ao carregar a página.");
  }
});

// Rota POST para as ações de gerenciamento (adicionar/remover serviço, salvar horários)
app.post("/gerenciar-servicos", async (req, res) => {
<<<<<<< HEAD
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
=======
  try {
    if (req.body.acao === "adicionar") {
      const { nome, preco, descricao, duracao } = req.body;
      await Servico.create({
        nome,
        preco,
        descricao,
        duracao, // <-- AGORA SALVA A DURAÇÃO
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

// NOVO: Rota para adicionar um novo intervalo
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

// NOVO: Rota para remover um intervalo
app.post("/remover-intervalo", async (req, res) => {
  try {
    const { id } = req.body;
    await Intervalo.destroy({ where: { id: id } });
    res.redirect("/gerenciar-servicos");
  } catch (error) {
    console.error("Erro ao remover intervalo:", error);
    res.status(500).send("Erro ao remover intervalo.");
>>>>>>> origin/master
  }
});

// Rota para EXIBIR a página de login
app.get("/login", (req, res) => {
<<<<<<< HEAD
  res.render("login");
=======
  res.render("login");
>>>>>>> origin/master
});

// Rota para PROCESSAR o formulário de login
app.post("/login", (req, res) => {
<<<<<<< HEAD
  const { password } = req.body;
  const SENHA_ADMIN = "admin123";
  if (password === SENHA_ADMIN) {
    req.session.isAdmin = true; // Marca a sessão como autenticada
    res.redirect("/agendamentos");
  } else {
    res.render("login", { error: "Senha inválida!" });
  }
=======
  const { password } = req.body;
  const SENHA_ADMIN = "admin123";
  if (password === SENHA_ADMIN) {
    req.session.isAdmin = true; // Marca a sessão como autenticada
    res.redirect("/agendamentos");
  } else {
    res.render("login", { error: "Senha inválida!" });
  }
>>>>>>> origin/master
});

// Rota para fazer logout
app.get("/logout", (req, res) => {
<<<<<<< HEAD
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao fazer logout:", err);
      return res.redirect("/agendamentos");
    }
    res.redirect("/");
  });
=======
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao fazer logout:", err);
      return res.redirect("/agendamentos");
    }
    res.redirect("/");
  });
>>>>>>> origin/master
});

// =================================================================
// 6. ROTAS DE API (PARA O JAVASCRIPT DO CLIENTE)
// =================================================================

<<<<<<< HEAD
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
=======
// Rota da API que retorna os horários disponíveis (AGORA COM DURAÇÃO DO SERVIÇO)
// MODIFICADO: Adiciona a lógica para bloquear os intervalos
app.get("/api/horarios/:data/:servicoId", async (req, res) => {
  const { data, servicoId } = req.params;

  try {
    // 1. Busca a duração do serviço selecionado
    const servico = await Servico.findByPk(servicoId);
    if (!servico) {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }
    const duracaoServico = servico.duracao;

    // 2. Lógica para buscar as configurações e horários ocupados
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
      // Inclui o modelo Servico para obter a duração do agendamento existente
      include: [{ model: Servico, as: "servicoAgendado" }],
    });

    const horariosOcupados = new Set();
    
    // Marca todos os blocos de tempo ocupados por agendamentos existentes
    agendamentosDoDia.forEach((agendamento) => {
      const inicioOcupado = new Date(`${data}T${agendamento.hora}:00`);
      // Pega a duração do agendamento existente ou usa 30 minutos como padrão
      const duracaoAgendamento = agendamento.servicoAgendado
        ? agendamento.servicoAgendado.duracao
        : 30;

      // Ocupa todos os blocos de 30 minutos que o agendamento abrange
      for (let i = 0; i < duracaoAgendamento; i += 30) {
        const horaOcupada = new Date(inicioOcupado.getTime() + i * 60000);
        horariosOcupados.add(horaOcupada.toTimeString().substring(0, 5));
      }
    });
    
    // NOVO CÓDIGO: Adiciona os intervalos ao conjunto de horários ocupados
    const intervalosDoDia = await Intervalo.findAll({ // <-- CORRIGIDO: Agora busca os intervalos!
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

    // 3. Lógica para gerar e filtrar horários disponíveis
    const horariosDisponiveis = [];
    let horaAtual = new Date(`${data}T${configDia.abertura}`);
    const horaFechamento = new Date(`${data}T${configDia.fechamento}`);
    const intervaloPadrao = 30; // Base para os blocos de agendamento
    const numBlocosNecessarios = Math.ceil(duracaoServico / intervaloPadrao);

    while (horaAtual < horaFechamento) {
      const horaInicio = horaAtual.toTimeString().substring(0, 5);
      let todosBlocosLivres = true;

      // Verifica se há blocos livres suficientes para a duração do serviço
      for (let i = 0; i < numBlocosNecessarios; i++) {
        const bloco = new Date(
          horaAtual.getTime() + i * intervaloPadrao * 60000
        );
        const blocoFormatado = bloco.toTimeString().substring(0, 5);

        // Verifica se o bloco está ocupado ou se excede o horário de fechamento
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

    // 4. Filtra horários passados e com menos de 20 minutos de antecedência
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
>>>>>>> origin/master
});

// =================================================================
// 7. INICIALIZAÇÃO DO SERVIDOR
// =================================================================
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Servidor rodando em http://localhost:${PORT}`);
=======
  console.log(`Servidor rodando em http://localhost:${PORT}`);
>>>>>>> origin/master
});
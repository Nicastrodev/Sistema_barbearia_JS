const express = require("express");
const router = express.Router();
const Agendamento = require("./Agendamento");

router.post("/agendar", async (req, res) => {
  try {
    const { nome, telefone, servico, servicoId, data, hora } = req.body;

    // Verifica duplicidade antes de criar
    const existente = await Agendamento.findOne({
      where: { data, hora, servicoId },
    });

    if (existente) {
      return res.status(409).json({
        sucesso: false,
        mensagem:
          "O horário solicitado foi agendado por outra pessoa. Atualize a página e selecione outro horário dísponivel",
      });
    }

    const novoAgendamento = await Agendamento.create({
      nome,
      telefone,
      servico,
      servicoId,
      data,
      hora,
    });

    return res.json({
      sucesso: true,
      mensagem: "Agendamento confirmado!",
      agendamento: novoAgendamento,
    });
  } catch (error) {
    console.error("Erro ao agendar:", error);

    // Trata erro de índice único (duplicidade)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Esse horário já foi agendado. Escolha outro.",
      });
    }

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro no servidor. Tente novamente.",
    });
  }
});

module.exports = router;

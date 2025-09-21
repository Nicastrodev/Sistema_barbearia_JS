document.addEventListener("DOMContentLoaded", () => {
  const dataInput = document.getElementById("data");
  const servicoSelect = document.getElementById("servico");
  const horaSelect = document.getElementById("hora");
  const telefoneInput = document.getElementById("telefone");

  // --- LÓGICA PARA ATUALIZAR HORÁRIOS DISPONÍVEIS ---
  if (dataInput && horaSelect && servicoSelect) {
    const hoje = new Date().toISOString().split("T")[0];
    dataInput.setAttribute("min", hoje);

    dataInput.addEventListener("change", fetchHorarios);
    servicoSelect.addEventListener("change", fetchHorarios);

    async function fetchHorarios() {
      const dataSelecionada = dataInput.value;
      const servicoId = servicoSelect.value;

      horaSelect.innerHTML = '<option value="">Carregando...</option>';
      horaSelect.disabled = true;

      if (!dataSelecionada || !servicoId) {
        horaSelect.innerHTML =
          '<option value="">Selecione a data e o serviço...</option>';
        return;
      }

      try {
        const response = await fetch(
          `/api/horarios/${dataSelecionada}/${servicoId}`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar horários no servidor.");
        }

        const horarios = await response.json();

        horaSelect.innerHTML = "";

        if (horarios.length === 0) {
          horaSelect.innerHTML =
            '<option value="">Nenhum horário disponível</option>';
          horaSelect.disabled = true;
        } else {
          horaSelect.innerHTML =
            '<option value="">Selecione o horário...</option>';
          horarios.forEach((hora) => {
            const option = document.createElement("option");
            option.value = hora;
            option.textContent = hora;
            horaSelect.appendChild(option);
          });
          horaSelect.disabled = false;
        }
      } catch (error) {
        console.error("Falha ao buscar horários:", error);
        horaSelect.innerHTML =
          '<option value="">Erro ao carregar horários</option>';
        horaSelect.disabled = true;
      }
    }
  }

  // --- MÁSCARA PARA TELEFONE ---
if (telefoneInput) {
  telefoneInput.addEventListener("input", (e) => {
    // 1. Limpa o valor, mantendo apenas os dígitos
    let value = e.target.value.replace(/\D/g, "");

    // 2. Limita o total de dígitos a 11 (máximo para celular com DDD)
    value = value.substring(0, 11);

    // 3. Aplica a formatação de forma inteligente
    if (value.length > 10) {
      // Formato para celular com 9º dígito: (XX) 9XXXX-XXXX
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");

    } else if (value.length > 6) {
      // Formato para telefone fixo: (XX) XXXX-XXXX
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");

    } else if (value.length > 2) {
      // Formato para quando está digitando o DDD
      value = value.replace(/^(\d{2})(\d*)/, "($1) $2");
      
    } else if (value.length > 0) {
      // Formato para quando está digitando o DDD
      value = value.replace(/^(\d*)/, "($1");
    }

    // 4. Atualiza o valor no campo
    e.target.value = value;
  });
}
  // --- LÓGICA PARA CANCELAR AGENDAMENTO ---
  const formCancelamento = document.querySelector(
    'form[action="/cancelar-agendamento"]'
  );
  if (formCancelamento) {
    formCancelamento.addEventListener("submit", async (e) => {
      e.preventDefault();

      const idParaCancelar = document.getElementById("id_cancelar").value;

      try {
        const response = await fetch("/cancelar-agendamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_cancelar: idParaCancelar }),
        });

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          window.location.href = "/cancelamento_confirmado/sucesso";
        } else {
          window.location.href = "/cancelamento_confirmado/nao_encontrado";
        }
      } catch (error) {
        console.error("Erro ao cancelar agendamento:", error);
        window.location.href = "/cancelamento_confirmado/erro";
      }
    });
  }
});
// =================================================================
// SCRIPT.JS FINAL - Barbearia Elite
// =================================================================

document.addEventListener("DOMContentLoaded", () => {
  const dataInput = document.getElementById("data");
  const horaSelect = document.getElementById("hora");
  const telefoneInput = document.getElementById("telefone");

  // --- LÓGICA PARA ATUALIZAR HORÁRIOS DISPONÍVEIS ---
  if (dataInput && horaSelect) {
    // Define a data mínima como hoje para não poder agendar no passado
    const hoje = new Date().toISOString().split("T")[0];
    dataInput.setAttribute("min", hoje);

    // Adiciona o listener para o evento de 'change' (quando a data é selecionada)
    dataInput.addEventListener("change", async () => {
      const dataSelecionada = dataInput.value;

      // Mostra um feedback de "Carregando..."
      horaSelect.innerHTML = '<option value="">Carregando...</option>';
      horaSelect.disabled = true;

      if (!dataSelecionada) {
        horaSelect.innerHTML =
          '<option value="">Selecione a data primeiro...</option>';
        return;
      }

      try {
        // Busca na nossa API os horários disponíveis para a data selecionada
        const response = await fetch(`/api/horarios/${dataSelecionada}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar horários no servidor.");
        }
        const horarios = await response.json();

        // Limpa o select antes de adicionar as novas opções
        horaSelect.innerHTML = "";

        if (horarios.length === 0) {
          // Se a lista de horários estiver vazia
          horaSelect.innerHTML =
            '<option value="">Nenhum horário disponível</option>';
          horaSelect.disabled = true;
        } else {
          // Se houver horários, preenche o menu
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
    });
  }

  // --- MÁSCARA PARA TELEFONE ---
  if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      value = value.substring(0, 11); // Limita a 11 dígitos
      if (value.length > 2) {
        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      }
      if (value.length > 9) {
        value = `${value.substring(0, 9)}-${value.substring(9)}`;
      }
      e.target.value = value;
    });
  }
});
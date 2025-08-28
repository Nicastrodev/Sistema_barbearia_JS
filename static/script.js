// script.js - Barbearia Elite
document.addEventListener('DOMContentLoaded', function() {

    const dataInput = document.getElementById('data');
    const horaSelect = document.getElementById('hora');
    const telefoneInput = document.getElementById('telefone');
    const formAgendamento = document.getElementById('agendamentoForm');
    const btnAgendar = document.getElementById('btnAgendar');

    // --- Configurar data mínima para hoje ---
    if (dataInput) {
        const hoje = new Date();
        const dataMinima = hoje.toISOString().split('T')[0];
        dataInput.setAttribute('min', dataMinima);

        // Bloquear domingos e atualizar horários
        dataInput.addEventListener('change', async function() {
            const dataSelecionada = new Date(this.value + 'T00:00:00');
            const diaSemana = dataSelecionada.getDay();
            await atualizarHorariosDisponiveis();
        });
    }

    // --- Função para atualizar horários disponíveis ---
    async function atualizarHorariosDisponiveis() {
        if (!dataInput.value || !horaSelect) return;

        // Horários fixos padrão
        let horariosFixos = ["08:00","09:00","10:00","11:00",
                             "14:00","15:00","16:00","17:00","18:00"];
        try {
            const response = await fetch(`/api/horarios/${dataInput.value}`);
            if (response.ok) {
                const horariosDisponiveis = await response.json();
                horariosFixos = horariosDisponiveis;
            }
        } catch (err) {
            console.error("Erro ao buscar horários disponíveis:", err);
        }

        // Filtra horários que já passaram se for hoje
        const agora = new Date();
        if (dataInput.value === agora.toISOString().split("T")[0]) {
            horariosFixos = horariosFixos.filter(h => {
                const [hHoras, hMinutos] = h.split(":").map(Number);
                const dataHora = new Date(dataInput.value + "T" + h + ":00");
                return dataHora > agora;
            });
        }

        // Atualiza select
        horaSelect.innerHTML = '<option value="">Selecione o horário...</option>';
        if (horariosFixos.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Nenhum horário disponível";
            horaSelect.appendChild(option);
        } else {
            horariosFixos.forEach(hora => {
                const option = document.createElement("option");
                option.value = hora;
                option.textContent = hora;
                horaSelect.appendChild(option);
            });
        }
    }

    // --- Máscara para telefone ---
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }

    // --- Validação do formulário ---
    if (formAgendamento) {
        formAgendamento.addEventListener('submit', function(e) {
            const nome = document.getElementById('nome').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const servico = document.getElementById('servico').value;
            const data = document.getElementById('data').value;
            const hora = document.getElementById('hora').value;

            if (nome.length < 3) {
                e.preventDefault();
                alert('⚠️ Digite um nome válido (mínimo 3 caracteres).');
                return;
            }
            if (telefone.length < 14) {
                e.preventDefault();
                alert('⚠️ Digite um telefone válido com DDD.');
                return;
            }
            if (!servico || !data || !hora) {
                e.preventDefault();
                alert('⚠️ Preencha todos os campos obrigatórios.');
                return;
            }

            const agora = new Date();
            const dataHoraAgendamento = new Date(data + 'T' + hora + ':00');
            if (dataHoraAgendamento <= agora) {
                e.preventDefault();
                alert('⚠️ Não é possível agendar horários já passados.');
                return;
            }

            // Feedback no botão
            if (btnAgendar) {
                btnAgendar.classList.add('btn-loading');
                btnAgendar.disabled = true;
            }
        });
    }

    // --- Animações simples ---
    const elementos = document.querySelectorAll('.form-card');
    elementos.forEach((el, idx) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, idx * 100);
    });

});
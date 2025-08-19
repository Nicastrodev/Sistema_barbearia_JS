// JavaScript para Barbearia Elite
document.addEventListener('DOMContentLoaded', function() {
    
    // Configurar data mínima para hoje
    const dataInput = document.getElementById('data');
    if (dataInput) {
        const hoje = new Date();
        const dataMinima = hoje.toISOString().split('T')[0];
        dataInput.setAttribute('min', dataMinima);
        
        // Bloquear domingos (opcional)
        dataInput.addEventListener('change', function() {
            const dataSelecionada = new Date(this.value + 'T00:00:00');
            const diaSemana = dataSelecionada.getDay();
            
            if (diaSemana === 0) { // Domingo
                alert('🚫 Desculpe, não atendemos aos domingos. Por favor, escolha outro dia.');
                this.value = '';
            }
        });
    }

    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
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

    // Validação do formulário de agendamento
    const formAgendamento = document.getElementById('agendamentoForm');
    if (formAgendamento) {
        formAgendamento.addEventListener('submit', function(e) {
            const nome = document.getElementById('nome').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const servico = document.getElementById('servico').value;
            const data = document.getElementById('data').value;
            const hora = document.getElementById('hora').value;
            
            // Validações básicas
            if (nome.length < 3) {
                e.preventDefault();
                alert('⚠️ Por favor, digite um nome válido (mínimo 3 caracteres).');
                return;
            }
            
            if (telefone.length < 14) {
                e.preventDefault();
                alert('⚠️ Por favor, digite um telefone válido com DDD.');
                return;
            }
            
            if (!servico || !data || !hora) {
                e.preventDefault();
                alert('⚠️ Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Verificar se a data não é no passado
            const dataAgendamento = new Date(data);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            if (dataAgendamento < hoje) {
                e.preventDefault();
                alert('⚠️ Não é possível agendar para datas passadas.');
                return;
            }
            
            // Animação de loading no botão
            const btnAgendar = document.getElementById('btnAgendar');
            if (btnAgendar) {
                btnAgendar.classList.add('btn-loading');
                btnAgendar.disabled = true;
            }
        });
    }

    // Validação do formulário de login
    const formLogin = document.getElementById('loginForm');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            const senha = document.getElementById('senha').value.trim();
            
            if (senha.length === 0) {
                e.preventDefault();
                alert('⚠️ Por favor, digite a senha.');
                return;
            }
            
            // Animação de loading no botão
            const btnLogin = document.getElementById('btnLogin');
            if (btnLogin) {
                btnLogin.classList.add('btn-loading');
                btnLogin.disabled = true;
            }
        });
    }

    // Funcionalidades da tabela de agendamentos
    const tabelaAgendamentos = document.getElementById('tabelaAgendamentos');
    if (tabelaAgendamentos) {
        // Adicionar funcionalidade de busca
        criarCampoBusca();
        
        // Destacar agendamentos do dia atual
        destacarAgendamentosHoje();
    }

    // Animações suaves para elementos
    const elementos = document.querySelectorAll('.form-card, .confirmation-card, .login-card, .table-container');
    elementos.forEach((elemento, index) => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            elemento.style.transition = 'all 0.6s ease-out';
            elemento.style.opacity = '1';
            elemento.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Adicionar efeito de hover nos cards
    const cards = document.querySelectorAll('.form-card, .confirmation-card, .login-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 25px 50px rgba(0,0,0,0.4)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
        });
    });
});

// Função para criar campo de busca na tabela
function criarCampoBusca() {
    const container = document.querySelector('.appointments-container');
    const tabela = document.getElementById('tabelaAgendamentos');
    
    if (!container || !tabela) return;

    const campoBusca = document.createElement('div');
    campoBusca.style.marginBottom = '2rem';
    campoBusca.innerHTML = `
        <div style="max-width: 400px; margin: 0 auto;">
            <input type="text" 
                   id="buscaAgendamentos" 
                   placeholder="🔍 Buscar por nome, telefone ou serviço..." 
                   style="width: 100%; padding: 1rem; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; background: rgba(255,255,255,0.9);">
        </div>
    `;
    
    container.insertBefore(campoBusca, tabela.parentElement);
    
    const inputBusca = document.getElementById('buscaAgendamentos');
    inputBusca.addEventListener('input', function() {
        filtrarTabela(this.value.toLowerCase());
    });
}

// Função para filtrar a tabela
function filtrarTabela(termo) {
    const linhas = document.querySelectorAll('#tabelaAgendamentos tbody tr');
    let contadorVisivel = 0;
    
    linhas.forEach(linha => {
        const textoLinha = linha.textContent.toLowerCase();
        const visivel = textoLinha.includes(termo);
        
        linha.style.display = visivel ? '' : 'none';
        if (visivel) contadorVisivel++;
    });
    
    // Atualizar contador
    const totalElement = document.getElementById('totalAgendamentos');
    if (totalElement) {
        totalElement.textContent = contadorVisivel;
    }
}

// Função para destacar agendamentos de hoje
function destacarAgendamentosHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    const linhas = document.querySelectorAll('#tabelaAgendamentos tbody tr');
    
    linhas.forEach(linha => {
        const colunaData = linha.children[4]; // Assumindo que a data está na 5ª coluna (índice 4)
        if (colunaData && colunaData.textContent.includes(hoje)) {
            linha.style.background = 'rgba(212, 175, 55, 0.3)';
            linha.style.border = '2px solid #d4af37';
            linha.insertAdjacentHTML('afterbegin', '<td style="color: #d4af37; font-weight: bold;">🔥 HOJE</td>');
        }
    });
}

// Função para notificações (pode ser expandida)
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: fadeInUp 0.5s ease-out;
    `;
    
    switch(tipo) {
        case 'success':
            notificacao.style.background = '#27ae60';
            break;
        case 'error':
            notificacao.style.background = '#dc3545';
            break;
        default:
            notificacao.style.background = '#333';
    }
    
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.remove();
    }, 5000);
}

// Função para validar horário de funcionamento
function validarHorarioFuncionamento(data, hora) {
    const dataObj = new Date(data);
    const diaSemana = dataObj.getDay();
    const [horas, minutos] = hora.split(':').map(Number);
    const horaDecimal = horas + minutos / 60;
    
    // Horários de funcionamento (pode ser customizado)
    const horarios = {
        1: [8, 18], // Segunda: 8h às 18h
        2: [8, 18], // Terça: 8h às 18h
        3: [8, 18], // Quarta: 8h às 18h
        4: [8, 18], // Quinta: 8h às 18h
        5: [8, 18], // Sexta: 8h às 18h
        6: [8, 16], // Sábado: 8h às 16h
        0: null     // Domingo: fechado
    };
    
    if (!horarios[diaSemana]) {
        return { valido: false, motivo: 'Não funcionamos aos domingos.' };
    }
    
    const [inicio, fim] = horarios[diaSemana];
    if (horaDecimal < inicio || horaDecimal >= fim) {
        return { 
            valido: false, 
            motivo: `Horário fora do funcionamento. Funcionamos das ${inicio}h às ${fim}h.` 
        };
    }
    
    return { valido: true };
}

// Interceptar formulário para validações extras
document.addEventListener('submit', function(e) {
    const form = e.target;
    
    if (form.id === 'agendamentoForm') {
        const data = form.data.value;
        const hora = form.hora.value;
        
        if (data && hora) {
            const validacao = validarHorarioFuncionamento(data, hora);
            if (!validacao.valido) {
                e.preventDefault();
                alert('⚠️ ' + validacao.motivo);
                
                // Remover loading do botão se houver erro
                const btn = document.getElementById('btnAgendar');
                if (btn) {
                    btn.classList.remove('btn-loading');
                    btn.disabled = false;
                }
            }
        }
    }
});

// Adicionar funcionalidade de impressão para lista de agendamentos
function adicionarBotaoImprimir() {
    const container = document.querySelector('.appointments-header');
    if (!container) return;
    
    const btnImprimir = document.createElement('button');
    btnImprimir.innerHTML = '🖨️ Imprimir Lista';
    btnImprimir.className = 'nav-link';
    btnImprimir.style.background = '#17a2b8';
    btnImprimir.style.border = 'none';
    btnImprimir.style.cursor = 'pointer';
    
    btnImprimir.addEventListener('click', function() {
        window.print();
    });
    
    container.appendChild(btnImprimir);
}

// Chamar função de impressão se estivermos na página de agendamentos
if (document.getElementById('tabelaAgendamentos')) {
    adicionarBotaoImprimir();
}
document.addEventListener("DOMContentLoaded", () => {
    // Verifica se existem dados de agendamentos
    if (window.dadosAgendamentos && window.dadosAgendamentos.length > 0) {
        const servicos = {};

        // Conta quantas vezes cada serviço aparece
        window.dadosAgendamentos.forEach(ag => {
            servicos[ag.servico] = (servicos[ag.servico] || 0) + 1;
        });

        // Descobre o serviço mais popular
        const servicoPopular = Object.entries(servicos)
            .sort(([, a], [, b]) => b - a)[0];

        // Mostra no painel
        if (servicoPopular) {
            document.getElementById('servicoPopular').textContent =
                `${servicoPopular[0]} (${servicoPopular[1]}x)`;
        }
    }
});

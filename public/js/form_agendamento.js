// public/js/form-agendamento.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-agendamento");

  if (form) {
    form.addEventListener("submit", async (event) => {
      // 1. Impede o envio tradicional do formulário (que recarrega a página)
      event.preventDefault();

      // Desabilita o botão para evitar cliques duplos
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Aguarde...";

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      try {
        // 2. Envia os dados para o servidor usando a API Fetch
        const response = await fetch("/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        // 3. Verifica a resposta do servidor
        if (response.ok && result.sucesso) {
          // Se sucesso=true, redireciona para a página de confirmação
          window.location.href = result.redirectUrl;
        } else {
          // Se sucesso=false, mostra o alerta amigável com a mensagem do servidor
          alert(result.mensagem);
        }
      } catch (error) {
        console.error("Erro ao enviar o formulário:", error);
        alert("Ocorreu um erro de comunicação. Tente novamente.");
      } finally {
        // Reabilita o botão após a tentativa de agendamento
        submitButton.disabled = false;
        submitButton.textContent = "Agendar";
      }
    });
  }
});

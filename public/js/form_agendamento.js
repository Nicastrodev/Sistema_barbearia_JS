// public/js/form-agendamento.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-agendamento");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Aguarde...";

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const msgErro = document.getElementById("mensagem-erro");

      try {
        const response = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.sucesso) {
          window.location.href = result.redirectUrl;
        } else {
          msgErro.textContent = result.mensagem || "Erro ao agendar.";
          msgErro.style.display = "block";
        }
      } catch (error) {
        console.error("Erro ao enviar o formulário:", error);
        msgErro.textContent =
          "Ocorreu um erro de comunicação. Tente novamente.";
        msgErro.style.display = "block";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "📋 Confirmar Agendamento";
      }
    });
  }
});

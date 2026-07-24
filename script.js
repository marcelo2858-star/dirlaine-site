const EVENT_DATE = new Date("2026-08-01T17:00:00-04:00").getTime();
const countdownIds = ["days", "hours", "minutes", "seconds"];

function updateCountdown() {
  const difference = Math.max(0, EVENT_DATE - Date.now());
  const values = [
    Math.floor(difference / 86400000),
    Math.floor((difference % 86400000) / 3600000),
    Math.floor((difference % 3600000) / 60000),
    Math.floor((difference % 60000) / 1000)
  ];

  countdownIds.forEach((id, index) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(values[index]).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

window.addEventListener("load", () => {
  window.setTimeout(() => {
    document.getElementById("intro")?.classList.add("hidden");
  }, 950);
});

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

menuButton?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

function getConfig() {
  const config = window.DIRLAINE_CONFIG || {};
  const validUrl =
    typeof config.supabaseUrl === "string" &&
    /^https:\/\/.+\.supabase\.co\/?$/.test(config.supabaseUrl);

  const validKey =
    typeof config.publishableKey === "string" &&
    config.publishableKey.startsWith("sb_publishable_");

  return validUrl && validKey ? config : null;
}

async function saveConfirmation(entry) {
  const config = getConfig();
  if (!config) throw new Error("Configuração do Supabase ausente.");

  const response = await fetch(
    `${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/convidados`,
    {
      method: "POST",
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        nome: entry.name,
        telefone: entry.phone,
        quantidade: entry.guests,
        observacao: entry.note || null
      })
    }
  );

  if (!response.ok) {
    throw new Error(await response.text() || `Erro ${response.status}`);
  }
}

function openWhatsApp(entry) {
  const message =
    `Olá! Meu nome é ${entry.name}. Confirmo minha presença na inauguração ` +
    `da Dirlaine Souza Nail Designer em 01/08/2026 às 17h. ` +
    `Quantidade de pessoas: ${entry.guests}.` +
    (entry.note ? ` Observação: ${entry.note}` : "");

  window.open(
    `https://wa.me/5569984792139?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener"
  );
}

const form = document.getElementById("rsvpForm");
const submitButton = document.getElementById("submitButton");
const successBox = document.getElementById("success");

form?.addEventListener("submit", async event => {
  event.preventDefault();

  const entry = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    guests: Number(document.getElementById("guests").value),
    note: document.getElementById("note").value.trim()
  };

  if (entry.name.length < 2 || entry.phone.replace(/\D/g, "").length < 8) {
    alert("Preencha o nome completo e um telefone válido.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Registrando...";
  successBox.hidden = true;

  try {
    await saveConfirmation(entry);
    successBox.textContent = "Presença registrada com sucesso. Obrigada!";
    successBox.hidden = false;
    form.reset();
    openWhatsApp(entry);
  } catch (error) {
    console.error(error);
    alert(
      "Não foi possível registrar na lista online agora. " +
      "A mensagem será aberta no WhatsApp para concluir a confirmação."
    );
    openWhatsApp(entry);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Confirmar presença";
  }
});

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
  const isOpen = navLinks?.classList.toggle("open") ?? false;
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
    `${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/confirmacoes_inauguracao`,
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
        presenca: true,
        acompanhantes: 0,
        observacoes: entry.note || null
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro ${response.status}`);
  }
}

function openWhatsApp(entry) {
  const message =
    `Olá! Meu nome é ${entry.name}. Confirmo minha presença individual ` +
    `na inauguração da Dirlaine Souza Nail Designer em 01/08/2026 às 17h.` +
    (entry.note ? ` Observação: ${entry.note}` : "");

  window.location.href =
    `https://wa.me/5569984792139?text=${encodeURIComponent(message)}`;
}

const form = document.getElementById("rsvpForm");
const submitButton = document.getElementById("submitButton");

form?.addEventListener("submit", async event => {
  event.preventDefault();

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const noteInput = document.getElementById("note");

  const entry = {
    name: nameInput?.value.trim() || "",
    phone: phoneInput?.value.trim() || "",
    note: noteInput?.value.trim() || ""
  };

  if (entry.name.length < 2) {
    nameInput?.focus();
    return;
  }

  if (entry.phone.replace(/\D/g, "").length < 8) {
    phoneInput?.focus();
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Registrando...";
  }

  try {
    await saveConfirmation(entry);
  } catch (error) {
    console.error("Erro ao registrar confirmação:", error);
  } finally {
    openWhatsApp(entry);
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Confirmar presença";
    }
  }
});

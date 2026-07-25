const { createClient } = require("@supabase/supabase-js");

// ===== CONFIGURAÇÃO =====
const SUPABASE_URL = "https://cpnvkjmpmcidyddkdztp.supabase.co";

const SUPABASE_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

const SENHA_DO_PAINEL = "2858";

// ========================

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-panel-password");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.headers["x-panel-password"] !== SENHA_DO_PAINEL) {
    return res.status(401).json({
      erro: "Senha incorreta."
    });
  }

  if (!SUPABASE_SECRET) {
    return res.status(500).json({
      erro: "SUPABASE_SERVICE_ROLE_KEY não configurada."
    });
  }

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SECRET,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const { data, error } = await supabase
    .from("confirmacoes_inauguracao")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    return res.status(500).json({
      erro: error.message
    });
  }

  return res.status(200).json(data);
};

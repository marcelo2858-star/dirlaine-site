const TABLE = "confirmacoes";

function responder(res, status, dados) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  return res.end(JSON.stringify(dados));
}

function obterConfiguracaoSupabase() {
  const url = String(process.env.SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");

  const key = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  ).trim();

  if (!url) {
    throw new Error(
      "A variável SUPABASE_URL não está configurada na Vercel."
    );
  }

  if (!key) {
    throw new Error(
      "A variável SUPABASE_SERVICE_ROLE_KEY não está configurada na Vercel."
    );
  }

  return { url, key };
}

async function chamarSupabase(caminho, opcoes = {}) {
  const { url, key } = obterConfiguracaoSupabase();

  return fetch(`${url}/rest/v1/${caminho}`, {
    ...opcoes,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...opcoes.headers
    }
  });
}

function lerCorpo(req) {
  if

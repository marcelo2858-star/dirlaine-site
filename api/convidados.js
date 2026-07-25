const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://cpnvkjmpmcidyddkdztp.supabase.co";

const SUPABASE_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

const PANEL_PASSWORD = process.env.PANEL_PASSWORD || "2858";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.headers["x-panel-password"] !== PANEL_PASSWORD) {
    return res.status(401).json({
      error: "Senha incorreta."
    });
  }

  if (!SUPABASE_SECRET) {
    return res.status(500).json({
      error: "Chave secreta do Supabase não configurada na Vercel."
    });
  }

  const headers = {
    apikey: SUPABASE_SECRET,
    Authorization: `Bearer ${SUPABASE_SECRET}`,
    "Content-Type": "application/json"
  };

  try {
    if (req.method === "GET") {
      const url =
        `${SUPABASE_URL}/rest/v1/confirmacoes_inauguracao` +
        "?select=id,nome,telefone,observacoes,criado_em" +
        "&order=criado_em.desc";

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Erro ao consultar convidados."
        });
      }

      return res.status(200).json({
        guests: data
      });
    }

    if (req.method === "DELETE") {
      const id = req.body?.id;

      if (!id) {
        return res.status(400).json({
          error: "Identificador ausente."
        });
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/confirmacoes_inauguracao?id=eq.${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            ...headers,
            Prefer: "return=minimal"
          }
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        return res.status(response.status).json({
          error: data.message || "Erro ao excluir confirmação."
        });
      }

      return res.status(200).json({
        ok: true
      });
    }

    res.setHeader("Allow", "GET, DELETE");

    return res.status(405).json({
      error: "Método não permitido."
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erro interno."
    });
  }
};

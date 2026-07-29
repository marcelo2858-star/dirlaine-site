const TABLE = "confirmacoes";

function responder(res, status, dados) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(dados));
}

function configuracaoSupabase() {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "");

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurada na Vercel."
    );
  }

  return { url, key };
}

async function requisitarSupabase(caminho, opcoes = {}) {
  const { url, key } = configuracaoSupabase();

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
  if (!req.body) return {};

  if (typeof req.body === "object") {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const corpo = lerCorpo(req);

      const nome = String(corpo.nome || "")
        .trim()
        .slice(0, 100);

      const telefone = String(corpo.telefone || "")
        .replace(/\D/g, "")
        .slice(0, 11);

      const observacoes = String(corpo.observacoes || "")
        .trim()
        .slice(0, 300);

      if (nome.length < 3) {
        return responder(res, 400, {
          error: "Digite o nome completo."
        });
      }

      if (telefone.length < 10) {
        return responder(res, 400, {
          error: "Digite um telefone válido com DDD."
        });
      }

      const consulta = await requisitarSupabase(
        `${TABLE}?telefone=eq.${encodeURIComponent(
          telefone
        )}&select=id&limit=1`
      );

      if (!consulta.ok) {
  const detalhes = await consulta.text();
  console.error("Erro ao consultar telefone:", detalhes);

  return responder(res, consulta.status, {
    error: `Supabase respondeu ${consulta.status}: ${detalhes}`
  });
}

        return responder(res, 500, {
          error: "Erro ao verificar a confirmação."
        });
      }

      const existente = await consulta.json();

      if (existente.length > 0) {
        return responder(res, 409, {
          error: "Este telefone já confirmou presença."
        });
      }

      const cadastro = await requisitarSupabase(TABLE, {
        method: "POST",
        headers: {
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          nome,
          telefone,
          observacoes,
          presente: true,
          acompanhantes: 0
        })
      });

      if (!cadastro.ok) {
        const detalhes = await cadastro.text();
        console.error("Erro ao salvar confirmação:", detalhes);

        return responder(res, 500, {
          error: "Não foi possível salvar a confirmação."
        });
      }

      const registros = await cadastro.json();

      return responder(res, 201, {
        ok: true,
        mensagem: "Presença confirmada com sucesso.",
        convidado: registros[0] || null
      });
    }

    if (req.method === "GET") {
      const senhaInformada = String(
        req.headers["x-painel-senha"] || ""
      );

      const senhaCorreta = String(
        process.env.PAINEL_SENHA || ""
      );

      if (!senhaCorreta) {
        return responder(res, 500, {
          error: "PAINEL_SENHA não configurada na Vercel."
        });
      }

      if (senhaInformada !== senhaCorreta) {
        return responder(res, 401, {
          error: "Senha incorreta."
        });
      }

      const consulta = await requisitarSupabase(
        `${TABLE}?select=id,nome,telefone,observacoes,criado_em&order=criado_em.desc`
      );

      if (!consulta.ok) {
        const detalhes = await consulta.text();
        console.error("Erro ao carregar convidados:", detalhes);

        return responder(res, 500, {
          error: "Não foi possível carregar os convidados."
        });
      }

      const convidados = await consulta.json();

      return responder(res, 200, {
        convidados
      });
    }

    res.setHeader("Allow", "GET, POST");

    return responder(res, 405, {
      error: "Método não permitido."
    });
  } catch (erro) {
    console.error("Erro interno da API:", erro);

    return responder(res, 500, {
      error:
        "Erro interno. Verifique as variáveis da Vercel e a tabela do Supabase."
    });
  }
};

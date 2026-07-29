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
    throw new Error("SUPABASE_URL não está configurada na Vercel.");
  }

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não está configurada na Vercel."
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
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function limparTelefone(valor) {
  return String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 11);
}

function lerRespostaSupabase(texto) {
  if (!texto) {
    return null;
  }

  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const corpo = lerCorpo(req);

      const nome = String(corpo.nome || "")
        .trim()
        .slice(0, 100);

      const telefone = limparTelefone(corpo.telefone);

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

      const resposta = await chamarSupabase(TABLE, {
        method: "POST",
        headers: {
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          nome,
          telefone,
          observacoes
        })
      });

      const texto = await resposta.text();
      const dados = lerRespostaSupabase(texto);

      if (!resposta.ok) {
        console.error(
          "Erro Supabase ao salvar:",
          resposta.status,
          dados
        );

        const codigo =
          dados && typeof dados === "object"
            ? String(dados.code || "")
            : "";

        const detalhe =
          dados && typeof dados === "object"
            ? String(
                dados.message ||
                dados.details ||
                dados.hint ||
                ""
              )
            : String(dados || "");

        if (
          codigo === "23505" ||
          detalhe.toLowerCase().includes("duplicate") ||
          detalhe.toLowerCase().includes("unique")
        ) {
          return responder(res, 409, {
            error: "Este telefone já confirmou presença."
          });
        }

      return responder(res, 500, {
  error: detalhe
    ? `Erro do Supabase: ${detalhe}`
    : "Não foi possível salvar a confirmação."
});
      

      return responder(res, 201, {
        ok: true,
        mensagem: "Presença confirmada com sucesso."
      });
    }

    if (req.method === "GET") {
      const senhaInformada = String(
        req.headers["x-painel-senha"] || ""
      ).trim();

      const senhaCorreta = String(
        process.env.PAINEL_SENHA || "2858"
      ).trim();

      if (senhaInformada !== senhaCorreta) {
        return responder(res, 401, {
          error: "Senha incorreta."
        });
      }

      const resposta = await chamarSupabase(
        `${TABLE}?select=*&order=criado_em.desc`,
        {
          method: "GET"
        }
      );

      const texto = await resposta.text();
      const dados = lerRespostaSupabase(texto);

      if (!resposta.ok) {
        console.error(
          "Erro Supabase ao carregar:",
          resposta.status,
          dados
        );

        return responder(res, 500, {
          error: "Não foi possível carregar os convidados.",
          detalhe:
            dados && typeof dados === "object"
              ? dados.message || dados.details || ""
              : String(dados || "")
        });
      }

      return responder(res, 200, {
        convidados: Array.isArray(dados) ? dados : []
      });
    }

    res.setHeader("Allow", "GET, POST");

    return responder(res, 405, {
      error: "Método não permitido."
    });
  } catch (erro) {
    console.error("Erro interno da API:", erro);

    return responder(res, 500, {
      error: "Erro interno da API.",
      detalhe: erro.message || "Erro desconhecido."
    });
  }
};

const TABLE = "confirmacoes";

function enviarJSON(res, status, dados) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(dados));
}

function limparTelefone(valor) {
  return String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 11);
}

function obterBody(req) {
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

function obterConfiguracao() {
  const supabaseUrl = String(
    process.env.SUPABASE_URL || ""
  )
    .trim()
    .replace(/\/+$/, "");

  const supabaseKey = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  ).trim();

  if (!supabaseUrl) {
    throw new Error(
      "SUPABASE_URL não está configurada na Vercel."
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não está configurada na Vercel."
    );
  }

  return {
    supabaseUrl,
    supabaseKey
  };
}

async function requisitarSupabase(caminho, opcoes) {
  const { supabaseUrl, supabaseKey } =
    obterConfiguracao();

  return fetch(
    `${supabaseUrl}/rest/v1/${caminho}`,
    {
      ...opcoes,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        ...(opcoes?.headers || {})
      }
    }
  );
}

async function lerResposta(resposta) {
  const texto = await resposta.text();

  if (!texto) return null;

  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const body = obterBody(req);

      const nome = String(body.nome || "")
        .trim()
        .slice(0, 100);

      const telefone = limparTelefone(body.telefone);

      const observacoes = String(
        body.observacoes || ""
      )
        .trim()
        .slice(0, 300);

      if (nome.length < 3) {
        return enviarJSON(res, 400, {
          error: "Digite o nome completo."
        });
      }

      if (telefone.length < 10) {
        return enviarJSON(res, 400, {
          error:
            "Digite um telefone válido com DDD."
        });
      }

      const resposta = await requisitarSupabase(
        TABLE,
        {
          method: "POST",
          headers: {
            Prefer: "return=minimal"
          },
          body: JSON.stringify({
            nome,
            telefone,
            observacoes
          })
        }
      );

      const dados = await lerResposta(resposta);

      if (!resposta.ok) {
        console.error(
          "Erro ao salvar no Supabase:",
          resposta.status,
          dados
        );

        const codigo =
          dados && typeof dados === "object"
            ? String(dados.code || "")
            : "";

        const mensagem =
          dados && typeof dados === "object"
            ? String(
                dados.message ||
                dados.details ||
                dados.hint ||
                "Erro desconhecido no Supabase."
              )
            : String(dados || "");

        if (
          codigo === "23505" ||
          mensagem
            .toLowerCase()
            .includes("duplicate") ||
          mensagem
            .toLowerCase()
            .includes("unique")
        ) {
          return enviarJSON(res, 409, {
            error:
              "Este telefone já confirmou presença."
          });
        }

        return enviarJSON(res, 500, {
          error: `Erro do Supabase: ${mensagem}`
        });
      }

      return enviarJSON(res, 201, {
        ok: true,
        mensagem:
          "Presença confirmada com sucesso."
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
        return enviarJSON(res, 401, {
          error: "Senha incorreta."
        });
      }

      const resposta = await requisitarSupabase(
        `${TABLE}?select=*`,
        {
          method: "GET"
        }
      );

      const dados = await lerResposta(resposta);

      if (!resposta.ok) {
        const mensagem =
          dados && typeof dados === "object"
            ? String(
                dados.message ||
                dados.details ||
                "Erro desconhecido."
              )
            : String(dados || "");

        return enviarJSON(res, 500, {
          error: `Erro ao carregar convidados: ${mensagem}`
        });
      }

      return enviarJSON(res, 200, {
        convidados: Array.isArray(dados)
          ? dados
          : []
      });
    }

    res.setHeader("Allow", "GET, POST");

    return enviarJSON(res, 405, {
      error: "Método não permitido."
    });
  } catch (erro) {
    console.error("Erro da API:", erro);

    return enviarJSON(res, 500, {
      error:
        erro && erro.message
          ? erro.message
          : "Erro interno da API."
    });
  }
};

PROJETO NOVO — DIRLAINE SOUZA NAIL DESIGNER

1) NO SUPABASE
- Abra SQL Editor.
- Cole todo o conteúdo de sql/banco.sql.
- Clique em Run.
ATENÇÃO: esse SQL apaga a tabela antiga e cria uma nova limpa.

2) NA VERCEL — SETTINGS > ENVIRONMENT VARIABLES
Crie estas variáveis:
SUPABASE_URL = https://cpnvkjmpmcidyddkdztp.supabase.co
SUPABASE_SERVICE_ROLE_KEY = cole a chave service_role do Supabase
PAINEL_SENHA = 2858

3) NO GITHUB
- Apague os arquivos antigos do repositório.
- Envie TODOS os arquivos e pastas deste projeto.
- Aguarde o novo deploy da Vercel.

4) TESTE
Site: https://dirlaine.com.br
Painel: https://dirlaine.com.br/convidados
Senha: 2858

IMPORTANTE
- Não coloque a service_role dentro de arquivos públicos.
- Ela deve ficar somente nas variáveis da Vercel.

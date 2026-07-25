<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Painel de convidados | Dirlaine Souza</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="convidados.css">
</head>
<body>
  <section id="loginView" class="login-shell">
    <div class="login-card">
      <div class="monogram">DS</div>
      <p class="eyebrow">Área administrativa</p>
      <h1>Painel de convidados</h1>
      <p class="muted">Digite a senha para visualizar as confirmações.</p>
      <form id="loginForm">
        <label for="password">Senha</label>
        <input id="password" type="password" inputmode="numeric" autocomplete="current-password" placeholder="Digite a senha" required>
        <button type="submit">Entrar</button>
        <p id="loginError" class="error" hidden>Senha incorreta.</p>
      </form>
    </div>
  </section>

  <main id="panelView" class="app" hidden>
    <header class="topbar">
      <div>
        <p class="eyebrow">Dirlaine Souza Nail Designer</p>
        <h1>Lista de convidados</h1>
      </div>
      <div class="top-actions">
        <a class="secondary" href="/">Abrir convite</a>
        <button id="logoutButton" class="secondary" type="button">Sair</button>
      </div>
    </header>

    <section class="stats">
      <article><span>Confirmações</span><strong id="totalConfirmations">0</strong></article>
      <article><span>Clientes confirmadas</span><strong id="totalPeople">0</strong></article>
      <article><span>Última confirmação</span><strong id="lastConfirmation">—</strong></article>
    </section>

    <section class="toolbar">
      <input id="searchInput" type="search" placeholder="Pesquisar por nome ou telefone">
      <div class="toolbar-actions">
        <button id="refreshButton" type="button">Atualizar</button>
        <button id="exportButton" type="button">Baixar CSV</button>
        <button id="printButton" type="button">Imprimir</button>
      </div>
    </section>

    <section class="table-card">
      <div id="statusMessage" class="status">Carregando...</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Observação</th>
              <th>Data e hora</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody id="guestRows"></tbody>
        </table>
      </div>
    </section>
  </main>

  <script src="convidados.js"></script>
</body>
</html>

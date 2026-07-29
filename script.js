const eventDate = new Date('2026-08-08T17:30:00-04:00');
const $ = (id) => document.getElementById(id);

function updateCountdown(){
  const diff = Math.max(0, eventDate - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;

  $('days').textContent = String(d).padStart(2,'0');
  $('hours').textContent = String(h).padStart(2,'0');
  $('minutes').textContent = String(m).padStart(2,'0');
  $('seconds').textContent = String(s).padStart(2,'0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

const tel = $('telefone');

tel.addEventListener('input', () => {
  let v = tel.value.replace(/\D/g,'').slice(0,11);

  if(v.length > 10){
    v = v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
  } else if(v.length > 6){
    v = v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');
  } else if(v.length > 2){
    v = v.replace(/(\d{2})(\d+)/,'($1) $2');
  }

  tel.value = v;
});

$('rsvpForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = $('submitBtn');
  const msg = $('formMessage');

  msg.className = 'message';
  msg.textContent = '';

  const nome = $('nome').value.trim();
  const telefone = tel.value.replace(/\D/g,'');
  const observacoes = $('observacoes').value.trim();

  if(nome.length < 3 || telefone.length < 10){
    msg.classList.add('error');
    msg.textContent = 'Preencha o nome e o telefone corretamente.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Confirmando...';

  try{
    const r = await fetch('/api/convidados', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({nome, telefone, observacoes})
    });

    const data = await r.json();

    if(!r.ok){
      throw new Error(data.error || 'Não foi possível confirmar.');
    }

    msg.classList.add('success');
    msg.textContent = 'Presença confirmada! Abrindo o WhatsApp...';
    e.target.reset();

    const texto = encodeURIComponent(
      `Olá! Sou ${nome} e confirmo minha presença na inauguração da Dirlaine Souza Nail Designer, dia 08/08/2026 às 17h30.`
    );

    setTimeout(() => {
      window.location.href = `https://wa.me/5569984792139?text=${texto}`;
    }, 900);

  } catch(err){
    msg.classList.add('error');
    msg.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirmar presença';
  }
});

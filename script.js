const EVENT_DATE = new Date('2026-08-01T17:00:00-04:00').getTime();
const ids = ['days','hours','minutes','seconds'];
function updateCountdown(){
  const diff = Math.max(0, EVENT_DATE - Date.now());
  const values = [
    Math.floor(diff / 86400000),
    Math.floor((diff % 86400000) / 3600000),
    Math.floor((diff % 3600000) / 60000),
    Math.floor((diff % 60000) / 1000)
  ];
  ids.forEach((id,i)=>document.getElementById(id).textContent=String(values[i]).padStart(2,'0'));
}
updateCountdown(); setInterval(updateCountdown,1000);

const form = document.getElementById('rsvpForm');
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    guests: Number(document.getElementById('guests').value),
    note: document.getElementById('note').value.trim(),
    createdAt: new Date().toISOString()
  };
  const list = JSON.parse(localStorage.getItem('dirlaine_rsvp') || '[]');
  list.push(entry);
  localStorage.setItem('dirlaine_rsvp', JSON.stringify(list));
  document.getElementById('success').hidden = false;
  const msg = `Olá! Meu nome é ${entry.name}. Confirmo minha presença na inauguração da Dirlaine Souza Nail Designer em 01/08/2026 às 17h. Quantidade de pessoas: ${entry.guests}.${entry.note ? ` Observação: ${entry.note}` : ''}`;
  window.open(`https://wa.me/5569984792139?text=${encodeURIComponent(msg)}`,'_blank');
  form.reset();
});

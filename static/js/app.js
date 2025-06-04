import { drawChart }   from './canvas.js';
import { initValidation } from './validate.js';
initValidation();
drawChart(); 

const panel = document.querySelector('#result');
const nameField = document.querySelector('#cardName');
const priceField = document.querySelector('#cardPrice');

document.querySelector('#sendBtn').addEventListener('click', send);

document.querySelector('#resetBtn').addEventListener('click', async () => {
  if (!confirm('Alle Einträge wirklich löschen?')) return;

  const res = await fetch('/api/cards', { method: 'DELETE' });

  if (res.ok) {
    await drawChart();           // Canvas leeren & neu zeichnen

    // Info-Panel in Blau zeigen
    const panel = document.querySelector('#result');
    panel.className = 'w3-panel w3-pale-blue w3-leftbar w3-border-blue';
    panel.innerHTML = '📊 Statistik wurde zurückgesetzt';
    panel.classList.remove('w3-hide');
  } else {
    alert('Reset fehlgeschlagen');
  }
});

async function send(){
  const body = {
    name   : nameField.value,
    rarity : document.querySelector('#cardRarity').value,
    price  : parseFloat(priceField.value),
  };

  try{
    const res  = await fetch('/api/cards',{
      method :'POST',
      headers:{'Content-Type':'application/json'},
      body   : JSON.stringify(body),
    });
    const json = await res.json();

    if(!res.ok) throw json;          // springt in catch unten

    panel.className = 'w3-panel w3-pale-green w3-leftbar w3-border-green';
    panel.innerHTML = `
    <strong>✅ Karte gespeichert!</strong><br>
    <code>ID: ${json.insertedId}</code><br>
    Gesamtzahl Karten: <b>${json.totalCards ?? '–'}</b><br>
    Besuche auf dieser Seite: <b>${json.visits}</b>
    Letzter Besuch: <b>${json.lastVisit ?? '–'}</b>   
    `;
    panel.classList.remove('w3-hide');


    // Felder zurücksetzen & Button wieder sperren
    nameField.value = '';
    priceField.value = '';
    document.querySelector('#cardRarity').value = '';
    initValidation();               // erneute Prüfung → Button disabled

    drawChart();
} catch (err) {
  console.error('Catch-Block', err);          // <— echte Fehlermeldung sehen
  panel.className = 'w3-panel w3-pale-red w3-leftbar w3-border-red';
  const msg = err?.errors
            ? err.errors.join('<br>')
            : (err.message || JSON.stringify(err));
  panel.innerHTML = `<strong>❌ Fehler:</strong><br>${msg}`;
  panel.classList.remove('w3-hide');
}

}

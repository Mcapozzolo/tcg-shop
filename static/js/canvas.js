// static/js/canvas.js
export async function drawChart() {         //  ← export hinzufügen
  const ctx    = document
                  .querySelector('#chart')
                  .getContext('2d');

  const counts = { Common:0, Uncommon:0, Rare:0, SuperRare:0 };

  const list   = await fetch('/api/cards').then(r => r.json());
  list.forEach(c => counts[c.rarity]++);

  ctx.clearRect(0, 0, 320, 200);
  ['Common','Uncommon','Rare','SuperRare'].forEach((r,i)=>{
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(20+i*70, 180-counts[r]*20, 50, counts[r]*20);
    ctx.fillStyle = '#000';
    ctx.fillText(r, 25+i*70, 195);
    ctx.beginPath(); ctx.moveTo(10,180); ctx.lineTo(310,180); ctx.stroke();
    ctx.moveTo(10,180); ctx.lineTo(10,10);  ctx.stroke();

  });
}

/* beim Seiten-Laden einmal zeichnen */
window.addEventListener('DOMContentLoaded', drawChart);

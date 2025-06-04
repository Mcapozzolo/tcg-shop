import express from 'express';
import cookieParser from 'cookie-parser';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../static')));
app.use((req, res, next) => {
  res.locals.lastVisit = req.cookies.lastVisit ?? null;   // ← vorheriger Besuch
  next();
});
app.get('/', (_, res) =>
  res.sendFile(path.join(__dirname, '../static/frontend.html'))
);

// MongoDB-Verbindung -------------------------------------------------
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();                       // <— öffnet die Verbindung
const db = client.db('tcg_shop');             // DB-Name frei wählbar
const cards = db.collection('op_cards');      // Collection = Tabelle

// Validierung ---------------------------------------------------------
function validate({ name, rarity, price }) {
  const err = [];
  if (!name?.match(/^[A-Za-z0-9 ]{3,30}$/))      err.push('Name 3–30 Zeichen.');
  if (!['Common','Uncommon','Rare','SuperRare'].includes(rarity)) err.push('Ungültige Seltenheit.');
  if (!(price >= 0.10 && price <= 999.95))        err.push('Preis 0.10–999.95.');
  return err;
}

// POST /api/cards -----------------------------------------------------
app.post('/api/cards', async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const doc          = { ...req.body, created: new Date() };
  const { insertedId } = await cards.insertOne(doc);

  const totalCards   = await cards.countDocuments();
  const visits       = (parseInt(req.cookies.visitCount) || 0) + 1;

  // neue Cookies setzen
  res.cookie('visitCount', visits, { maxAge: 31_536_000_000 });
  res.cookie('lastVisit', new Date().toISOString(), { maxAge: 31_536_000_000 });

  // EINMALIGE Antwort ✔
  res.json({
    insertedId,
    visits,
    totalCards,
    lastVisit : res.locals.lastVisit   // ← vorheriger Besuch
  });
});


// GET /api/cards (optional Filter) -----------------------------------
app.get('/api/cards', async (req, res) => {
  const list = await cards
    .find(req.query.rarity ? { rarity: req.query.rarity } : {})
    .toArray();
  res.json(list);
});

app.delete('/api/cards', async (_, res) => {
  await cards.deleteMany({});          // leert die Collection
  res.json({ ok: true });
});

app.listen(3000, () => console.log('✅ Backend läuft auf http://localhost:3000'));

import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
router.use(express.json());

export default router;

router.get("/", (req, res) =>
  res.sendFile(path.join(process.cwd(), "static", "frontend.html"))
);

let cards;
const client = new MongoClient("mongodb://127.0.0.1:27017");
client
  .connect()
  .then(() => {
    cards = client.db("tcg_shop").collection("op_cards");
    console.log("[API] Mongo verbunden");
  })
  .catch((err) => console.error("[API] Mongo-Connect X", err));

function cookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((p) => {
    const [k, v] = p.trim().split("=");
    if (k) {
      out[k] = decodeURIComponent(v);
    }
  });
  return out;
}
function setCookie(res, n, v) {
  res.setHeader(
    "Set-Cookie",
    `${n}=${encodeURIComponent(v)};Path=/;Max-Age=31536000`
  );
}
function validate(d) {
  const e = [];
  if (!d.name || !/^[A-Za-z0-9 ]{3,30}$/.test(d.name)) {
    e.push("Name 3–30 Zeichen");
  }
  if (!["Common", "Uncommon", "Rare", "SuperRare"].includes(d.rarity)) {
    e.push("Seltenheit falsch");
  }
  if (!(d.price >= 0.1 && d.price <= 999.95)) {
    e.push("Preis 0.10–999.95");
  }
  return e;
}

router.post("/cards", async (req, res) => {
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString());
    } catch {
      return res.status(400).json({ errors: ["Ungültiges JSON"] });
    }
  }

  if (!cards) {
    return res.status(503).json({ error: "DB nicht bereit" });
  }

  const errs = validate(req.body);
  if (errs.length) {
    return res.status(400).json({ errors: errs });
  }

  const ins = await cards.insertOne({ ...req.body, created: new Date() });
  const total = await cards.countDocuments();

  const ck = cookies(req);
  const visits = parseInt(ck.visits || "0", 10) + 1;
  setCookie(res, "visits", visits);
  setCookie(res, "last", new Date().toISOString());

  res.json({
    insertedId: ins.insertedId,
    visits,
    totalCards: total,
    lastVisit: ck.last || null,
  });
});

router.get("/cards", async (req, res) => {
  if (!cards) {
    return res.status(503).json({ error: "DB nicht bereit" });
  }
  const q = req.query.rarity ? { rarity: req.query.rarity } : {};
  res.json(await cards.find(q).toArray());
});

router.delete("/cards", async (_req, res) => {
  if (!cards) {
    return res.status(503).json({ error: "DB nicht bereit" });
  }
  await cards.deleteMany({});
  res.json({ ok: true });
});

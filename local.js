// local.js für npm start
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import api from "./backend/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use("/api", api);
app.use(express.static(path.join(process.cwd(), "static")));
app.get("/", (_, res) =>
  res.sendFile(path.join(process.cwd(), "static", "frontend.html"))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("[LOCAL] http://localhost:" + PORT));

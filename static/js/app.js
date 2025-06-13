import { drawChart } from "./canvas.js";
import { initValidation } from "./validate.js";

initValidation();
drawChart();

function $(sel) {
  return document.querySelector(sel);
}
function text(el, v) {
  el.textContent = v;
}

var panel = $("#result");
var nameField = $("#cardName");
var priceField = $("#cardPrice");
var raritySel = $("#cardRarity");
var sendBtn = $("#sendBtn");
var resetBtn = $("#resetBtn");

sendBtn.addEventListener("click", sendCard);
resetBtn.addEventListener("click", resetAll);

// speichern

function sendCard() {
  var body = {
    name: nameField.value,
    rarity: raritySel.value,
    price: parseFloat(priceField.value),
  };

  fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then(function (res) {
      return res.json().then(function (j) {
        return { ok: res.ok, json: j };
      });
    })
    .then(function (resp) {
      if (!resp.ok) {
        throw resp.json;
      }

      panel.className = "w3-panel w3-pale-green w3-leftbar w3-border-green";
      panel.classList.remove("w3-hide");

      panel.innerHTML =
        "<strong>Karte gespeichert!</strong><br>" +
        "<code>ID: " +
        resp.json.insertedId +
        "</code><br>" +
        "Gesamtzahl Karten: <b>" +
        resp.json.totalCards +
        "</b><br>" +
        "Besuche: <b>" +
        resp.json.visits +
        "</b><br>" +
        "Letzter Besuch: <b>" +
        (resp.json.lastVisit || "-") +
        "</b>";

      // Felder leeren
      nameField.value = "";
      priceField.value = "";
      raritySel.value = "";

      initValidation();
      drawChart();
    })
    .catch(showError);
}

// Statistik löschen
function resetAll() {
  if (!confirm("Alle Einträge wirklich löschen?")) return;

  fetch("/api/cards", { method: "DELETE" })
    .then(function (r) {
      if (!r.ok) throw new Error("Reset fehlgeschlagen");
    })
    .then(function () {
      drawChart();
      panel.className = "w3-panel w3-pale-blue w3-leftbar w3-border-blue";
      panel.classList.remove("w3-hide");
      panel.innerHTML = "Statistik wurde zurückgesetzt";
    })
    .catch(function (e) {
      alert(e.message);
    });
}

// Fehlermeldung anzeigen
function showError(err) {
  panel.className = "w3-panel w3-pale-red w3-leftbar w3-border-red";
  panel.classList.remove("w3-hide");

  var msg;
  if (err && err.errors && Array.isArray(err.errors)) {
    msg = err.errors.join("<br>");
  } else if (err && err.message) {
    msg = err.message;
  } else {
    msg = JSON.stringify(err);
  }
  panel.innerHTML = "<strong>Fehler:</strong><br>" + msg;
}

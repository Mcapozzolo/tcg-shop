// static/js/validate.js
const rules = {
  name : {
    el  : '#cardName',
    rex : /^[A-Za-z0-9 ]{3,30}$/,
    msg : '3–30 Buchstaben/Zahlen',
  },
  rarity : {
    el  : '#cardRarity',
    rex : /^(Common|Uncommon|Rare|SuperRare)$/,
    msg : 'Bitte Seltenheit wählen',
  },
  price : {
    el  : '#cardPrice',
    rex : /^(0(\.\d\d?)?|[1-9]\d{0,2}(\.\d\d?)?)$/, // 0–999.99
    msg : '0.10 – 999.95',
  },
};

export function initValidation() {
  Object.values(rules).forEach(r => {
    const input = document.querySelector(r.el);
    const err   = document.querySelector(r.el + 'Error');
    ['input','change'].forEach(evt =>
    input.addEventListener(evt, () => {
        const ok = r.rex.test(input.value);
        input.classList.toggle('invalid', !ok);
        err.textContent = ok ? '' : r.msg;
        updateButtonState();
    })
    );
  });
  updateButtonState();    // initial = disabled
}

function updateButtonState() {
  const allOk = Object.values(rules).every(r =>
    !document.querySelector(r.el).classList.contains('invalid') &&
    document.querySelector(r.el).value !== ''
  );
  document.querySelector('#sendBtn').disabled = !allOk;
}

// Fenêtre de l'extension : convertisseur, taux, style d'affichage, exclusion du site courant.
const DEFAUT = { actif: true, usd: 605, gbp: 780, arrondi: 100, style: "pastille", exclus: [] };
const EXT = typeof chrome !== "undefined" && chrome.storage;
const stock = EXT ? chrome.storage.sync : {
  get: (d, cb) => { try { cb({ ...d, ...JSON.parse(localStorage.getItem("cauris") || "{}") }); } catch (e) { cb(d); } },
  set: (o) => { try { localStorage.setItem("cauris", JSON.stringify({ ...JSON.parse(localStorage.getItem("cauris") || "{}"), ...o })); } catch (e) {} parent.dispatchEvent(new CustomEvent("cauris:reglages")); }
};
const $ = (s) => document.querySelector(s);
let cfg = DEFAUT, host = "";
const num = (v) => parseFloat(String(v).replace(/\s/g, "").replace(",", ".")) || 0;
const fmt = (v) => (Math.round(v / cfg.arrondi) * cfg.arrondi).toLocaleString("fr-FR").replace(/ /g, " ");

function rendu() {
  $("#actif").checked = cfg.actif; $("#usd").value = String(cfg.usd).replace(".", ","); $("#gbp").value = String(cfg.gbp).replace(".", ",");
  ["style", "arrondi"].forEach((k) => document.querySelectorAll(`#${k} button`).forEach((b) => b.classList.toggle("on", b.dataset.v == cfg[k])));
  const ex = cfg.exclus.includes(host); $("#excl").textContent = ex ? "Réactiver ici" : "Désactiver ici";
  convertir();
}
function convertir() {
  const t = { eur: 655.957, usd: cfg.usd, gbp: cfg.gbp }[$("#dv").value];
  $("#res").innerHTML = `${fmt(num($("#mt").value) * t)} F <small>CFA</small>`;
}
function maj(o) { cfg = { ...cfg, ...o }; stock.set(o); rendu(); }

stock.get(DEFAUT, (c) => { cfg = c; rendu(); });
$("#mt").oninput = $("#dv").onchange = convertir;
$("#actif").onchange = (e) => maj({ actif: e.target.checked });
$("#usd").onchange = (e) => maj({ usd: num(e.target.value) || DEFAUT.usd });
$("#gbp").onchange = (e) => maj({ gbp: num(e.target.value) || DEFAUT.gbp });
["style", "arrondi"].forEach((k) => $("#" + k).onclick = (e) => { const b = e.target.closest("button"); if (b) maj({ [k]: k === "arrondi" ? +b.dataset.v : b.dataset.v }); });
$("#excl").onclick = () => maj({ exclus: cfg.exclus.includes(host) ? cfg.exclus.filter((h) => h !== host) : [...cfg.exclus, host] });

if (EXT && chrome.tabs) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    try { host = new URL(tab.url).hostname; } catch (e) {}
    $("#host").textContent = host || "Ce site"; rendu();
    chrome.tabs.sendMessage(tab.id, "compte", (n) => { $("#cnt").textContent = chrome.runtime.lastError ? "Page non analysable (page interne du navigateur)." : `${n} prix convertis sur cette page.`; });
  });
} else {
  host = "boutique-demo"; $("#host").textContent = "Démo : boutique fictive";
  const upd = (n) => $("#cnt").textContent = `${n} prix convertis sur cette page.`;
  parent.addEventListener("cauris:compte", (e) => upd(e.detail)); upd(parent.__caurisCompte || 0);
}

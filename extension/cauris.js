// Cauris : repère les prix en USD / GBP / CHF dans le texte de la page et ajoute leur équivalent en euros.
// Aucune donnée ne quitte le navigateur ; les taux sont stockés dans chrome.storage.
(() => {
  if (window.__cauris) return; window.__cauris = true;
  const DEFAUT = { actif: true, usd: 0.92, gbp: 1.17, chf: 1.06, arrondi: 0.01, style: "pastille", exclus: [] };
  const stock = typeof chrome !== "undefined" && chrome.storage ? chrome.storage.sync : {
    get: (d, cb) => { try { cb({ ...d, ...JSON.parse(localStorage.getItem("cauris-eur") || "{}") }); } catch (e) { cb(d); } },
    set: (o) => { try { localStorage.setItem("cauris-eur", JSON.stringify({ ...JSON.parse(localStorage.getItem("cauris-eur") || "{}"), ...o })); } catch (e) {} }
  };
  const SYM = { "$": "usd", "usd": "usd", "us$": "usd", "£": "gbp", "gbp": "gbp", "chf": "chf" };
  const N = "(\\d{1,3}(?:[ \\u00a0\\u202f.,']\\d{3})*(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)";
  const D = "(US\\$|\\$|USD|£|GBP|CHF)";
  const RE = new RegExp(`${D}\\s?${N}|${N}\\s?${D}`, "gi");
  let cfg = DEFAUT, compte = 0;

  function nombre(t) {
    t = t.replace(/[\s  ']/g, "");
    const dec = t.match(/[.,](\d{1,2})$/);
    const ent = (dec ? t.slice(0, -dec[0].length) : t).replace(/[.,]/g, "");
    return parseFloat(ent + (dec ? "." + dec[1] : ""));
  }
  const taux = (dev) => dev === "usd" ? cfg.usd : dev === "gbp" ? cfg.gbp : cfg.chf;
  const euros = (v) => { const d = cfg.arrondi < 1 ? 2 : 0; return (Math.round(v / cfg.arrondi) * cfg.arrondi).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/\u202f/g, "\u00a0") + "\u00a0€"; };

  function traiter(noeud) {
    const txt = noeud.nodeValue; RE.lastIndex = 0;
    if (!RE.test(txt)) return; RE.lastIndex = 0;
    const frag = document.createDocumentFragment(); let i = 0, m;
    while ((m = RE.exec(txt))) {
      const sym = (m[1] || m[4] || "").toLowerCase(), val = nombre(m[2] || m[3] || ""), dev = SYM[sym];
      if (!dev || !isFinite(val) || val <= 0) continue;
      frag.append(txt.slice(i, m.index));
      const s = document.createElement("span"); s.className = "cauris-prix"; s.textContent = m[0];
      const b = document.createElement("span"); b.className = "cauris-eur cauris-" + cfg.style;
      b.textContent = "≈ " + euros(val * taux(dev));
      b.title = `${m[0]} × ${String(taux(dev)).replace(".", ",")} (Cauris)`;
      s.append(b); frag.append(s); i = m.index + m[0].length; compte++;
    }
    if (!i) return;
    frag.append(txt.slice(i)); noeud.replaceWith(frag);
  }

  function parcourir(racine) {
    const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const p = n.parentElement;
        if (!p || p.closest("script,style,textarea,input,code,pre,[contenteditable],.cauris-prix,.cauris-ignorer")) return NodeFilter.FILTER_REJECT;
        return /\d/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const lot = []; while (w.nextNode()) lot.push(w.currentNode);
    lot.forEach(traiter);
  }

  function nettoyer() {
    document.querySelectorAll(".cauris-prix").forEach((s) => s.replaceWith(s.firstChild.nodeValue));
    compte = 0;
  }

  let obs;
  function lancer() {
    nettoyer(); if (obs) obs.disconnect();
    if (!cfg.actif || cfg.exclus.includes(location.hostname)) return annoncer();
    parcourir(document.body);
    obs = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.nodeType === 1 && !n.classList.contains("cauris-prix")) parcourir(n);
      else if (n.nodeType === 3 && n.parentElement && !n.parentElement.closest(".cauris-prix")) traiter(n);
    })));
    obs.observe(document.body, { childList: true, subtree: true });
    annoncer();
  }
  function annoncer() { window.__caurisCompte = compte; window.dispatchEvent(new CustomEvent("cauris:compte", { detail: compte })); }

  stock.get(DEFAUT, (c) => { cfg = c; lancer(); });
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.onChanged.addListener(() => stock.get(DEFAUT, (c) => { cfg = c; lancer(); }));
    chrome.runtime.onMessage?.addListener((msg, _, rep) => { if (msg === "compte") rep(compte); });
  }
  window.addEventListener("cauris:reglages", () => stock.get(DEFAUT, (c) => { cfg = c; lancer(); }));
})();

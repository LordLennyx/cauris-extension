# Cauris

**Extension Chrome (Manifest V3)** — Extension Chrome qui détecte les prix en dollars, livres et francs suisses sur n'importe quelle page et affiche leur équivalent en euros à côté, avec une fenêtre de réglages et un convertisseur. Démo en direct avec le vrai script de l'extension sur une boutique fictive.

**Démo en ligne : [https://lordlennyx.github.io/cauris-extension/](https://lordlennyx.github.io/cauris-extension/)**

Spot de présentation (30 s) : [media/spot-30s.mp4](https://lordlennyx.github.io/cauris-extension/media/spot-30s.mp4)

![Aperçu bureau](media/capture-bureau.png)

## Ce que le projet montre

- Détection des prix dans le texte de la page : symbole avant ou après, séparateurs français et anglais, espaces fines
- Taux du dollar, de la livre et du franc suisse réglables ; arrondi au centime, à 10 centimes, à l'euro ou à 5 €
- Pages dynamiques prises en charge (MutationObserver), champs de saisie, code et zones éditables ignorés
- Fenêtre de l'extension : activation, convertisseur, taux, trois styles d'affichage, désactivation par site, compteur de prix
- Manifest V3, une seule permission (storage), aucune requête réseau, mode sombre

## Réalisation

- **Stack :** JavaScript natif, Manifest V3, chrome.storage, HTML/CSS
- **Installer :** Télécharger cauris-extension.zip, chrome://extensions, mode développeur, « Charger l'extension non empaquetée »
- **Compatible :** Chrome, Edge, Brave, Opera (Chromium)

| Bureau | Mobile |
|---|---|
| ![](media/capture-bureau-complet.png) | ![](media/capture-mobile.png) |

---

Client et contenus fictifs, créés pour la démonstration. Conception, design et développement : **Njundiyimun Béchard** — [github.com/LordLennyx](https://github.com/LordLennyx)

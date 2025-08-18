# Palette Muse — README (oui, c'est un bricolage)

> Avertissement brutal: c'est de la merde. Un bricolage perso, fait à l'instinct. Si quelqu'un passe par là et veut s'en servir, vas-y, fais-toi plaisir. Juste: pas d'usage commercial.

## Ce que c'est
Une petite app de palettes/couleurs qui mélange:
- roue chromatique façon Photoshop (teinte + carré saturation/lumière)
- harmonies (complémentaire, analogues, triadiques, tétradique, monochrome)
- historique des couleurs, favoris avec tags
- comparateur de contrastes (ratios WCAG)
- mode "color blind" (protanopie/deutéranopie/tritanopie)
- pipette (EyeDropper API quand dispo)
- copie multi-format (HEX/RGB/HSL/CSS/JSON)
- palette dynamique (échelles clair/sombre)
- export/import local (JSON) et pseudo "cloud sync" configurable (endpoint perso)
- peinture/mixage (MixLab) avec pastilles cliquables et drop de couleurs

C'est rapide, pas fignolé, mais ça tourne.

## Installation
- Prérequis: Node 18+
- Installation: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Non-commercial
Utilisation permise uniquement à des fins non commerciales. Aucune garantie, aucun support. Si tu veux faire du commercial avec, passe ton chemin.

## Limites connues
- Pas de backend fourni (la "sync cloud" attend un endpoint à toi)
- Peu/aucun test automatisé
- La pipette dépend du navigateur
- Le code est long, verbeux et perfectible (volontairement assumé)

## Licence "à l'arrache"
Tu peux lire le code, l'adapter, le réutiliser à titre non commercial. Pas de redistribution commerciale. Pas de garantie. Merci.
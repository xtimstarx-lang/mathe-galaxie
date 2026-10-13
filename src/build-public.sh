#!/bin/sh
# Baut die öffentliche Website-Version (GitHub Pages) nach $1
cd "$(dirname "$0")"
OUT="$(cd "${1:-..}" && pwd)"
FAV='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Ccircle cx=%2232%22 cy=%2232%22 r=%2230%22 fill=%22%23090b22%22/%3E%3Cpath d=%22M32 9c9 8 10 22 7 32H25c-3-10-2-24 7-32z%22 fill=%22%23ffd23f%22/%3E%3Ccircle cx=%2232%22 cy=%2224%22 r=%225%22 fill=%22%233de8c7%22/%3E%3Cpath d=%22M25 34l-8 11 8-3zM39 34l8 11-8-3z%22 fill=%22%23ff4fa3%22/%3E%3Cpath d=%22M27 42l5 10 5-10z%22 fill=%22%23ff8a00%22/%3E%3C/svg%3E'
{
cat <<HEAD
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Mathe-Galaxie – Mathe-Lernspiel für die 4. Klasse (8. Schulstufe)</title>
<meta name="description" content="Kostenloses Mathe-Lernspiel im Weltraum für die 4. Klasse Mittelschule und AHS (8. Schulstufe): Pythagoras, Wurzeln und Quadratzahlen, Terme, binomische Formeln, Gleichungen, Kreis, Zylinder, Kegel, Kugel, Funktionen, Gleichungssysteme und Statistik – mit über 40 Mini-Spielen.">
<meta name="keywords" content="Mathe Lernspiel, 4. Klasse Mathematik, 8. Schulstufe, Satz des Pythagoras üben, Quadratzahlen, Wurzeln, binomische Formeln, Gleichungen üben, Kreis, Kugel, Kegel, Zylinder, lineare Funktionen, Gleichungssysteme, Statistik, Mittelschule, AHS, Österreich">
<meta name="robots" content="index, follow">
<meta name="google-site-verification" content="AftOCS4HUJ2G5u6js4kzkdXgx3KVdpmVC0gYb089Wzg" />
<link rel="canonical" href="https://xtimstarx-lang.github.io/mathe-galaxie/">
<meta property="og:type" content="website">
<meta property="og:locale" content="de_AT">
<meta property="og:title" content="Mathe-Galaxie – Mathe-Lernspiel für die 4. Klasse">
<meta property="og:description" content="Rette die Mathe-Galaxie! Über 40 Mini-Spiele zum Mathe-Stoff der 8. Schulstufe – kostenlos im Browser.">
<meta property="og:url" content="https://xtimstarx-lang.github.io/mathe-galaxie/">
<meta name="theme-color" content="#090b22">
<link rel="icon" href="$FAV">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"VideoGame","name":"Mathe-Galaxie","url":"https://xtimstarx-lang.github.io/mathe-galaxie/","description":"Kostenloses Mathe-Lernspiel für die 4. Klasse (8. Schulstufe) mit über 40 Mini-Spielen.","inLanguage":"de","genre":"Lernspiel","gamePlatform":"Webbrowser","applicationCategory":"Game","isAccessibleForFree":true,"audience":{"@type":"EducationalAudience","educationalRole":"student"},"educationalLevel":"8. Schulstufe"}</script>
<style>
*,*::before,*::after{box-sizing:border-box}
html{height:100%}
:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0;font:14px system-ui,-apple-system,sans-serif}
img{max-width:100%}
[hidden]{display:none!important}
</style>
HEAD
sed '/^<title>/d' head.html
echo '<style>'; cat style.css; echo '</style>'
echo '</head>'
echo '<body>'
cat body.html
echo '<noscript><p style="color:#fff;padding:20px">Mathe-Galaxie ist ein Mathe-Lernspiel für die 4. Klasse. Bitte aktiviere JavaScript, um zu spielen.</p></noscript>'
echo '<script>'; sed '/^if (typeof module/d' content.js; echo '</script>'
echo '<script>'; sed '/^\/\* ---------- Start ---------- \*\//,$d' ui.js; cat accounts.js; sed -n '/^\/\* ---------- Start ---------- \*\//,$p' ui.js; echo '</script>'
echo '</body>'
echo '</html>'
} > "$OUT/index.html"

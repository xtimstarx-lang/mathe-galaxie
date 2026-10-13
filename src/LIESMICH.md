# Quelldateien der Mathe-Galaxie

Die Website (`../index.html`) wird aus diesen Dateien zusammengebaut.

| Datei | Inhalt |
|---|---|
| `content.js` | Alle Aufgaben-Generatoren und die Planeten-Liste (`PLANETS`) |
| `extras.js` | Zusätzliche Aufgaben (ist bereits in `content.js` eingebaut, nur zur Übersicht) |
| `ui.js` | Spiel-Ablauf, Sternenkarte, Shop, Abzeichen, Eltern-Bereich |
| `accounts.js` | Login/Accounts (funktioniert nur in der Claude-Version, auf der Website automatisch Gast-Modus) |
| `style.css` | Design (Farben, Schriften, Layout) |
| `head.html`, `body.html` | Grundgerüst der Seite |

## Neu bauen

```sh
sh src/build-public.sh .      # aus dem Hauptordner: schreibt ./index.html
```

Danach `index.html` committen und pushen – GitHub Pages ist nach 1–2 Minuten aktuell.

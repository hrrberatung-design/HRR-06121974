# Krypto-Wochen-Dashboard als PWA (iPhone + Windows)

Installierbare Progressive Web App mit **einer** Codebasis und **einer** HTTPS-Adresse für iPhone (Safari → Home-Bildschirm) und Windows (Edge/Chrome → App-Fenster).
Inhalt: archivierter Bericht **19.–25.10.2026** (Kursstand 25.10.2026, ca. 09:00 UTC) mit Marktdaten, Vorwochenvergleich und Nachrichtenarchiv.
**Es sind keine Live-Daten.** Keine API-Schlüssel, keine Konten, keine kostenpflichtigen Dienste, keine Synchronisation zwischen Geräten.

## Schnellstart lokal

```
npm install          # nur für die Tests (Playwright); die App selbst hat keine Abhängigkeiten
npm start            # stempelt die Version und startet http://localhost:8080/
npm test             # 51 automatisierte Chromium-Tests (siehe docs/TESTS.md)
```
Ohne Node: jeder statische Webserver, der den Ordner ausliefert, genügt – **aber nur über HTTPS oder `localhost`** (Service Worker!). Ein Doppelklick auf `index.html` (`file://`) zeigt nur eine Fehlermeldung, weil Daten per `fetch` geladen werden.

## Projektstruktur

| Datei | Zweck |
|---|---|
| `index.html`, `styles.css` | Oberfläche (Inline-Skripte/-Styles gibt es nicht → strenge Content-Security-Policy) |
| `core.js` | Escaping, Formatierung, lokaler Speicher mit Fallback, Daten laden/validieren |
| `market.js` | Marktdaten: KPI, 4 Charts, Tabelle (breit), Coin-Karten (schmal), Vorwochenvergleich, Filter |
| `news.js` | Nachrichtenarchiv: Suche, Coin-/Themenfilter, Leerzustände |
| `pwa.js` | Service-Worker-Anmeldung, Update-Hinweis, Online/Offline, Installieren-Knopf/Anleitung, Info-Dialog |
| `app.js` | Start, Bereichsumschaltung (`#markt`, `#nachrichten`) |
| `sw.js`, `app-version.js` | Service Worker; Version + Build-Hash (erzeugt von `tools/stamp.mjs`) |
| `manifest.webmanifest`, `icons/` | App-Manifest, Icons (192, 512, maskable, Apple-Touch 180, Favicon) |
| `data/report-2026-10-25.json` | **Berichtsdaten** (getrennt vom Code, Schema `schema: 1`) |
| `data/news-archive.json` | Nachrichten-Archivverweise (Schema nach `NACHRICHTEN_ANFORDERUNGEN.md`) |
| `vendor/`, `fonts/` | Chart.js 4.4.3 (MIT), Inter und JetBrains Mono (SIL OFL) – lokal, Lizenztexte liegen bei |
| `_headers`, `.nojekyll` | Hosting-Hilfen (Cloudflare/Netlify bzw. GitHub Pages) |
| `tools/` | `stamp.mjs` (Version/Build), `serve.mjs` (lokaler Server, `--base` für Unterverzeichnis), `make-icons.py`, `build-preview.mjs` |
| `tests/` | `run.mjs` (Tests), `fixtures/original/` (unveränderter Ausgangscode für den Datentreue-Test) |
| `docs/` | Anleitungen, Testübersicht, Checklisten, Phase 2 |

## Wichtig bei jeder Änderung

1. `npm run stamp` ausführen (oder `npm start`/`npm test`, die das tun). Das erzeugt einen neuen Build-Hash → neuer Cache-Name → Geräte erkennen die neue Version.
2. Neue App-Datei? In `sw.js` unter `APP_FILES` eintragen (der Test „Precache-Liste“ meldet Vergessenes).
3. Neuer Bericht? Datei in `data/` ersetzen (Dateiname in `app.js`/`sw.js` anpassen). Ein reines Daten-Update braucht **kein** App-Update; der angezeigte Datenstand kommt immer aus der Datendatei.

## Wie Offline und Updates funktionieren

* **App-Dateien**: beim Installieren einer Version komplett in einen versionierten Cache (`krypto-app-<Version>-<Build>`) gelegt und nur daraus bedient → nie gemischte Versionen.
* **Neue Version**: wird im Hintergrund geladen, wartet, bis du „Jetzt aktualisieren“ wählst; der Hinweis sagt ausdrücklich, dass sich der Datenstand dadurch nicht ändert.
* **Berichtsdaten**: eigener Cache, erst Netz (4 s Zeitlimit), sonst letzter gespeicherter Stand. Zusätzlich eine Kopie im lokalen Browser-Speicher als zweite Rückfallebene. Die Oberfläche nennt immer die Herkunft („aus dem Netz“, „aus dem Offline-Speicher“, „aus lokaler Kopie“) und den Datenstand.
* **Erster Aufruf ohne Internet** funktioniert nicht (nichts gespeichert); die App zeigt dann einen ehrlichen Hinweis statt einer leeren Seite.
* Das Betriebssystem darf Browser-Speicher bei Platzmangel löschen – dann einmal online öffnen.

## Entscheidungen / Änderungen gegenüber dem Ausgangscode

Siehe `docs/PRUEFUNG_AUSGANGSCODE.md` (erkannte Fehler und Datenauffälligkeiten – **ohne** Änderung der Finanzzahlen).

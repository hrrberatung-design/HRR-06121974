# Testübersicht

Stand: 2026-10-25 · Umgebung: **Chromium (Playwright 1.63.0) auf linux** (Linux-Container, Desktop-Chromium, Touch-/Viewport-Emulation) · Ergebnis: **51/51 bestanden**
Aufruf: `npm test` (Protokoll in `tests/RESULTS.json`).

> **Wichtig:** Das sind automatisierte Tests in **Chromium unter Linux**. Sie belegen weder eine Installation auf dem iPhone noch unter Windows. Ein Desktop-Browsertest gilt ausdrücklich **nicht** als bestätigter iPhone- oder Windows-Installationstest.

## A. Tatsächlich durchgeführt (automatisiert, Chromium/Linux)
| Nr. | Test | Ergebnis |
|---|---|---|
| 1 | app-version.js ist aktuell (stamp --check) | bestanden |
| 2 | Precache-Liste in sw.js stimmt mit vorhandenen Dateien überein | bestanden |
| 3 | Manifest gültig: Pflichtfelder, Icons existieren mit richtiger Größe | bestanden |
| 4 | Keine externen Ressourcen (CDN/Fonts) in HTML, CSS, JS | bestanden |
| 5 | Keine API-Schlüssel/Tokens/Passwörter im Projekt (Muster-Suche) | bestanden |
| 6 | Datentreue: Zellen, Fußnoten, Quellen, Urteile = Originalcode (Übergabepaket) | bestanden |
| 7 | Rechenkontrolle: Wochenrendite, bp-Werte, Kurs/Index konsistent (±Rundung) | bestanden |
| 8 | Start: Archiv-Kennzeichnung, Datenstand, 4 KPI-Karten, 4 Charts mit Größe | bestanden |
| 9 | Kein "Live"-Versprechen, kein Aktualisieren-Button | bestanden |
| 10 | Coin-Filter: ETH abwählen → 3 KPI, 3 Tabellenspalten, 3 Urteile, 3 Vergleichseinträge je Zeile | bestanden |
| 11 | Nur XRP + ETF: kein erfundener Wochenfluss und kein bp-Wert | bestanden |
| 12 | Letzter Coin erneut gewählt → alle Coins, Hinweis sichtbar | bestanden |
| 13 | Kategorie-Filter: Kurs/Derivate/On-Chain zeigen nur ihre Gruppe | bestanden |
| 14 | Vorwochenvergleich: Werte stimmen mit eigener Rechnung (% und pp) | bestanden |
| 15 | Datenlücken: Derivate/On-Chain ohne Vergleichswert zeigen Begründung, nie 0 | bestanden |
| 16 | Quellenlinks: 14 Links, target=_blank, rel=noopener, Ziel = Datenquelle | bestanden |
| 17 | Chart-Wertetabellen (Tastatur/Screenreader-Alternative) vorhanden und gefüllt | bestanden |
| 18 | Nachrichten: Wechsel, 9 Karten, Archiv-Badge, unbekannte Publikationszeit | bestanden |
| 19 | Nachrichten: XRP + ETF → genau 1 passender Verweis | bestanden |
| 20 | Nachrichten: Suche + Coin + Thema kombinierbar (Schnittmenge) | bestanden |
| 21 | Nachrichten: Leerzustände ehrlich (unbekannter Text, Regulierung) | bestanden |
| 22 | Nachrichten: Reset stellt alle 9 wieder her | bestanden |
| 23 | Nachrichten: HTML-/Skript-Eingabe in Suche wird nicht ausgeführt | bestanden |
| 24 | Nachrichten: Links target=_blank + rel=noopener, Ziel stimmt | bestanden |
| 25 | Filter bleiben beim Bereichswechsel erhalten, getrennt voneinander | bestanden |
| 26 | Hash-Routen #markt / #nachrichten (App-Verknüpfungen) funktionieren | bestanden |
| 27 | Tastatur: Tab erreicht Filter/Navigation, Enter/Leertaste schalten, sichtbarer Fokus | bestanden |
| 28 | Info-Dialog: öffnet per Maus, schließt per Escape, zeigt Datenstand, Version, Anleitungen | bestanden |
| 29 | Installieren-Button nur bei beforeinstallprompt, sonst versteckt | bestanden |
| 30 | Keine Konsolenfehler/CSP-Verstöße in der Desktop-Sitzung | bestanden |
| 31 | Einstellungen bleiben lokal erhalten (Coins, Kategorie, Bereich, Nachrichtenfilter) | bestanden |
| 32 | Speicher nicht verfügbar: App läuft weiter, Hinweis sichtbar | bestanden |
| 33 | Layout iPhone 375: kein horizontaler Seiten-Überlauf, Bedienelemente erreichbar, Charts sichtbar | bestanden |
| 34 | Layout iPhone 390: kein horizontaler Seiten-Überlauf, Bedienelemente erreichbar, Charts sichtbar | bestanden |
| 35 | Layout iPhone 430: kein horizontaler Seiten-Überlauf, Bedienelemente erreichbar, Charts sichtbar | bestanden |
| 36 | Layout iPhone quer 844x390: kein horizontaler Seiten-Überlauf, Bedienelemente erreichbar, Charts sichtbar | bestanden |
| 37 | Layout schmales Fenster 600: kein horizontaler Seiten-Überlauf, Bedienelemente erreichbar, Charts sichtbar | bestanden |
| 38 | Layout Fenster 980: kein horizontaler Seiten-Überlauf, Bedienelemente erreichbar, Charts sichtbar | bestanden |
| 39 | Layout Desktop 1280: kein horizontaler Seiten-Überlauf, Bedienelemente erreichbar, Charts sichtbar | bestanden |
| 40 | Layout Desktop 1920: kein horizontaler Seiten-Überlauf, Bedienelemente erreichbar, Charts sichtbar | bestanden |
| 41 | Chromium meldet keine Installierbarkeitsfehler (CDP Page.getInstallabilityErrors) | bestanden |
| 42 | Offline nach Erstladen: App, Charts, Bericht UND Nachrichten lesbar; Offline-Hinweis; Datenstand unverändert | bestanden |
| 43 | Wieder online: Offline-Hinweis verschwindet, Anzeige aus dem Netz | bestanden |
| 44 | Offline mit Berichtskopie nur im Browser-Speicher (Cache gelöscht): Hinweis „gespeicherte Kopie“ | bestanden |
| 45 | Beschädigter Cache: kaputte JSON im Cache + keine Kopie → Fehlerzustand mit Reset, danach wieder funktionsfähig | bestanden |
| 46 | Datenfehler online (ungültiges JSON vom Server): Fehlerzustand statt leerer/halber App | bestanden |
| 47 | App-Update: neue Version wird erkannt, Hinweis ohne neuen Datenstand, Wechsel erst auf Klick, alter Cache entfernt | bestanden |
| 48 | Daten-Update getrennt vom App-Update: neuer Bericht wird online angezeigt, offline bleibt der zuletzt geladene | bestanden |
| 49 | Unterverzeichnis (/krypto/): lädt, SW-Scope /krypto/, Offline funktioniert (relative Pfade) | bestanden |
| 50 | Erstaufruf ohne Cache und ohne Netz: ehrlicher Fallback statt leerer Seite (Service Worker ohne Cache) | bestanden |
| 51 | Keine Konsolenfehler in den PWA-/Responsive-Läufen (außer erwarteten Offline-/Testfehlern) | bestanden |

Zusätzlich visuell geprüft (Screenshots 390 px und 1920 px in `docs/`): Mobilansicht mit Coin-Karten, Charts mit Legende, Desktop-Layout.

## B. Was diese Tests **nicht** abdecken (offen)
| Bereich | Status |
|---|---|
| Safari / WebKit (auch nur als Desktop-Engine) | **nicht geprüft** – in der Testumgebung steht kein WebKit zur Verfügung |
| Echtes iPhone: „Zum Home-Bildschirm“, Standalone-Start, Safe Areas/Notch, Querformat, Offline im Flugmodus, Update | **nicht geprüft** → `CHECKLISTEN.md` |
| Echte Windows-Installation mit Edge | **nicht geprüft** → `CHECKLISTEN.md` |
| Echte Windows-Installation mit Chrome | **nicht geprüft** → `CHECKLISTEN.md` |
| Anheften an Start/Taskleiste, Sprungliste (App-Verknüpfungen), Deinstallation | **nicht geprüft** (Anleitungen beruhen auf Herstellerverhalten, nicht auf eigenem Test) |
| Echter Installationsdialog (`beforeinstallprompt`) | nur **simuliert** (Ereignis künstlich ausgelöst); das echte Auslösen im Browser ist offen |
| Hosting unter finaler HTTPS-Adresse | **nicht geprüft** – nichts veröffentlicht; Unterverzeichnis-Betrieb nur lokal (`/krypto/`) getestet |
| Lighthouse/Barrierefreiheits-Audit, Screenreader (VoiceOver/Narrator) | **nicht durchgeführt** (nur Kontrastberechnung, Fokus- und Tastaturtests) |
| Langzeit-Offline (Speicherbereinigung durch iOS/Windows), mehrtägiger Cache | **nicht geprüft** |
| Inhaltliche Richtigkeit der Finanzzahlen und Artikel | **nicht verifiziert** (nur Übereinstimmung mit dem Übergabecode und Rechenkontrollen, siehe `PRUEFUNG_AUSGANGSCODE.md`) |
| Phase 2 (Live-Daten, Nachrichtenabruf) | nicht umgesetzt |

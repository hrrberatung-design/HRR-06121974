# Abnahme-Checklisten (echte Geräte) – alle Punkte sind **noch offen**

Diese Listen sind für dich bzw. für einen Test auf den echten Geräten. Ein Häkchen darf erst gesetzt werden, wenn es auf dem **echten** Gerät beobachtet wurde. Notiere Datum, Gerät, iOS-/Windows-Version, Browserversion.

## iPhone (Safari → Home-Bildschirm)
**Installation**
- [ ] Seite in Safari öffnet, Datenstand oben sichtbar (25.10.2026, ca. 09:00 UTC), Hinweis „Archivbericht“
- [ ] Teilen → Zum Home-Bildschirm: Symbol (Balkendiagramm) und Name „Krypto“ erscheinen
- [ ] Hinweisband „Als App nutzen“ erscheint in Safari und lässt sich ausblenden
**Start als App**
- [ ] Start vom Home-Bildschirm: ohne Safari-Leiste, dunkler Hintergrund, kein weißes Aufblitzen
- [ ] Statusleiste/Notch: Inhalt nicht verdeckt (Safe Areas), Navigation „Marktdaten/Nachrichten“ bleibt oben bedienbar
- [ ] Hochformat und Querformat: nichts abgeschnitten, kein seitliches Wischen der ganzen Seite
- [ ] Coin-Karten lesbar; Filter (Coins, Kategorie) bedienbar; Charts lesbar, Tippen zeigt Werte
- [ ] Nachrichten: Suche, Coin-/Themenfilter, Reset, Leerzustand, „Originalseite öffnen“ öffnet die richtige Seite
**Offline**
- [ ] Einmal online geöffnet → App schließen (aus App-Umschalter wischen) → Flugmodus → Start: Oberfläche, Charts, Bericht, Nachrichtenkarten da
- [ ] Offline-Hinweis und „Datenstand“ sichtbar und unverändert; Originalseite offline → Hinweis statt Fehlerseite
- [ ] Nach 1–2 Tagen erneut offline starten: Speicher noch vorhanden (ggf. vom System gelöscht → Hinweis in README)
**Updates**
- [ ] Nach neuer Version online öffnen: Hinweis „Neue App-Version verfügbar“ → „Jetzt aktualisieren“ → Version in „Info & Installation“ neu
- [ ] Datenstand nach reinem App-Update unverändert
**Sonstiges**
- [ ] Einstellungen (Coin-Auswahl) bleiben nach Neustart erhalten; auf dem PC erscheinen sie **nicht** (keine Synchronisation)
- [ ] App löschen → neu hinzufügen: sauberer Erststart

## Windows – Microsoft Edge
**Installation**
- [ ] Installationssymbol/„Diese Website als App installieren“ vorhanden; Knopf „App installieren“ in der App erscheint und öffnet den Edge-Dialog
- [ ] Start aus dem Startmenü; Anheften an Start und Taskleiste funktioniert
**App-Fenster**
- [ ] Eigenes Fenster ohne Adressleiste; Größe frei änderbar, minimiert/maximiert ok
- [ ] 1280 und 1920 px: Tabelle + 4 Charts nutzen den Platz; schmales Fenster (~500 px): Coin-Karten, nichts abgeschnitten
- [ ] Tastatur: Tab-Reihenfolge sinnvoll, Fokus sichtbar, Enter/Leertaste schalten Filter, Esc schließt Info-Dialog
- [ ] Quellenlink öffnet im Standardbrowser (richtige Adresse)
- [ ] Sprunglisteneinträge „Marktdaten“/„Nachrichten“ (falls angezeigt) öffnen den richtigen Bereich
**Offline**
- [ ] Einmal online → WLAN/Netzwerk trennen → App starten: alles lesbar, Offline-Hinweis, Datenstand unverändert
**Updates**
- [ ] Neue Version: Hinweis → „Jetzt aktualisieren“ → neue Version, Datenstand unverändert
**Sonstiges**
- [ ] Installiert + erneut öffnen der Adresse im Browser: Knopf „App installieren“ erscheint nicht (bzw. verständlicher Hinweis)
- [ ] Deinstallation über App-Menü; Neuinstallation startet sauber

## Windows – Google Chrome
(wie Edge; zusätzlich)
- [ ] Installation über Adressleisten-Symbol bzw. „Seite als App installieren“
- [ ] Anheften an Taskleiste/Start; Verknüpfungsoptionen im Installationsdialog dokumentieren
- [ ] Offline-Start, Update-Hinweis, Deinstallation wie bei Edge

## Zwei Geräte
- [ ] Beide zeigen denselben Berichtsstand; geänderte Filter auf einem Gerät erscheinen **nicht** auf dem anderen (so beschrieben)

## Nach dem Deployment (einmalig)
- [ ] Finale Adresse im Privatfenster: neue Version, Filter, Offline-Assets erreichbar
- [ ] `manifest.webmanifest`, `sw.js`, `data/*.json` abrufbar; Content-Type des Manifests ok

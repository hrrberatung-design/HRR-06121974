# Phase 2: spätere Live-Daten-Anbindung (nur Konzept – **nicht umgesetzt**)

Es ist nichts davon eingebaut. Keine „Live“-Beschriftung, kein „Aktualisieren“-Knopf, keine Schlüssel im Frontend.

## Voraussetzung: deine Freigabe
Kostenpflichtige Anbieter und laufende Dienste erst nach ausdrücklicher Freigabe. Zu klären vorab: Anbieterwahl, monatliche Kosten, Nutzungsrechte (Anzeige im eigenen, nicht öffentlichen Dashboard; Weitergabe), Abruflimits.

## Architektur
```
Anbieter-APIs / RSS  →  kleiner serverseitiger Abruf (Cloudflare Worker / Function, geplant alle X Min.)
                         · Schlüssel nur als Secret der Umgebung
                         · normalisiert, prüft, entdoppelt
                         ↓
                      data/report-<datum>.json + data/news.json  (gleiches Schema, schema: 1)
                         ↓
                  App (unverändert): lädt die JSON, zeigt Datenstand + Herkunft, cached für Offline
```
Die App liest bereits nur JSON mit Schema/Validierung und zeigt Stand und Herkunft an; die Umstellung betrifft nur den Daten-Erzeuger. Offline zeigt sie weiterhin den zuletzt gespeicherten Stand – bei Live-Daten zusätzlich mit „veraltet seit …“.

## Was zu klären ist
| Thema | Offene Fragen |
|---|---|
| Kurse/Marktkapitalisierung | Anbieter (kostenlos mit Limit vs. kostenpflichtig), Realtime vs. verzögert, Rate Limits, Lizenz |
| Spot-ETF-Flüsse | Welche Produkte zählen (BTC/ETH sicher; SOL/XRP-Abdeckung je Quelle uneinheitlich → heute „nicht belastbar“), Revisionen, Handelstage vs. Kalenderwoche |
| Derivate (OI, Funding, Liquidationen) | Börsenabdeckung (heute unbekannt), Fenster (4h/24h/7d) getrennt halten, Kosten der Aggregatoren |
| On-Chain/TVL | Stichtage vs. Kalenderwoche, Vergleichbarkeit der Chains |
| Nachrichten | RSS/API-Verfügbarkeit, Nutzungsrechte (nur Titel/Link vs. Zusammenfassung), Dublettenerkennung (kanonische URL + Ereignis), Publikationszeit mit Zeitzone, `fetched_at`, Status `verified/unverified/conflicted`, Ausfall ≠ „keine Meldungen“ |
| Betrieb | Zugangsdaten (Secret-Verwaltung), Aktualisierungsrhythmus, Fehlerbenachrichtigung, Kosten, wer prüft Datenqualität |
| Synchronisation | Gerätesynchronisation von Einstellungen braucht Konten + Backend – eigenes Vorhaben |

## Nicht zulässig ohne Prüfung
Vergleichswerte aus verschiedenen Fenstern mischen · fehlende Werte mit 0 füllen · Kausalaussagen („Hebel dominiert“) · Anlageempfehlungen/Signale.

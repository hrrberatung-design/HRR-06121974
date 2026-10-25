# Prüfung des Ausgangscodes (Übergabepaket)

Geprüft: `Krypto-Dashboard-Quellcode-fuer-Claude.txt` (= `quellcode/index.html` + `quellcode/news.js`, inhaltsgleich zum ZIP-Paket verglichen), `CLAUDE_STARTPROMPT.md`, `TECHNIK_UND_ABNAHME.md`, `NACHRICHTEN_ANFORDERUNGEN.md`, `PRUEFSTATUS.md` sowie die beiden DOCX (Startprompt = inhaltsgleich mit der MD-Fassung; älterer Analyseprompt nur als fachliche Ergänzung).

**Nicht verwendet:** `Krypto-Wochen-Dashboard.zip`. Dessen `index.html` ist die Ausgangsversion **plus ein eingebettetes Fremdskript** (`data-pplx-inline-edit`, ca. 440 Zeilen, Bearbeitungsbrücke einer anderen Plattform). Es wurde bewusst nicht übernommen.

## Erhalten (funktional unverändert)
BTC/ETH/SOL/XRP · Coin-Mehrfachauswahl und Kategorie-Filter · 4 KPI-Karten · 4 Charts · Kennzahlentabelle mit Vorwochenspalte (Berechnung wie im Original, jetzt datengetrieben) · Fazit-Karten · Methodik · Quellenlinks · Nachrichtenbereich (9 Archivkarten, Suche, Coin-/Themenfilter, Reset, Leerzustände, Regulierung bewusst leer).
Ein automatischer Test vergleicht alle Tabellenzellen, Fußnoten, Fazit-Texte, 14 Quellenlinks und 9 Nachrichtenverweise mit dem unveränderten Originalcode.

## Erkannte Fehler/Schwächen und ihre Behebung
| # | Befund im Original | Behebung |
|---|---|---|
| 1 | Chart.js (jsDelivr) und Schriften (Google Fonts) von fremden Servern → offline nicht lauffähig | lokal unter `vendor/` und `fonts/` (Lizenzen liegen bei) |
| 2 | `--text-faint` (#64708a) erreicht auf den Flächen nur ca. 3,5:1 Kontrast (AA verlangt 4,5:1 für kleinen Text) | #8591a8 (≥ 4,6:1) |
| 3 | Tabelle mit `min-width:1080px` → auf dem iPhone nur durch langes seitliches Scrollen nutzbar | unter 1000 px Breite Coin-Karten mit aktuellem Wert, Vorwochenwert und Veränderung zusammen; Tabelle bleibt ab 1000 px |
| 4 | Filter-Chips ohne Statusangabe für Screenreader (`aria-pressed`) und ohne definierten Fokusrahmen | `aria-pressed`, sichtbarer Fokus, Touch-Größen |
| 5 | Charts nur per Hover/Tippen lesbar, keine Legende für Linien- und Flussdiagramm | HTML-Legende, „Werte als Tabelle“ unter jedem Chart, Beschriftung der Zeichenfläche |
| 6 | Kursdiagramm: Achsenmarken bei −4,5 / −2,5 / −0,5 % (Null-Linie nicht beschriftet) | Achse 94–106 → Marken −6…+6 % in 2er-Schritten (nur Darstellung) |
| 7 | Wochenrendite-Balken fest rot | Farbe nach Vorzeichen (heute alle negativ → optisch gleich) |
| 8 | `text-size-adjust:none` verhindert Textvergrößerung | `100 %` |
| 9 | Zeile „Liquidations-Kontext“: Gesamtmarkttext stand allein in der BTC-Spalte | als marktweite Zeile über alle Coin-Spalten (Text unverändert) |
| 10 | Letzten Coin erneut anklicken setzte still auf „alle“ zurück | Verhalten beibehalten, aber mit sichtbarem Hinweis |
| 11 | Quellenlinks/Spaltenüberschriften nicht tastaturfreundlich dimensioniert | Mindestgrößen auf Touch-Geräten |

## Datenauffälligkeiten – **nicht verändert**, bitte fachlich prüfen
Keine Finanzzahl wurde angepasst. Folgendes fiel beim Gegenrechnen auf:
1. **BTC-ETF Donnerstag 22.10.:** Chart-Wert **−635,5 Mio. $**, Fußnote **−$635,6 Mio.**. Die Summe +301,2 Mio. $ passt nur zu −635,6 (mit −635,5 ergäbe sich +301,3). Vermutlich Rundung – Ursache ungeklärt.
2. **Fazit BTC:** „+$1,08 Mrd. Mo–Mi“; die hinterlegten Tageswerte (526,7 + 23,2 + 524,8) ergeben 1.074,7 Mio. = **1,07 Mrd.** Möglicherweise ungerundete Quellwerte.
3. **BTC-ETF-Woche:** Summe der Tageswerte +301,2 vs. The Block +304,7 Mio. $ – schon im Bericht als „ungeklärt“ ausgewiesen (bleibt so).
4. Kontrollrechnungen, die **stimmen**: Wochenrenditen (−2,08/−3,09/−3,13/−0,90 %) gegen Kurs 25.10./18.10.; bp-Werte (+1,9/−7,8/−5,3) gegen Marktkapitalisierung; ETH „3 von 5 Abflusstagen“.

## Inhaltliche Grenzen (aus `TECHNIK_UND_ABNAHME.md`) – erhalten
BTC-Abweichung ungeklärt · SOL nur 5-Tage-Fenster bis 22.10. · XRP kein Wochenwert und kein bp-Wert (`null`) · ETH 3 Abflusstage · 4h/24h-Liquidationen getrennt · OI-Börsenabdeckung unbekannt · Funding nur Snapshots · Netzwerkerlöse = Vorwoche · TVL-WoW zum 16.10. statt 18.10. · Sonntagsstand vorläufig · keine Kausalurteile.

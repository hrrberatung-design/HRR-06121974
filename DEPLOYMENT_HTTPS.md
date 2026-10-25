# HTTPS-Deployment (Anleitung)

PWAs funktionieren (Service Worker, Installation) nur über **HTTPS** (oder `localhost`). Ich habe **nichts veröffentlicht** – Hosting und Sichtbarkeit entscheidest du (siehe „Entscheidung“ unten).


# Nur für dich: privater Betrieb (Empfehlung)

Die App enthält nur den Archivbericht, aber sie soll nur du öffnen können. Die App ist bereits für Suchmaschinen gesperrt (`noindex`, `robots.txt`). Das ist **kein Zugriffsschutz**; dafür gibt es drei Wege:

| Weg | Schutz | Aufwand/Kosten | Hinweise |
|---|---|---|---|
| **1. Cloudflare Pages + Cloudflare Access** (empfohlen) | Anmeldung per E-Mail-Code, nur für deine Adresse | kostenlos (bis 50 Nutzer) | Läuft ohne eigenen Rechner. Manifest wird mit Anmeldedaten geladen (`crossorigin="use-credentials"` ist gesetzt). Ist die Anmeldung abgelaufen, scheitert nur ein App-Update; die Offline-Ansicht bleibt nutzbar. Einmal im Browser anmelden, dann installieren. |
| **2. Tailscale (privates Netz) mit `tailscale serve`** | Nur deine eigenen Geräte | kostenlos für Privatnutzung | Ein Rechner muss die App ausliefern (HTTPS-Zertifikat von Tailscale); Tailscale auf iPhone und PC installieren. Gelesen wird danach offline aus dem Cache. |
| **3. Öffentliche Seite mit nicht erratbarer Adresse** | nur Geheimhaltung der Adresse | kostenlos | Kein echter Schutz: Wer den Link hat, sieht alles. Nur vertretbar, weil keine persönlichen Daten enthalten sind. |

Einrichtung Weg 1: Cloudflare Pages wie unten (Weg A), danach *Zero Trust → Access → Applications → Add → Self-hosted*, die Pages-Adresse eintragen, Richtlinie „Allow“ mit **Emails = deine Adresse**, Anmeldemethode „One-time PIN“. Anmeldung und Passwörter erledigst du selbst im Browser.

Wichtig: Die privat geschützte Variante ist in Safari/Edge/Chrome **noch nicht getestet** (Chromium-Tests liefen ohne Zugriffsschutz).

## Entscheidung für dich
* **Öffentlich oder privat?** Die App enthält nur den Archivbericht (Zahlen aus öffentlichen Quellen, keine persönlichen Daten). Wer die Adresse kennt, kann sie öffnen. Ein Zugriffsschutz (z. B. Cloudflare Access) ist möglich, macht aber die Installation und Updates aufwendiger und ist hier nicht eingerichtet.
* **Kosten:** Alle drei Wege unten haben kostenlose Tarife; gebucht habe ich nichts.

## Weg A: Cloudflare Pages (empfohlen: einfach, eigene Adresse `*.pages.dev`, nutzt `_headers`)
1. Konto auf cloudflare.com anlegen (Anmeldung durch dich; **keine Passwörter an mich/in den Chat**).
2. *Workers & Pages → Create → Pages → Upload assets*; Projektname wählen (z. B. `krypto-dashboard`).
3. Den **Inhalt dieses Ordners** hochladen (nicht `node_modules`, `tests`, `tools`, `docs`; sie schaden nicht, werden aber nicht gebraucht). Wichtig: `index.html` muss im Stammverzeichnis liegen.
4. Nach „Deploy“ ist die App unter `https://<projekt>.pages.dev/` erreichbar. Diese Adresse auf iPhone **und** Windows verwenden.
5. Update: `npm run stamp`, neuen Ordnerinhalt erneut hochladen.

## Weg B: GitHub Pages
1. Neues Repository, Ordnerinhalt ins Hauptverzeichnis (Datei `.nojekyll` liegt bei).
2. *Settings → Pages → Deploy from a branch → main / (root)*.
3. Adresse: `https://<name>.github.io/<repo>/` – das ist ein **Unterverzeichnis**; die App nutzt nur relative Pfade und funktioniert dort ohne Änderung (getestet mit `/krypto/`). Kostenlose Pages-Seiten sind öffentlich sichtbar. `_headers` wirkt auf GitHub Pages nicht – GitHub liefert Dateien mit ca. 10 Minuten Browser-Cache; Updates erkennt die App trotzdem (der Service Worker wird mit `updateViaCache: 'none'` geprüft, die Daten mit `no-cache` geladen), im schlechtesten Fall mit wenigen Minuten Verzögerung.

## Weg C: Netlify
*Add new site → Deploy manually* → Ordner per Drag & Drop. `_headers` wird übernommen.

## Eigene Domain / Unterverzeichnis
* Eigene Domain: im Hosting-Dienst hinzufügen; HTTPS-Zertifikat stellt der Dienst automatisch aus.
* Unterverzeichnis: nichts anpassen (relative Pfade, `scope: "./"`). Lokal prüfbar mit `node tools/serve.mjs --base /krypto/`.
* **Adresse nicht mehr ändern, wenn Geräte schon installiert haben**: Eine installierte PWA hängt an ihrer Adresse (Origin). Bei Umzug auf eine neue Adresse neu installieren (Einstellungen/Offline-Speicher gehen verloren).

## Prüfen nach dem Deployment (in neuem Browser-Kontext/Privatfenster)
1. `https://…/` lädt, „Datenstand“ steht oben, Charts sichtbar.
2. `https://…/manifest.webmanifest` und `https://…/sw.js` sind abrufbar (kein 404).
3. Chrome/Edge: Entwicklertools (F12) → *Anwendung/Application* → *Manifest* ohne Fehler; *Service Workers* zeigt „activated“.
4. Danach die Checklisten in `CHECKLISTEN.md` auf den echten Geräten durchgehen.

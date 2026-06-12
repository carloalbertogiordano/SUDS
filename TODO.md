# SUDS — TODO

## Bug

- [x] **Presentazione fullscreen** — testo lungo non va a capo, allunga la pagina orizzontalmente. Fix CSS (`word-wrap`/`overflow-wrap` su `.presenta-desc`)
- [x] **QR decode UTF-8** — `initFromHash` usa `escape(atob(...))`, si rompe con caratteri accentati italiani (à, è, ò). Sostituire con `TextDecoder`
- [x] **Label "Salva" vs Firefox** — rilevare supporto `showSaveFilePicker` a load time e mostrare "Salva" (Chrome/Safari) o "Scarica copia JSON" (Firefox) in modo permanente e onesto

## Feature

- [x] **Indicator modifiche non salvate** — badge/asterisco nell'header dopo ogni modifica, sparisce dopo `saveJSON()`
- [x] **Titolo libero sessione** — campo opzionale per etichettare una sessione ("Dopo vacanze", "Prima EMDR"), mostrato nel selector e nel grafico
- [x] **Note VP persistenti** — le note inserite nella view "Voglio Provare" vengono salvate nella sessione e riproposte alla riapertura
- [x] **Target SUDS per attività** — terzo valore oltre stimato/vissuto: goal terapeutico. Visibile nel grafico progressi come linea tratteggiata orizzontale
- [x] **Archivio attività** — nascondere un'attività senza eliminarla, mantenendo lo storico nelle sessioni precedenti
- [x] **Hint tasti tastiera** — indicatore visibile dei tasti rapidi (`F` = presenta, `Esc` = chiudi). Es. tooltip o footer discreto
- [x] **Draft recovery con prompt** — al caricamento, se esiste draft in localStorage, chiedere "Ripristinare sessione di Mario Rossi del 10/06?" invece di caricare in silenzio
- [x] **Confronto sessioni** — vista tabellare affiancata di due sessioni selezionate (stimato + vissuto per ciascuna)
- [x] **Template gerarchia** — caricare lista attività predefinite come punto di partenza (es. "fobia sociale", "ansia da prestazione")
- [x] **Export CSV** — esportare tutte le sessioni in CSV per analisi esterna (Excel, SPSS)
- [x] **PWA installabile** — `manifest.json` + service worker + icone SVG; funziona offline per asset locali
- [x] **Condivisione PDF diretta (no link)** — rimosso Email (mailto non supporta allegati); WhatsApp e Telegram auto-generano il PDF e usano `navigator.share({ files })` su mobile (picker OS nativo), fallback link su desktop. Da verificare comportamento su iOS/Android reali.
- [ ] **Bottone "Problemi? Serve una mano?"** — home page, punta a `https://github.com/carloalbertogiordano/SUDS/issues/new`; aggiungere pagina/sezione nel repo con spiegazione su come aprire una issue (titolo descrittivo, cosa fare, cosa non fare)

# SUDS — TODO

## Bug

- [x] **Presentazione fullscreen** — testo lungo non va a capo, allunga la pagina orizzontalmente. Fix CSS (`word-wrap`/`overflow-wrap` su `.presenta-desc`)
- [x] **QR decode UTF-8** — `initFromHash` usa `escape(atob(...))`, si rompe con caratteri accentati italiani (à, è, ò). Sostituire con `TextDecoder`
- [x] **Label "Salva" vs Firefox** — rilevare supporto `showSaveFilePicker` a load time e mostrare "Salva" (Chrome/Safari) o "Scarica copia JSON" (Firefox) in modo permanente e onesto

## Feature

- [ ] **Indicator modifiche non salvate** — badge/asterisco nell'header dopo ogni modifica, sparisce dopo `saveJSON()`
- [ ] **Titolo libero sessione** — campo opzionale per etichettare una sessione ("Dopo vacanze", "Prima EMDR"), mostrato nel selector e nel grafico
- [ ] **Note VP persistenti** — le note inserite nella view "Voglio Provare" vengono salvate nella sessione e riproposte alla riapertura
- [ ] **Target SUDS per attività** — terzo valore oltre stimato/vissuto: goal terapeutico. Visibile nel grafico progressi come linea tratteggiata orizzontale
- [ ] **Archivio attività** — nascondere un'attività senza eliminarla, mantenendo lo storico nelle sessioni precedenti
- [ ] **Hint tasti tastiera** — indicatore visibile dei tasti rapidi (`F` = presenta, `Esc` = chiudi). Es. tooltip o footer discreto
- [ ] **Draft recovery con prompt** — al caricamento, se esiste draft in localStorage, chiedere "Ripristinare sessione di Mario Rossi del 10/06?" invece di caricare in silenzio
- [ ] **Confronto sessioni** — vista tabellare affiancata di due sessioni selezionate (stimato + vissuto per ciascuna)
- [ ] **Template gerarchia** — caricare lista attività predefinite come punto di partenza (es. "fobia sociale", "ansia da prestazione")
- [ ] **Export CSV** — esportare tutte le sessioni in CSV per analisi esterna (Excel, SPSS)
- [ ] **PWA installabile** — aggiungere `manifest.json` + service worker minimal per installazione da browser mobile

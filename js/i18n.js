'use strict';

const STRINGS = {
  it: {
    // Home
    'home.tagline':           'Scala di Disagio Soggettivo — Gestione schede pazienti',
    'home.author':            "Sviluppata da Joseph Wolpe, anni '50",
    'home.new-patient':       'Nuovo paziente',
    'home.new-patient-desc':  'Crea una nuova scheda',
    'home.load':              'Carica scheda',
    'home.load-desc':         'Importa un file JSON',
    'home.support':           'Problemi? Serve una mano?',
    'home.lang-toggle':       'English',

    // Patient bar
    'bar.back':               '← Indietro',
    'bar.code':               'Codice: #{id}',
    'bar.save-overwrite':     '💾 Salva',
    'bar.save-export':        '💾 Esporta JSON',
    'bar.save-download':      '⬇ Scarica JSON',
    'bar.save-tt-overwrite':  'Sovrascrive il file aperto',
    'bar.save-tt-export':     'Scegli dove salvare il file JSON',
    'bar.save-tt-download':   'Scarica copia JSON — Firefox non supporta la sovrascrittura diretta',
    'bar.vp':                 '▶ Voglio provare',
    'bar.new-session':        '+ Sessione',
    'bar.lock':               '🔒 Blocca',
    'bar.unlock':             '🔓 Sblocca',
    'bar.locked-badge':       '🔒 Sessione bloccata',
    'bar.delete-session':     '🗑 Elimina',
    'bar.notes':              '📝 Note',
    'bar.progress':           '📈 Progressi',
    'bar.presenta':           '⛶ Presenta',
    'bar.compare':            '⇆ Confronta',
    'bar.csv':                '📄 CSV',
    'bar.templates':          '📄 Template',

    // Activities
    'act.section-label':      'Attività e punteggi SUDS',
    'act.add':                '+ Aggiungi attività',
    'act.empty':              'Nessuna attività ancora.<br>Clicca <strong>Aggiungi attività</strong> per iniziare.',
    'act.placeholder':        "Descrivi l'attività…",
    'act.stimato':            'Stimato',
    'act.vissuto':            'Vissuto',
    'act.target':             'Target',
    'act.archive-tt':         'Archivia',
    'act.unarchive-tt':       'Ripristina',
    'act.delete-tt':          'Elimina',
    'act.archived-section':   'Archivio ({n})',
    'act.no-name':            '(senza nome)',
    'kbd.hint':               'Tasti: <kbd>F</kbd> presentazione &nbsp;·&nbsp; <kbd>Esc</kbd> chiudi',

    // Modals
    'modal.cancel':                   'Annulla',
    'modal.new-patient.title':        'Nuovo paziente',
    'modal.new-patient.sub':          'Inserisci nome e cognome. Il codice identificativo viene generato in automatico.',
    'modal.new-patient.nome':         'Nome',
    'modal.new-patient.nome-ph':      'es. Mario',
    'modal.new-patient.cognome':      'Cognome',
    'modal.new-patient.cognome-ph':   'es. Rossi',
    'modal.new-patient.create':       'Crea scheda',
    'modal.sessions.title':           'Sessioni',
    'modal.sessions.sub':             'Seleziona la sessione attiva o creane una nuova.',
    'modal.sessions.new-title':       'Nuova sessione',
    'modal.sessions.title-ph':        'Titolo opzionale (es. Prima EMDR, Dopo vacanze)',
    'modal.sessions.copy':            'Copia punteggi dalla sessione precedente (vissuto diventa stimato)',
    'modal.sessions.close':           'Chiudi',
    'modal.sessions.create':          'Crea sessione',
    'modal.sessions.title-input-ph':  'Aggiungi titolo…',
    'modal.notes.title':              '📝 Note private',
    'modal.notes.sub':                'Queste note non appaiono nel PDF.',
    'modal.notes.ph':                 'Note di sessione…',
    'modal.notes.save':               'Salva',
    'modal.compare.title':            '⇆ Confronto sessioni',
    'modal.compare.sub':              'Seleziona due sessioni per confrontare i punteggi SUDS.',
    'modal.compare.close':            'Chiudi',
    'compare.col-activity':           'Attività',
    'compare.hint':                   'Stimato &nbsp;·&nbsp; <span class="compare-vissuto">(vissuto)</span> &nbsp;·&nbsp; <span class="delta-better">verde = miglioramento</span> nella direzione sessione A → B',
    'modal.templates.title':          '📄 Template gerarchia',
    'modal.templates.sub':            'Seleziona un template per aggiungere attività predefinite alla scheda attuale.',
    'modal.templates.apply':          'Aggiungi attività',

    // VP view
    'vp.title-prefix':        '▶ Voglio Provare —',
    'vp.generate':            'Genera PDF',
    'vp.regenerate':          '↻ Rigenera',
    'vp.generating':          'Generazione…',
    'vp.general-label':       'Commento generale',
    'vp.general-ph':          'Note introduttive, indicazioni generali per questa sessione…',
    'vp.acts-label':          'Attività selezionate — ordinate per punteggio crescente',
    'vp.note-label':          'Nota per questa attività',
    'vp.note-ph':             'Inserisci una nota specifica…',
    'vp.unnamed':             '(attività senza nome)',
    'vp.ready':               '✓ PDF pronto',
    'vp.download':            '⬇ Scarica PDF',

    // Progressi
    'prog.title-prefix':      '📈 Progressi —',
    'prog.sub':               'Andamento dei punteggi SUDS nelle sessioni. Linea continua = stimato, tratteggiata = vissuto.',
    'prog.hint':              'Clicca sulla legenda per mostrare/nascondere singole attività.',
    'prog.y-axis':            'Punteggio SUDS',

    // Chart tooltip types
    'chart.target':           'Target',
    'chart.vissuto':          'Vissuto',
    'chart.stimato':          'Stimato',

    // Presenta
    'presenta.close':         '× Chiudi',
    'presenta.show-all':      'Mostra tutti ({n} nascost{e})',
    'presenta.no-acts':       'Nessuna attività.',
    'presenta.stimato-label': 'Stimato',
    'presenta.vissuto-label': 'Vissuto',

    // QR patient view
    'qr.brand':               'Voglio Provare',
    'qr.print':               '🖨 Stampa',
    'qr.stimato-label':       'Ansia stimata',
    'qr.vissuto-label':       'Vissuto',

    // Session labels (used in JS rendering)
    'sess.n':                 'Sessione {n}',
    'sess.date-sep':          ' — ',

    // Toasts
    'toast.session-deleted':  'Sessione eliminata.',
    'toast.session-only':     "Impossibile eliminare l'unica sessione.",
    'toast.session-created':  'Nuova sessione creata.',
    'toast.session-locked':   'Sessione bloccata.',
    'toast.session-unlocked': 'Sessione sbloccata.',
    'toast.notes-saved':      'Note salvate.',
    'toast.file-updated':     'File aggiornato correttamente.',
    'toast.file-downloaded':  'Scheda scaricata come JSON.',
    'toast.load-error':       'Errore nel caricamento.',
    'toast.file-invalid':     'File non valido.',
    'toast.migrated':         'Scheda aggiornata al formato corrente.',
    'toast.loaded':           'Scheda caricata.',
    'toast.read-error':       'Errore nella lettura del file.',
    'toast.pdf-ready':        'PDF pronto.',
    'toast.pdf-saved':        'PDF salvato.',
    'toast.csv-exported':     'CSV esportato.',
    'toast.act-archived':     'Attività archiviata.',
    'toast.act-restored':     'Attività ripristinata.',
    'toast.sel-activity':     "Seleziona almeno un'attività.",
    'toast.sel-template':     'Seleziona un template.',
    'toast.locked-err':       'Sessione bloccata.',
    'toast.tpl-applied':      'Template "{name}" aggiunto.',
    'toast.pdf-error':        'Errore nella generazione del PDF.',
    'toast.jspdf-missing':    'jsPDF non caricato. Connetti Internet e riprova.',

    // Confirms
    'confirm.delete-session': "Eliminare questa sessione? L'operazione non può essere annullata.",
    'confirm.lock-session':   'Una sessione bloccata non può essere modificata. Continuare?',
    'confirm.unlock-session': 'Sbloccare la sessione? I dati torneranno modificabili.',
    'confirm.go-home':        'Tornando alla home perderai le modifiche non salvate. Continuare?',
    'confirm.restore-draft':  'Trovata sessione non salvata di {name}{date}.\nRipristinare?',

    // PDF
    'pdf.title':              'Voglio Provare',
    'pdf.acts-header':        'ATTIVITÀ SELEZIONATE — ORDINATE PER PUNTEGGIO CRESCENTE',
    'pdf.notes-header':       'NOTE GENERALI',
    'pdf.note-label':         'Nota:',
    'pdf.qr-caption':         'Scansiona per rileggere',
    'pdf.footer':             'SUDS — Scala di Disagio Soggettivo  ·  Pagina {p} di {total}',
    'pdf.locale':             'it-IT',

    // Templates
    'tpl.social-phobia.name': 'Fobia sociale',
    'tpl.perf.name':          'Ansia da prestazione',
    'tpl.agora.name':         'Agorafobia',
    'tpl.social-phobia.0':    'Salutare un vicino di casa',
    'tpl.social-phobia.1':    'Telefonare a un negozio per chiedere informazioni',
    'tpl.social-phobia.2':    'Fare una domanda in classe o in riunione',
    'tpl.social-phobia.3':    'Mangiare in un ristorante affollato',
    'tpl.social-phobia.4':    'Parlare con uno sconosciuto',
    'tpl.social-phobia.5':    'Fare un acquisto e chiedere uno scontrino',
    'tpl.social-phobia.6':    'Partecipare a una festa con persone non conosciute',
    'tpl.social-phobia.7':    'Fare una presentazione davanti a un gruppo',
    'tpl.perf.0':             'Leggere un testo ad alta voce da soli',
    'tpl.perf.1':             'Consegnare un compito scritto',
    'tpl.perf.2':             'Rispondere a una domanda del docente in aula',
    'tpl.perf.3':             'Sostenere un colloquio di lavoro simulato',
    'tpl.perf.4':             'Sostenere un esame scritto',
    'tpl.perf.5':             'Sostenere un esame orale',
    'tpl.perf.6':             'Esibirsi davanti a un pubblico (recita, sport, ecc.)',
    'tpl.agora.0':            'Stare in casa da soli per 30 minuti',
    'tpl.agora.1':            'Passeggiare vicino a casa',
    'tpl.agora.2':            'Fare la spesa in un piccolo negozio',
    'tpl.agora.3':            "Prendere l'autobus per una fermata",
    'tpl.agora.4':            "Stare in una sala d'attesa affollata",
    'tpl.agora.5':            'Visitare un centro commerciale',
    'tpl.agora.6':            'Viaggiare in treno per più fermate',
    'tpl.agora.7':            'Stare in una piazza o in un parco affollato',
  },

  en: {
    // Home
    'home.tagline':           'Subjective Units of Distress Scale — Patient Management',
    'home.author':            'Developed by Joseph Wolpe, 1950s',
    'home.new-patient':       'New patient',
    'home.new-patient-desc':  'Create a new record',
    'home.load':              'Load record',
    'home.load-desc':         'Import a JSON file',
    'home.support':           'Issues? Need help?',
    'home.lang-toggle':       'Italiano',

    // Patient bar
    'bar.back':               '← Back',
    'bar.code':               'Code: #{id}',
    'bar.save-overwrite':     '💾 Save',
    'bar.save-export':        '💾 Export JSON',
    'bar.save-download':      '⬇ Download JSON',
    'bar.save-tt-overwrite':  'Overwrites the open file',
    'bar.save-tt-export':     'Choose where to save the JSON file',
    'bar.save-tt-download':   'Download JSON copy — Firefox does not support direct overwrite',
    'bar.vp':                 '▶ I want to try',
    'bar.new-session':        '+ Session',
    'bar.lock':               '🔒 Lock',
    'bar.unlock':             '🔓 Unlock',
    'bar.locked-badge':       '🔒 Session locked',
    'bar.delete-session':     '🗑 Delete',
    'bar.notes':              '📝 Notes',
    'bar.progress':           '📈 Progress',
    'bar.presenta':           '⛶ Present',
    'bar.compare':            '⇆ Compare',
    'bar.csv':                '📄 CSV',
    'bar.templates':          '📄 Templates',

    // Activities
    'act.section-label':      'Activities and SUDS scores',
    'act.add':                '+ Add activity',
    'act.empty':              'No activities yet.<br>Click <strong>Add activity</strong> to start.',
    'act.placeholder':        'Describe the activity…',
    'act.stimato':            'Estimated',
    'act.vissuto':            'Experienced',
    'act.target':             'Target',
    'act.archive-tt':         'Archive',
    'act.unarchive-tt':       'Restore',
    'act.delete-tt':          'Delete',
    'act.archived-section':   'Archive ({n})',
    'act.no-name':            '(no name)',
    'kbd.hint':               'Keys: <kbd>F</kbd> presentation &nbsp;·&nbsp; <kbd>Esc</kbd> close',

    // Modals
    'modal.cancel':                   'Cancel',
    'modal.new-patient.title':        'New patient',
    'modal.new-patient.sub':          'Enter first and last name. The ID code is generated automatically.',
    'modal.new-patient.nome':         'First name',
    'modal.new-patient.nome-ph':      'e.g. John',
    'modal.new-patient.cognome':      'Last name',
    'modal.new-patient.cognome-ph':   'e.g. Smith',
    'modal.new-patient.create':       'Create record',
    'modal.sessions.title':           'Sessions',
    'modal.sessions.sub':             'Select the active session or create a new one.',
    'modal.sessions.new-title':       'New session',
    'modal.sessions.title-ph':        'Optional title (e.g. First EMDR, After holidays)',
    'modal.sessions.copy':            'Copy scores from previous session (experienced becomes estimated)',
    'modal.sessions.close':           'Close',
    'modal.sessions.create':          'Create session',
    'modal.sessions.title-input-ph':  'Add title…',
    'modal.notes.title':              '📝 Private notes',
    'modal.notes.sub':                'These notes do not appear in the PDF.',
    'modal.notes.ph':                 'Session notes…',
    'modal.notes.save':               'Save',
    'modal.compare.title':            '⇆ Session comparison',
    'modal.compare.sub':              'Select two sessions to compare SUDS scores.',
    'modal.compare.close':            'Close',
    'compare.col-activity':           'Activity',
    'compare.hint':                   'Estimated &nbsp;·&nbsp; <span class="compare-vissuto">(experienced)</span> &nbsp;·&nbsp; <span class="delta-better">green = improvement</span> in direction A → B',
    'modal.templates.title':          '📄 Hierarchy templates',
    'modal.templates.sub':            'Select a template to add predefined activities to the current record.',
    'modal.templates.apply':          'Add activities',

    // VP view
    'vp.title-prefix':        '▶ I Want to Try —',
    'vp.generate':            'Generate PDF',
    'vp.regenerate':          '↻ Regenerate',
    'vp.generating':          'Generating…',
    'vp.general-label':       'General comment',
    'vp.general-ph':          'Introductory notes, general instructions for this session…',
    'vp.acts-label':          'Selected activities — sorted by ascending score',
    'vp.note-label':          'Note for this activity',
    'vp.note-ph':             'Enter a specific note…',
    'vp.unnamed':             '(unnamed activity)',
    'vp.ready':               '✓ PDF ready',
    'vp.download':            '⬇ Download PDF',

    // Progressi
    'prog.title-prefix':      '📈 Progress —',
    'prog.sub':               'SUDS score trends across sessions. Solid line = estimated, dashed = experienced.',
    'prog.hint':              'Click the legend to show/hide individual activities.',
    'prog.y-axis':            'SUDS Score',

    // Chart tooltip types
    'chart.target':           'Target',
    'chart.vissuto':          'Experienced',
    'chart.stimato':          'Estimated',

    // Presenta
    'presenta.close':         '× Close',
    'presenta.show-all':      'Show all ({n} hidden)',
    'presenta.no-acts':       'No activities.',
    'presenta.stimato-label': 'Estimated',
    'presenta.vissuto-label': 'Experienced',

    // QR patient view
    'qr.brand':               'I Want to Try',
    'qr.print':               '🖨 Print',
    'qr.stimato-label':       'Estimated anxiety',
    'qr.vissuto-label':       'Experienced',

    // Session labels (used in JS rendering)
    'sess.n':                 'Session {n}',
    'sess.date-sep':          ' — ',

    // Toasts
    'toast.session-deleted':  'Session deleted.',
    'toast.session-only':     'Cannot delete the only session.',
    'toast.session-created':  'New session created.',
    'toast.session-locked':   'Session locked.',
    'toast.session-unlocked': 'Session unlocked.',
    'toast.notes-saved':      'Notes saved.',
    'toast.file-updated':     'File updated successfully.',
    'toast.file-downloaded':  'Record downloaded as JSON.',
    'toast.load-error':       'Error loading file.',
    'toast.file-invalid':     'Invalid file.',
    'toast.migrated':         'Record updated to current format.',
    'toast.loaded':           'Record loaded.',
    'toast.read-error':       'Error reading file.',
    'toast.pdf-ready':        'PDF ready.',
    'toast.pdf-saved':        'PDF saved.',
    'toast.csv-exported':     'CSV exported.',
    'toast.act-archived':     'Activity archived.',
    'toast.act-restored':     'Activity restored.',
    'toast.sel-activity':     'Select at least one activity.',
    'toast.sel-template':     'Select a template.',
    'toast.locked-err':       'Session is locked.',
    'toast.tpl-applied':      'Template "{name}" added.',
    'toast.pdf-error':        'Error generating PDF.',
    'toast.jspdf-missing':    'jsPDF not loaded. Connect to the internet and try again.',

    // Confirms
    'confirm.delete-session': 'Delete this session? This action cannot be undone.',
    'confirm.lock-session':   'A locked session cannot be modified. Continue?',
    'confirm.unlock-session': 'Unlock session? Data will become editable again.',
    'confirm.go-home':        'Going back will discard unsaved changes. Continue?',
    'confirm.restore-draft':  'Found unsaved session for {name}{date}.\nRestore?',

    // PDF
    'pdf.title':              'I Want to Try',
    'pdf.acts-header':        'SELECTED ACTIVITIES — SORTED BY ASCENDING SCORE',
    'pdf.notes-header':       'GENERAL NOTES',
    'pdf.note-label':         'Note:',
    'pdf.qr-caption':         'Scan to view',
    'pdf.footer':             'SUDS — Subjective Units of Distress  ·  Page {p} of {total}',
    'pdf.locale':             'en-US',

    // Templates
    'tpl.social-phobia.name': 'Social phobia',
    'tpl.perf.name':          'Performance anxiety',
    'tpl.agora.name':         'Agoraphobia',
    'tpl.social-phobia.0':    'Greeting a neighbour',
    'tpl.social-phobia.1':    'Calling a shop for information',
    'tpl.social-phobia.2':    'Asking a question in class or a meeting',
    'tpl.social-phobia.3':    'Eating at a crowded restaurant',
    'tpl.social-phobia.4':    'Talking to a stranger',
    'tpl.social-phobia.5':    'Making a purchase and asking for a receipt',
    'tpl.social-phobia.6':    'Attending a party with unfamiliar people',
    'tpl.social-phobia.7':    'Giving a presentation in front of a group',
    'tpl.perf.0':             'Reading a text aloud alone',
    'tpl.perf.1':             'Handing in a written assignment',
    'tpl.perf.2':             "Answering a teacher's question in class",
    'tpl.perf.3':             'Doing a mock job interview',
    'tpl.perf.4':             'Sitting a written exam',
    'tpl.perf.5':             'Sitting an oral exam',
    'tpl.perf.6':             'Performing in front of an audience (show, sport, etc.)',
    'tpl.agora.0':            'Being home alone for 30 minutes',
    'tpl.agora.1':            'Walking near home',
    'tpl.agora.2':            'Shopping at a small local store',
    'tpl.agora.3':            'Taking the bus for one stop',
    'tpl.agora.4':            'Sitting in a crowded waiting room',
    'tpl.agora.5':            'Visiting a shopping centre',
    'tpl.agora.6':            'Travelling by train for several stops',
    'tpl.agora.7':            'Being in a busy square or park',
  },
};

let currentLang = (() => {
  try {
    const saved = localStorage.getItem('suds_lang');
    if (saved && STRINGS[saved]) return saved;
  } catch(e) {}
  return (navigator.language || 'it').startsWith('it') ? 'it' : 'en';
})();

function t(key, vars) {
  let str = (STRINGS[currentLang] || STRINGS.it)[key];
  if (str === undefined) str = STRINGS.it[key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return str;
}

function setLang(lang) {
  if (!STRINGS[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('suds_lang', lang); } catch(e) {}
  applyTranslations();
}

function toggleLang() {
  setLang(currentLang === 'it' ? 'en' : 'it');
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
    el.dataset.tooltip = t(el.dataset.i18nTooltip);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  const langBtn = document.getElementById('btn-lang');
  if (langBtn) langBtn.textContent = t('home.lang-toggle');
  if (typeof syncSaveBtn === 'function') syncSaveBtn();
  if (typeof patient !== 'undefined' && patient && typeof renderPatient === 'function') {
    renderPatient();
  }
}

document.addEventListener('DOMContentLoaded', () => applyTranslations());

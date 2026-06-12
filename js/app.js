'use strict';

function switchSessionModal(id) {
  switchSession(id);
  renderSessionList();
}

function deleteSession(event, id) {
  if (event) event.stopPropagation();
  if (!confirm('Eliminare questa sessione? L\'operazione non può essere annullata.')) return;
  patient.sessioni = patient.sessioni.filter(s => s.id !== id);
  if (currentSessionId === id) {
    currentSessionId = patient.sessioni[patient.sessioni.length - 1].id;
  }
  renderSessionList();
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
  autoSave();
  toast('Sessione eliminata.');
}

function deleteCurrentSession() {
  if (patient.sessioni.length <= 1) {
    toast('Impossibile eliminare l\'unica sessione.', 'err');
    return;
  }
  deleteSession(null, currentSessionId);
}

function createSession() {
  const copyPrev = document.getElementById('new-sess-copy').checked;
  const prevSess = activeSession();
  const sessId   = 'sess_' + uidAct();
  const titolo   = (document.getElementById('new-sess-title')?.value || '').trim();

  const punteggi = patient.attivita.map(a => {
    const prev = copyPrev && prevSess
      ? prevSess.punteggi.find(p => p.attivita_id === a.id)
      : null;
    const nuovoStimato = prev ? (prev.vissuto !== null ? prev.vissuto : prev.stimato) : 0;
    const noteVP = copyPrev && prev ? (prev.noteVP || '') : '';
    return { attivita_id: a.id, stimato: nuovoStimato, vissuto: null, sel: false, noteVP };
  });

  patient.sessioni.push({ id: sessId, data: today(), locked: false, notePrivate: '', titolo, noteVPGenerale: '', punteggi });
  currentSessionId = sessId;
  if (document.getElementById('new-sess-title')) document.getElementById('new-sess-title').value = '';

  closeModal('modal-sessions');
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
  autoSave();
  toast('Nuova sessione creata.');
}

function lockSession() {
  const sess = activeSession();
  if (!sess) return;
  if (!confirm('Una sessione bloccata non può essere modificata. Continuare?')) return;
  sess.locked = true;
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
  autoSave();
  toast('Sessione bloccata.');
}

function unlockSession() {
  const sess = activeSession();
  if (!sess) return;
  if (!confirm('Sbloccare la sessione? I dati torneranno modificabili.')) return;
  sess.locked = false;
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
  autoSave();
  toast('Sessione sbloccata.');
}

function openNotesModal() {
  const sess = activeSession();
  if (!sess) return;
  document.getElementById('notes-textarea').value = sess.notePrivate || '';
  openModal('modal-notes');
}

function saveNotes() {
  const sess = activeSession();
  if (!sess) return;
  sess.notePrivate = document.getElementById('notes-textarea').value;
  autoSave();
  closeModal('modal-notes');
  toast('Note salvate.');
}

function addActivity() {
  if (activeSession()?.locked) return;
  const actId = uidAct();
  patient.attivita.push({ id: actId, desc: '', target: null, archiviata: false });
  patient.sessioni.forEach(sess => {
    sess.punteggi.push({ attivita_id: actId, stimato: 0, vissuto: null, sel: false, noteVP: '' });
  });
  renderActivities();
  syncVPBtn();
  autoSave();
  const inputs = document.querySelectorAll('.act-desc-input');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function deleteActivity(id) {
  if (activeSession()?.locked) return;
  patient.attivita = patient.attivita.filter(a => a.id !== id);
  patient.sessioni.forEach(sess => {
    sess.punteggi = sess.punteggi.filter(p => p.attivita_id !== id);
  });
  renderActivities();
  syncVPBtn();
  autoSave();
}

function archiveActivity(id) {
  if (activeSession()?.locked) return;
  const a = patient.attivita.find(a => a.id === id);
  if (a) { a.archiviata = true; renderActivities(); syncVPBtn(); autoSave(); toast('Attività archiviata.'); }
}

function unarchiveActivity(id) {
  if (activeSession()?.locked) return;
  const a = patient.attivita.find(a => a.id === id);
  if (a) { a.archiviata = false; renderActivities(); syncVPBtn(); autoSave(); toast('Attività ripristinata.'); }
}

function toggleShowArchived() {
  showArchived = !showArchived;
  renderActivities();
}

function updateTarget(id, val) {
  if (activeSession()?.locked) return;
  const a = patient.attivita.find(a => a.id === id);
  if (!a) return;
  a.target = (val === '' || val === null) ? null : Math.max(0, Math.min(100, parseInt(val) || 0));
  autoSave();
}

function updateSessionTitolo(id, val) {
  const sess = patient.sessioni.find(s => s.id === id);
  if (sess) sess.titolo = val;
  renderSessionSelector();
  autoSave();
}

function updateNoteVPGenerale(val) {
  const sess = activeSession();
  if (sess) sess.noteVPGenerale = val;
  autoSave();
}

function updateNoteVP(actId, val) {
  const p = punteggio(actId);
  if (p) p.noteVP = val;
  autoSave();
}

const TEMPLATES = [
  {
    id: 'fobia-sociale',
    nome: 'Fobia sociale',
    attivita: [
      { desc: 'Salutare un vicino di casa', stimato: 10 },
      { desc: 'Telefonare a un negozio per chiedere info', stimato: 20 },
      { desc: 'Fare una domanda in classe o in riunione', stimato: 35 },
      { desc: 'Mangiare in un ristorante affollato', stimato: 45 },
      { desc: 'Parlare con uno sconosciuto', stimato: 55 },
      { desc: 'Fare un acquisto e chiedere uno scontrino', stimato: 60 },
      { desc: 'Partecipare a una festa con persone non conosciute', stimato: 70 },
      { desc: 'Fare una presentazione davanti a un gruppo', stimato: 85 },
    ],
  },
  {
    id: 'ansia-prestazione',
    nome: 'Ansia da prestazione',
    attivita: [
      { desc: 'Leggere un testo ad alta voce da soli', stimato: 10 },
      { desc: 'Consegnare un compito scritto', stimato: 20 },
      { desc: 'Rispondere a una domanda del docente in aula', stimato: 40 },
      { desc: 'Sostenere un colloquio di lavoro simulato', stimato: 55 },
      { desc: 'Sostenere un esame scritto', stimato: 65 },
      { desc: 'Sostenere un esame orale', stimato: 75 },
      { desc: 'Esibirsi davanti a un pubblico (recita, sport, ecc.)', stimato: 85 },
    ],
  },
  {
    id: 'agorafobia',
    nome: 'Agorafobia',
    attivita: [
      { desc: 'Stare in casa da soli per 30 minuti', stimato: 10 },
      { desc: 'Passeggiare vicino a casa', stimato: 20 },
      { desc: 'Fare la spesa in un piccolo negozio', stimato: 35 },
      { desc: 'Prendere l\'autobus per una fermata', stimato: 50 },
      { desc: 'Stare in una sala d\'attesa affollata', stimato: 60 },
      { desc: 'Visitare un centro commerciale', stimato: 70 },
      { desc: 'Viaggiare in treno per più fermate', stimato: 80 },
      { desc: 'Stare in una piazza o in un parco affollato', stimato: 85 },
    ],
  },
];

let _selectedTemplate = null;

function openTemplatesModal() {
  if (activeSession()?.locked) { toast('Sessione bloccata.', 'err'); return; }
  _selectedTemplate = null;
  const list = document.getElementById('template-list');
  if (list) {
    list.innerHTML = TEMPLATES.map(t => `
      <div class="template-item" data-id="${t.id}" onclick="selectTemplate('${t.id}')">
        <div class="template-item-name">${t.nome}</div>
        <div class="template-item-preview">${t.attivita.map(a => a.desc).join(' · ')}</div>
      </div>`).join('');
  }
  openModal('modal-templates');
}

function selectTemplate(id) {
  _selectedTemplate = id;
  document.querySelectorAll('.template-item').forEach(el => {
    el.classList.toggle('template-selected', el.dataset.id === id);
  });
}

function applyTemplate() {
  if (!_selectedTemplate) { toast('Seleziona un template.', 'err'); return; }
  const tpl = TEMPLATES.find(t => t.id === _selectedTemplate);
  if (!tpl) return;
  tpl.attivita.forEach(({ desc, stimato }) => {
    const actId = uidAct();
    patient.attivita.push({ id: actId, desc, target: null, archiviata: false });
    patient.sessioni.forEach(sess => {
      sess.punteggi.push({ attivita_id: actId, stimato, vissuto: null, sel: false, noteVP: '' });
    });
  });
  closeModal('modal-templates');
  renderActivities();
  syncVPBtn();
  autoSave();
  toast(`Template "${tpl.nome}" aggiunto.`);
}

function exportCSV() {
  const headers = ['Sessione', 'Titolo', 'Data', 'Attività', 'Stimato', 'Vissuto', 'Target'];
  const rows = patient.sessioni.map((sess, si) =>
    patient.attivita.map(act => {
      const p = sess.punteggi.find(p => p.attivita_id === act.id);
      return [si + 1, sess.titolo || '', sess.data, act.desc, p?.stimato ?? '', p?.vissuto ?? '', act.target ?? ''];
    })
  ).flat();
  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `SUDS_${patient.cognome}_${patient.nome}_${patient.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV esportato.');
}

function updateDesc(id, val) {
  if (activeSession()?.locked) return;
  const a = patient.attivita.find(a => a.id === id);
  if (a) a.desc = val;
  autoSave();
}

function updateStimato(id, val) {
  if (activeSession()?.locked) return;
  const p = punteggio(id);
  if (!p) return;
  let v = parseInt(val);
  if (isNaN(v)) v = 0;
  p.stimato = Math.max(0, Math.min(100, v));
  const row = document.querySelector(`.act-row[data-id="${id}"]`);
  if (row) {
    const vi = row.querySelector('.vissuto-input');
    if (vi) updateVissutoClass(vi, p.vissuto, p.stimato);
  }
  autoSave();
}

function updateVissuto(id, val) {
  if (activeSession()?.locked) return;
  const p = punteggio(id);
  if (!p) return;
  p.vissuto = (val === '' || val === null) ? null : Math.max(0, Math.min(100, parseInt(val) || 0));
  const row = document.querySelector(`.act-row[data-id="${id}"]`);
  if (row) {
    const vi = row.querySelector('.vissuto-input');
    if (vi) updateVissutoClass(vi, p.vissuto, p.stimato);
  }
  autoSave();
}

function updateVissutoClass(el, vissuto, stimato) {
  if (!el) return;
  el.classList.remove('vissuto-empty', 'vissuto-better', 'vissuto-worse', 'vissuto-same');
  el.classList.add(vissutoClass(vissuto, stimato));
}

function sortOnBlur() {
  setTimeout(renderActivities, 50);
}

function toggleSel(id, checked) {
  const p = punteggio(id);
  if (p) p.sel = checked;
  const row = document.querySelector(`.act-row[data-id="${id}"]`);
  if (row) row.classList.toggle('is-selected', checked);
  syncVPBtn();
  autoSave();
}

function syncVPBtn() {
  const btn = document.getElementById('btn-vp');
  if (!btn) return;
  const any = activePunteggi().some(p => p.sel);
  btn.disabled = !any;
}

function autoSave() {
  try { localStorage.setItem('suds_draft', JSON.stringify(patient)); } catch(e) {}
  markUnsaved();
}

function saveJSON() {
  if (window.showSaveFilePicker && fileHandle) {
    saveToFileHandle(fileHandle);
  } else {
    exportJSON();
  }
}

async function saveToFileHandle(handle) {
  try {
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(patient, null, 2));
    await writable.close();
    markSaved();
    syncSaveBtn();
    toast('File aggiornato correttamente.');
  } catch (err) {
    console.error(err);
    exportJSON();
  }
}

async function exportJSON() {
  const fileName = `SUDS_${patient.cognome}_${patient.nome}_${patient.id}.json`;
  const content = JSON.stringify(patient, null, 2);

  if (window.showSaveFilePicker) {
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }]
      });
      if (fileHandle) {
          syncSaveBtn();
          saveToFileHandle(fileHandle);
          return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  const blob = new Blob([content], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  markSaved();
  syncSaveBtn();
  toast('Scheda scaricata come JSON.');
}

function triggerImport() {
  if (window.showOpenFilePicker) {
    importWithFS();
  } else {
    const el = document.getElementById('file-import');
    if (el) el.click();
  }
}

async function importWithFS() {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: 'JSON File', accept: { 'application/json': ['.json'] } }],
      multiple: false
    });
    fileHandle = handle;
    const file = await handle.getFile();
    const text = await file.text();
    processImportedJSON(text);
  } catch (err) {
    if (err.name !== 'AbortError') toast('Errore nel caricamento.', 'err');
  }
}

function onFileImport(e) {
  const f = e.target.files[0];
  if (!f) return;
  fileHandle = null;
  const r = new FileReader();
  r.onload = ev => processImportedJSON(ev.target.result);
  r.readAsText(f);
  e.target.value = '';
}

function processImportedJSON(text) {
  try {
    let data = JSON.parse(text);
    if (!data.id || !data.nome || !data.cognome) { toast('File non valido.', 'err'); return; }
    const wasV1 = !data.v || data.v < 2;
    if (wasV1) data = migrateV1toV2(data);
    patient = data;
    currentSessionId = patient.sessioni[patient.sessioni.length - 1].id;
    renderPatient();
    showView('view-patient');
    toast(wasV1 ? 'Scheda aggiornata al formato corrente.' : 'Scheda caricata.');
  } catch {
    toast('Errore nella lettura del file.', 'err');
  }
}

function migrateV1toV2(data) {
  const attivita = (data.attivita || []).map(a => ({
    id:         a.id   || uidAct(),
    desc:       a.desc || a.descrizione || '',
    target:     a.target ?? null,
    archiviata: a.archiviata ?? false,
  }));
  const sessId = 'sess_' + uidAct();
  return {
    v: 2,
    id: data.id,
    nome: data.nome,
    cognome: data.cognome,
    attivita,
    sessioni: [{
      id: sessId,
      data: today(),
      locked: false,
      notePrivate: '',
      titolo: '',
      noteVPGenerale: '',
      punteggi: (data.attivita || []).map((a, i) => ({
        attivita_id: attivita[i].id,
        stimato: a.score ?? a.punteggio ?? 0,
        vissuto: null,
        sel: a.sel ?? a.selected ?? false,
        noteVP: '',
      }))
    }]
  };
}

function initFromHash() {
  const hash  = window.location.hash;
  const match = hash.match(/^#view=voglio-provare&data=(.+)$/);
  if (!match) return;
  try {
    const decoded = b64decode(decodeURIComponent(match[1]));
    const data    = JSON.parse(decoded);
    if (!data.nome || !Array.isArray(data.attivita)) return;
    renderQRView(data);
    showView('view-qr-read');
  } catch(e) {
    console.warn('QR decode failed:', e);
  }
}

function openSessionsModal() {
  renderSessionList();
  const copy = document.getElementById('new-sess-copy');
  if (copy) copy.checked = false;
  const title = document.getElementById('new-sess-title');
  if (title) title.value = '';
  openModal('modal-sessions');
}

function switchSession(id) {
  currentSessionId = id;
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
}

function goHome() {
  if (patient && patient.attivita.length > 0) {
    if (!confirm('Tornando alla home perderai le modifiche non salvate. Continuare?')) return;
  }
  patient = null;
  currentSessionId = null;
  fileHandle = null;
  showView('view-home');
}

/* ===== INITIALIZATION & EVENTS ===== */
document.addEventListener('DOMContentLoaded', () => {
  initFromHash();
  
  try {
    const raw = localStorage.getItem('suds_draft');
    if (raw) {
      const data    = JSON.parse(raw);
      const last    = data.sessioni?.[data.sessioni.length - 1];
      const dateStr = last ? ` del ${formatDate(last.data)}` : '';
      if (confirm(`Trovata sessione non salvata di ${data.nome} ${data.cognome}${dateStr}.\nRipristinare?`)) {
        patient           = data;
        currentSessionId  = patient.sessioni[patient.sessioni.length - 1].id;
        renderPatient();
        showView('view-patient');
      } else {
        localStorage.removeItem('suds_draft');
      }
    }
  } catch(e) {}
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['modal-new', 'modal-sessions', 'modal-notes', 'modal-templates'].forEach(id => closeModal(id));
    closePresentazione();
    closeVPView();
    closeProgressiView();
    if (document.getElementById('view-qr-read').classList.contains('active')) showView('view-home');
  }
  if (e.key === 'f' || e.key === 'F') {
    const inInput = ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName);
    if (!inInput && patient && document.getElementById('view-patient').classList.contains('active')) {
      openPresentazione();
    }
  }
});

const inNome = document.getElementById('in-nome');
if (inNome) {
    inNome.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('in-cognome').focus();
    });
}

const inCognome = document.getElementById('in-cognome');
if (inCognome) {
    inCognome.addEventListener('keydown', e => {
      if (e.key === 'Enter') createPatient();
    });
}

document.querySelectorAll('.overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    if (e.target === ov) {
      ov.classList.remove('open');
    }
  });
});

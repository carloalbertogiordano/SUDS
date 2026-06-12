'use strict';

function switchSessionModal(id) {
  switchSession(id);
  renderSessionList();
}

function deleteSession(event, id) {
  if (event) event.stopPropagation();
  if (!confirm(t('confirm.delete-session'))) return;
  patient.sessioni = patient.sessioni.filter(s => s.id !== id);
  if (currentSessionId === id) {
    currentSessionId = patient.sessioni[patient.sessioni.length - 1].id;
  }
  renderSessionList();
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
  autoSave();
  toast(t('toast.session-deleted'));
}

function deleteCurrentSession() {
  if (patient.sessioni.length <= 1) {
    toast(t('toast.session-only'), 'err');
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
  toast(t('toast.session-created'));
}

function lockSession() {
  const sess = activeSession();
  if (!sess) return;
  if (!confirm(t('confirm.lock-session'))) return;
  sess.locked = true;
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
  autoSave();
  toast(t('toast.session-locked'));
}

function unlockSession() {
  const sess = activeSession();
  if (!sess) return;
  if (!confirm(t('confirm.unlock-session'))) return;
  sess.locked = false;
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
  autoSave();
  toast(t('toast.session-unlocked'));
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
  toast(t('toast.notes-saved'));
}

function addActivity() {
  if (activeSession()?.locked) return;
  const actId = uidAct();
  patient.attivita.push({ id: actId, desc: '', target: null, archiviata: false, addedInSession: currentSessionId });
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
  if (a) { a.archiviata = true; renderActivities(); syncVPBtn(); autoSave(); toast(t('toast.act-archived')); }
}

function unarchiveActivity(id) {
  if (activeSession()?.locked) return;
  const a = patient.attivita.find(a => a.id === id);
  if (a) { a.archiviata = false; renderActivities(); syncVPBtn(); autoSave(); toast(t('toast.act-restored')); }
}

function toggleShowArchived() {
  showArchived = !showArchived;
  renderActivities();
}

function updateTarget(id, val) {
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

function getTemplates() {
  return [
    {
      id: 'fobia-sociale',
      nome: t('tpl.social-phobia.name'),
      attivita: [
        { desc: t('tpl.social-phobia.0'), stimato: 10 },
        { desc: t('tpl.social-phobia.1'), stimato: 20 },
        { desc: t('tpl.social-phobia.2'), stimato: 35 },
        { desc: t('tpl.social-phobia.3'), stimato: 45 },
        { desc: t('tpl.social-phobia.4'), stimato: 55 },
        { desc: t('tpl.social-phobia.5'), stimato: 60 },
        { desc: t('tpl.social-phobia.6'), stimato: 70 },
        { desc: t('tpl.social-phobia.7'), stimato: 85 },
      ],
    },
    {
      id: 'ansia-prestazione',
      nome: t('tpl.perf.name'),
      attivita: [
        { desc: t('tpl.perf.0'), stimato: 10 },
        { desc: t('tpl.perf.1'), stimato: 20 },
        { desc: t('tpl.perf.2'), stimato: 40 },
        { desc: t('tpl.perf.3'), stimato: 55 },
        { desc: t('tpl.perf.4'), stimato: 65 },
        { desc: t('tpl.perf.5'), stimato: 75 },
        { desc: t('tpl.perf.6'), stimato: 85 },
      ],
    },
    {
      id: 'agorafobia',
      nome: t('tpl.agora.name'),
      attivita: [
        { desc: t('tpl.agora.0'), stimato: 10 },
        { desc: t('tpl.agora.1'), stimato: 20 },
        { desc: t('tpl.agora.2'), stimato: 35 },
        { desc: t('tpl.agora.3'), stimato: 50 },
        { desc: t('tpl.agora.4'), stimato: 60 },
        { desc: t('tpl.agora.5'), stimato: 70 },
        { desc: t('tpl.agora.6'), stimato: 80 },
        { desc: t('tpl.agora.7'), stimato: 85 },
      ],
    },
  ];
}

let _selectedTemplate = null;

function openTemplatesModal() {
  if (activeSession()?.locked) { toast(t('toast.locked-err'), 'err'); return; }
  _selectedTemplate = null;
  const list = document.getElementById('template-list');
  if (list) {
    list.innerHTML = getTemplates().map(tpl => `
      <div class="template-item" data-id="${tpl.id}" onclick="selectTemplate('${tpl.id}')">
        <div class="template-item-name">${tpl.nome}</div>
        <div class="template-item-preview">${tpl.attivita.map(a => a.desc).join(' · ')}</div>
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
  if (!_selectedTemplate) { toast(t('toast.sel-template'), 'err'); return; }
  const tpl = getTemplates().find(tpl => tpl.id === _selectedTemplate);
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
  toast(t('toast.tpl-applied', { name: tpl.nome }));
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
  toast(t('toast.csv-exported'));
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
    toast(t('toast.file-updated'));
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
  toast(t('toast.file-downloaded'));
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
    if (err.name !== 'AbortError') toast(t('toast.load-error'), 'err');
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
    if (!data.id || !data.nome || !data.cognome) { toast(t('toast.file-invalid'), 'err'); return; }
    const wasV1 = !data.v || data.v < 2;
    if (wasV1) data = migrateV1toV2(data);
    patient = data;
    currentSessionId = patient.sessioni[patient.sessioni.length - 1].id;
    renderPatient();
    showView('view-patient');
    toast(wasV1 ? t('toast.migrated') : t('toast.loaded'));
  } catch {
    toast(t('toast.read-error'), 'err');
  }
}

function migrateV1toV2(data) {
  const attivita = (data.attivita || []).map(a => ({
    id:               a.id   || uidAct(),
    desc:             a.desc || a.descrizione || '',
    target:           a.target ?? null,
    archiviata:       a.archiviata ?? false,
    addedInSession:   a.addedInSession ?? null,
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
    const raw  = JSON.parse(decoded);
    const data = normalizeQRPayload(raw);
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
    if (!confirm(t('confirm.go-home'))) return;
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
      const dateStr = last ? t('sess.date-sep') + formatDate(last.data) : '';
      if (confirm(t('confirm.restore-draft', { name: `${data.nome} ${data.cognome}`, date: dateStr }))) {
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
    ['modal-new', 'modal-sessions', 'modal-notes', 'modal-templates', 'modal-compare'].forEach(id => closeModal(id));
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

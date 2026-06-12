'use strict';

let chartInstances = [];
let presentaHidden = new Set();
const CHART_COLORS = [
  '#5B8E9F', '#4A8A6A', '#C87941', '#7B6FAF',
  '#B85757', '#3D9EA8', '#8B6F45', '#5B9F7A',
];

function activeSession() {
  return patient?.sessioni?.find(s => s.id === currentSessionId) ?? null;
}

function activePunteggi() {
  return activeSession()?.punteggi ?? [];
}

function punteggio(attivita_id) {
  return activePunteggi().find(p => p.attivita_id === attivita_id) ?? null;
}

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

const _hasFileAPI = typeof window.showSaveFilePicker === 'function';

function markUnsaved() {
  _unsaved = true;
  const btn = document.getElementById('btn-save');
  if (btn) btn.classList.add('has-changes');
}

function markSaved() {
  _unsaved = false;
  const btn = document.getElementById('btn-save');
  if (btn) btn.classList.remove('has-changes');
}

function syncSaveBtn() {
  const btn = document.getElementById('btn-save');
  if (!btn) return;
  if (!_hasFileAPI) {
    btn.textContent = t('bar.save-download');
    btn.dataset.tooltip = t('bar.save-tt-download');
  } else if (fileHandle) {
    btn.textContent = t('bar.save-overwrite');
    btn.dataset.tooltip = t('bar.save-tt-overwrite');
  } else {
    btn.textContent = t('bar.save-export');
    btn.dataset.tooltip = t('bar.save-tt-export');
  }
  btn.classList.toggle('has-changes', _unsaved);
}

function renderPatient() {
  document.getElementById('pt-name').textContent = `${patient.nome} ${patient.cognome}`;
  document.getElementById('pt-code').textContent = t('bar.code', { id: patient.id });
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
  syncSaveBtn();
}

function renderSessionSelector() {
  const select = document.getElementById('sess-select');
  if (!select) return;
  select.innerHTML = patient.sessioni.slice().reverse().map((s, i) => {
    const n     = patient.sessioni.length - i;
    const lock  = s.locked ? ' 🔒' : '';
    const title = s.titolo ? ` · ${s.titolo}` : '';
    const label = t('sess.n', { n }) + t('sess.date-sep') + formatDate(s.data) + title + lock;
    return `<option value="${s.id}" ${s.id === currentSessionId ? 'selected' : ''}>${label}</option>`;
  }).join('');

  const sess      = activeSession();
  const btnLock   = document.getElementById('btn-lock');
  const badgeLock = document.getElementById('badge-locked');
  const btnAdd    = document.getElementById('btn-add-act');
  const btnUnlock = document.getElementById('btn-unlock');
  const btnDel    = document.getElementById('btn-delete-session');

  const isLocked = sess?.locked ?? false;
  const canDelete = !isLocked && patient.sessioni.length > 1;

  if (isLocked) {
    if (btnLock) btnLock.style.display   = 'none';
    if (badgeLock) badgeLock.style.display = '';
    if (btnUnlock) btnUnlock.style.display = '';
    if (btnDel) btnDel.style.display = 'none';
    if (btnAdd) {
        btnAdd.disabled         = true;
        btnAdd.style.opacity    = '.4';
        btnAdd.style.cursor     = 'not-allowed';
    }
  } else {
    if (btnLock) btnLock.style.display   = '';
    if (badgeLock) badgeLock.style.display = 'none';
    if (btnUnlock) btnUnlock.style.display = 'none';
    if (btnDel) btnDel.style.display = canDelete ? '' : 'none';
    if (btnAdd) {
        btnAdd.disabled         = false;
        btnAdd.style.opacity    = '';
        btnAdd.style.cursor     = '';
    }
  }
}

function renderSessionList() {
  const list = document.getElementById('sess-list');
  if (!list) return;
  list.innerHTML = patient.sessioni.slice().reverse().map((s, i) => {
    const n         = patient.sessioni.length - i;
    const isActive  = s.id === currentSessionId;
    const canDelete = !s.locked && patient.sessioni.length > 1;
    return `
    <div class="sess-item${isActive ? ' sess-active' : ''}"
         onclick="${isActive ? '' : `switchSessionModal('${s.id}')`}">
      <div class="sess-item-info">
        <div class="sess-item-name">${t('sess.n', { n })}${s.locked ? ' 🔒' : ''} <span class="sess-item-date">${formatDate(s.data)}</span></div>
        <input class="sess-title-input" value="${esc(s.titolo || '')}"
               placeholder="${t('modal.sessions.title-input-ph')}"
               onclick="event.stopPropagation()"
               onchange="updateSessionTitolo('${s.id}', this.value)">
      </div>
      ${canDelete
        ? `<button class="btn-del" onclick="deleteSession(event,'${s.id}')" title="Elimina">&#215;</button>`
        : ''}
    </div>`;
  }).join('');
}

function sorted(includeArchived = false) {
  const sess = activeSession();
  if (!sess) return [];
  return [...patient.attivita]
    .filter(a => includeArchived || !a.archiviata)
    .sort((a, b) => {
      const pa = sess.punteggi.find(p => p.attivita_id === a.id)?.stimato ?? 0;
      const pb = sess.punteggi.find(p => p.attivita_id === b.id)?.stimato ?? 0;
      return pa - pb;
    });
}

function vissutoClass(vissuto, stimato) {
  if (vissuto === null || vissuto === undefined) return 'vissuto-empty';
  if (vissuto < stimato)  return 'vissuto-better';
  if (vissuto > stimato)  return 'vissuto-worse';
  return 'vissuto-same';
}

function actRowHTML(a, i, sess, locked, archived) {
  const p       = sess?.punteggi.find(p => p.attivita_id === a.id);
  const stimato = p?.stimato ?? 0;
  const vissuto = p?.vissuto ?? null;
  const target  = a.target ?? null;
  const sel     = p?.sel ?? false;
  const vc      = vissutoClass(vissuto, stimato);
  const vissVal = vissuto !== null ? vissuto : '';
  const targVal = target !== null ? target : '';
  const ro      = locked ? 'readonly' : '';
  const dis     = locked ? 'disabled' : '';

  return `
  <div class="act-row${sel ? ' is-selected' : ''}${locked ? ' is-locked' : ''}${archived ? ' is-archived' : ''}" data-id="${a.id}">
    ${archived
      ? '<span class="act-rank act-archived-label">📦</span>'
      : `<input type="checkbox" class="act-check" ${sel ? 'checked' : ''}
               onchange="toggleSel('${a.id}', this.checked)">`}
    <span class="act-rank">${archived ? '' : i + 1}</span>
    <input type="text" class="act-desc-input" value="${esc(a.desc)}"
           placeholder="${t('act.placeholder')}" ${archived ? 'readonly' : ro}
           oninput="updateDesc('${a.id}', this.value)">
    <div class="act-score-wrap">
      <div class="score-col">
        <span class="score-col-label">${t('act.stimato')}</span>
        <div class="score-input-row">
          <input type="number" class="act-score-input" value="${stimato}"
                 min="0" max="100" ${archived ? 'readonly' : ro}
                 oninput="updateStimato('${a.id}', this.value)"
                 onblur="sortOnBlur()">
          <span class="score-denom">/100</span>
        </div>
      </div>
      <div class="score-col">
        <span class="score-col-label">${t('act.vissuto')}</span>
        <div class="score-input-row">
          <input type="number" class="act-score-input vissuto-input ${vc}"
                 value="${vissVal}" min="0" max="100" placeholder="—" ${archived ? 'readonly' : ro}
                 oninput="updateVissuto('${a.id}', this.value)">
          <span class="score-denom">/100</span>
        </div>
      </div>
      <div class="score-col score-col-target">
        <span class="score-col-label">${t('act.target')}</span>
        <div class="score-input-row">
          <input type="number" class="act-score-input target-input" value="${targVal}"
                 min="0" max="100" placeholder="—" ${archived ? 'readonly' : ''}
                 oninput="updateTarget('${a.id}', this.value)">
          <span class="score-denom">/100</span>
        </div>
      </div>
    </div>
    ${archived
      ? `<button class="btn-arch btn-unarch" onclick="unarchiveActivity('${a.id}')" title="${t('act.unarchive-tt')}" ${dis}>&#8593;</button>`
      : `<button class="btn-arch" onclick="archiveActivity('${a.id}')" title="${t('act.archive-tt')}" ${dis}>&#128451;</button>
         <button class="btn-del" onclick="deleteActivity('${a.id}')" title="${t('act.delete-tt')}" ${dis}>&#215;</button>`}
  </div>`;
}

function renderActivities() {
  const list  = document.getElementById('act-list');
  const empty = document.getElementById('act-empty');
  const sess  = activeSession();
  const locked = sess?.locked ?? false;

  const active   = sorted().filter(a => !a.archiviata);
  const archived = patient?.attivita.filter(a => a.archiviata) ?? [];

  if (!active.length && !archived.length) {
    if (list) list.style.display  = 'none';
    if (empty) empty.style.display = '';
    updateArchivedToggle(archived.length);
    return;
  }

  if (list) list.style.display  = 'flex';
  if (empty) empty.style.display = 'none';

  let html = active.map((a, i) => actRowHTML(a, i, sess, locked, false)).join('');

  if (archived.length) {
    html += `<div class="archived-separator">
      <button class="btn-arch-toggle" onclick="toggleShowArchived()">
        ${showArchived ? '&#9650;' : '&#9660;'} ${t('act.archived-section', { n: archived.length })}
      </button>
    </div>`;
    if (showArchived) {
      html += archived.map(a => actRowHTML(a, 0, sess, locked, true)).join('');
    }
  }

  if (list) list.innerHTML = html;
  updateArchivedToggle(archived.length);
}

function updateArchivedToggle(count) {
  const btn = document.getElementById('btn-archived-toggle');
  if (!btn) return;
  btn.style.display = count ? '' : 'none';
}

function openCompareModal() {
  const opts = patient.sessioni.slice().reverse().map((s, i) => {
    const n     = patient.sessioni.length - i;
    const title = s.titolo ? ` · ${s.titolo}` : '';
    const label = t('sess.n', { n }) + t('sess.date-sep') + formatDate(s.data) + title;
    return `<option value="${s.id}">${label}</option>`;
  }).join('');

  const selA = document.getElementById('compare-sess-a');
  const selB = document.getElementById('compare-sess-b');
  if (selA) selA.innerHTML = opts;
  if (selB) selB.innerHTML = opts;

  const ids = patient.sessioni.map(s => s.id);
  if (selA && ids.length >= 1) selA.value = ids[ids.length - 1];
  if (selB && ids.length >= 2) selB.value = ids[ids.length - 2];
  else if (selB && ids.length === 1) selB.value = ids[0];

  renderCompareTable();
  openModal('modal-compare');
}

function renderCompareTable() {
  const wrap = document.getElementById('compare-table-wrap');
  if (!wrap) return;

  const idA  = document.getElementById('compare-sess-a')?.value;
  const idB  = document.getElementById('compare-sess-b')?.value;
  const sessA = patient.sessioni.find(s => s.id === idA);
  const sessB = patient.sessioni.find(s => s.id === idB);
  if (!sessA || !sessB) { wrap.innerHTML = ''; return; }

  const nA = patient.sessioni.indexOf(sessA) + 1;
  const nB = patient.sessioni.indexOf(sessB) + 1;

  const acts = [...patient.attivita]
    .filter(a => !a.archiviata)
    .sort((a, b) => {
      const pa = sessA.punteggi.find(p => p.attivita_id === a.id)?.stimato ?? 0;
      const pb = sessA.punteggi.find(p => p.attivita_id === b.id)?.stimato ?? 0;
      return pa - pb;
    });

  const hA = `Sess. ${nA}${sessA.titolo ? '<br><em>' + esc(sessA.titolo) + '</em>' : ''}<br><small>${formatDate(sessA.data)}</small>`;
  const hB = `Sess. ${nB}${sessB.titolo ? '<br><em>' + esc(sessB.titolo) + '</em>' : ''}<br><small>${formatDate(sessB.data)}</small>`;

  const rows = acts.map(a => {
    const pA = sessA.punteggi.find(p => p.attivita_id === a.id);
    const pB = sessB.punteggi.find(p => p.attivita_id === a.id);
    const stA = pA?.stimato ?? null;
    const stB = pB?.stimato ?? null;
    const vsA = pA?.vissuto ?? null;
    const vsB = pB?.vissuto ?? null;
    const delta = stA !== null && stB !== null ? stB - stA : null;
    const dCls  = delta === null ? '' : delta < 0 ? 'delta-better' : delta > 0 ? 'delta-worse' : 'delta-same';
    const dStr  = delta === null ? '—' : (delta > 0 ? '+' : '') + delta;
    const fmtScore = (st, vs) => st !== null
      ? `${st}${vs !== null ? `<span class="compare-vissuto"> (${vs})</span>` : ''}`
      : '—';
    return `<tr>
      <td>${esc(a.desc) || '(senza nome)'}</td>
      <td class="compare-score">${fmtScore(stA, vsA)}</td>
      <td class="compare-score">${fmtScore(stB, vsB)}</td>
      <td class="compare-delta ${dCls}">${dStr}</td>
    </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="compare-table">
      <thead><tr>
        <th>${t('compare.col-activity')}</th>
        <th>${hA}</th>
        <th>${hB}</th>
        <th>Δ</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="compare-hint">${t('compare.hint')}</p>`;
}

function openProgressiView() {
  const el = document.getElementById('progressi-patient-name');
  if (el) el.textContent = `${patient.nome} ${patient.cognome}`;
  document.getElementById('view-progressi').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(renderCharts, 80);
}

function closeProgressiView() {
  chartInstances.forEach(c => c.destroy());
  chartInstances = [];
  document.getElementById('view-progressi').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCharts() {
  if (!window.Chart) return;
  chartInstances.forEach(c => c.destroy());
  chartInstances = [];

  const container = document.getElementById('progressi-charts');
  if (!container) return;
  container.innerHTML = '';

  const acts = patient.attivita.filter(a => !a.archiviata);
  if (!acts.length) {
    container.innerHTML = `<p style="color:var(--text-2);text-align:center;padding:48px 0">${t('presenta.no-acts')}</p>`;
    return;
  }

  acts.forEach((act, idx) => {
    const color = CHART_COLORS[idx % CHART_COLORS.length];

    // sessions since the activity was introduced
    const addedIdx = act.addedInSession
      ? Math.max(0, patient.sessioni.findIndex(s => s.id === act.addedInSession))
      : 0;
    const sessions = patient.sessioni.slice(addedIdx);

    const labels = sessions.map((s, i) => {
      const n = addedIdx + i + 1;
      return `${t('sess.n', { n })}${t('sess.date-sep')}${formatDate(s.data)}`;
    });

    const datasets = [];

    datasets.push({
      label:            t('chart.stimato'),
      data:             sessions.map(s => {
        const p = s.punteggi.find(p => p.attivita_id === act.id);
        return p !== undefined ? p.stimato : null;
      }),
      borderColor:      color,
      backgroundColor:  color + '22',
      tension:          0.3,
      pointRadius:      5,
      pointHoverRadius: 7,
      borderWidth:      2,
      spanGaps:         false,
    });

    datasets.push({
      label:            t('chart.vissuto'),
      data:             sessions.map(s => {
        const p = s.punteggi.find(p => p.attivita_id === act.id);
        return (p && p.vissuto !== null) ? p.vissuto : null;
      }),
      borderColor:      color,
      backgroundColor:  'transparent',
      borderDash:       [6, 4],
      tension:          0.3,
      pointRadius:      4,
      pointHoverRadius: 6,
      borderWidth:      1.5,
      spanGaps:         false,
    });

    if (act.target !== null && act.target !== undefined) {
      datasets.push({
        label:           t('chart.target'),
        data:            sessions.map(() => act.target),
        borderColor:     color,
        backgroundColor: 'transparent',
        borderDash:      [2, 5],
        borderWidth:     1,
        pointRadius:     0,
        spanGaps:        true,
      });
    }

    const canvasId = `chart-act-${act.id}`;
    const card = document.createElement('div');
    card.className = 'prog-chart-card';
    card.innerHTML = `
      <div class="prog-chart-title">${esc(act.desc) || t('act.no-name')}</div>
      <div class="prog-chart-wrap"><canvas id="${canvasId}"></canvas></div>`;
    container.appendChild(card);

    const instance = new Chart(document.getElementById(canvasId).getContext('2d'), {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        interaction:         { mode: 'index', intersect: false },
        scales: {
          y: {
            min: 0, max: 100,
            grid:  { color: '#E4EEF1' },
            ticks: { stepSize: 20, color: '#5E7880' },
          },
          x: {
            grid:  { color: '#E4EEF1' },
            ticks: { color: '#5E7880', maxRotation: 30 },
          },
        },
        plugins: {
          legend: {
            labels: {
              color:         '#253238',
              usePointStyle: true,
              padding:       12,
              font:          { size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.parsed.y;
                if (val === null || val === undefined) return null;
                return `  ${ctx.dataset.label}: ${val}`;
              },
            },
          },
        },
      },
    });
    chartInstances.push(instance);
  });
}

function openPresentazione() {
  presentaHidden = new Set();
  renderPresentazione();
  document.getElementById('view-presenta').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePresentazione() {
  document.getElementById('view-presenta').classList.remove('open');
  document.body.style.overflow = '';
}

function renderPresentazione() {
  const sess = activeSession();
  const items = sorted();

  document.getElementById('presenta-patient').textContent =
    `${patient.nome} ${patient.cognome}  ·  #${patient.id}`;

  const body = document.getElementById('presenta-body');
  if (!body) return;

  if (!items.length) {
    body.innerHTML =
      `<p style="color:var(--text-2);font-size:22px;text-align:center;padding:80px 0">${t('presenta.no-acts')}</p>`;
    return;
  }

  body.innerHTML = items.map((a, i) => {
    const p       = sess?.punteggi.find(p => p.attivita_id === a.id);
    const stimato = p?.stimato ?? 0;
    const vissuto = p?.vissuto ?? null;

    let vissutoHtml = '';
    if (vissuto !== null) {
      const cls = vissuto < stimato ? 'better' : vissuto > stimato ? 'worse' : 'same';
      vissutoHtml = `
        <div class="presenta-score-group">
          <span class="presenta-score-label">${t('presenta.vissuto-label')}</span>
          <span class="presenta-vissuto-val ${cls}">${vissuto}</span>
        </div>`;
    }

    return `
    <div class="presenta-row" data-act-id="${a.id}">
      <span class="presenta-rank">${i + 1}</span>
      <span class="presenta-desc">${esc(a.desc) || '(senza nome)'}</span>
      <div class="presenta-scores">
        <div class="presenta-score-group">
          <span class="presenta-score-label">${t('presenta.stimato-label')}</span>
          <span class="presenta-score-val">${stimato}</span>
        </div>
        ${vissutoHtml}
      </div>
      <button class="presenta-toggle-btn" onclick="togglePresentaRow('${a.id}')" title="Nascondi riga">&#8854;</button>
    </div>`;
  }).join('');
}

function togglePresentaRow(id) {
  const row = document.querySelector(`.presenta-row[data-act-id="${id}"]`);
  if (!row) return;
  if (presentaHidden.has(id)) {
    presentaHidden.delete(id);
    row.classList.remove('hidden');
  } else {
    presentaHidden.add(id);
    row.classList.add('hidden');
  }
  updatePresentaHeader();
}

function resetPresentaToggle() {
  presentaHidden.clear();
  document.querySelectorAll('#presenta-body .presenta-row').forEach(r => r.classList.remove('hidden'));
  updatePresentaHeader();
}

function updatePresentaHeader() {
  const n   = presentaHidden.size;
  const btn = document.getElementById('presenta-reset');
  if (!btn) return;
  btn.textContent = n > 0 ? t('presenta.show-all', { n, e: currentLang === 'it' ? (n === 1 ? 'a' : 'e') : '' }) : '';
  btn.classList.toggle('visible', n > 0);
}

function renderQRView(data) {
  document.getElementById('qr-patient-name').textContent = data.nome;
  document.getElementById('qr-session-date').textContent = formatDate(data.data);

  const noteEl = document.getElementById('qr-note-generale');
  if (noteEl) {
    noteEl.textContent = data.noteGenerale || '';
    noteEl.style.display = data.noteGenerale ? '' : 'none';
  }

  const list = document.getElementById('qr-act-list');
  if (!list) return;

  list.innerHTML = data.attivita.map((a, i) => {
    const visHtml = a.vissuto !== null ? (() => {
      const cls = a.vissuto < a.stimato ? 'success' : a.vissuto > a.stimato ? 'worse' : 'same';
      return `<div class="qr-score-group">
        <span class="qr-score-label">${t('qr.vissuto-label')}</span>
        <span class="qr-score-val qr-vissuto ${cls}">${a.vissuto}<span class="qr-denom">/100</span></span>
      </div>`;
    })() : '';

    return `
    <div class="qr-act-card">
      <span class="qr-act-num">${i + 1}</span>
      <span class="qr-act-desc">${esc(a.desc || '(senza nome)')}</span>
      <div class="qr-scores">
        <div class="qr-score-group">
          <span class="qr-score-label">${t('qr.stimato-label')}</span>
          <span class="qr-score-val">${a.stimato}<span class="qr-denom">/100</span></span>
        </div>
        ${visHtml}
      </div>
    </div>`;
  }).join('');
}

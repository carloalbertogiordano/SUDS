'use strict';

let chartInstance = null;
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

function renderPatient() {
  document.getElementById('pt-name').textContent = `${patient.nome} ${patient.cognome}`;
  document.getElementById('pt-code').textContent = `Codice: #${patient.id}`;
  renderSessionSelector();
  renderActivities();
  syncVPBtn();
}

function renderSessionSelector() {
  const select = document.getElementById('sess-select');
  if (!select) return;
  select.innerHTML = patient.sessioni.slice().reverse().map((s, i) => {
    const n    = patient.sessioni.length - i;
    const lock = s.locked ? ' 🔒' : '';
    return `<option value="${s.id}" ${s.id === currentSessionId ? 'selected' : ''}>Sessione ${n} — ${formatDate(s.data)}${lock}</option>`;
  }).join('');

  const sess      = activeSession();
  const btnLock   = document.getElementById('btn-lock');
  const badgeLock = document.getElementById('badge-locked');
  const btnAdd    = document.getElementById('btn-add-act');
  const btnUnlock = document.getElementById('btn-unlock');

  if (sess?.locked) {
    if (btnLock) btnLock.style.display   = 'none';
    if (badgeLock) badgeLock.style.display = '';
    if (btnUnlock) btnUnlock.style.display = '';
    if (btnAdd) {
        btnAdd.disabled         = true;
        btnAdd.style.opacity    = '.4';
        btnAdd.style.cursor     = 'not-allowed';
    }
  } else {
    if (btnLock) btnLock.style.display   = '';
    if (badgeLock) badgeLock.style.display = 'none';
    if (btnUnlock) btnUnlock.style.display = 'none';
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
        <div class="sess-item-name">Sessione ${n}${s.locked ? ' 🔒' : ''}</div>
        <div class="sess-item-date">${formatDate(s.data)}</div>
      </div>
      ${canDelete
        ? `<button class="btn-del" onclick="deleteSession(event,'${s.id}')" title="Elimina">&#215;</button>`
        : ''}
    </div>`;
  }).join('');
}

function sorted() {
  const sess = activeSession();
  if (!sess) return [];
  return [...patient.attivita].sort((a, b) => {
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

function renderActivities() {
  const list  = document.getElementById('act-list');
  const empty = document.getElementById('act-empty');
  const items = sorted();
  const sess  = activeSession();
  const locked = sess?.locked ?? false;

  if (!items.length) {
    if (list) list.style.display  = 'none';
    if (empty) empty.style.display = '';
    return;
  }

  if (list) list.style.display  = 'flex';
  if (empty) empty.style.display = 'none';

  if (list) {
    list.innerHTML = items.map((a, i) => {
      const p       = sess?.punteggi.find(p => p.attivita_id === a.id);
      const stimato = p?.stimato ?? 0;
      const vissuto = p?.vissuto ?? null;
      const sel     = p?.sel ?? false;
      const vc      = vissutoClass(vissuto, stimato);
      const vissVal = vissuto !== null ? vissuto : '';
      const ro      = locked ? 'readonly' : '';
      const dis     = locked ? 'disabled' : '';

      return `
      <div class="act-row${sel ? ' is-selected' : ''}${locked ? ' is-locked' : ''}" data-id="${a.id}">
        <input type="checkbox" class="act-check" ${sel ? 'checked' : ''}
               onchange="toggleSel('${a.id}', this.checked)">
        <span class="act-rank">${i + 1}</span>
        <input type="text" class="act-desc-input" value="${esc(a.desc)}"
               placeholder="Descrivi l'attività..." ${ro}
               oninput="updateDesc('${a.id}', this.value)">
        <div class="act-score-wrap">
          <div class="score-col">
            <span class="score-col-label">Stimato</span>
            <div class="score-input-row">
              <input type="number" class="act-score-input" value="${stimato}"
                     min="0" max="100" ${ro}
                     oninput="updateStimato('${a.id}', this.value)"
                     onblur="sortOnBlur()">
              <span class="score-denom">/100</span>
            </div>
          </div>
          <div class="score-col">
            <span class="score-col-label">Vissuto</span>
            <div class="score-input-row">
              <input type="number" class="act-score-input vissuto-input ${vc}"
                     value="${vissVal}" min="0" max="100" placeholder="—" ${ro}
                     oninput="updateVissuto('${a.id}', this.value)">
              <span class="score-denom">/100</span>
            </div>
          </div>
        </div>
        <button class="btn-del" onclick="deleteActivity('${a.id}')" title="Elimina" ${dis}>&#215;</button>
      </div>`;
    }).join('');
  }
}

function openProgressiView() {
  const el = document.getElementById('progressi-patient-name');
  if (el) el.textContent = `${patient.nome} ${patient.cognome}`;
  document.getElementById('view-progressi').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(renderChart, 80);
}

function closeProgressiView() {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  document.getElementById('view-progressi').classList.remove('open');
  document.body.style.overflow = '';
}

function renderChart() {
  if (!window.Chart) { return; }
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  const canvas   = document.getElementById('chart-canvas');
  if (!canvas) return;
  const ctx      = canvas.getContext('2d');
  const labels   = patient.sessioni.map((s, i) => `S${i + 1} — ${formatDate(s.data)}`);
  const datasets = [];

  patient.attivita.forEach((act, i) => {
    const color  = CHART_COLORS[i % CHART_COLORS.length];
    const hidden = i >= 5;

    datasets.push({
      label:          act.desc || '(senza nome)',
      isVissuto:      false,
      actIndex:       i,
      data:           patient.sessioni.map(s => {
        const p = s.punteggi.find(p => p.attivita_id === act.id);
        return p !== undefined ? p.stimato : null;
      }),
      borderColor:    color,
      backgroundColor: color + '18',
      tension:        0.3,
      pointRadius:    5,
      pointHoverRadius: 7,
      borderWidth:    2,
      hidden,
      spanGaps:       false,
    });

    datasets.push({
      label:          act.desc || '(senza nome)',
      isVissuto:      true,
      actIndex:       i,
      data:           patient.sessioni.map(s => {
        const p = s.punteggi.find(p => p.attivita_id === act.id);
        return (p && p.vissuto !== null) ? p.vissuto : null;
      }),
      borderColor:    color,
      backgroundColor: 'transparent',
      borderDash:     [6, 4],
      tension:        0.3,
      pointRadius:    4,
      pointHoverRadius: 6,
      borderWidth:    1.5,
      hidden,
      spanGaps:       false,
    });
  });

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      interaction:         { mode: 'index', intersect: false },
      scales: {
        y: {
          min: 0, max: 100,
          title: { display: true, text: 'Punteggio SUDS', color: '#5E7880', font: { size: 12 } },
          grid:  { color: '#E4EEF1' },
          ticks: { stepSize: 10, color: '#5E7880' },
        },
        x: {
          grid:  { color: '#E4EEF1' },
          ticks: { color: '#5E7880', maxRotation: 30 },
        },
      },
      plugins: {
        legend: {
          labels: {
            filter:        (item, data) => !data.datasets[item.datasetIndex].isVissuto,
            color:         '#253238',
            usePointStyle: true,
            padding:       16,
          },
          onClick: (e, legendItem, legend) => {
            const chart    = legend.chart;
            const actIndex = chart.data.datasets[legendItem.datasetIndex].actIndex;
            const isHidden = chart.getDatasetMeta(legendItem.datasetIndex).hidden ?? false;
            chart.data.datasets.forEach((ds, i) => {
              if (ds.actIndex === actIndex) chart.getDatasetMeta(i).hidden = !isHidden;
            });
            chart.update();
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed.y;
              if (val === null || val === undefined) return null;
              const type = ctx.dataset.isVissuto ? 'Vissuto' : 'Stimato';
              return `  ${ctx.dataset.label} — ${type}: ${val}`;
            },
          },
        },
      },
    },
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
      '<p style="color:var(--text-2);font-size:22px;text-align:center;padding:80px 0">Nessuna attività.</p>';
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
          <span class="presenta-score-label">Vissuto</span>
          <span class="presenta-vissuto-val ${cls}">${vissuto}</span>
        </div>`;
    }

    return `
    <div class="presenta-row" data-act-id="${a.id}">
      <span class="presenta-rank">${i + 1}</span>
      <span class="presenta-desc">${esc(a.desc) || '(senza nome)'}</span>
      <div class="presenta-scores">
        <div class="presenta-score-group">
          <span class="presenta-score-label">Stimato</span>
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
  btn.textContent = n > 0 ? `Mostra tutti (${n} nascost${n === 1 ? 'a' : 'e'})` : '';
  btn.classList.toggle('visible', n > 0);
}

function renderQRView(data) {
  document.getElementById('qr-patient-name').textContent = data.nome;
  document.getElementById('qr-session-date').textContent  = `Sessione del ${formatDate(data.data)}`;

  const list = document.getElementById('qr-act-list');
  if (!list) return;

  list.innerHTML = data.attivita.map((a, i) => {
    const visHtml = a.vissuto !== null ? (() => {
      const cls = a.vissuto < a.stimato ? 'var(--success)' : a.vissuto > a.stimato ? 'var(--warn)' : 'var(--primary)';
      return `
        <div class="score-col">
          <span class="score-col-label">Vissuto</span>
          <div class="score-input-row">
            <span style="font-size:24px;font-weight:700;font-family:'Lora',serif;color:${cls}">${a.vissuto}</span>
            <span class="score-denom">/100</span>
          </div>
        </div>`;
    })() : '';

    return `
    <div class="act-row">
      <span class="act-rank">${i + 1}</span>
      <span style="flex:1;padding:4px 8px;font-size:16px;color:var(--text)">${esc(a.desc || '(senza nome)')}</span>
      <div class="act-score-wrap">
        <div class="score-col">
          <span class="score-col-label">Stimato</span>
          <div class="score-input-row">
            <span style="font-size:24px;font-weight:700;font-family:'Lora',serif;color:var(--primary)">${a.stimato}</span>
            <span class="score-denom">/100</span>
          </div>
        </div>
        ${visHtml}
      </div>
    </div>`;
  }).join('');
}

'use strict';

function uid4() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function uidAct() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function normalizeQRPayload(data) {
  // Accepts both compact format {n,dt,ng,a:[{d,s,v}]} and legacy {nome,data,attivita:[{desc,stimato,vissuto}]}
  return {
    nome:         data.n  || data.nome  || '',
    data:         data.dt || data.data  || '',
    noteGenerale: data.ng || '',
    attivita: (data.a || data.attivita || []).map(a => ({
      desc:    a.d  || a.desc    || '',
      stimato: a.s  ?? a.stimato ?? 0,
      vissuto: (a.v !== undefined ? a.v : null) ?? a.vissuto ?? null,
    })),
  };
}

function b64decode(b64str) {
  const bytes = Uint8Array.from(atob(b64str), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast ' + type;
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

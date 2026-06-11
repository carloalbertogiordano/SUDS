'use strict';

let _pdfResult = null;

function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function buildQRPayload(selActs, sess) {
  return {
    nome:     `${patient.nome} ${patient.cognome}`,
    data:     sess?.data ?? today(),
    attivita: selActs.map(a => {
      const p = sess?.punteggi.find(p => p.attivita_id === a.id);
      return { desc: a.desc, stimato: p?.stimato ?? 0, vissuto: p?.vissuto ?? null };
    }),
  };
}

function openVPView() {
  const sess = activeSession();
  if (!sess) return;
  const selActs = sorted().filter(a => sess.punteggi.find(p => p.attivita_id === a.id)?.sel);
  if (!selActs.length) { toast('Seleziona almeno un\'attività.', 'err'); return; }

  document.getElementById('vp-patient-name').textContent = `${patient.nome} ${patient.cognome}`;
  document.getElementById('vp-general').value = '';
  const genBtn = document.getElementById('vp-genera-btn');
  genBtn.disabled    = false;
  genBtn.textContent = 'Genera PDF';
  document.getElementById('vp-result-bar').style.display = 'none';
  _pdfResult = null;

  document.getElementById('vp-acts').innerHTML = selActs.map(a => {
    const p = sess.punteggi.find(p => p.attivita_id === a.id);
    return `
    <div class="vp-act-card">
      <div class="vp-act-top">
        <span class="vp-badge">${p?.stimato ?? 0}</span>
        <span class="vp-act-name">${esc(a.desc) || '(attività senza nome)'}</span>
      </div>
      <label class="vp-note-label">Nota per questa attività</label>
      <textarea class="field-textarea" data-id="${a.id}"
                placeholder="Inserisci una nota specifica..."
                style="min-height:80px"></textarea>
    </div>`;
  }).join('');

  document.getElementById('view-vp').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVPView() {
  document.getElementById('view-vp').classList.remove('open');
  document.body.style.overflow = '';
  _pdfResult = null;
}

async function preparePDF() {
  const btn = document.getElementById('vp-genera-btn');
  btn.disabled    = true;
  btn.textContent = 'Generazione…';
  try {
    _pdfResult = await generatePDF();
    if (!_pdfResult) { btn.disabled = false; btn.textContent = 'Genera PDF'; return; }
    btn.innerHTML = '&#8635; Rigenera';
    btn.disabled    = false;
    
    const bar = document.getElementById('vp-result-bar');
    bar.style.display = 'flex';
    
    const canShare = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
    document.getElementById('vp-share-btn').style.display = canShare ? '' : 'none';
    
    // Show QR on screen
    renderQRToCanvas();
    
    toast('PDF pronto.');
  } catch(e) {
    console.error(e);
    toast('Errore nella generazione del PDF.', 'err');
    btn.disabled    = false;
    btn.textContent = 'Genera PDF';
  }
}

function getShareURL() {
  const sess    = activeSession();
  const selActs = sorted().filter(a => sess?.punteggi.find(p => p.attivita_id === a.id)?.sel);
  const payload = buildQRPayload(selActs, sess);
  const encoded = b64encode(JSON.stringify(payload));
  return `https://carloalbertogiordano.github.io/SUDS/#view=voglio-provare&data=${encodeURIComponent(encoded)}`;
}

async function renderQRToCanvas() {
  if (!window.QRCode) return;
  const url = getShareURL();
  const canvas = document.getElementById('qr-canvas-screen');
  if (!canvas) return;
  
  try {
    await QRCode.toCanvas(canvas, url, {
      width: 120,
      margin: 1,
      color: { dark: '#3D6E7E', light: '#FFFFFF' }
    });
    document.getElementById('vp-qr-on-screen').style.display = 'block';
  } catch (err) {
    console.error(err);
  }
}

function toggleQRSize() {
  const canvas = document.getElementById('qr-canvas-screen');
  if (canvas.style.width === '60px') {
    canvas.style.width = '240px';
    canvas.style.height = '240px';
    canvas.style.position = 'fixed';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.zIndex = '1000';
    canvas.style.boxShadow = '0 0 100px rgba(0,0,0,0.5)';
  } else {
    canvas.style.width = '60px';
    canvas.style.height = '60px';
    canvas.style.position = '';
    canvas.style.transform = '';
    canvas.style.boxShadow = '';
  }
}

function shareViaWhatsApp() {
  const url = getShareURL();
  const text = `Ecco la scheda SUDS Voglio Provare per ${patient.nome}: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareViaEmail() {
  const url = getShareURL();
  const subject = `Scheda SUDS Voglio Provare - ${patient.nome} ${patient.cognome}`;
  const body = `Puoi visualizzare la scheda al seguente link:\n\n${url}`;
  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}

function downloadPDF() {
  if (!_pdfResult) return;
  const url = URL.createObjectURL(_pdfResult.blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = _pdfResult.fname;
  a.click();
  URL.revokeObjectURL(url);
  toast('PDF salvato.');
}

async function sharePDF() {
  if (!_pdfResult) return;
  const file = new File([_pdfResult.blob], _pdfResult.fname, { type: 'application/pdf' });
  
  const shareData = {
    title: 'SUDS - Scheda Paziente',
    text: `Scheda Voglio Provare: ${patient.nome} ${patient.cognome}`,
    files: [file]
  };

  try {
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      toast('Condivisione non supportata su questo browser.', 'err');
    }
  } catch(e) {
    if (e.name !== 'AbortError') {
      console.error(e);
      toast('Errore nella condivisione.', 'err');
    }
  }
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) { toast('jsPDF non caricato. Connetti Internet e riprova.', 'err'); return null; }

  const sess    = activeSession();
  const selActs = sorted().filter(a => sess?.punteggi.find(p => p.attivita_id === a.id)?.sel);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW  = doc.internal.pageSize.getWidth();
  const PH  = doc.internal.pageSize.getHeight();
  const ML  = 22, MR = 22;
  const CW  = PW - ML - MR;
  let y     = 0;

  const C_PRIMARY   = [91, 142, 159];
  const C_PRIMARY_D = [61, 110, 126];
  const C_TEXT      = [37,  50,  56];
  const C_TEXT2     = [94, 120, 128];
  const C_LIGHT     = [227, 239, 243];
  const C_WHITE     = [255, 255, 255];

  const CPT = 13, CPB = 13, CPL = 8;
  const BW  = 26, BH  = 14;
  const BX  = ML + CPL;
  const NX  = BX + BW + 8;
  const NW  = CW - CPL - BW - 8 - 4;
  const NFS = 12, NLH = 8;
  const NGAP = 10, NLFS = 8.5, NLABEL_H = 7;
  const NoteFS = 10.5, NoteLH = 7;
  const NoteX  = ML + CPL + 4;
  const NoteW  = CW - CPL - 4 - 4;
  const CG  = 8;

  function lines(arr, x, startY, lh) {
    arr.forEach((ln, i) => doc.text(ln, x, startY + i * lh));
  }

  function addPage() { doc.addPage(); y = 24; }

  function checkY(needed) {
    if (y + needed > PH - 20) addPage();
  }

  doc.setFillColor(...C_PRIMARY);
  doc.rect(0, 0, PW, 40, 'F');
  doc.setTextColor(...C_WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Voglio Provare', ML, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const dateStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`${patient.nome} ${patient.cognome}  ·  #${patient.id}  ·  ${dateStr}`, ML, 32);
  y = 52;

  const genComment = document.getElementById('vp-general').value.trim();
  if (genComment) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const genLines = doc.splitTextToSize(genComment, CW - 16);
    const genBoxH  = 8 + 4 + genLines.length * 7 + 10;
    checkY(genBoxH + 16);
    doc.setFillColor(...C_LIGHT);
    doc.roundedRect(ML, y, CW, genBoxH, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C_TEXT2);
    doc.text('NOTE GENERALI', ML + 8, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...C_TEXT);
    lines(genLines, ML + 8, y + 8 + 4 + 7, 7);
    y += genBoxH + 14;
    doc.setDrawColor(...C_LIGHT);
    doc.setLineWidth(0.4);
    doc.line(ML, y, PW - MR, y);
    y += 12;
  }

  checkY(18);
  doc.setTextColor(...C_TEXT2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('ATTIVITÀ SELEZIONATE — ORDINATE PER PUNTEGGIO CRESCENTE', ML, y);
  y += 12;

  const noteMap = {};
  document.querySelectorAll('#vp-acts textarea[data-id]').forEach(ta => {
    noteMap[ta.dataset.id] = ta.value.trim();
  });

  selActs.forEach(act => {
    const p       = sess?.punteggi.find(p => p.attivita_id === act.id);
    const stimato = p?.stimato ?? 0;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(NFS);
    const nameLines = doc.splitTextToSize(act.desc || '(attività senza nome)', NW);

    const note      = noteMap[act.id] || '';
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(NoteFS);
    const noteLines = note ? doc.splitTextToSize(note, NoteW) : [];
    const hasNote   = noteLines.length > 0;

    const nameBlockH = nameLines.length * NLH;
    const topBlockH  = Math.max(BH, nameBlockH);
    const noteBlockH = hasNote ? NGAP + NLABEL_H + noteLines.length * NoteLH : 0;
    const cardH      = CPT + topBlockH + noteBlockH + CPB;

    checkY(cardH + CG);

    doc.setFillColor(...C_LIGHT);
    doc.roundedRect(ML, y, CW, cardH, 3, 3, 'F');

    const bTopY = y + CPT;
    doc.setFillColor(...C_PRIMARY);
    doc.roundedRect(BX, bTopY, BW, BH, 3, 3, 'F');
    doc.setTextColor(...C_WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(String(stimato), BX + BW / 2, bTopY + BH / 2 + 2.2, { align: 'center' });

    const nameBaseY = bTopY + 4;
    doc.setTextColor(...C_TEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(NFS);
    lines(nameLines, NX, nameBaseY, NLH);

    if (hasNote) {
      const noteSectionY = y + CPT + topBlockH + NGAP;
      doc.setTextColor(...C_PRIMARY_D);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(NLFS);
      doc.text('Nota:', NoteX, noteSectionY + NLABEL_H - 1);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(NoteFS);
      doc.setTextColor(...C_TEXT2);
      lines(noteLines, NoteX, noteSectionY + NLABEL_H - 1 + NoteLH, NoteLH);
    }

    y += cardH + CG;
  });

  // QR code — below last card, right-aligned
  try {
    if (window.QRCode) {
      const payload    = buildQRPayload(selActs, sess);
      const payloadStr = JSON.stringify(payload);
      const encoded    = b64encode(payloadStr);
      const qrUrl      = `https://carloalbertogiordano.github.io/SUDS/#view=voglio-provare&data=${encodeURIComponent(encoded)}`;
      if (qrUrl.length <= 1800) {
        const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 200, margin: 1, color: { dark: '#3D6E7E', light: '#FFFFFF' } });
        const QR_H = 28; // QR image + caption height (mm)
        checkY(QR_H + 4);
        const qrX = PW - MR - 26;
        doc.addImage(qrDataUrl, 'PNG', qrX, y, 24, 24);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C_TEXT2);
        doc.text('Scansiona per rileggere', qrX + 12, y + 25.5, { align: 'center' });
        y += QR_H;
      }
    }
  } catch(e) { /* QR non bloccante */ }

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C_TEXT2);
    doc.text(
      `SUDS — Scala di Disagio Soggettivo  ·  Pagina ${p} di ${totalPages}`,
      PW / 2, PH - 9, { align: 'center' }
    );
  }

  const fname = `VoglioProvare_${patient.cognome}_${patient.id}_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.pdf`;
  const blob  = doc.output('blob');
  return { blob, fname };
}

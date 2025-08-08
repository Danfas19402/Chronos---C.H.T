// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  if (document.querySelector('#timeTable tbody tr') === null || document.querySelectorAll('#timeTable tbody tr').length === 0) {
    addRow(); // linha inicial
  }
  updateTotal();
});

// ---------- utilitários ----------
function timeToMinutes(t) {
  if (!t) return NaN;
  const [hh, mm] = t.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
  return hh * 60 + mm;
}
function minutesToHM(min) {
  if (!Number.isFinite(min) || min <= 0) return '0h 0min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}min`;
}
function minutesToHHMM(min) {
  if (!Number.isFinite(min) || min < 0) return '00:00';
  const h = Math.floor(min / 60).toString().padStart(2,'0');
  const m = (min % 60).toString().padStart(2,'0');
  return `${h}:${m}`;
}

// ---------- criação de linhas ----------
function createCellWith(element) {
  const td = document.createElement('td');
  td.appendChild(element);
  return td;
}

function addRow(data = {}) {
  const tbody = document.querySelector('#timeTable tbody');
  const tr = document.createElement('tr');

  // inputs
  const inDate = document.createElement('input'); inDate.type = 'date'; inDate.value = data.date || '';
  const inEntrada = document.createElement('input'); inEntrada.type = 'time'; inEntrada.value = data.entrada || '';
  const inAlmocoStart = document.createElement('input'); inAlmocoStart.type = 'time'; inAlmocoStart.value = data.almocoStart || '';
  const inAlmocoRet = document.createElement('input'); inAlmocoRet.type = 'time'; inAlmocoRet.value = data.almocoRet || '';
  const inSaida = document.createElement('input'); inSaida.type = 'time'; inSaida.value = data.saida || '';

  const tdHoras = document.createElement('td'); tdHoras.className = 'horas'; tdHoras.innerText = '0h 0min';

  const btnRem = document.createElement('button'); btnRem.innerText = '❌';
  btnRem.onclick = () => { tr.remove(); updateTotal(); saveData(); };

  tr.appendChild(createCellWith(inDate));
  tr.appendChild(createCellWith(inEntrada));
  tr.appendChild(createCellWith(inAlmocoStart));
  tr.appendChild(createCellWith(inAlmocoRet));
  tr.appendChild(createCellWith(inSaida));
  tr.appendChild(tdHoras);
  tr.appendChild(createCellWith(btnRem));

  // listeners para recalcular quando digitar
  [inEntrada, inAlmocoStart, inAlmocoRet, inSaida].forEach(inp => {
    inp.addEventListener('input', () => {
      updateRowHours(tr);
      updateTotal();
      saveData();
    });
  });
  inDate.addEventListener('change', () => saveData());

  tbody.appendChild(tr);

  // atualiza a linha caso dados vieram preenchidos
  updateRowHours(tr);
  updateTotal();
  saveData();
}

function addFolga(date = '') {
  const tbody = document.querySelector('#timeTable tbody');
  const tr = document.createElement('tr');

  const inDate = document.createElement('input'); inDate.type = 'date'; inDate.value = date;

  const tdLabel = document.createElement('td');
  tdLabel.colSpan = 4;
  tdLabel.style.textAlign = 'center';
  tdLabel.style.color = 'gray';
  tdLabel.innerText = 'FOLGA';

  const tdHoras = document.createElement('td'); tdHoras.className = 'horas'; tdHoras.innerText = '00:00';
  const btnRem = document.createElement('button'); btnRem.innerText = '❌';
  btnRem.onclick = () => { tr.remove(); updateTotal(); saveData(); };

  const tdDate = document.createElement('td'); tdDate.appendChild(inDate);

  // estrutura: [date][colspan=4 Folga][horas][remover]
  tr.appendChild(tdDate);
  tr.appendChild(tdLabel);
  tr.appendChild(tdHoras);
  tr.appendChild(createCellWith(btnRem));

  tbody.appendChild(tr);
  saveData();
  updateTotal();
}

// ---------- cálculo por linha ----------
function updateRowHours(tr) {
  const tds = tr.querySelectorAll('td');
  // detecta folga: segunda célula tem colspan
  if (tds[1] && tds[1].hasAttribute && tds[1].hasAttribute('colspan')) {
    // folga: mantém 00:00
    const horasTd = tr.querySelector('.horas');
    if (horasTd) horasTd.innerText = '00:00';
    return;
  }

  // indices: 0=date,1=entrada,2=almocoStart,3=almocoRet,4=saida,5=horas
  const entrada = tds[1].querySelector('input')?.value;
  const almocoStart = tds[2].querySelector('input')?.value;
  const almocoRet = tds[3].querySelector('input')?.value;
  const saida = tds[4].querySelector('input')?.value;
  const horasTd = tds[5];

  if (!entrada || !saida) {
    if (horasTd) horasTd.innerText = '0h 0min';
    return;
  }

  let e = timeToMinutes(entrada);
  let s = timeToMinutes(saida);
  if (!Number.isFinite(e) || !Number.isFinite(s)) { if (horasTd) horasTd.innerText = '0h 0min'; return; }

  let total = s - e;
  // se cruzou meia-noite
  if (total < 0) total += 24 * 60;

  if (almocoStart && almocoRet) {
    const a1 = timeToMinutes(almocoStart);
    const a2 = timeToMinutes(almocoRet);
    if (Number.isFinite(a1) && Number.isFinite(a2)) {
      let lunch = a2 - a1;
      if (lunch < 0) lunch += 24 * 60;
      total -= lunch;
    }
  }

  if (total < 0) total = 0;

  if (horasTd) horasTd.innerText = minutesToHM(total);
  return total;
}

// ---------- total geral ----------
function updateTotal() {
  let totalMin = 0;
  const rows = document.querySelectorAll('#timeTable tbody tr');

  rows.forEach(row => {
    const tds = row.querySelectorAll('td');
    if (tds.length === 0) return;

    // pular se folga (segunda celula com colspan)
    if (tds[1] && tds[1].hasAttribute && tds[1].hasAttribute('colspan')) return;

    const minutos = updateRowHours(row);
    if (Number.isFinite(minutos)) totalMin += minutos;
  });

  const out = document.getElementById('total');
  out.innerText = `Total: ${minutesToHM(totalMin)}`;
}

// ---------- persistência ----------
function saveData() {
  const rows = document.querySelectorAll('#timeTable tbody tr');
  const data = [];
  rows.forEach(row => {
    const tds = row.querySelectorAll('td');
    if (tds[1] && tds[1].hasAttribute && tds[1].hasAttribute('colspan')) {
      // folga: estrutura [date][colspan=4][horas][btn]
      const date = tds[0].querySelector('input')?.value || '';
      data.push({ tipo: 'folga', date });
    } else {
      const date = tds[0].querySelector('input')?.value || '';
      const entrada = tds[1].querySelector('input')?.value || '';
      const almocoStart = tds[2].querySelector('input')?.value || '';
      const almocoRet = tds[3].querySelector('input')?.value || '';
      const saida = tds[4].querySelector('input')?.value || '';
      const horasText = tds[5]?.innerText || '';
      data.push({ tipo: 'dia', date, entrada, almocoStart, almocoRet, saida, horasText });
    }
  });

  localStorage.setItem('cht_data', JSON.stringify(data));
}

function loadData() {
  const raw = localStorage.getItem('cht_data');
  if (!raw) return;
  try {
    const arr = JSON.parse(raw);
    const tbody = document.querySelector('#timeTable tbody');
    tbody.innerHTML = '';
    arr.forEach(item => {
      if (item.tipo === 'folga') addFolga(item.date || '');
      else addRow({
        date: item.date || '',
        entrada: item.entrada || '',
        almocoStart: item.almocoStart || '',
        almocoRet: item.almocoRet || '',
        saida: item.saida || ''
      });
    });
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }
}

// ---------- exportações ----------
function exportExcel() {
  const dados = [['Data','Entrada','Almoço Início','Retorno Almoço','Saída','Horas Trabalhadas']];
  document.querySelectorAll('#timeTable tbody tr').forEach(row => {
    const tds = row.querySelectorAll('td');
    if (tds[1] && tds[1].hasAttribute && tds[1].hasAttribute('colspan')) {
      const date = tds[0].querySelector('input')?.value || '';
      dados.push([date, 'FOLGA','','','','00:00']);
    } else {
      const date = tds[0].querySelector('input')?.value || '';
      const entrada = tds[1].querySelector('input')?.value || '';
      const aStart = tds[2].querySelector('input')?.value || '';
      const aRet = tds[3].querySelector('input')?.value || '';
      const saida = tds[4].querySelector('input')?.value || '';
      const horas = tds[5]?.innerText || '';
      dados.push([date, entrada, aStart, aRet, saida, horas]);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Horas');
  XLSX.writeFile(wb, 'cht-horas.xlsx');
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  doc.setFontSize(14);
  doc.text('Relatório - C.H.T', 40, 40);

  let y = 70;
  const lineHeight = 16;
  doc.setFontSize(10);

  document.querySelectorAll('#timeTable tbody tr').forEach(row => {
    const tds = row.querySelectorAll('td');
    let line = '';
    if (tds[1] && tds[1].hasAttribute && tds[1].hasAttribute('colspan')) {
      const date = tds[0].querySelector('input')?.value || '';
      line = `${date} — FOLGA`;
    } else {
      const date = tds[0].querySelector('input')?.value || '';
      const entrada = tds[1].querySelector('input')?.value || '--';
      const aStart = tds[2].querySelector('input')?.value || '--';
      const aRet = tds[3].querySelector('input')?.value || '--';
      const saida = tds[4].querySelector('input')?.value || '--';
      const horas = tds[5]?.innerText || '--';
      line = `${date} | ${entrada} - ${aStart} / ${aRet} - ${saida}  => ${horas}`;
    }

    doc.text(line, 40, y);
    y += lineHeight;
    if (y > 750) { doc.addPage(); y = 40; doc.setFontSize(10); }
  });

  doc.save('cht-relatorio.pdf');
}

// ---------- utilidades adicionais ----------
function clearAll() {
  if (!confirm('Apagar todos os registros salvos?')) return;
  localStorage.removeItem('cht_data');
  document.querySelector('#timeTable tbody').innerHTML = '';
  addRow();
  updateTotal();
}

// ---------- fim do arquivo ----------

   


    
  


   

  

function addRow() {
  const tbody = document.querySelector("#timeTable tbody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input type="date" onchange="updateTotal()" /></td>
    <td><input type="time" onchange="updateTotal()" /></td>
    <td><input type="time" onchange="updateTotal()" /></td>
    <td><input type="time" onchange="updateTotal()" /></td>
    <td><input type="time" onchange="updateTotal()" /></td>
    <td></td>
    <td><button onclick="removerLinha(this)">❌</button></td>
  `;

  tbody.appendChild(tr);
}

function addFolga() {
  const tbody = document.querySelector("#timeTable tbody");
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="date" /></td>
    <td colspan="5">Folga</td>
    <td><button onclick="removerLinha(this)">❌</button></td>
  `;
  tbody.appendChild(tr);
}

function removerLinha(btn) {
  btn.closest("tr").remove();
  updateTotal();
}

function calcularHoras(entrada, almocoIni, almocoFim, saida) {
  if (!entrada || !saida) return 0;

  const [eH, eM] = entrada.split(":").map(Number);
  const [sH, sM] = saida.split(":").map(Number);
  let total = (sH * 60 + sM) - (eH * 60 + eM);

  if (almocoIni && almocoFim) {
    const [aIH, aIM] = almocoIni.split(":").map(Number);
    const [aFH, aFM] = almocoFim.split(":").map(Number);
    total -= (aFH * 60 + aFM) - (aIH * 60 + aIM);
  }

  return total > 0 ? total : 0;
}

function updateTotal() {
  let totalMinutos = 0;
  const rows = document.querySelectorAll("#timeTable tbody tr");

  rows.forEach(row => {
    const tds = row.querySelectorAll("td");
    if (tds.length < 7 || tds[1].hasAttribute("colspan")) return;

    const entrada = tds[1].querySelector("input")?.value;
    const almocoIni = tds[2].querySelector("input")?.value;
    const almocoFim = tds[3].querySelector("input")?.value;
    const saida = tds[4].querySelector("input")?.value;

    const minutos = calcularHoras(entrada, almocoIni, almocoFim, saida);
    totalMinutos += minutos;

    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    tds[5].innerText = `${h}h ${m}min`;
  });

  const totalH = Math.floor(totalMinutos / 60);
  const totalM = totalMinutos % 60;
  document.getElementById("totalHoras").innerText = `Total: ${totalH}h ${totalM}min`;
}

function salvarDados() {
  const rows = document.querySelectorAll("#timeTable tbody tr");
  const dados = [];

  rows.forEach(row => {
    const tds = row.querySelectorAll("td");
    if (tds.length < 7) return;

    const data = tds[0].querySelector("input")?.value;
    if (tds[1].hasAttribute("colspan")) {
      dados.push({ data, tipo: "Folga" });
    } else {
      const entrada = tds[1].querySelector("input")?.value;
      const almocoIni = tds[2].querySelector("input")?.value;
      const almocoFim = tds[3].querySelector("input")?.value;
      const saida = tds[4].querySelector("input")?.value;
      const horas = tds[5].innerText;
      dados.push({ data, entrada, almocoIni, almocoFim, saida, horas });
    }
  });

  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "horas-trabalhadas.json";
  a.click();
  URL.revokeObjectURL(url);
}

function exportarExcel() {
  const wb = XLSX.utils.book_new();
  const dados = [["Data", "Entrada", "Almoço Início", "Almoço Fim", "Saída", "Horas Trabalhadas"]];

  document.querySelectorAll("#timeTable tbody tr").forEach(row => {
    const tds = row.querySelectorAll("td");
    const data = tds[0]?.querySelector("input")?.value || "";
    if (tds[1]?.hasAttribute("colspan")) {
      dados.push([data, "Folga", "", "", "", ""]);
    } else {
      const entrada = tds[1]?.querySelector("input")?.value || "";
      const almocoIni = tds[2]?.querySelector("input")?.value || "";
      const almocoFim = tds[3]?.querySelector("input")?.value || "";
      const saida = tds[4]?.querySelector("input")?.value || "";
      const horas = tds[5]?.innerText || "";
      dados.push([data, entrada, almocoIni, almocoFim, saida, horas]);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(dados);
  XLSX.utils.book_append_sheet(wb, ws, "Horas");
  XLSX.writeFile(wb, "horas-trabalhadas.xlsx");
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Relatório de Horas Trabalhadas", 20, 20);

  let y = 30;
  document.querySelectorAll("#timeTable tbody tr").forEach(row => {
    const tds = row.querySelectorAll("td");
    const data = tds[0]?.querySelector("input")?.value || "";

    if (tds[1]?.hasAttribute("colspan")) {
      doc.text(`${data} - FOLGA`, 20, y);
    } else {
      const entrada = tds[1]?.querySelector("input")?.value || "";
      const almocoIni = tds[2]?.querySelector("input")?.value || "";
      const almocoFim = tds[3]?.querySelector("input")?.value || "";
      const saida = tds[4]?.querySelector("input")?.value || "";
      const horas = tds[5]?.innerText || "";
      doc.text(`${data} | ${entrada} - ${almocoIni}/${almocoFim} - ${saida} = ${horas}`, 20, y);
    }

    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("relatorio-horas.pdf");
}

     
  

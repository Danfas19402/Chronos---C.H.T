document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  updateTotal();
});

function createInput(type = "time") {
  const input = document.createElement("input");
  input.type = type;
  input.oninput = updateTotal;
  return input;
}

function addRow(data = {}) {
  const tbody = document.getElementById("timeTable");

  const row = document.createElement("tr");

  const date = createInput("date");
  date.value = data.date || "";

  const entrada = createInput();
  entrada.value = data.entrada || "";

  const almocoIni = createInput();
  almocoIni.value = data.almocoIni || "";

  const almocoFim = createInput();
  almocoFim.value = data.almocoFim || "";

  const saida = createInput();
  saida.value = data.saida || "";

  const horas = document.createElement("td");
  horas.className = "horas";
  horas.innerText = "0h";

  const remover = document.createElement("button");
  remover.innerText = "🗑️";
  remover.onclick = () => {
    tbody.removeChild(row);
    updateTotal();
  };

  row.appendChild(createTd(date));
  row.appendChild(createTd(entrada));
  row.appendChild(createTd(almocoIni));
  row.appendChild(createTd(almocoFim));
  row.appendChild(createTd(saida));
  row.appendChild(horas);
  row.appendChild(createTd(remover));

  tbody.appendChild(row);

  updateTotal();
}

function addFolga(dateValue = "") {
  const tbody = document.getElementById("timeTable");
  const row = document.createElement("tr");

  const date = createInput("date");
  date.value = dateValue;

  row.innerHTML = `
    <td><input type="date" value="${dateValue}"/></td>
    <td colspan="5" style="text-align:center; color:gray;">Folga</td>
    <td><button onclick="removerLinha(this)">🗑️</button></td>
  `;

  tbody.appendChild(row);
}

function createTd(child) {
  const td = document.createElement("td");
  td.appendChild(child);
  return td;
}

function removerLinha(btn) {
  const row = btn.parentElement.parentElement;
  row.remove();
  updateTotal();
}

function calcularHoras(entrada, almocoIni, almocoFim, saida) {
  if (!entrada || !saida) return 0;

  const [h1, m1] = entrada.split(":").map(Number);
  const [h2, m2] = saida.split(":").map(Number);
  let totalMin = (h2 * 60 + m2) - (h1 * 60 + m1);

  if (almocoIni && almocoFim) {
    const [ha1, ma1] = almocoIni.split(":").map(Number);
    const [ha2, ma2] = almocoFim.split(":").map(Number);
    totalMin -= (ha2 * 60 + ma2) - (ha1 * 60 + ma1);
  }

  return Math.max(totalMin, 0);
}

function updateTotal() {
  let totalMinutos = 0;
  const rows = document.querySelectorAll("#timeTable tr");

  rows.forEach(row => {
    const tds = row.querySelectorAll("td");

    if (tds.length < 7 || tds[1].colSpan) return; // pular folgas

    const entrada = tds[1].querySelector("input")?.value;
    const almocoIni = tds[2].querySelector("input")?.value;
    const almocoFim = tds[3].querySelector("input")?.value;
    const saida = tds[4].querySelector("input")?.value;
    const horasTd = tds[5];

    const minutos = calcularHoras(entrada, almocoIni, almocoFim, saida);
    totalMinutos += minutos;

    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    horasTd.innerText = `${h}h ${m}min`;
  });

  const totalH = Math.floor(totalMinutos / 60);
  const totalM = totalMinutos % 60;
  document.getElementById("totalHoras").innerText = `Total: ${totalH}h ${totalM}min`;
}

function saveData() {
  const rows = document.querySelectorAll("#timeTable tr");
  const dados = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    const tds = row.querySelectorAll("td");

    if (tds.length === 7 && tds[1].colSpan) {
      // Folga
      dados.push({ tipo: "folga", date: inputs[0].value });
    } else if (inputs.length >= 5) {
      dados.push({
        tipo: "dia",
        date: inputs[0].value,
        entrada: inputs[1].value,
        almocoIni: inputs[2].value,
        almocoFim: inputs[3].value,
        saida: inputs[4].value,
      });
    }
  });

  localStorage.setItem("chtData", JSON.stringify(dados));
  alert("Dados salvos!");
}

function loadSavedData() {
  const dados = JSON.parse(localStorage.getItem("chtData") || "[]");

  dados.forEach(dia => {
    if (dia.tipo === "dia") addRow(dia);
    else if (dia.tipo === "folga") addFolga(dia.date);
  });
}

function downloadData() {
  const dados = localStorage.getItem("chtData") || "[]";
  const blob = new Blob([dados], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "horas_trabalhadas.json";
  a.click();
  URL.revokeObjectURL(url);
}

function clearData() {
  if (confirm("Deseja realmente apagar tudo?")) {
    localStorage.removeItem("chtData");
    document.getElementById("timeTable").innerHTML = "";
    updateTotal();
  }
}

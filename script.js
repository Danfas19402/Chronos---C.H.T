function addDia(data = "", entrada = "", almocoIni = "", almocoFim = "", saida = "") {
  const tbody = document.querySelector("#timeTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="date" value="${data}"></td>
    <td><input type="time" value="${entrada}"></td>
    <td><input type="time" value="${almocoIni}"></td>
    <td><input type="time" value="${almocoFim}"></td>
    <td><input type="time" value="${saida}"></td>
    <td class="horas">0h 0min</td>
    <td><button onclick="removerLinha(this)">❌</button></td>
  `;

  tbody.appendChild(row);
  addListeners(row);
  updateTotal();
}

function addFolga(data = "") {
  const tbody = document.querySelector("#timeTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="date" value="${data}"></td>
    <td colspan="5">Folga</td>
    <td><button onclick="removerLinha(this)">❌</button></td>
  `;

  tbody.appendChild(row);
  updateTotal();
}

function removerLinha(btn) {
  btn.closest("tr").remove();
  updateTotal();
  salvarDados();
}

function addListeners(row) {
  const inputs = row.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      updateTotal();
      salvarDados();
    });
  });
}

function calcularHoras(entrada, almocoIni, almocoFim, saida) {
  if (!entrada || !saida) return 0;

  const toMin = h => {
    const [hr, min] = h.split(":");
    return parseInt(hr) * 60 + parseInt(min);
  };

  let total = toMin(saida) - toMin(entrada);
  if (almocoIni && almocoFim) {
    total -= toMin(almocoFim) - toMin(almocoIni);
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

function salvarDados() {
  const data = [];
  const rows = document.querySelectorAll("#timeTable tbody tr");

  rows.forEach(row => {
    const tds = row.querySelectorAll("td");
    if (tds.length < 7 || tds[1].hasAttribute("colspan")) {
      data.push({ tipo: "folga", data: tds[0].querySelector("input")?.value });
    } else {
      data.push({
        tipo: "dia",
        data: tds[0].querySelector("input")?.value,
        entrada: tds[1].querySelector("input")?.value,
        almocoIni: tds[2].querySelector("input")?.value,
        almocoFim: tds[3].querySelector("input")?.value,
        saida: tds[4].querySelector("input")?.value
      });
    }
  });

  localStorage.setItem("dadosCHT", JSON.stringify(data));
}

function carregarDados() {
  const dados = JSON.parse(localStorage.getItem("dadosCHT") || "[]");
  dados.forEach(dado => {
    if (dado.tipo === "folga") {
      addFolga(dado.data);
    } else {
      addDia(dado.data, dado.entrada, dado.almocoIni, dado.almocoFim, dado.saida);
    }
  });
}

function baixarJSON() {
  const dados = localStorage.getItem("dadosCHT");
  const blob = new Blob([dados], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cht-dados.json";
  a.click();

  URL.revokeObjectURL(url);
}

window.onload = carregarDados;

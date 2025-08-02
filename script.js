function addRow() {
  const tbody = document.getElementById("timeTable");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="date" /></td>
    <td><input type="time" onchange="calcularHoras(this)" /></td>
    <td><input type="time" onchange="calcularHoras(this)" /></td>
    <td><input type="time" onchange="calcularHoras(this)" /></td>
    <td><input type="time" onchange="calcularHoras(this)" /></td>
    <td class="horas">0</td>
    <td><button onclick="removerLinha(this)">🗑️</button></td>
  `;

  tbody.appendChild(row);
}

function calcularHoras(elemento) {
  const linha = elemento.closest("tr");
  const inputs = linha.querySelectorAll("input[type='time']");

  const entrada = getMinutos(inputs[0]?.value);
  const almocoInicio = getMinutos(inputs[1]?.value);
  const almocoFim = getMinutos(inputs[2]?.value);
  const saida = getMinutos(inputs[3]?.value);

  if ([entrada, almocoInicio, almocoFim, saida].some(isNaN)) {
    linha.querySelector(".horas").textContent = "0";
    return;
  }

  const horasTrabalhadas = (saida - entrada) - (almocoFim - almocoInicio);
  linha.querySelector(".horas").textContent = formatarMinutos(horasTrabalhadas);
}

function calcularTotal() {
  let total = 0;
  document.querySelectorAll(".horas").forEach(cell => {
    total += getMinutos(cell.textContent);
  });

  document.getElementById("total").textContent = formatarMinutos(total);
}

function getMinutos(horario) {
  if (!horario) return NaN;
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + m;
}

function formatarMinutos(min) {
  if (isNaN(min) || min < 0) return "0";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function removerLinha(btn) {
  btn.closest("tr").remove();
  calcularTotal();
}

function adicionarFolga() {
  const tbody = document.getElementById("timeTable");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="date" /></td>
    <td colspan="5" style="text-align: center; color: gray;">Folga</td>
    <td><button onclick="removerLinha(this)">🗑️</button></td>
  `;

  tbody.appendChild(row);
}

function salvarHoras() {
  const linhas = document.querySelectorAll("#timeTable tr");
  const dados = [];

  linhas.forEach(linha => {
    const inputs = linha.querySelectorAll("input");
    const celulaHoras = linha.querySelector(".horas");

    if (linha.querySelector("td[colspan='5']")) {
      const data = inputs[0]?.value || "";
      dados.push({ tipo: "folga", data });
    } else {
      if (inputs.length >= 5 && celulaHoras) {
        dados.push({
          tipo: "trabalho",
          data: inputs[0].value,
          entrada: inputs[1].value,
          almocoInicio: inputs[2].value,
          almocoFim: inputs[3].value,
          saida: inputs[4].value,
          horas: celulaHoras.textContent
        });
      }
    }
  });

  const total = document.getElementById("total").textContent;

  const resultado = {
    dias: dados,
    totalHoras: total
  };

  localStorage.setItem("chronos_horas", JSON.stringify(resultado));
  alert("Horas salvas com sucesso!");
}

function carregarHoras() {
  const salvo = localStorage.getItem("chronos_horas");
  if (!salvo) return;

  const { dias, totalHoras } = JSON.parse(salvo);

  document.getElementById("timeTable").innerHTML = "";

  dias.forEach(dia => {
    if (dia.tipo === "folga") {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="date" value="${dia.data}" /></td>
        <td colspan="5" style="text-align: center; color: gray;">Folga</td>
        <td><button onclick="removerLinha(this)">🗑️</button></td>
      `;
      document.getElementById("timeTable").appendChild(row);
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="date" value="${dia.data}" /></td>
        <td><input type="time" value="${dia.entrada}" onchange="calcularHoras(this)" /></td>
        <td><input type="time" value="${dia.almocoInicio}" onchange="calcularHoras(this)" /></td>
        <td><input type="time" value="${dia.almocoFim}" onchange="calcularHoras(this)" /></td>
        <td><input type="time" value="${dia.saida}" onchange="calcularHoras(this)" /></td>
        <td class="horas">${dia.horas}</td>
        <td><button onclick="removerLinha(this)">🗑️</button></td>
      `;
      document.getElementById("timeTable").appendChild(row);
    }
  });

  document.getElementById("total").textContent = totalHoras;
}

window.onload = () => {
  carregarHoras();
  if (!localStorage.getItem("chronos_horas")) addRow();
};

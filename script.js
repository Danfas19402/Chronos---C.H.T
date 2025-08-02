function addRow() {
  const tbody = document.getElementById("timeTable");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="date" /></td>
    <td><input type="time" onchange="calcularHoras(this)" /></td>
    <td><input type="time" onchange="calcularHoras(this)" /></td>
    <td><input type="time" onchange="calcularHoras(this)" /></td>
    <td><input type="time" onchange="calcularHoras(this)" /></td>
    <td class="horas">-</td>
    <td><button onclick="removerLinha(this)">🗑️</button></td>
  `;

  tbody.appendChild(row);
}

function calcularHoras(input) {
  const linha = input.closest("tr");
  const inputs = linha.querySelectorAll("input");

  const entrada = inputs[1].value;
  const almocoInicio = inputs[2].value;
  const almocoFim = inputs[3].value;
  const saida = inputs[4].value;

  if (entrada && saida && almocoInicio && almocoFim) {
    const tEntrada = parseHora(entrada);
    const tAlmocoInicio = parseHora(almocoInicio);
    const tAlmocoFim = parseHora(almocoFim);
    const tSaida = parseHora(saida);

    let tempoTrabalhado = (tSaida - tEntrada) - (tAlmocoFim - tAlmocoInicio);
    if (tempoTrabalhado < 0) tempoTrabalhado += 24 * 60;

    const horas = String(Math.floor(tempoTrabalhado / 60)).padStart(2, '0');
    const minutos = String(tempoTrabalhado % 60).padStart(2, '0');

    linha.querySelector(".horas").textContent = `${horas}:${minutos}`;
  }
}

function parseHora(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function calcularTotal() {
  const linhas = document.querySelectorAll("#timeTable tr");
  let totalMinutos = 0;

  linhas.forEach(linha => {
    const valor = linha.querySelector(".horas").textContent;
    if (valor && valor !== "-") {
      const [h, m] = valor.split(":").map(Number);
      totalMinutos += h * 60 + m;
    }
  });

  const totalHoras = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
  const totalMin = String(totalMinutos % 60).padStart(2, "0");

  document.getElementById("total").textContent = `Total de horas: ${totalHoras}:${totalMin}`;
}

function removerLinha(botao) {
  botao.closest("tr").remove();
  calcularTotal();
}

// Linha inicial
window.onload = addRow;

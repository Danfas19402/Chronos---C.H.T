function criarInput(tipo) {
  const input = document.createElement("input");
  input.type = tipo;
  return input;
}

function criarCelulaComInput(tipo) {
  const td = document.createElement("td");
  const input = criarInput(tipo);
  td.appendChild(input);
  return { td, input };
}

function adicionarDia() {
  const tbody = document.querySelector("#tabelaHoras tbody");
  const tr = document.createElement("tr");

  const { td: tdData } = criarCelulaComInput("date");
  const { td: tdEntrada, input: entrada } = criarCelulaComInput("time");
  const { td: tdAlmocoInicio, input: almocoInicio } = criarCelulaComInput("time");
  const { td: tdAlmocoFim, input: almocoFim } = criarCelulaComInput("time");
  const { td: tdSaida, input: saida } = criarCelulaComInput("time");

  const tdHoras = document.createElement("td");
  tdHoras.textContent = "-";

  const tdAcao = document.createElement("td");
  const btnRemover = document.createElement("button");
  btnRemover.textContent = "🗑️";
  btnRemover.onclick = () => tr.remove();
  tdAcao.appendChild(btnRemover);

  [entrada, almocoInicio, almocoFim, saida].forEach(input => {
    input.onchange = () => {
      if (entrada.value && almocoInicio.value && almocoFim.value && saida.value) {
        const inicio = new Date("1970-01-01T" + entrada.value);
        const almocoI = new Date("1970-01-01T" + almocoInicio.value);
        const almocoF = new Date("1970-01-01T" + almocoFim.value);
        const fim = new Date("1970-01-01T" + saida.value);

        const horasManha = (almocoI - inicio) / (1000 * 60 * 60);
        const horasTarde = (fim - almocoF) / (1000 * 60 * 60);
        const total = horasManha + horasTarde;

        const horas = Math.floor(total);
        const minutos = Math.round((total - horas) * 60);
        tdHoras.textContent = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
      }
    };
  });

  tr.append(tdData, tdEntrada, tdAlmocoInicio, tdAlmocoFim, tdSaida, tdHoras, tdAcao);
  tbody.appendChild(tr);
}

function adicionarFolga() {
  const tbody = document.querySelector("#tabelaHoras tbody");
  const tr = document.createElement("tr");

  const tdData = criarInput("date");
  const td = document.createElement("td");
  td.colSpan = 5;
  td.textContent = "Folga";

  const tdHoras = document.createElement("td");
  tdHoras.textContent = "00:00";

  const tdAcao = document.createElement("td");
  const btnRemover = document.createElement("button");
  btnRemover.textContent = "🗑️";
  btnRemover.onclick = () => tr.remove();
  tdAcao.appendChild(btnRemover);

  const tdDataWrapper = document.createElement("td");
  tdDataWrapper.appendChild(tdData);

  tr.append(tdDataWrapper, td, tdHoras, tdAcao);
  tbody.appendChild(tr);
}

function calcularTotal() {
  const rows = document.querySelectorAll("#tabelaHoras tbody tr");
  let totalMinutos = 0;

  rows.forEach(row => {
    const td = row.cells[5];
    if (td && td.textContent.includes(":")) {
      const [h, m] = td.textContent.split(":").map(Number);
      totalMinutos += h * 60 + m;
    }
  });

  const totalHoras = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  document.getElementById("totalHoras").textContent =
    "Total de horas: " + String(totalHoras).padStart(2, '0') + ":" + String(minutos).padStart(2, '0');
}

function salvarHoras() {
  const dados = [];
  const rows = document.querySelectorAll("#tabelaHoras tbody tr");

  rows.forEach(row => {
    const data = row.cells[0]?.querySelector("input")?.value || "";
    const entrada = row.cells[1]?.querySelector("input")?.value || "";
    const almocoInicio = row.cells[2]?.querySelector("input")?.value || "";
    const almocoFim = row.cells[3]?.querySelector("input")?.value || "";
    const saida = row.cells[4]?.querySelector("input")?.value || "";
    const total = row.cells[5]?.textContent || "00:00";

    dados.push({ data, entrada, almocoInicio, almocoFim, saida, total });
  });

  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "horas_trabalhadas.json";
  a.click();

  URL.revokeObjectURL(url);
}

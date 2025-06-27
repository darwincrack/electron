// Referencias a secciones
const mainMenu = document.getElementById('mainMenu');
const viewIngresos = document.getElementById('viewIngresos');
const viewEgresos = document.getElementById('viewEgresos');
const viewLista = document.getElementById('viewLista');
const viewGrafico = document.getElementById('viewGrafico');

// Botones menú principal
const btnIngreso = document.getElementById('btnIngreso');
const btnEgreso = document.getElementById('btnEgreso');
const btnLista = document.getElementById('btnLista');
const btnGrafico = document.getElementById('btnGrafico');

function ocultarTodo() {
  mainMenu.classList.add('is-hidden');
  viewIngresos.classList.add('is-hidden');
  viewEgresos.classList.add('is-hidden');
  viewLista.classList.add('is-hidden');
  viewGrafico.classList.add('is-hidden');
}

function volverMenu() {
  ocultarTodo();
  mainMenu.classList.remove('is-hidden');
}

// Vista Ingresos
btnIngreso.addEventListener('click', () => {
  ocultarTodo();
  viewIngresos.innerHTML = `
    <button class="button is-light volver-btn" id="volverMenu1">← Volver al menú</button>
    <div class="box">
      <h2 class="title is-4">Registrar Ingreso</h2>
      <form id="formIngreso">
        <div class="field">
          <label class="label">Cantidad *</label>
          <div class="control">
            <input class="input" type="number" id="cantidadIngreso" min="0.01" step="0.01" required autofocus>
          </div>
        </div>
        <div class="field">
          <label class="label">Descripción (opcional)</label>
          <div class="control">
            <input class="input" type="text" id="descripcionIngreso" maxlength="100">
          </div>
        </div>
        <button class="button is-link is-fullwidth" type="submit">Guardar</button>
      </form>
      <p class="has-text-success mt-3" id="successIngreso" style="display:none;">¡Ingreso guardado!</p>
    </div>
  `;
  viewIngresos.classList.remove('is-hidden');
  document.getElementById('volverMenu1').onclick = volverMenu;
  registrarIngreso();
});

// Vista Egresos
btnEgreso.addEventListener('click', () => {
  ocultarTodo();
  viewEgresos.innerHTML = `
    <button class="button is-light volver-btn" id="volverMenu2">← Volver al menú</button>
    <div class="box">
      <h2 class="title is-4">Registrar Egreso</h2>
      <form id="formEgreso">
        <div class="field">
          <label class="label">Cantidad *</label>
          <div class="control">
            <input class="input" type="number" id="cantidadEgreso" min="0.01" step="0.01" required>
          </div>
        </div>
        <div class="field">
          <label class="label">Descripción (opcional)</label>
          <div class="control">
            <input class="input" type="text" id="descripcionEgreso" maxlength="100">
          </div>
        </div>
        <button class="button is-danger is-fullwidth" type="submit">Guardar</button>
      </form>
      <p class="has-text-success mt-3" id="successEgreso" style="display:none;">¡Egreso guardado!</p>
    </div>
  `;
  viewEgresos.classList.remove('is-hidden');
  document.getElementById('volverMenu2').onclick = volverMenu;
  registrarEgreso();
});

// Vista Lista
btnLista.addEventListener('click', () => {
  ocultarTodo();
  viewLista.innerHTML = `
    <button class="button is-light volver-btn" id="volverMenu3">← Volver al menú</button>
    <div class="box">
      <h2 class="title is-4">Lista de Movimientos</h2>
      <div class="buttons has-addons is-centered mb-4">
        <button class="button is-link is-selected" id="filtroIngresos">Ingresos</button>
        <button class="button is-danger" id="filtroEgresos">Egresos</button>
      </div>
      <ul id="listaMovimientos" style="list-style:none;padding:0;"></ul>
      <div class="mt-4 has-text-weight-bold" id="totalLista">Total: $0.00</div>
    </div>
  `;
  viewLista.classList.remove('is-hidden');
  document.getElementById('volverMenu3').onclick = volverMenu;
  cargarListaMovimientos('ingreso');
  document.getElementById('filtroIngresos').onclick = () => {
    document.getElementById('filtroIngresos').classList.add('is-selected');
    document.getElementById('filtroEgresos').classList.remove('is-selected');
    cargarListaMovimientos('ingreso');
  };
  document.getElementById('filtroEgresos').onclick = () => {
    document.getElementById('filtroEgresos').classList.add('is-selected');
    document.getElementById('filtroIngresos').classList.remove('is-selected');
    cargarListaMovimientos('egreso');
  };
});

// Vista Gráfico
btnGrafico.addEventListener('click', () => {
  ocultarTodo();
  viewGrafico.innerHTML = `
    <button class="button is-light volver-btn" id="volverMenu4">← Volver al menú</button>
    <div class="box">
      <h2 class="title is-4">Gráfico de Ingresos y Egresos</h2>
      <canvas id="graficoMovimientos" width="320" height="180"></canvas>
    </div>
  `;
  viewGrafico.classList.remove('is-hidden');
  document.getElementById('volverMenu4').onclick = volverMenu;
  cargarGraficoMovimientos();
});

// Funciones para cada vista
function registrarIngreso() {
  const formIngreso = document.getElementById('formIngreso');
  const cantidadIngreso = document.getElementById('cantidadIngreso');
  const descripcionIngreso = document.getElementById('descripcionIngreso');
  const successIngreso = document.getElementById('successIngreso');
  formIngreso.addEventListener('submit', (e) => {
    e.preventDefault();
    const cantidad = parseFloat(cantidadIngreso.value);
    const descripcion = descripcionIngreso.value.trim();
    if (!cantidad || cantidad <= 0) return;
    electronAPI.send('guardar-movimiento', {
      tipo: 'ingreso',
      cantidad,
      descripcion
    });
  });
  electronAPI.on('movimiento-guardado', () => {
    successIngreso.style.display = 'block';
    formIngreso.reset();
    cantidadIngreso.focus();
    setTimeout(() => {
      successIngreso.style.display = 'none';
    }, 1200);
  });
}

function registrarEgreso() {
  const formEgreso = document.getElementById('formEgreso');
  const cantidadEgreso = document.getElementById('cantidadEgreso');
  const descripcionEgreso = document.getElementById('descripcionEgreso');
  const successEgreso = document.getElementById('successEgreso');
  formEgreso.addEventListener('submit', (e) => {
    e.preventDefault();
    const cantidad = parseFloat(cantidadEgreso.value);
    const descripcion = descripcionEgreso.value.trim();
    if (!cantidad || cantidad <= 0) return;
    electronAPI.send('guardar-movimiento', {
      tipo: 'egreso',
      cantidad,
      descripcion
    });
  });
  electronAPI.on('movimiento-guardado', () => {
    successEgreso.style.display = 'block';
    formEgreso.reset();
    cantidadEgreso.focus();
    setTimeout(() => {
      successEgreso.style.display = 'none';
    }, 1200);
  });
}

async function cargarListaMovimientos(tipo = 'ingreso') {
  const { movimientos, total } = await electronAPI.invoke('obtener-movimientos', tipo);
  const lista = document.getElementById('listaMovimientos');
  lista.innerHTML = '';
  if (movimientos.length === 0) {
    lista.innerHTML = '<li class="has-text-grey">Sin movimientos</li>';
  } else {
    movimientos.forEach(mov => {
      const li = document.createElement('li');
      li.className = 'mb-2';
      li.innerHTML = `<span class='has-text-weight-bold'>$${parseFloat(mov.cantidad).toFixed(2)}</span> - <span>${mov.descripcion ? mov.descripcion : '<i>Sin descripción</i>'}</span> <span class='has-text-grey-light' style='font-size:0.9em;'>(${new Date(mov.fecha).toLocaleDateString()})</span>`;
      lista.appendChild(li);
    });
  }
  document.getElementById('totalLista').textContent = `Total: $${parseFloat(total).toFixed(2)}`;
}

async function cargarGraficoMovimientos() {
  const ctx = document.getElementById('graficoMovimientos').getContext('2d');
  const datos = await electronAPI.invoke('obtener-datos-grafico', 7);
  if (window.graficoMov) window.graficoMov.destroy();
  window.graficoMov = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datos.labels,
      datasets: [
        {
          label: 'Ingresos',
          data: datos.ingresos,
          backgroundColor: 'rgba(0, 123, 255, 0.6)'
        },
        {
          label: 'Egresos',
          data: datos.egresos,
          backgroundColor: 'rgba(220, 53, 69, 0.6)'
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
} 
// Esperar a que el DOM y electronAPI estén disponibles
const electronAPI = window.electronAPI;

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
    <div class="columns">
      <!-- Columna izquierda: Formulario -->
      <div class="column is-half">
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
      </div>
      
      <!-- Columna derecha: Resumen semanal y tabla del día -->
      <div class="column is-half">
        <!-- Total con filtros -->
        <div class="box has-background-success-light">
          <h3 class="title is-5 has-text-success">Total de Ingresos</h3>
          <div class="buttons has-addons is-centered mb-3">
            <button class="button is-small is-success is-selected" id="filtroDiario">Diario</button>
            <button class="button is-small is-success" id="filtroSemanal">Semanal</button>
            <button class="button is-small is-success" id="filtroMensual">Mensual</button>
          </div>
          <p class="title is-3 has-text-success" id="totalPeriodo">$0.00</p>
          <p class="subtitle is-6 has-text-grey" id="textoPeriodo">Hoy</p>
        </div>
        
        <!-- Lista de ingresos -->
        <div class="box">
          <h3 class="title is-5" id="tituloTabla">Ingresos de Hoy</h3>
          <div style="max-height: 350px; overflow-y: auto;">
            <table class="table is-fullwidth is-striped">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Cantidad</th>
                  <th>Descripción</th>
                  <th width="80">Acción</th>
                </tr>
              </thead>
              <tbody id="tablaIngresosPeriodo">
                <tr>
                  <td colspan="4" class="has-text-grey">No hay ingresos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  viewIngresos.classList.remove('is-hidden');
  document.getElementById('volverMenu1').onclick = volverMenu;
  
  // Event listeners para filtros
  document.getElementById('filtroDiario').onclick = () => cambiarFiltroIngresos('diario');
  document.getElementById('filtroSemanal').onclick = () => cambiarFiltroIngresos('semanal');
  document.getElementById('filtroMensual').onclick = () => cambiarFiltroIngresos('mensual');
  
  registrarIngreso();
  cambiarFiltroIngresos('diario'); // Cargar filtro diario por defecto
});

// Vista Egresos
btnEgreso.addEventListener('click', () => {
  ocultarTodo();
  viewEgresos.innerHTML = `
    <button class="button is-light volver-btn" id="volverMenu2">← Volver al menú</button>
    <div class="columns">
      <!-- Columna izquierda: Formulario -->
      <div class="column is-half">
        <div class="box">
          <h2 class="title is-4">Registrar Egreso</h2>
          <form id="formEgreso">
            <div class="field">
              <label class="label">Cantidad *</label>
              <div class="control">
                <input class="input" type="number" id="cantidadEgreso" min="0.01" step="0.01" required autofocus>
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
      </div>
      
      <!-- Columna derecha: Resumen semanal y tabla del día -->
      <div class="column is-half">
        <!-- Total con filtros -->
        <div class="box has-background-danger-light">
          <h3 class="title is-5 has-text-danger">Total de Egresos</h3>
          <div class="buttons has-addons is-centered mb-3">
            <button class="button is-small is-danger is-selected" id="filtroDiarioEgr">Diario</button>
            <button class="button is-small is-danger" id="filtroSemanalEgr">Semanal</button>
            <button class="button is-small is-danger" id="filtroMensualEgr">Mensual</button>
          </div>
          <p class="title is-3 has-text-danger" id="totalPeriodoEgresos">$0.00</p>
          <p class="subtitle is-6 has-text-grey" id="textoPeriodoEgresos">Hoy</p>
        </div>
        
        <!-- Lista de egresos -->
        <div class="box">
          <h3 class="title is-5" id="tituloTablaEgresos">Egresos de Hoy</h3>
          <div style="max-height: 350px; overflow-y: auto;">
            <table class="table is-fullwidth is-striped">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Cantidad</th>
                  <th>Descripción</th>
                  <th width="80">Acción</th>
                </tr>
              </thead>
              <tbody id="tablaEgresosPeriodo">
                <tr>
                  <td colspan="4" class="has-text-grey">No hay egresos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  viewEgresos.classList.remove('is-hidden');
  document.getElementById('volverMenu2').onclick = volverMenu;
  
  // Event listeners para filtros de egresos
  document.getElementById('filtroDiarioEgr').onclick = () => cambiarFiltroEgresos('diario');
  document.getElementById('filtroSemanalEgr').onclick = () => cambiarFiltroEgresos('semanal');
  document.getElementById('filtroMensualEgr').onclick = () => cambiarFiltroEgresos('mensual');
  
  registrarEgreso();
  cambiarFiltroEgresos('diario'); // Cargar filtro diario por defecto
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
  
  formIngreso.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cantidad = parseFloat(document.getElementById('cantidadIngreso').value);
    const descripcion = document.getElementById('descripcionIngreso').value.trim();
    if (!cantidad || cantidad <= 0) return;
    
    try {
      await electronAPI.invoke('guardar-movimiento', {
        tipo: 'ingreso',
        cantidad,
        descripcion
      });
      
      // Mostrar mensaje de éxito
      const successIngreso = document.getElementById('successIngreso');
      successIngreso.style.display = 'block';
      formIngreso.reset();
      document.getElementById('cantidadIngreso').focus();
      
      // Actualizar vista
      const filtroActivo = document.querySelector('.button.is-success.is-selected');
      if (filtroActivo) {
        const periodo = filtroActivo.id.replace('filtro', '').toLowerCase();
        await cambiarFiltroIngresos(periodo);
      }
      
      setTimeout(() => {
        successIngreso.style.display = 'none';
      }, 1200);
      
    } catch (error) {
      console.error('Error al guardar ingreso:', error);
    }
  });
}

function registrarEgreso() {
  const formEgreso = document.getElementById('formEgreso');
  
  formEgreso.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cantidad = parseFloat(document.getElementById('cantidadEgreso').value);
    const descripcion = document.getElementById('descripcionEgreso').value.trim();
    if (!cantidad || cantidad <= 0) return;
    
    try {
      await electronAPI.invoke('guardar-movimiento', {
        tipo: 'egreso',
        cantidad,
        descripcion
      });
      
      // Mostrar mensaje de éxito
      const successEgreso = document.getElementById('successEgreso');
      successEgreso.style.display = 'block';
      formEgreso.reset();
      document.getElementById('cantidadEgreso').focus();
      
      // Actualizar vista
      const filtroActivo = document.querySelector('.button.is-danger.is-selected');
      if (filtroActivo) {
        const periodo = filtroActivo.id.replace('filtro', '').replace('Egr', '').toLowerCase();
        await cambiarFiltroEgresos(periodo);
      }
      
      setTimeout(() => {
        successEgreso.style.display = 'none';
      }, 1200);
      
    } catch (error) {
      console.error('Error al guardar egreso:', error);
    }
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

// Función para cambiar filtro de ingresos
async function cambiarFiltroIngresos(periodo) {
  try {
    // Actualizar botones activos
    document.querySelectorAll('#filtroDiario, #filtroSemanal, #filtroMensual').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    document.getElementById(`filtro${periodo.charAt(0).toUpperCase() + periodo.slice(1)}`).classList.add('is-selected');
    
    // Obtener datos según el período
    let resumen;
    let titulo;
    let textoPeriodo;
    
    switch(periodo) {
      case 'diario':
        resumen = await electronAPI.invoke('obtener-ingresos-dia');
        titulo = 'Ingresos de Hoy';
        textoPeriodo = 'Hoy';
        break;
      case 'semanal':
        resumen = await electronAPI.invoke('obtener-ingresos-semana');
        titulo = 'Ingresos de la Semana';
        textoPeriodo = 'Desde el lunes';
        break;
      case 'mensual':
        resumen = await electronAPI.invoke('obtener-ingresos-mes');
        titulo = 'Ingresos del Mes';
        textoPeriodo = 'Este mes';
        break;
    }
    
    // Actualizar UI
    const totalPeriodo = document.getElementById('totalPeriodo');
    const textoPeriodoEl = document.getElementById('textoPeriodo');
    const tituloTabla = document.getElementById('tituloTabla');
    const tablaIngresosPeriodo = document.getElementById('tablaIngresosPeriodo');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `$${parseFloat(resumen.total || 0).toFixed(2)}`;
    }
    
    if (textoPeriodoEl) {
      textoPeriodoEl.textContent = textoPeriodo;
    }
    
    if (tituloTabla) {
      tituloTabla.textContent = titulo;
    }
    
    if (tablaIngresosPeriodo) {
      tablaIngresosPeriodo.innerHTML = '';
      if (resumen.movimientos && resumen.movimientos.length > 0) {
        resumen.movimientos.forEach(mov => {
          const tr = document.createElement('tr');
          const fecha = new Date(mov.fecha);
          
          let fechaTexto;
          if (periodo === 'diario') {
            fechaTexto = fecha.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          } else {
            fechaTexto = fecha.toLocaleDateString('es-ES', { 
              day: '2-digit',
              month: '2-digit'
            }) + ' ' + fecha.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }
          
          tr.innerHTML = `
            <td>${fechaTexto}</td>
            <td class="has-text-weight-bold has-text-success">$${parseFloat(mov.cantidad).toFixed(2)}</td>
            <td>${mov.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
            <td>
              <button class="button is-small is-danger" onclick="eliminarMovimiento(${mov.id}, 'ingreso')">
                <span class="icon is-small">
                  <i class="fas fa-times"></i>
                </span>
              </button>
            </td>
          `;
          tablaIngresosPeriodo.appendChild(tr);
        });
      } else {
        tablaIngresosPeriodo.innerHTML = `<tr><td colspan="4" class="has-text-grey">No hay ingresos ${periodo === 'diario' ? 'hoy' : periodo === 'semanal' ? 'esta semana' : 'este mes'}</td></tr>`;
      }
    }
  } catch (error) {
    console.error('Error al cargar ingresos por período:', error);
  }
}

// Función para cambiar filtro de egresos
async function cambiarFiltroEgresos(periodo) {
  try {
    // Actualizar botones activos
    document.querySelectorAll('#filtroDiarioEgr, #filtroSemanalEgr, #filtroMensualEgr').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    document.getElementById(`filtro${periodo.charAt(0).toUpperCase() + periodo.slice(1)}Egr`).classList.add('is-selected');
    
    // Obtener datos según el período
    let resumen;
    let titulo;
    let textoPeriodo;
    
    switch(periodo) {
      case 'diario':
        resumen = await electronAPI.invoke('obtener-egresos-dia');
        titulo = 'Egresos de Hoy';
        textoPeriodo = 'Hoy';
        break;
      case 'semanal':
        resumen = await electronAPI.invoke('obtener-egresos-semana');
        titulo = 'Egresos de la Semana';
        textoPeriodo = 'Desde el lunes';
        break;
      case 'mensual':
        resumen = await electronAPI.invoke('obtener-egresos-mes');
        titulo = 'Egresos del Mes';
        textoPeriodo = 'Este mes';
        break;
    }
    
    // Actualizar UI
    const totalPeriodo = document.getElementById('totalPeriodoEgresos');
    const textoPeriodoEl = document.getElementById('textoPeriodoEgresos');
    const tituloTabla = document.getElementById('tituloTablaEgresos');
    const tablaEgresosPeriodo = document.getElementById('tablaEgresosPeriodo');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `$${parseFloat(resumen.total || 0).toFixed(2)}`;
    }
    
    if (textoPeriodoEl) {
      textoPeriodoEl.textContent = textoPeriodo;
    }
    
    if (tituloTabla) {
      tituloTabla.textContent = titulo;
    }
    
    if (tablaEgresosPeriodo) {
      tablaEgresosPeriodo.innerHTML = '';
      if (resumen.movimientos && resumen.movimientos.length > 0) {
        resumen.movimientos.forEach(mov => {
          const tr = document.createElement('tr');
          const fecha = new Date(mov.fecha);
          
          let fechaTexto;
          if (periodo === 'diario') {
            fechaTexto = fecha.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          } else {
            fechaTexto = fecha.toLocaleDateString('es-ES', { 
              day: '2-digit',
              month: '2-digit'
            }) + ' ' + fecha.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }
          
          tr.innerHTML = `
            <td>${fechaTexto}</td>
            <td class="has-text-weight-bold has-text-danger">$${parseFloat(mov.cantidad).toFixed(2)}</td>
            <td>${mov.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
            <td>
              <button class="button is-small is-danger" onclick="eliminarMovimiento(${mov.id}, 'egreso')">
                <span class="icon is-small">
                  <i class="fas fa-times"></i>
                </span>
              </button>
            </td>
          `;
          tablaEgresosPeriodo.appendChild(tr);
        });
      } else {
        tablaEgresosPeriodo.innerHTML = `<tr><td colspan="4" class="has-text-grey">No hay egresos ${periodo === 'diario' ? 'hoy' : periodo === 'semanal' ? 'esta semana' : 'este mes'}</td></tr>`;
      }
    }
  } catch (error) {
    console.error('Error al cargar egresos por período:', error);
  }
}

// Función para eliminar movimiento
async function eliminarMovimiento(id, tipo) {
  if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
    try {
      await electronAPI.invoke('eliminar-movimiento', id);
      console.log('Movimiento eliminado:', id);
      
      // Actualizar la vista correspondiente
      if (tipo === 'ingreso') {
        const filtroActivo = document.querySelector('.button.is-success.is-selected');
        if (filtroActivo) {
          const periodo = filtroActivo.id.replace('filtro', '').toLowerCase();
          cambiarFiltroIngresos(periodo);
        }
      } else {
        const filtroActivo = document.querySelector('.button.is-danger.is-selected');
        if (filtroActivo) {
          const periodo = filtroActivo.id.replace('filtro', '').replace('Egr', '').toLowerCase();
          cambiarFiltroEgresos(periodo);
        }
      }
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      alert('Error al eliminar el registro');
    }
  }
}
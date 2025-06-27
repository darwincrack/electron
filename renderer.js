// Esperar a que el DOM y electronAPI estén disponibles

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
          <p class="title is-3 has-text-success" id="totalPeriodo">Bs 0.00</p>
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
          <p class="title is-3 has-text-danger" id="totalPeriodoEgresos">Bs 0.00</p>
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
  const fechaHoy = new Date().toISOString().split('T')[0];
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - 30); // 30 días atrás por defecto
  const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
  
  viewLista.innerHTML = `
    <button class="button is-light volver-btn" id="volverMenu3">← Volver al menú</button>
    <div class="box">
      <h2 class="title is-4">Lista de Movimientos</h2>
      
      <!-- Filtros de fecha -->
      <div class="columns is-mobile mb-4">
        <div class="column">
          <label class="label">Desde:</label>
          <input class="input" type="date" id="fechaDesde" value="${fechaInicioStr}">
        </div>
        <div class="column">
          <label class="label">Hasta:</label>
          <input class="input" type="date" id="fechaHasta" value="${fechaHoy}">
        </div>
        <div class="column is-narrow">
          <label class="label">&nbsp;</label>
          <button class="button is-info" id="aplicarFiltroFecha">Aplicar</button>
        </div>
      </div>
      
      <!-- Filtros de tipo -->
      <div class="buttons has-addons is-centered mb-4">
        <button class="button is-link is-selected" id="filtroIngresos">Ingresos</button>
        <button class="button is-danger" id="filtroEgresos">Egresos</button>
      </div>
      
      <!-- Tabla de movimientos -->
      <div style="max-height: 400px; overflow-y: auto;">
        <table class="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Cantidad</th>
              <th>Descripción</th>
              <th width="80">Acción</th>
            </tr>
          </thead>
          <tbody id="listaMovimientos">
            <tr>
              <td colspan="4" class="has-text-grey">Cargando...</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="mt-4 has-text-weight-bold" id="totalLista">Total: Bs 0.00</div>
    </div>
  `;
  viewLista.classList.remove('is-hidden');
  document.getElementById('volverMenu3').onclick = volverMenu;
  
  // Event listeners
  document.getElementById('aplicarFiltroFecha').onclick = () => {
    const tipoActual = document.getElementById('filtroIngresos').classList.contains('is-selected') ? 'ingreso' : 'egreso';
    cargarListaMovimientos(tipoActual);
  };
  
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
  
  // Cargar datos iniciales
  cargarListaMovimientos('ingreso');
});

// Vista Gráfico
btnGrafico.addEventListener('click', () => {
  ocultarTodo();
  const fechaHoy = new Date().toISOString().split('T')[0];
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - 7); // 7 días atrás por defecto
  const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
  
  viewGrafico.innerHTML = `
    <button class="button is-light volver-btn" id="volverMenu4">← Volver al menú</button>
    <div class="box">
      <h2 class="title is-4">Gráfico de Ingresos y Egresos</h2>
      
      <!-- Filtros de fecha -->
      <div class="columns is-mobile mb-4">
        <div class="column">
          <label class="label">Desde:</label>
          <input class="input" type="date" id="fechaDesdeGrafico" value="${fechaInicioStr}">
        </div>
        <div class="column">
          <label class="label">Hasta:</label>
          <input class="input" type="date" id="fechaHastaGrafico" value="${fechaHoy}">
        </div>
        <div class="column is-narrow">
          <label class="label">&nbsp;</label>
          <button class="button is-info" id="actualizarGrafico">Actualizar</button>
        </div>
      </div>
      
      <canvas id="graficoMovimientos" width="600" height="300"></canvas>
    </div>
  `;
  viewGrafico.classList.remove('is-hidden');
  document.getElementById('volverMenu4').onclick = volverMenu;
  
  // Event listener para actualizar gráfico
  document.getElementById('actualizarGrafico').onclick = () => {
    cargarGraficoMovimientos();
  };
  
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
      const result = await electronAPI.invoke('guardar-movimiento', {
        tipo: 'ingreso',
        cantidad,
        descripcion
      });
      
      // Mostrar mensaje de éxito
      const successIngreso = document.getElementById('successIngreso');
      successIngreso.style.display = 'block';
      formIngreso.reset();
      document.getElementById('cantidadIngreso').focus();
      
      // Agregar la nueva fila a la tabla existente (sin recargar)
      await agregarFilaIngresoATabla({ id: result.id, tipo: 'ingreso', cantidad, descripcion, fecha: new Date() });
      
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
      const result = await electronAPI.invoke('guardar-movimiento', {
        tipo: 'egreso',
        cantidad,
        descripcion
      });
      
      // Mostrar mensaje de éxito
      const successEgreso = document.getElementById('successEgreso');
      successEgreso.style.display = 'block';
      formEgreso.reset();
      document.getElementById('cantidadEgreso').focus();
      
      // Agregar la nueva fila a la tabla existente (sin recargar)  
      await agregarFilaEgresoATabla({ id: result.id, tipo: 'egreso', cantidad, descripcion, fecha: new Date() });
      
      setTimeout(() => {
        successEgreso.style.display = 'none';
      }, 1200);
      
    } catch (error) {
      console.error('Error al guardar egreso:', error);
    }
  });
}

async function cargarListaMovimientos(tipo = 'ingreso') {
  try {
    // Obtener rangos de fecha de los inputs
    const fechaDesde = document.getElementById('fechaDesde')?.value;
    const fechaHasta = document.getElementById('fechaHasta')?.value;
    
    const movimientos = await electronAPI.invoke('obtener-movimientos-rango', {
      tipo,
      fechaDesde,
      fechaHasta
    });
    
    const listaMovimientos = document.getElementById('listaMovimientos');
    const totalLista = document.getElementById('totalLista');
    
    listaMovimientos.innerHTML = '';
    
    if (movimientos && movimientos.length > 0) {
      movimientos.forEach(mov => {
        const fecha = new Date(mov.fecha);
        const tr = document.createElement('tr');
        
        const fechaTexto = fecha.toLocaleDateString('es-ES', { 
          day: '2-digit',
          month: '2-digit'
        }) + ' ' + fecha.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        tr.innerHTML = `
          <td>${fechaTexto}</td>
                      <td class="has-text-weight-bold ${tipo === 'ingreso' ? 'has-text-success' : 'has-text-danger'}">Bs ${parseFloat(mov.cantidad).toFixed(2)}</td>
          <td>${mov.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
          <td>
            <button class="button is-small is-danger btn-eliminar" data-id="${mov.id}" data-tipo="${tipo}">
              <span class="icon is-small">
                <i class="fas fa-times"></i>
              </span>
            </button>
          </td>
        `;
        listaMovimientos.appendChild(tr);
        
        // Agregar event listener al botón eliminar
        const btnEliminar = tr.querySelector('.btn-eliminar');
        btnEliminar.addEventListener('click', () => {
          eliminarMovimiento(mov.id, tipo);
        });
      });
      
      const total = movimientos.reduce((sum, mov) => sum + mov.cantidad, 0);
      totalLista.textContent = `Total ${tipo === 'ingreso' ? 'Ingresos' : 'Egresos'}: Bs Bs ${total.toFixed(2)}`;
    } else {
      listaMovimientos.innerHTML = `<tr><td colspan="4" class="has-text-grey">No hay ${tipo}s en este período</td></tr>`;
      totalLista.textContent = 'Total: Bs 0.00';
    }
  } catch (error) {
    console.error('Error al cargar lista de movimientos:', error);
    const listaMovimientos = document.getElementById('listaMovimientos');
    if (listaMovimientos) {
      listaMovimientos.innerHTML = `<tr><td colspan="4" class="has-text-danger">Error al cargar datos</td></tr>`;
    }
  }
}

async function cargarGraficoMovimientos() {
  try {
    const ctx = document.getElementById('graficoMovimientos').getContext('2d');
    
    // Obtener rangos de fecha de los inputs
    const fechaDesde = document.getElementById('fechaDesdeGrafico')?.value;
    const fechaHasta = document.getElementById('fechaHastaGrafico')?.value;
    
    const datos = await electronAPI.invoke('obtener-datos-grafico-rango', {
      fechaDesde,
      fechaHasta
    });
    
    if (window.graficoMov) window.graficoMov.destroy();
    
    window.graficoMov = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.labels,
        datasets: [
          {
            label: 'Ingresos',
            data: datos.ingresos,
            backgroundColor: 'rgba(72, 187, 120, 0.7)',
            borderColor: 'rgba(72, 187, 120, 1)',
            borderWidth: 1
          },
          {
            label: 'Egresos',
            data: datos.egresos,
            backgroundColor: 'rgba(245, 101, 101, 0.7)',
            borderColor: 'rgba(245, 101, 101, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { 
            position: 'top',
            labels: {
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: `Reporte de ${fechaDesde} a ${fechaHasta}`,
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'Bs ' + value.toFixed(2);
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al cargar gráfico:', error);
    alert('Error al cargar el gráfico');
  }
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
        textoPeriodo = resumen.rangoFechas || 'Desde el lunes';
        break;
      case 'mensual':
        resumen = await electronAPI.invoke('obtener-ingresos-mes');
        titulo = 'Ingresos del Mes';
        textoPeriodo = resumen.rangoFechas || 'Este mes';
        break;
    }
    
    // Actualizar UI
    const totalPeriodo = document.getElementById('totalPeriodo');
    const textoPeriodoEl = document.getElementById('textoPeriodo');
    const tituloTabla = document.getElementById('tituloTabla');
    const tablaIngresosPeriodo = document.getElementById('tablaIngresosPeriodo');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
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
            <td class="has-text-weight-bold has-text-success">Bs ${parseFloat(mov.cantidad).toFixed(2)}</td>
            <td>${mov.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
            <td>
              <button class="button is-small is-danger btn-eliminar" data-id="${mov.id}" data-tipo="ingreso">
                <span class="icon is-small">
                  <i class="fas fa-times"></i>
                </span>
              </button>
            </td>
          `;
          tablaIngresosPeriodo.appendChild(tr);
          
          // Agregar event listener al botón eliminar
          const btnEliminar = tr.querySelector('.btn-eliminar');
          btnEliminar.addEventListener('click', () => {
            eliminarMovimiento(mov.id, 'ingreso');
          });
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
        textoPeriodo = resumen.rangoFechas || 'Desde el lunes';
        break;
      case 'mensual':
        resumen = await electronAPI.invoke('obtener-egresos-mes');
        titulo = 'Egresos del Mes';
        textoPeriodo = resumen.rangoFechas || 'Este mes';
        break;
    }
    
    // Actualizar UI
    const totalPeriodo = document.getElementById('totalPeriodoEgresos');
    const textoPeriodoEl = document.getElementById('textoPeriodoEgresos');
    const tituloTabla = document.getElementById('tituloTablaEgresos');
    const tablaEgresosPeriodo = document.getElementById('tablaEgresosPeriodo');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
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
            <td class="has-text-weight-bold has-text-danger">Bs ${parseFloat(mov.cantidad).toFixed(2)}</td>
            <td>${mov.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
            <td>
              <button class="button is-small is-danger btn-eliminar" data-id="${mov.id}" data-tipo="egreso">
                <span class="icon is-small">
                  <i class="fas fa-times"></i>
                </span>
              </button>
            </td>
          `;
          tablaEgresosPeriodo.appendChild(tr);
          
          // Agregar event listener al botón eliminar
          const btnEliminar = tr.querySelector('.btn-eliminar');
          btnEliminar.addEventListener('click', () => {
            eliminarMovimiento(mov.id, 'egreso');
          });
        });
      } else {
        tablaEgresosPeriodo.innerHTML = `<tr><td colspan="4" class="has-text-grey">No hay egresos ${periodo === 'diario' ? 'hoy' : periodo === 'semanal' ? 'esta semana' : 'este mes'}</td></tr>`;
      }
    }
  } catch (error) {
    console.error('Error al cargar egresos por período:', error);
  }
}

// Función para actualizar solo la tabla de ingresos (sin tocar inputs)
async function actualizarTablaIngresos() {
  const filtroActivo = document.querySelector('.button.is-success.is-selected');
  if (filtroActivo) {
    const periodo = filtroActivo.id.replace('filtro', '').toLowerCase();
    
    // Obtener datos según el período
    let resumen;
    switch(periodo) {
      case 'diario':
        resumen = await electronAPI.invoke('obtener-ingresos-dia');
        break;
      case 'semanal':
        resumen = await electronAPI.invoke('obtener-ingresos-semana');
        break;
      case 'mensual':
        resumen = await electronAPI.invoke('obtener-ingresos-mes');
        break;
    }
    
    // Actualizar solo total y tabla
    const totalPeriodo = document.getElementById('totalPeriodo');
    const tablaIngresosPeriodo = document.getElementById('tablaIngresosPeriodo');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
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
            <td class="has-text-weight-bold has-text-success">Bs ${parseFloat(mov.cantidad).toFixed(2)}</td>
            <td>${mov.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
            <td>
              <button class="button is-small is-danger btn-eliminar" data-id="${mov.id}" data-tipo="ingreso">
                <span class="icon is-small">
                  <i class="fas fa-times"></i>
                </span>
              </button>
            </td>
          `;
          tablaIngresosPeriodo.appendChild(tr);
          
          // Agregar event listener al botón eliminar
          const btnEliminar = tr.querySelector('.btn-eliminar');
          btnEliminar.addEventListener('click', () => {
            eliminarMovimiento(mov.id, 'ingreso');
          });
        });
      } else {
        tablaIngresosPeriodo.innerHTML = `<tr><td colspan="4" class="has-text-grey">No hay ingresos ${periodo === 'diario' ? 'hoy' : periodo === 'semanal' ? 'esta semana' : 'este mes'}</td></tr>`;
      }
    }
  }
}

// Función para actualizar solo la tabla de egresos (sin tocar inputs)
async function actualizarTablaEgresos() {
  const filtroActivo = document.querySelector('.button.is-danger.is-selected');
  if (filtroActivo) {
    const periodo = filtroActivo.id.replace('filtro', '').replace('Egr', '').toLowerCase();
    
    // Obtener datos según el período
    let resumen;
    switch(periodo) {
      case 'diario':
        resumen = await electronAPI.invoke('obtener-egresos-dia');
        break;
      case 'semanal':
        resumen = await electronAPI.invoke('obtener-egresos-semana');
        break;
      case 'mensual':
        resumen = await electronAPI.invoke('obtener-egresos-mes');
        break;
    }
    
    // Actualizar solo total y tabla
    const totalPeriodo = document.getElementById('totalPeriodoEgresos');
    const tablaEgresosPeriodo = document.getElementById('tablaEgresosPeriodo');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
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
            <td class="has-text-weight-bold has-text-danger">Bs ${parseFloat(mov.cantidad).toFixed(2)}</td>
            <td>${mov.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
            <td>
              <button class="button is-small is-danger btn-eliminar" data-id="${mov.id}" data-tipo="egreso">
                <span class="icon is-small">
                  <i class="fas fa-times"></i>
                </span>
              </button>
            </td>
          `;
          tablaEgresosPeriodo.appendChild(tr);
          
          // Agregar event listener al botón eliminar
          const btnEliminar = tr.querySelector('.btn-eliminar');
          btnEliminar.addEventListener('click', () => {
            eliminarMovimiento(mov.id, 'egreso');
          });
        });
      } else {
        tablaEgresosPeriodo.innerHTML = `<tr><td colspan="4" class="has-text-grey">No hay egresos ${periodo === 'diario' ? 'hoy' : periodo === 'semanal' ? 'esta semana' : 'este mes'}</td></tr>`;
      }
    }
  }
}

// Funciones para agregar filas individuales sin recargar tablas
async function agregarFilaIngresoATabla(movimiento) {
  const tablaIngresosPeriodo = document.getElementById('tablaIngresosPeriodo');
  if (!tablaIngresosPeriodo) return;
  
  // Eliminar fila de "no hay ingresos" si existe
  const filaVacia = tablaIngresosPeriodo.querySelector('tr td[colspan="4"]');
  if (filaVacia) {
    filaVacia.closest('tr').remove();
  }
  
  const tr = document.createElement('tr');
  const fecha = new Date(movimiento.fecha);
  const fechaTexto = fecha.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  tr.innerHTML = `
    <td>${fechaTexto}</td>
    <td class="has-text-weight-bold has-text-success">Bs ${parseFloat(movimiento.cantidad).toFixed(2)}</td>
    <td>${movimiento.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
    <td>
      <button class="button is-small is-danger btn-eliminar" data-id="${movimiento.id}" data-tipo="ingreso">
        <span class="icon is-small">
          <i class="fas fa-times"></i>
        </span>
      </button>
    </td>
  `;
  
  // Insertar al principio (más reciente arriba)
  tablaIngresosPeriodo.insertBefore(tr, tablaIngresosPeriodo.firstChild);
  
  // Agregar event listener al botón eliminar
  const btnEliminar = tr.querySelector('.btn-eliminar');
  btnEliminar.addEventListener('click', () => {
    eliminarMovimiento(movimiento.id, 'ingreso');
  });
  
  // Actualizar solo el total
  await actualizarSoloTotalIngresos();
}

async function agregarFilaEgresoATabla(movimiento) {
  const tablaEgresosPeriodo = document.getElementById('tablaEgresosPeriodo');
  if (!tablaEgresosPeriodo) return;
  
  // Eliminar fila de "no hay egresos" si existe
  const filaVacia = tablaEgresosPeriodo.querySelector('tr td[colspan="4"]');
  if (filaVacia) {
    filaVacia.closest('tr').remove();
  }
  
  const tr = document.createElement('tr');
  const fecha = new Date(movimiento.fecha);
  const fechaTexto = fecha.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  tr.innerHTML = `
    <td>${fechaTexto}</td>
    <td class="has-text-weight-bold has-text-danger">Bs ${parseFloat(movimiento.cantidad).toFixed(2)}</td>
    <td>${movimiento.descripcion || '<em class="has-text-grey">Sin descripción</em>'}</td>
    <td>
      <button class="button is-small is-danger btn-eliminar" data-id="${movimiento.id}" data-tipo="egreso">
        <span class="icon is-small">
          <i class="fas fa-times"></i>
        </span>
      </button>
    </td>
  `;
  
  // Insertar al principio (más reciente arriba)
  tablaEgresosPeriodo.insertBefore(tr, tablaEgresosPeriodo.firstChild);
  
  // Agregar event listener al botón eliminar
  const btnEliminar = tr.querySelector('.btn-eliminar');
  btnEliminar.addEventListener('click', () => {
    eliminarMovimiento(movimiento.id, 'egreso');
  });
  
  // Actualizar solo el total
  await actualizarSoloTotalEgresos();
}

// Funciones para actualizar solo totales (sin tocar tablas ni inputs)
async function actualizarSoloTotalIngresos() {
  const filtroActivo = document.querySelector('.button.is-success.is-selected');
  if (filtroActivo) {
    const periodo = filtroActivo.id.replace('filtro', '').toLowerCase();
    
    let resumen;
    switch(periodo) {
      case 'diario':
        resumen = await electronAPI.invoke('obtener-ingresos-dia');
        break;
      case 'semanal':
        resumen = await electronAPI.invoke('obtener-ingresos-semana');
        break;
      case 'mensual':
        resumen = await electronAPI.invoke('obtener-ingresos-mes');
        break;
    }
    
    const totalPeriodo = document.getElementById('totalPeriodo');
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
    }
  }
}

async function actualizarSoloTotalEgresos() {
  const filtroActivo = document.querySelector('.button.is-danger.is-selected');
  if (filtroActivo) {
    const periodo = filtroActivo.id.replace('filtro', '').replace('Egr', '').toLowerCase();
    
    let resumen;
    switch(periodo) {
      case 'diario':
        resumen = await electronAPI.invoke('obtener-egresos-dia');
        break;
      case 'semanal':
        resumen = await electronAPI.invoke('obtener-egresos-semana');
        break;
      case 'mensual':
        resumen = await electronAPI.invoke('obtener-egresos-mes');
        break;
    }
    
    const totalPeriodo = document.getElementById('totalPeriodoEgresos');
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
    }
  }
}

async function actualizarSoloTotalLista(tipo) {
  // Calcular total de las filas visibles en la tabla
  const tabla = document.getElementById('listaMovimientos');
  const filas = tabla.querySelectorAll('tr');
  let total = 0;
  
  filas.forEach(fila => {
    const celdaCantidad = fila.querySelector('td:nth-child(2)');
    if (celdaCantidad) {
      const texto = celdaCantidad.textContent;
      const numero = parseFloat(texto.replace('Bs ', ''));
      if (!isNaN(numero)) {
        total += numero;
      }
    }
  });
  
  const totalLista = document.getElementById('totalLista');
  if (totalLista) {
    totalLista.textContent = `Total ${tipo === 'ingreso' ? 'Ingresos' : 'Egresos'}: Bs ${total.toFixed(2)}`;
  }
}

// Función para mostrar modal de confirmación sin interferir con el foco
function mostrarModalConfirmacion(mensaje, onConfirm) {
  // Crear modal dinámicamente
  const modal = document.createElement('div');
  modal.className = 'modal is-active';
  modal.innerHTML = `
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Confirmar eliminación</p>
      </header>
      <section class="modal-card-body">
        <p>${mensaje}</p>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-danger" id="confirmarEliminar">Sí, eliminar</button>
        <button class="button" id="cancelarEliminar">Cancelar</button>
      </footer>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners para los botones
  document.getElementById('confirmarEliminar').onclick = () => {
    document.body.removeChild(modal);
    onConfirm();
  };
  
  document.getElementById('cancelarEliminar').onclick = () => {
    document.body.removeChild(modal);
  };
  
  // Cerrar modal al hacer clic en el fondo
  modal.querySelector('.modal-background').onclick = () => {
    document.body.removeChild(modal);
  };
}

// Función para eliminar movimiento
async function eliminarMovimiento(id, tipo) {
  mostrarModalConfirmacion('¿Estás seguro de que quieres eliminar este registro?', async () => {
    try {
      // PRIMERO: Eliminar la fila visual ANTES de la operación del backend
      const filaAEliminar = document.querySelector(`button[data-id="${id}"]`).closest('tr');
      if (filaAEliminar) {
        filaAEliminar.remove();
        console.log('Fila eliminada del DOM:', id);
      }
      
      // SEGUNDO: Eliminar del backend
      await electronAPI.invoke('eliminar-movimiento', id);
      console.log('Movimiento eliminado del backend:', id);
      
      // TERCERO: Actualizar solo los totales sin tocar las tablas
      const vistaIngresos = document.querySelector('#viewIngresos:not(.is-hidden)');
      const vistaEgresos = document.querySelector('#viewEgresos:not(.is-hidden)');
      const vistaLista = document.querySelector('#viewLista:not(.is-hidden)');
      
      if (vistaIngresos && tipo === 'ingreso') {
        await actualizarSoloTotalIngresos();
      } else if (vistaEgresos && tipo === 'egreso') {
        await actualizarSoloTotalEgresos();
      } else if (vistaLista) {
        await actualizarSoloTotalLista(tipo);
      }
      
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      alert('Error al eliminar el registro');
      // Si hay error, recargar la vista para restaurar consistencia
      location.reload();
    }
  });
}

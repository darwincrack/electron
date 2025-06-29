// Esperar a que el DOM y electronAPI estén disponibles

// Referencias a secciones
const mainMenu = document.getElementById('mainMenu');
const viewIngresos = document.getElementById('viewIngresos');
const viewEgresos = document.getElementById('viewEgresos');
const viewLista = document.getElementById('viewLista');
const viewGrafico = document.getElementById('viewGrafico');

// Variables globales para el tipo de cambio
let tipoCambioDolar = { price: 0, symbol: '?', title: 'Cargando...', last_update: '' };

// Función para obtener el tipo de cambio del dólar
async function obtenerTipoCambio() {
  try {
    tipoCambioDolar = await electronAPI.invoke('obtener-tipo-cambio-dolar');
    actualizarIndicadorDolar();
  } catch (error) {
    console.error('Error al obtener tipo de cambio:', error);
    tipoCambioDolar = { price: 0, symbol: '?', title: 'Error', last_update: 'No disponible' };
    actualizarIndicadorDolar();
  }
}

// Función para actualizar el indicador de dólar en la UI
function actualizarIndicadorDolar() {
  const indicadores = document.querySelectorAll('.indicador-dolar');
  indicadores.forEach(indicador => {
    if (tipoCambioDolar.price > 0) {
      indicador.innerHTML = `
        <span class="icon-text">
          <span class="icon has-text-success">
            <i class="fas fa-dollar-sign"></i>
          </span>
          <span class="has-text-weight-bold">Bs ${tipoCambioDolar.price.toFixed(2)} ${tipoCambioDolar.symbol}</span>
        </span>
      `;
      indicador.title = `Última actualización: ${tipoCambioDolar.last_update}`;
    } else {
      indicador.innerHTML = `
        <span class="icon-text">
          <span class="icon has-text-grey">
            <i class="fas fa-dollar-sign"></i>
          </span>
          <span class="has-text-grey">No disponible</span>
        </span>
      `;
    }
  });
}

// Función para convertir bolívares a dólares
function convertirADolares(bolivares) {
  if (tipoCambioDolar.price > 0) {
    return (bolivares / tipoCambioDolar.price).toFixed(2);
  }
  return '0.00';
}

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
    <div class="level mb-4">
      <div class="level-left">
        <button class="button is-light volver-btn" id="volverMenu1">← Volver al menú</button>
      </div>
      <div class="level-right">
        <div class="indicador-dolar"></div>
      </div>
    </div>
    
    <div class="columns">
      <!-- Columna izquierda: Formulario -->
      <div class="column is-half">
        <div class="box">
          <h2 class="title is-4">Registrar Ingreso</h2>
          <form id="formIngreso">
            <div class="field">
              <label class="label">Tipo de Pago *</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select id="tipoPagoIngreso" required>
                    <option value="">Seleccionar tipo</option>
                    <option value="efectivo" selected>Efectivo</option>
                    <option value="pago_movil">Pago Móvil</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">Cantidad *</label>
              <div class="control">
                <input class="input" type="number" id="cantidadIngreso" min="0.01" step="0.01" required>
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
          <div class="has-text-centered">
            <p class="title is-3 has-text-success" id="totalPeriodo">Bs 0.00</p>
            <p class="subtitle is-6 has-text-success" id="totalPeriodoDolares">≈ $0.00 USD</p>
            <p class="subtitle is-6 has-text-grey" id="textoPeriodo">Hoy</p>
          </div>
        </div>
        
        <!-- Resumen por tipo de pago -->
        <div class="box">
          <h3 class="title is-6 has-text-info">Desglose por Tipo de Pago</h3>
          <div id="resumenTipoPago">
            <div class="columns is-mobile">
              <div class="column has-text-centered">
                <p class="heading">Efectivo</p>
                <p class="title is-6 has-text-success" id="totalEfectivo">Bs 0.00</p>
                <p class="subtitle is-7 has-text-success" id="totalEfectivoDolares">≈ $0.00</p>
              </div>
              <div class="column has-text-centered">
                <p class="heading">Pago Móvil</p>
                <p class="title is-6 has-text-success" id="totalPagoMovil">Bs 0.00</p>
                <p class="subtitle is-7 has-text-success" id="totalPagoMovilDolares">≈ $0.00</p>
              </div>
            </div>
          </div>
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
                  <th>Tipo Pago</th>
                  <th>Descripción</th>
                  <th width="80">Acción</th>
                </tr>
              </thead>
              <tbody id="tablaIngresosPeriodo">
                <tr>
                  <td colspan="5" class="has-text-grey">No hay ingresos</td>
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
  
  // Dar foco al campo de cantidad para mejorar UX
  document.getElementById('cantidadIngreso').focus();
  
  // Event listeners para filtros
  document.getElementById('filtroDiario').onclick = () => cambiarFiltroIngresos('diario');
  document.getElementById('filtroSemanal').onclick = () => cambiarFiltroIngresos('semanal');
  document.getElementById('filtroMensual').onclick = () => cambiarFiltroIngresos('mensual');
  
  // Obtener tipo de cambio y actualizar indicador
  obtenerTipoCambio();
  
  registrarIngreso();
  cambiarFiltroIngresos('diario'); // Cargar filtro diario por defecto
});

// Vista Egresos
btnEgreso.addEventListener('click', () => {
  ocultarTodo();
  viewEgresos.innerHTML = `
    <div class="level mb-4">
      <div class="level-left">
        <button class="button is-light volver-btn" id="volverMenu2">← Volver al menú</button>
      </div>
      <div class="level-right">
        <div class="indicador-dolar"></div>
      </div>
    </div>
    
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
          <div class="has-text-centered">
            <p class="title is-3 has-text-danger" id="totalPeriodoEgresos">Bs 0.00</p>
            <p class="subtitle is-6 has-text-danger" id="totalPeriodoEgresosDolares">≈ $0.00 USD</p>
            <p class="subtitle is-6 has-text-grey" id="textoPeriodoEgresos">Hoy</p>
          </div>
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
  
  // Obtener tipo de cambio y actualizar indicador
  obtenerTipoCambio();
  
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
    <div class="level mb-4">
      <div class="level-left">
        <button class="button is-light volver-btn" id="volverMenu3">← Volver al menú</button>
      </div>
      <div class="level-right">
        <div class="indicador-dolar"></div>
      </div>
    </div>
    
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
      
      <!-- Filtros de tipo de pago (solo para ingresos) -->
      <div id="filtrosTipoPago" class="mb-4">
        <p class="has-text-centered has-text-weight-bold mb-2">Filtrar por Tipo de Pago:</p>
        <div class="buttons has-addons is-centered">
          <button class="button is-info is-selected" id="filtroTodos">Todos</button>
          <button class="button is-info" id="filtroEfectivo">Efectivo</button>
          <button class="button is-info" id="filtroPagoMovil">Pago Móvil</button>
        </div>
      </div>
      
      <!-- Tabla de movimientos -->
      <div style="max-height: 400px; overflow-y: auto;">
        <table class="table is-fullwidth is-striped">
                        <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Cantidad</th>
                  <th>Tipo Pago</th>
                  <th>Descripción</th>
                  <th width="80">Acción</th>
                </tr>
              </thead>
              <tbody id="listaMovimientos">
                <tr>
                  <td colspan="5" class="has-text-grey">Cargando...</td>
                </tr>
              </tbody>
        </table>
      </div>
      
      <div class="mt-4 has-text-weight-bold" id="totalLista">Total: Bs 0.00</div>
    </div>
  `;
  viewLista.classList.remove('is-hidden');
  document.getElementById('volverMenu3').onclick = volverMenu;
  
  // Obtener tipo de cambio y actualizar indicador
  obtenerTipoCambio();
  
  // Event listeners
  document.getElementById('aplicarFiltroFecha').onclick = () => {
    const tipoActual = document.getElementById('filtroIngresos').classList.contains('is-selected') ? 'ingreso' : 'egreso';
    
    // Si es ingreso, obtener el filtro de tipo de pago activo
    let tipoPagoFiltro = 'todos';
    if (tipoActual === 'ingreso') {
      if (document.getElementById('filtroEfectivo').classList.contains('is-selected')) {
        tipoPagoFiltro = 'efectivo';
      } else if (document.getElementById('filtroPagoMovil').classList.contains('is-selected')) {
        tipoPagoFiltro = 'pago_movil';
      }
    }
    
    cargarListaMovimientos(tipoActual, tipoPagoFiltro);
  };
  
  document.getElementById('filtroIngresos').onclick = () => {
    document.getElementById('filtroIngresos').classList.add('is-selected');
    document.getElementById('filtroEgresos').classList.remove('is-selected');
    // Mostrar filtros de tipo de pago solo para ingresos
    document.getElementById('filtrosTipoPago').style.display = 'block';
    cargarListaMovimientos('ingreso');
  };
  document.getElementById('filtroEgresos').onclick = () => {
    document.getElementById('filtroEgresos').classList.add('is-selected');
    document.getElementById('filtroIngresos').classList.remove('is-selected');
    // Ocultar filtros de tipo de pago para egresos
    document.getElementById('filtrosTipoPago').style.display = 'none';
    cargarListaMovimientos('egreso');
  };
  
  // Event listeners para filtros de tipo de pago
  document.getElementById('filtroTodos').onclick = () => {
    document.querySelectorAll('#filtroTodos, #filtroEfectivo, #filtroPagoMovil').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    document.getElementById('filtroTodos').classList.add('is-selected');
    cargarListaMovimientos('ingreso', 'todos');
  };
  
  document.getElementById('filtroEfectivo').onclick = () => {
    document.querySelectorAll('#filtroTodos, #filtroEfectivo, #filtroPagoMovil').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    document.getElementById('filtroEfectivo').classList.add('is-selected');
    cargarListaMovimientos('ingreso', 'efectivo');
  };
  
  document.getElementById('filtroPagoMovil').onclick = () => {
    document.querySelectorAll('#filtroTodos, #filtroEfectivo, #filtroPagoMovil').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    document.getElementById('filtroPagoMovil').classList.add('is-selected');
    cargarListaMovimientos('ingreso', 'pago_movil');
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
    <div class="level mb-4">
      <div class="level-left">
        <button class="button is-light volver-btn" id="volverMenu4">← Volver al menú</button>
      </div>
      <div class="level-right">
        <div class="indicador-dolar"></div>
      </div>
    </div>
    
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
      
      <!-- Filtros de tipo de pago para ingresos -->
      <div class="mb-4">
        <p class="has-text-centered has-text-weight-bold mb-2">Filtrar Ingresos por Tipo de Pago:</p>
        <div class="buttons has-addons is-centered">
          <button class="button is-primary is-selected" id="graficoTodos">Todos</button>
          <button class="button is-primary" id="graficoEfectivo">Solo Efectivo</button>
          <button class="button is-primary" id="graficoPagoMovil">Solo Pago Móvil</button>
        </div>
      </div>
      
      <canvas id="graficoMovimientos" width="600" height="300"></canvas>
    </div>
  `;
  viewGrafico.classList.remove('is-hidden');
  document.getElementById('volverMenu4').onclick = volverMenu;
  
  // Obtener tipo de cambio y actualizar indicador
  obtenerTipoCambio();
  
  // Event listener para actualizar gráfico
  document.getElementById('actualizarGrafico').onclick = () => {
    cargarGraficoMovimientos();
  };
  
  // Event listeners para filtros de tipo de pago en gráfico
  document.getElementById('graficoTodos').onclick = () => {
    document.querySelectorAll('#graficoTodos, #graficoEfectivo, #graficoPagoMovil').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    document.getElementById('graficoTodos').classList.add('is-selected');
    cargarGraficoMovimientos('todos');
  };
  
  document.getElementById('graficoEfectivo').onclick = () => {
    document.querySelectorAll('#graficoTodos, #graficoEfectivo, #graficoPagoMovil').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    document.getElementById('graficoEfectivo').classList.add('is-selected');
    cargarGraficoMovimientos('efectivo');
  };
  
  document.getElementById('graficoPagoMovil').onclick = () => {
    document.querySelectorAll('#graficoTodos, #graficoEfectivo, #graficoPagoMovil').forEach(btn => {
      btn.classList.remove('is-selected');
    });
    document.getElementById('graficoPagoMovil').classList.add('is-selected');
    cargarGraficoMovimientos('pago_movil');
  };
  
  cargarGraficoMovimientos();
});

// Funciones para cada vista
function registrarIngreso() {
  const formIngreso = document.getElementById('formIngreso');
  
  formIngreso.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tipoPago = document.getElementById('tipoPagoIngreso').value;
    const cantidad = parseFloat(document.getElementById('cantidadIngreso').value);
    const descripcion = document.getElementById('descripcionIngreso').value.trim();
    
    if (!tipoPago) {
      alert('Por favor selecciona un tipo de pago');
      return;
    }
    if (!cantidad || cantidad <= 0) return;
    
    try {
      const result = await electronAPI.invoke('guardar-movimiento', {
        tipo: 'ingreso',
        cantidad,
        descripcion,
        tipo_pago: tipoPago
      });
      
      // Mostrar mensaje de éxito
      const successIngreso = document.getElementById('successIngreso');
      successIngreso.style.display = 'block';
      formIngreso.reset();
      document.getElementById('cantidadIngreso').focus();
      
      // Agregar la nueva fila a la tabla existente (sin recargar)
      await agregarFilaIngresoATabla({ id: result.id, tipo: 'ingreso', cantidad, descripcion, tipo_pago: tipoPago, fecha: new Date() });
      
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

async function cargarListaMovimientos(tipo = 'ingreso', tipoPagoFiltro = 'todos') {
  try {
    // Obtener rangos de fecha de los inputs
    const fechaDesde = document.getElementById('fechaDesde')?.value;
    const fechaHasta = document.getElementById('fechaHasta')?.value;
    
    // Si es ingreso y hay filtro de tipo de pago, usar el endpoint filtrado
    let movimientos;
    if (tipo === 'ingreso' && tipoPagoFiltro && tipoPagoFiltro !== 'todos') {
      movimientos = await electronAPI.invoke('obtener-movimientos-rango-tipo-pago', {
        tipo,
        fechaDesde,
        fechaHasta,
        tipoPago: tipoPagoFiltro
      });
    } else {
      movimientos = await electronAPI.invoke('obtener-movimientos-rango', {
        tipo,
        fechaDesde,
        fechaHasta
      });
    }
    
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
        
        // Formatear tipo de pago (solo para ingresos)
        const tipoPagoTexto = tipo === 'ingreso' && mov.tipo_pago ? 
          (mov.tipo_pago === 'pago_movil' ? 'Pago Móvil' : 
           mov.tipo_pago === 'efectivo' ? 'Efectivo' : 'No especificado') :
          (tipo === 'egreso' ? '<em class="has-text-grey">N/A</em>' : '<em class="has-text-grey">No especificado</em>');
        
        tr.innerHTML = `
          <td>${fechaTexto}</td>
          <td class="has-text-weight-bold ${tipo === 'ingreso' ? 'has-text-success' : 'has-text-danger'}">Bs ${parseFloat(mov.cantidad).toFixed(2)}</td>
          <td>${tipoPagoTexto}</td>
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
      totalLista.innerHTML = `
        <span class="has-text-weight-bold">Total ${tipo === 'ingreso' ? 'Ingresos' : 'Egresos'}: Bs ${total.toFixed(2)}</span><br>
        <span class="has-text-grey">≈ $${convertirADolares(total)} USD</span>
      `;
    } else {
      listaMovimientos.innerHTML = `<tr><td colspan="5" class="has-text-grey">No hay ${tipo}s en este período</td></tr>`;
      totalLista.innerHTML = `
        <span class="has-text-weight-bold">Total: Bs 0.00</span><br>
        <span class="has-text-grey">≈ $0.00 USD</span>
      `;
    }
  } catch (error) {
    console.error('Error al cargar lista de movimientos:', error);
    const listaMovimientos = document.getElementById('listaMovimientos');
    if (listaMovimientos) {
      listaMovimientos.innerHTML = `<tr><td colspan="5" class="has-text-danger">Error al cargar datos</td></tr>`;
    }
  }
}

// Función para actualizar resumen por tipo de pago
async function actualizarResumenTipoPago() {
  const filtroActivo = document.querySelector('.button.is-success.is-selected');
  if (filtroActivo) {
    const periodo = filtroActivo.id.replace('filtro', '').toLowerCase();
    
    try {
      let reporte;
      switch(periodo) {
        case 'diario':
          reporte = await electronAPI.invoke('obtener-reporte-tipo-pago-dia');
          break;
        case 'semanal':
          reporte = await electronAPI.invoke('obtener-reporte-tipo-pago-semana');
          break;
        case 'mensual':
          reporte = await electronAPI.invoke('obtener-reporte-tipo-pago-mes');
          break;
      }
      
      let totalEfectivo = 0;
      let totalPagoMovil = 0;
      
      if (reporte && reporte.length > 0) {
        reporte.forEach(item => {
          if (item.tipo_pago === 'efectivo') {
            totalEfectivo = item.total;
          } else if (item.tipo_pago === 'pago_movil') {
            totalPagoMovil = item.total;
          }
        });
      }
      
      const elementoEfectivo = document.getElementById('totalEfectivo');
      const elementoPagoMovil = document.getElementById('totalPagoMovil');
      const elementoEfectivoDolares = document.getElementById('totalEfectivoDolares');
      const elementoPagoMovilDolares = document.getElementById('totalPagoMovilDolares');
      
      if (elementoEfectivo) {
        elementoEfectivo.textContent = `Bs ${totalEfectivo.toFixed(2)}`;
      }
      if (elementoPagoMovil) {
        elementoPagoMovil.textContent = `Bs ${totalPagoMovil.toFixed(2)}`;
      }
      
      // Agregar conversiones a dólares
      if (elementoEfectivoDolares) {
        elementoEfectivoDolares.textContent = `≈ $${convertirADolares(totalEfectivo)}`;
      }
      if (elementoPagoMovilDolares) {
        elementoPagoMovilDolares.textContent = `≈ $${convertirADolares(totalPagoMovil)}`;
      }
      
    } catch (error) {
      console.error('Error al obtener resumen por tipo de pago:', error);
    }
  }
}

async function cargarGraficoMovimientos(tipoPagoFiltro = 'todos') {
  try {
    const ctx = document.getElementById('graficoMovimientos').getContext('2d');
    
    // Obtener rangos de fecha de los inputs
    const fechaDesde = document.getElementById('fechaDesdeGrafico')?.value;
    const fechaHasta = document.getElementById('fechaHastaGrafico')?.value;
    
    // Si hay filtro de tipo de pago, usar el endpoint filtrado
    let datos;
    if (tipoPagoFiltro && tipoPagoFiltro !== 'todos') {
      datos = await electronAPI.invoke('obtener-datos-grafico-rango-tipo-pago', {
        fechaDesde,
        fechaHasta,
        tipoPago: tipoPagoFiltro
      });
    } else {
      datos = await electronAPI.invoke('obtener-datos-grafico-rango', {
        fechaDesde,
        fechaHasta
      });
    }
    
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
            text: `Reporte de ${fechaDesde} a ${fechaHasta}${tipoPagoFiltro !== 'todos' ? ` (Ingresos: ${tipoPagoFiltro === 'efectivo' ? 'Efectivo' : 'Pago Móvil'})` : ''}`,
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
    const totalPeriodoDolares = document.getElementById('totalPeriodoDolares');
    const textoPeriodoEl = document.getElementById('textoPeriodo');
    const tituloTabla = document.getElementById('tituloTabla');
    const tablaIngresosPeriodo = document.getElementById('tablaIngresosPeriodo');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
    }
    
    if (totalPeriodoDolares) {
      totalPeriodoDolares.textContent = `≈ $${convertirADolares(parseFloat(resumen.total || 0))} USD`;
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
          
          // Formatear tipo de pago
          const tipoPagoTexto = mov.tipo_pago === 'pago_movil' ? 'Pago Móvil' : 
                               mov.tipo_pago === 'efectivo' ? 'Efectivo' : 
                               '<em class="has-text-grey">No especificado</em>';
          
          tr.innerHTML = `
            <td>${fechaTexto}</td>
            <td class="has-text-weight-bold has-text-success">Bs ${parseFloat(mov.cantidad).toFixed(2)}</td>
            <td>${tipoPagoTexto}</td>
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
        tablaIngresosPeriodo.innerHTML = `<tr><td colspan="5" class="has-text-grey">No hay ingresos ${periodo === 'diario' ? 'hoy' : periodo === 'semanal' ? 'esta semana' : 'este mes'}</td></tr>`;
      }
    }
    
    // Actualizar resumen por tipo de pago
    await actualizarResumenTipoPago();
    
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
    const totalPeriodoDolares = document.getElementById('totalPeriodoEgresosDolares');
    const textoPeriodoEl = document.getElementById('textoPeriodoEgresos');
    const tituloTabla = document.getElementById('tituloTablaEgresos');
    const tablaEgresosPeriodo = document.getElementById('tablaEgresosPeriodo');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
    }
    
    if (totalPeriodoDolares) {
      totalPeriodoDolares.textContent = `≈ $${convertirADolares(parseFloat(resumen.total || 0))} USD`;
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
          
          // Formatear tipo de pago
          const tipoPagoTexto = mov.tipo_pago === 'pago_movil' ? 'Pago Móvil' : 
                               mov.tipo_pago === 'efectivo' ? 'Efectivo' : 
                               '<em class="has-text-grey">No especificado</em>';
          
          tr.innerHTML = `
            <td>${fechaTexto}</td>
            <td class="has-text-weight-bold has-text-success">Bs ${parseFloat(mov.cantidad).toFixed(2)}</td>
            <td>${tipoPagoTexto}</td>
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
        tablaIngresosPeriodo.innerHTML = `<tr><td colspan="5" class="has-text-grey">No hay ingresos ${periodo === 'diario' ? 'hoy' : periodo === 'semanal' ? 'esta semana' : 'este mes'}</td></tr>`;
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
  const filaVacia = tablaIngresosPeriodo.querySelector('tr td[colspan="5"]');
  if (filaVacia) {
    filaVacia.closest('tr').remove();
  }
  
  const tr = document.createElement('tr');
  const fecha = new Date(movimiento.fecha);
  const fechaTexto = fecha.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Formatear tipo de pago
  const tipoPagoTexto = movimiento.tipo_pago === 'pago_movil' ? 'Pago Móvil' : 
                       movimiento.tipo_pago === 'efectivo' ? 'Efectivo' : 
                       '<em class="has-text-grey">No especificado</em>';
  
  tr.innerHTML = `
    <td>${fechaTexto}</td>
    <td class="has-text-weight-bold has-text-success">Bs ${parseFloat(movimiento.cantidad).toFixed(2)}</td>
    <td>${tipoPagoTexto}</td>
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
    const totalPeriodoDolares = document.getElementById('totalPeriodoDolares');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
    }
    
    if (totalPeriodoDolares) {
      totalPeriodoDolares.textContent = `≈ $${convertirADolares(parseFloat(resumen.total || 0))} USD`;
    }
    
    // Actualizar resumen por tipo de pago
    await actualizarResumenTipoPago();
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
    const totalPeriodoDolares = document.getElementById('totalPeriodoEgresosDolares');
    
    if (totalPeriodo) {
      totalPeriodo.textContent = `Bs ${parseFloat(resumen.total || 0).toFixed(2)}`;
    }
    
    if (totalPeriodoDolares) {
      totalPeriodoDolares.textContent = `≈ $${convertirADolares(parseFloat(resumen.total || 0))} USD`;
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
    totalLista.innerHTML = `
      <span class="has-text-weight-bold">Total ${tipo === 'ingreso' ? 'Ingresos' : 'Egresos'}: Bs ${total.toFixed(2)}</span><br>
      <span class="has-text-grey">≈ $${convertirADolares(total)} USD</span>
    `;
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

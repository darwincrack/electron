const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const https = require('https');

// Función para obtener fecha y hora local de Venezuela (UTC-4)
function obtenerFechaHoraLocal() {
  const ahora = new Date();
  
  // Convertir a hora de Venezuela (UTC-4)
  const venezuelaTime = new Date(ahora.toLocaleString("en-US", {timeZone: "America/Caracas"}));
  
  // Formatear como YYYY-MM-DD HH:MM:SS en hora de Venezuela
  const año = venezuelaTime.getFullYear();
  const mes = String(venezuelaTime.getMonth() + 1).padStart(2, '0');
  const dia = String(venezuelaTime.getDate()).padStart(2, '0');
  const hora = String(venezuelaTime.getHours()).padStart(2, '0');
  const minuto = String(venezuelaTime.getMinutes()).padStart(2, '0');
  const segundo = String(venezuelaTime.getSeconds()).padStart(2, '0');
  
  return `${año}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

// Función para obtener solo la fecha local de Venezuela (YYYY-MM-DD)
function obtenerFechaLocal() {
  const ahora = new Date();
  
  // Convertir a hora de Venezuela (UTC-4)
  const venezuelaTime = new Date(ahora.toLocaleString("en-US", {timeZone: "America/Caracas"}));
  
  const año = venezuelaTime.getFullYear();
  const mes = String(venezuelaTime.getMonth() + 1).padStart(2, '0');
  const dia = String(venezuelaTime.getDate()).padStart(2, '0');
  
  return `${año}-${mes}-${dia}`;
}

// Función para obtener el tipo de cambio del dólar
async function obtenerTipoCambioDolar() {
  return new Promise((resolve, reject) => {
    const url = 'https://pydolarve.org/api/v2/tipo-cambio?currency=usd';
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const resultado = JSON.parse(data);
          resolve(resultado);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Inicializar base de datos
const dbPath = path.join(app.getPath('userData'), 'finanzas.db');
const db = new Database(dbPath);

// Crear tabla si no existe
db.exec(`CREATE TABLE IF NOT EXISTS movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  cantidad REAL NOT NULL,
  descripcion TEXT,
  fecha DATETIME DEFAULT (datetime('now', 'localtime')),
  tipo_pago TEXT DEFAULT NULL
)`);

// Agregar columna tipo_pago si no existe (para bases de datos existentes)
try {
  db.exec(`ALTER TABLE movimientos ADD COLUMN tipo_pago TEXT DEFAULT NULL`);
} catch (err) {
  // La columna ya existe, continuamos
  console.log('Columna tipo_pago ya existe en la tabla');
}

// Preparar statements para mejor rendimiento
const insertMovimiento = db.prepare('INSERT INTO movimientos (tipo, cantidad, descripcion, fecha, tipo_pago) VALUES (?, ?, ?, ?, ?)');
const getMovimientos = db.prepare('SELECT * FROM movimientos WHERE tipo = ? ORDER BY fecha DESC LIMIT 50');
const getMovimientosPorRango = db.prepare('SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) >= ? AND DATE(fecha) <= ? ORDER BY fecha DESC');
const getDatosGrafico = db.prepare(`SELECT 
  DATE(fecha) as dia,
  tipo,
  SUM(cantidad) as total
 FROM movimientos 
 WHERE fecha >= ? 
 GROUP BY DATE(fecha), tipo
 ORDER BY dia`);
const getMovimientosPorDia = db.prepare('SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) = ? ORDER BY fecha DESC');
const getDatosGraficoRango = db.prepare('SELECT DATE(fecha) as dia, tipo, SUM(cantidad) as total FROM movimientos WHERE DATE(fecha) >= ? AND DATE(fecha) <= ? GROUP BY DATE(fecha), tipo ORDER BY DATE(fecha)');
const deleteMovimiento = db.prepare('DELETE FROM movimientos WHERE id = ?');

// Preparar statements para reportes por tipo de pago
const getReporteTipoPagoDia = db.prepare('SELECT tipo_pago, SUM(cantidad) as total FROM movimientos WHERE tipo = ? AND DATE(fecha) = ? GROUP BY tipo_pago');
const getReporteTipoPagoRango = db.prepare('SELECT tipo_pago, SUM(cantidad) as total FROM movimientos WHERE tipo = ? AND DATE(fecha) >= ? AND DATE(fecha) <= ? GROUP BY tipo_pago');
const getMovimientosPorRangoYTipoPago = db.prepare('SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) >= ? AND DATE(fecha) <= ? AND tipo_pago = ? ORDER BY fecha DESC');
const getDatosGraficoRangoTipoPago = db.prepare('SELECT DATE(fecha) as dia, tipo, SUM(cantidad) as total FROM movimientos WHERE DATE(fecha) >= ? AND DATE(fecha) <= ? AND (tipo = ? OR (tipo = ? AND tipo_pago = ?)) GROUP BY DATE(fecha), tipo ORDER BY DATE(fecha)');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
};

// Manejadores IPC
ipcMain.handle('guardar-movimiento', (event, data) => {
  try {
    const { tipo, cantidad, descripcion, tipo_pago } = data;
    
    // Usar fecha y hora local de Venezuela/computadora
    const fechaLocal = obtenerFechaHoraLocal();
    
    console.log('Guardando con fecha local Venezuela:', fechaLocal, 'Tipo pago:', tipo_pago);
    
    const result = insertMovimiento.run(tipo, cantidad, descripcion || '', fechaLocal, tipo_pago || null);
    console.log(`Movimiento guardado: ${tipo} Bs ${cantidad} ${tipo_pago ? `(${tipo_pago})` : ''} a las ${fechaLocal} - ID: ${result.lastInsertRowid}`);
    return { id: result.lastInsertRowid };
  } catch (err) {
    console.error('Error al guardar movimiento:', err);
    throw err;
  }
});

ipcMain.handle('obtener-movimientos', (event, tipo) => {
  try {
    const rows = getMovimientos.all(tipo);
    const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
    return { movimientos: rows, total };
  } catch (err) {
    console.error('Error al obtener movimientos:', err);
    throw err;
  }
});

ipcMain.handle('obtener-datos-grafico', (event, dias) => {
  try {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    
    const rows = getDatosGrafico.all(fechaInicio.toISOString());
    
    // Procesar datos para el gráfico
    const labels = [];
    const ingresos = [];
    const egresos = [];
    
    // Crear días para el rango
    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const diaStr = fecha.toISOString().split('T')[0];
      labels.push(fecha.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric' 
      }));
      
      const ingresosDia = rows.find(r => r.dia === diaStr && r.tipo === 'ingreso');
      const egresosDia = rows.find(r => r.dia === diaStr && r.tipo === 'egreso');
      
      ingresos.push(ingresosDia ? ingresosDia.total : 0);
      egresos.push(egresosDia ? egresosDia.total : 0);
    }
    
    return { labels, ingresos, egresos };
  } catch (err) {
    console.error('Error al obtener datos de gráfico:', err);
    throw err;
  }
});

// Obtener ingresos de la semana (desde el lunes)
ipcMain.handle('obtener-ingresos-semana', (event) => {
  try {
    // Calcular el inicio de la semana (lunes) en Venezuela
    const hoy = new Date();
    const horaVenezuela = hoy.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const fechaVenezuela = new Date(horaVenezuela);
    
    const inicioSemana = new Date(fechaVenezuela);
    const dia = fechaVenezuela.getDay();
    const diasDesdeInicio = dia === 0 ? 6 : dia - 1; // Si es domingo (0), son 6 días desde el lunes
    inicioSemana.setDate(fechaVenezuela.getDate() - diasDesdeInicio);
    
    // Calcular el fin de semana (domingo)
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6); // Agregar 6 días para llegar al domingo
    
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0]; // YYYY-MM-DD
    const finSemanaStr = finSemana.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('Buscando ingresos de la semana (Venezuela):', inicioSemanaStr, 'a', finSemanaStr);
    
    const rows = getMovimientosPorRango.all('ingreso', inicioSemanaStr, finSemanaStr);
    console.log('Ingresos encontrados de la semana:', rows);
    const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
    const rangoFechas = `${inicioSemana.toLocaleDateString('es-ES')} - ${finSemana.toLocaleDateString('es-ES')}`;
    return { movimientos: rows, total, rangoFechas };
  } catch (err) {
    console.error('Error al obtener ingresos de la semana:', err);
    throw err;
  }
});

// Obtener ingresos del día actual
ipcMain.handle('obtener-ingresos-dia', (event) => {
  try {
    const fechaHoy = obtenerFechaLocal();
    
    console.log('Buscando ingresos del día (Venezuela):', fechaHoy);
    
    const rows = getMovimientosPorDia.all('ingreso', fechaHoy);
    console.log('Ingresos encontrados del día:', rows);
    const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
    return { movimientos: rows, total };
  } catch (err) {
    console.error('Error al obtener ingresos del día:', err);
    throw err;
  }
});

// Obtener ingresos del mes actual
ipcMain.handle('obtener-ingresos-mes', (event) => {
  try {
    // Usar hora de Venezuela
    const hoy = new Date();
    const horaVenezuela = hoy.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const fechaVenezuela = new Date(horaVenezuela);
    
    const inicioMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth(), 1);
    const finMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth() + 1, 0);
    
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    const finMesStr = finMes.toISOString().split('T')[0];
    
    console.log('Buscando ingresos del mes (Venezuela):', inicioMesStr, 'a', finMesStr);
    
    const rows = getMovimientosPorRango.all('ingreso', inicioMesStr, finMesStr);
    console.log('Ingresos encontrados del mes:', rows);
    const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
    const rangoFechas = `${inicioMes.toLocaleDateString('es-ES')} - ${finMes.toLocaleDateString('es-ES')}`;
    return { movimientos: rows, total, rangoFechas };
  } catch (err) {
    console.error('Error al obtener ingresos del mes:', err);
    throw err;
  }
});

// Obtener egresos de la semana (desde el lunes)
ipcMain.handle('obtener-egresos-semana', (event) => {
  try {
    // Calcular el inicio de la semana (lunes) en Venezuela
    const hoy = new Date();
    const horaVenezuela = hoy.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const fechaVenezuela = new Date(horaVenezuela);
    
    const inicioSemana = new Date(fechaVenezuela);
    const dia = fechaVenezuela.getDay();
    const diasDesdeInicio = dia === 0 ? 6 : dia - 1; // Si es domingo (0), son 6 días desde el lunes
    inicioSemana.setDate(fechaVenezuela.getDate() - diasDesdeInicio);
    
    // Calcular el fin de semana (domingo)
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6); // Agregar 6 días para llegar al domingo
    
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0]; // YYYY-MM-DD
    const finSemanaStr = finSemana.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('Buscando egresos de la semana (Venezuela):', inicioSemanaStr, 'a', finSemanaStr);
    
    const rows = getMovimientosPorRango.all('egreso', inicioSemanaStr, finSemanaStr);
    console.log('Egresos encontrados de la semana:', rows);
    const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
    const rangoFechas = `${inicioSemana.toLocaleDateString('es-ES')} - ${finSemana.toLocaleDateString('es-ES')}`;
    return { movimientos: rows, total, rangoFechas };
  } catch (err) {
    console.error('Error al obtener egresos de la semana:', err);
    throw err;
  }
});

// Obtener egresos del día actual
ipcMain.handle('obtener-egresos-dia', (event) => {
  try {
    const fechaHoy = obtenerFechaLocal();
    
    console.log('Buscando egresos del día (Venezuela):', fechaHoy);
    
    const rows = getMovimientosPorDia.all('egreso', fechaHoy);
    console.log('Egresos encontrados del día:', rows);
    const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
    return { movimientos: rows, total };
  } catch (err) {
    console.error('Error al obtener egresos del día:', err);
    throw err;
  }
});

// Obtener egresos del mes actual
ipcMain.handle('obtener-egresos-mes', (event) => {
  try {
    // Usar hora de Venezuela
    const hoy = new Date();
    const horaVenezuela = hoy.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const fechaVenezuela = new Date(horaVenezuela);
    
    const inicioMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth(), 1);
    const finMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth() + 1, 0);
    
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    const finMesStr = finMes.toISOString().split('T')[0];
    
    console.log('Buscando egresos del mes (Venezuela):', inicioMesStr, 'a', finMesStr);
    
    const rows = getMovimientosPorRango.all('egreso', inicioMesStr, finMesStr);
    console.log('Egresos encontrados del mes:', rows);
    const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
    const rangoFechas = `${inicioMes.toLocaleDateString('es-ES')} - ${finMes.toLocaleDateString('es-ES')}`;
    return { movimientos: rows, total, rangoFechas };
  } catch (err) {
    console.error('Error al obtener egresos del mes:', err);
    throw err;
  }
});

// Obtener movimientos por rango de fechas
ipcMain.handle('obtener-movimientos-rango', (event, { tipo, fechaDesde, fechaHasta }) => {
  try {
    console.log('Buscando movimientos por rango:', { tipo, fechaDesde, fechaHasta });
    
    const rows = getMovimientosPorRango.all(tipo, fechaDesde, fechaHasta);
    console.log(`Movimientos encontrados (${tipo}):`, rows.length);
    return rows;
  } catch (err) {
    console.error('Error al obtener movimientos por rango:', err);
    throw err;
  }
});

// Obtener movimientos por rango de fechas y tipo de pago
ipcMain.handle('obtener-movimientos-rango-tipo-pago', (event, { tipo, fechaDesde, fechaHasta, tipoPago }) => {
  try {
    console.log('Buscando movimientos por rango y tipo de pago:', { tipo, fechaDesde, fechaHasta, tipoPago });
    
    const rows = getMovimientosPorRangoYTipoPago.all(tipo, fechaDesde, fechaHasta, tipoPago);
    console.log(`Movimientos encontrados (${tipo} - ${tipoPago}):`, rows.length);
    return rows;
  } catch (err) {
    console.error('Error al obtener movimientos por rango y tipo de pago:', err);
    throw err;
  }
});

// Obtener datos para gráfico por rango de fechas
ipcMain.handle('obtener-datos-grafico-rango', (event, { fechaDesde, fechaHasta }) => {
  try {
    console.log('Generando datos de gráfico para rango:', fechaDesde, 'a', fechaHasta);
    
    const rows = getDatosGraficoRango.all(fechaDesde, fechaHasta);
    console.log('Datos de gráfico obtenidos:', rows);
    
    // Generar array de fechas en el rango
    const fechaInicio = new Date(fechaDesde);
    const fechaFin = new Date(fechaHasta);
    const labels = [];
    const ingresos = [];
    const egresos = [];
    
    // Iterar día por día en el rango
    for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
      const diaStr = fecha.toISOString().split('T')[0];
      labels.push(fecha.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short' 
      }));
      
      const ingresosDia = rows.find(r => r.dia === diaStr && r.tipo === 'ingreso');
      const egresosDia = rows.find(r => r.dia === diaStr && r.tipo === 'egreso');
      
      ingresos.push(ingresosDia ? ingresosDia.total : 0);
      egresos.push(egresosDia ? egresosDia.total : 0);
    }
    
    return { labels, ingresos, egresos };
  } catch (err) {
    console.error('Error al obtener datos de gráfico:', err);
    throw err;
  }
});

// Obtener datos para gráfico por rango de fechas y tipo de pago
ipcMain.handle('obtener-datos-grafico-rango-tipo-pago', (event, { fechaDesde, fechaHasta, tipoPago }) => {
  try {
    console.log('Generando datos de gráfico para rango y tipo de pago:', fechaDesde, 'a', fechaHasta, 'tipo:', tipoPago);
    
    const rows = getDatosGraficoRangoTipoPago.all(fechaDesde, fechaHasta, 'egreso', 'ingreso', tipoPago);
    console.log('Datos de gráfico filtrados obtenidos:', rows);
    
    // Generar array de fechas en el rango
    const fechaInicio = new Date(fechaDesde);
    const fechaFin = new Date(fechaHasta);
    const labels = [];
    const ingresos = [];
    const egresos = [];
    
    // Iterar día por día en el rango
    for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
      const diaStr = fecha.toISOString().split('T')[0];
      labels.push(fecha.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short' 
      }));
      
      const ingresosDia = rows.find(r => r.dia === diaStr && r.tipo === 'ingreso');
      const egresosDia = rows.find(r => r.dia === diaStr && r.tipo === 'egreso');
      
      ingresos.push(ingresosDia ? ingresosDia.total : 0);
      egresos.push(egresosDia ? egresosDia.total : 0);
    }
    
    return { labels, ingresos, egresos };
  } catch (err) {
    console.error('Error al obtener datos de gráfico filtrados:', err);
    throw err;
  }
});

// Eliminar movimiento
ipcMain.handle('eliminar-movimiento', (event, id) => {
  try {
    const result = deleteMovimiento.run(id);
    console.log(`Movimiento eliminado: ID ${id}, cambios: ${result.changes}`);
    return { success: true, changes: result.changes };
  } catch (err) {
    console.error('Error al eliminar movimiento:', err);
    throw err;
  }
});

// Obtener reportes por tipo de pago
ipcMain.handle('obtener-reporte-tipo-pago-dia', (event) => {
  try {
    const fechaHoy = obtenerFechaLocal();
    const rows = getReporteTipoPagoDia.all('ingreso', fechaHoy);
    console.log('Reporte tipo pago del día:', rows);
    return rows;
  } catch (err) {
    console.error('Error al obtener reporte tipo pago del día:', err);
    throw err;
  }
});

ipcMain.handle('obtener-reporte-tipo-pago-semana', (event) => {
  try {
    // Calcular el inicio de la semana (lunes) en Venezuela
    const hoy = new Date();
    const horaVenezuela = hoy.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const fechaVenezuela = new Date(horaVenezuela);
    
    const inicioSemana = new Date(fechaVenezuela);
    const dia = fechaVenezuela.getDay();
    const diasDesdeInicio = dia === 0 ? 6 : dia - 1;
    inicioSemana.setDate(fechaVenezuela.getDate() - diasDesdeInicio);
    
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];
    const finSemanaStr = finSemana.toISOString().split('T')[0];
    
    const rows = getReporteTipoPagoRango.all('ingreso', inicioSemanaStr, finSemanaStr);
    console.log('Reporte tipo pago de la semana:', rows);
    return rows;
  } catch (err) {
    console.error('Error al obtener reporte tipo pago de la semana:', err);
    throw err;
  }
});

ipcMain.handle('obtener-reporte-tipo-pago-mes', (event) => {
  try {
    // Usar hora de Venezuela
    const hoy = new Date();
    const horaVenezuela = hoy.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const fechaVenezuela = new Date(horaVenezuela);
    
    const inicioMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth(), 1);
    const finMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth() + 1, 0);
    
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    const finMesStr = finMes.toISOString().split('T')[0];
    
    const rows = getReporteTipoPagoRango.all('ingreso', inicioMesStr, finMesStr);
    console.log('Reporte tipo pago del mes:', rows);
    return rows;
  } catch (err) {
    console.error('Error al obtener reporte tipo pago del mes:', err);
    throw err;
  }
});

// Obtener tipo de cambio del dólar
ipcMain.handle('obtener-tipo-cambio-dolar', async (event) => {
  try {
    const tipoCambio = await obtenerTipoCambioDolar();
    console.log('Tipo de cambio obtenido:', tipoCambio);
    return tipoCambio;
  } catch (err) {
    console.error('Error al obtener tipo de cambio:', err);
    // Retornar valor por defecto en caso de error
    return {
      price: 0,
      symbol: '?',
      title: 'Error al obtener tipo de cambio',
      last_update: 'No disponible'
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cerrar base de datos al salir
app.on('before-quit', () => {
  db.close();
});
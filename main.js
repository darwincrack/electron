const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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

// Inicializar base de datos
const dbPath = path.join(__dirname, 'finanzas.db');
const db = new sqlite3.Database(dbPath);

// Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    cantidad REAL NOT NULL,
    descripcion TEXT,
    fecha DATETIME DEFAULT (datetime('now', 'localtime'))
  )`);
});

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
  return new Promise((resolve, reject) => {
    const { tipo, cantidad, descripcion } = data;
    
    // Usar fecha y hora local de Venezuela/computadora
    const fechaLocal = obtenerFechaHoraLocal();
    
    console.log('Guardando con fecha local Venezuela:', fechaLocal);
    
    db.run(
      'INSERT INTO movimientos (tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?)',
      [tipo, cantidad, descripcion || '', fechaLocal],
      function(err) {
        if (err) {
          console.error('Error al guardar movimiento:', err);
          reject(err);
        } else {
          console.log(`Movimiento guardado: ${tipo} Bs ${cantidad} a las ${fechaLocal} - ID: ${this.lastID}`);
          resolve({ id: this.lastID });
        }
      }
    );
  });
});

ipcMain.handle('obtener-movimientos', (event, tipo) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM movimientos WHERE tipo = ? ORDER BY fecha DESC LIMIT 50',
      [tipo],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Calcular total
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          resolve({ movimientos: rows, total });
        }
      }
    );
  });
});

ipcMain.handle('obtener-datos-grafico', (event, dias) => {
  return new Promise((resolve, reject) => {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    
    db.all(
      `SELECT 
        DATE(fecha) as dia,
        tipo,
        SUM(cantidad) as total
       FROM movimientos 
       WHERE fecha >= ? 
       GROUP BY DATE(fecha), tipo
       ORDER BY dia`,
      [fechaInicio.toISOString()],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
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
          
          resolve({ labels, ingresos, egresos });
        }
      }
    );
  });
});

// Obtener ingresos de la semana (desde el lunes)
ipcMain.handle('obtener-ingresos-semana', (event) => {
  return new Promise((resolve, reject) => {
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
    
    db.all(
      "SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) >= ? AND DATE(fecha) <= ? ORDER BY fecha DESC",
      ['ingreso', inicioSemanaStr, finSemanaStr],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log('Ingresos encontrados de la semana:', rows);
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          const rangoFechas = `${inicioSemana.toLocaleDateString('es-ES')} - ${finSemana.toLocaleDateString('es-ES')}`;
          resolve({ movimientos: rows, total, rangoFechas });
        }
      }
    );
  });
});

// Obtener ingresos del día actual
ipcMain.handle('obtener-ingresos-dia', (event) => {
  return new Promise((resolve, reject) => {
    const fechaHoy = obtenerFechaLocal();
    
    console.log('Buscando ingresos del día (Venezuela):', fechaHoy);
    
    db.all(
      "SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) = ? ORDER BY fecha DESC",
      ['ingreso', fechaHoy],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log('Ingresos encontrados del día:', rows);
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          resolve({ movimientos: rows, total });
        }
      }
    );
  });
});

// Obtener ingresos del mes actual
ipcMain.handle('obtener-ingresos-mes', (event) => {
  return new Promise((resolve, reject) => {
    // Usar hora de Venezuela
    const hoy = new Date();
    const horaVenezuela = hoy.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const fechaVenezuela = new Date(horaVenezuela);
    
    const inicioMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth(), 1);
    const finMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth() + 1, 0);
    
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    const finMesStr = finMes.toISOString().split('T')[0];
    
    console.log('Buscando ingresos del mes (Venezuela):', inicioMesStr, 'a', finMesStr);
    
    db.all(
      "SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) >= ? AND DATE(fecha) <= ? ORDER BY fecha DESC",
      ['ingreso', inicioMesStr, finMesStr],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log('Ingresos encontrados del mes:', rows);
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          const rangoFechas = `${inicioMes.toLocaleDateString('es-ES')} - ${finMes.toLocaleDateString('es-ES')}`;
          resolve({ movimientos: rows, total, rangoFechas });
        }
      }
    );
  });
});

// Obtener egresos de la semana (desde el lunes)
ipcMain.handle('obtener-egresos-semana', (event) => {
  return new Promise((resolve, reject) => {
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
    
    db.all(
      "SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) >= ? AND DATE(fecha) <= ? ORDER BY fecha DESC",
      ['egreso', inicioSemanaStr, finSemanaStr],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log('Egresos encontrados de la semana:', rows);
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          const rangoFechas = `${inicioSemana.toLocaleDateString('es-ES')} - ${finSemana.toLocaleDateString('es-ES')}`;
          resolve({ movimientos: rows, total, rangoFechas });
        }
      }
    );
  });
});

// Obtener egresos del día actual
ipcMain.handle('obtener-egresos-dia', (event) => {
  return new Promise((resolve, reject) => {
    const fechaHoy = obtenerFechaLocal();
    
    console.log('Buscando egresos del día (Venezuela):', fechaHoy);
    
    db.all(
      "SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) = ? ORDER BY fecha DESC",
      ['egreso', fechaHoy],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log('Egresos encontrados del día:', rows);
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          resolve({ movimientos: rows, total });
        }
      }
    );
  });
});

// Obtener egresos del mes actual
ipcMain.handle('obtener-egresos-mes', (event) => {
  return new Promise((resolve, reject) => {
    // Usar hora de Venezuela
    const hoy = new Date();
    const horaVenezuela = hoy.toLocaleString("en-US", {timeZone: "America/Caracas"});
    const fechaVenezuela = new Date(horaVenezuela);
    
    const inicioMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth(), 1);
    const finMes = new Date(fechaVenezuela.getFullYear(), fechaVenezuela.getMonth() + 1, 0);
    
    const inicioMesStr = inicioMes.toISOString().split('T')[0];
    const finMesStr = finMes.toISOString().split('T')[0];
    
    console.log('Buscando egresos del mes (Venezuela):', inicioMesStr, 'a', finMesStr);
    
    db.all(
      "SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) >= ? AND DATE(fecha) <= ? ORDER BY fecha DESC",
      ['egreso', inicioMesStr, finMesStr],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log('Egresos encontrados del mes:', rows);
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          const rangoFechas = `${inicioMes.toLocaleDateString('es-ES')} - ${finMes.toLocaleDateString('es-ES')}`;
          resolve({ movimientos: rows, total, rangoFechas });
        }
      }
    );
  });
});

// Obtener movimientos por rango de fechas
ipcMain.handle('obtener-movimientos-rango', (event, { tipo, fechaDesde, fechaHasta }) => {
  return new Promise((resolve, reject) => {
    console.log('Buscando movimientos por rango:', { tipo, fechaDesde, fechaHasta });
    
    db.all(
      "SELECT * FROM movimientos WHERE tipo = ? AND DATE(fecha) >= ? AND DATE(fecha) <= ? ORDER BY fecha DESC",
      [tipo, fechaDesde, fechaHasta],
      (err, rows) => {
        if (err) {
          console.error('Error al obtener movimientos por rango:', err);
          reject(err);
        } else {
          console.log(`Movimientos encontrados (${tipo}):`, rows.length);
          resolve(rows);
        }
      }
    );
  });
});

// Obtener datos para gráfico por rango de fechas
ipcMain.handle('obtener-datos-grafico-rango', (event, { fechaDesde, fechaHasta }) => {
  return new Promise((resolve, reject) => {
    console.log('Generando datos de gráfico para rango:', fechaDesde, 'a', fechaHasta);
    
    db.all(
      "SELECT DATE(fecha) as dia, tipo, SUM(cantidad) as total FROM movimientos WHERE DATE(fecha) >= ? AND DATE(fecha) <= ? GROUP BY DATE(fecha), tipo ORDER BY DATE(fecha)",
      [fechaDesde, fechaHasta],
      (err, rows) => {
        if (err) {
          console.error('Error al obtener datos de gráfico:', err);
          reject(err);
        } else {
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
          
          resolve({ labels, ingresos, egresos });
        }
      }
    );
  });
});

// Eliminar movimiento
ipcMain.handle('eliminar-movimiento', (event, id) => {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM movimientos WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          console.error('Error al eliminar movimiento:', err);
          reject(err);
        } else {
          console.log(`Movimiento eliminado: ID ${id}, cambios: ${this.changes}`);
          resolve({ success: true, changes: this.changes });
        }
      }
    );
  });
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
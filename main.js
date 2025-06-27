const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Función para obtener fecha y hora local de Venezuela
function obtenerFechaHoraLocal() {
  const ahora = new Date();
  
  // Formatear como YYYY-MM-DD HH:MM:SS en hora local
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const hora = String(ahora.getHours()).padStart(2, '0');
  const minuto = String(ahora.getMinutes()).padStart(2, '0');
  const segundo = String(ahora.getSeconds()).padStart(2, '0');
  
  return `${año}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

// Función para obtener solo la fecha local (YYYY-MM-DD)
function obtenerFechaLocal() {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  
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
          console.log(`Movimiento guardado: ${tipo} $${cantidad} a las ${fechaLocal} - ID: ${this.lastID}`);
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
    // Calcular el inicio de la semana (lunes)
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    const dia = hoy.getDay();
    const diasDesdeInicio = dia === 0 ? 6 : dia - 1; // Si es domingo (0), son 6 días desde el lunes
    inicioSemana.setDate(hoy.getDate() - diasDesdeInicio);
    inicioSemana.setHours(0, 0, 0, 0);
    
    db.all(
      'SELECT SUM(cantidad) as total FROM movimientos WHERE tipo = ? AND fecha >= ?',
      ['ingreso', inicioSemana.toISOString()],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ total: rows[0]?.total || 0 });
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
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);
    
    db.all(
      'SELECT * FROM movimientos WHERE tipo = ? AND fecha >= ? ORDER BY fecha DESC',
      ['ingreso', inicioMes.toISOString()],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          resolve({ movimientos: rows, total });
        }
      }
    );
  });
});

// Obtener egresos de la semana (desde el lunes)
ipcMain.handle('obtener-egresos-semana', (event) => {
  return new Promise((resolve, reject) => {
    // Calcular el inicio de la semana (lunes)
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    const dia = hoy.getDay();
    const diasDesdeInicio = dia === 0 ? 6 : dia - 1; // Si es domingo (0), son 6 días desde el lunes
    inicioSemana.setDate(hoy.getDate() - diasDesdeInicio);
    inicioSemana.setHours(0, 0, 0, 0);
    
    db.all(
      'SELECT SUM(cantidad) as total FROM movimientos WHERE tipo = ? AND fecha >= ?',
      ['egreso', inicioSemana.toISOString()],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ total: rows[0]?.total || 0 });
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
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);
    
    db.all(
      'SELECT * FROM movimientos WHERE tipo = ? AND fecha >= ? ORDER BY fecha DESC',
      ['egreso', inicioMes.toISOString()],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const total = rows.reduce((sum, mov) => sum + mov.cantidad, 0);
          resolve({ movimientos: rows, total });
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
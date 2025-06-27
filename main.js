const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
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
ipcMain.on('guardar-movimiento', (event, data) => {
  const { tipo, cantidad, descripcion } = data;
  
  db.run(
    'INSERT INTO movimientos (tipo, cantidad, descripcion) VALUES (?, ?, ?)',
    [tipo, cantidad, descripcion || ''],
    function(err) {
      if (err) {
        console.error('Error al guardar movimiento:', err);
        event.reply('error-movimiento', err.message);
      } else {
        console.log(`Movimiento guardado: ${tipo} $${cantidad}`);
        event.reply('movimiento-guardado', { id: this.lastID });
      }
    }
  );
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
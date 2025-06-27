const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { app, BrowserWindow, ipcMain } = require('electron');

// Ruta de la base de datos local
const dbPath = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Base de datos SQLite conectada.');
  }
});

// Crear tabla si no existe
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL, -- 'ingreso' o 'egreso'
    cantidad REAL NOT NULL,
    descripcion TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;
db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error al crear la tabla:', err.message);
  } else {
    console.log("Tabla 'movimientos' lista.");
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('guardar-movimiento', (event, movimiento) => {
  const { tipo, cantidad, descripcion } = movimiento;
  const stmt = db.prepare('INSERT INTO movimientos (tipo, cantidad, descripcion) VALUES (?, ?, ?)');
  stmt.run(tipo, cantidad, descripcion, function(err) {
    if (err) {
      console.error('Error al guardar movimiento:', err.message);
    } else {
      event.reply('movimiento-guardado');
    }
  });
  stmt.finalize();
}); 
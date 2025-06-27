# 💰 Gestión Financiera

Una aplicación de escritorio moderna y completa para la gestión de finanzas personales, desarrollada con Electron, SQLite y tecnologías web modernas.

![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

## 📋 Características Principales

### ✨ **Gestión de Movimientos**
- **Registro de Ingresos** con tipos de pago (Efectivo/Pago Móvil)
- **Registro de Egresos** con descripciones opcionales
- **Eliminación** de movimientos con confirmación
- **Efectivo preseleccionado** por defecto para mayor rapidez

### 📊 **Reportes y Análisis**
- **Filtros por período**: Diario, Semanal, Mensual
- **Desglose por tipo de pago** para ingresos
- **Gráficos interactivos** con Chart.js
- **Filtros avanzados** en gráficos por tipo de pago

### 🔍 **Lista de Movimientos**
- **Filtros por tipo**: Ingresos/Egresos
- **Filtros por tipo de pago**: Efectivo/Pago Móvil/Todos
- **Filtros por rango de fechas** personalizables
- **Totales dinámicos** por categoría

### 🚀 **Experiencia de Usuario**
- **Foco automático** en campos de entrada
- **Interfaz moderna** con Bulma CSS
- **Navegación intuitiva** con menú principal
- **Mensajes de confirmación** para acciones importantes

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Desktop Framework**: Electron
- **Base de Datos**: SQLite con better-sqlite3
- **UI Framework**: Bulma CSS
- **Gráficos**: Chart.js
- **Iconos**: Font Awesome
- **Build Tool**: electron-builder

## 📦 Instalación

### Opción 1: Ejecutable (Recomendado)
1. Descarga `Gestión Financiera Setup 1.0.0.exe` (~86MB)
2. Ejecuta el instalador y sigue las instrucciones
3. La aplicación se instalará con accesos directos automáticos

### Opción 2: Desarrollo
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd electron

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir ejecutable
npm run build:win
```

## 🚀 Uso de la Aplicación

### **Registro Rápido de Ingresos**
1. Click en "Registrar Ingresos"
2. Escribir cantidad (cursor automático)
3. Seleccionar tipo: Efectivo (por defecto) o Pago Móvil
4. Agregar descripción (opcional)
5. Presionar Enter o click "Guardar"

### **Análisis y Reportes**
- **Vista Ingresos/Egresos**: Reportes por día/semana/mes con desglose por tipo de pago
- **Lista de Movimientos**: Filtros avanzados por fecha y tipo de pago
- **Gráficos**: Visualización temporal con filtros por tipo de pago

### **Funciones Avanzadas**
- **Eliminación**: Click en ❌ para eliminar movimientos
- **Filtros**: Combinar filtros de fecha, tipo y forma de pago
- **Persistencia**: Todos los filtros se mantienen al cambiar fechas

## 📁 Estructura del Proyecto

```
electron/
├── main.js              # Proceso principal de Electron
├── renderer.js          # Lógica del frontend
├── preload.js           # Script de preload para seguridad
├── index.html           # Interfaz principal
├── package.json         # Configuración y dependencias
├── finanzas.db          # Base de datos SQLite (se crea automáticamente)
└── dist/                # Archivos de distribución
    └── Gestión Financiera Setup 1.0.0.exe
```

## 🗄️ Base de Datos

La aplicación utiliza SQLite con la siguiente estructura:

```sql
CREATE TABLE movimientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,           -- 'ingreso' o 'egreso'
  cantidad REAL NOT NULL,       -- Monto del movimiento
  descripcion TEXT,             -- Descripción opcional
  fecha TEXT NOT NULL,          -- Fecha y hora (ISO string)
  tipo_pago TEXT               -- 'efectivo' o 'pago_movil' (solo ingresos)
);
```

**Ubicación de la base de datos:**
- **Desarrollo**: `./finanzas.db`
- **Producción**: `%APPDATA%/gestion-financiera/finanzas.db`

## ⚙️ Configuración de Desarrollo

### Scripts Disponibles
```bash
npm start          # Ejecutar en modo desarrollo
npm run build      # Construir para todas las plataformas
npm run build:win  # Construir solo para Windows
npm run dist       # Construir y crear instalador
```

### Dependencias Principales
- `electron`: Framework de aplicaciones de escritorio
- `better-sqlite3`: Driver SQLite moderno y rápido
- `electron-builder`: Herramienta de empaquetado

### Configuración de Build
El archivo se configura en `package.json`:
```json
"build": {
  "appId": "com.empresa.gestion-financiera",
  "productName": "Gestión Financiera",
  "directories": {
    "output": "dist"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

## 🔧 Desarrollo y Contribución

### Arquitectura
- **main.js**: Gestión de ventana, IPC handlers, base de datos
- **renderer.js**: Lógica del frontend, manejo de eventos, actualizaciones de UI
- **preload.js**: Exposición segura de APIs de Electron al renderer

### Funciones Clave
- `registrarIngreso()`: Manejo del formulario de ingresos
- `cargarListaMovimientos()`: Carga y filtrado de movimientos
- `cargarGraficoMovimientos()`: Generación de gráficos interactivos
- `actualizarResumenTipoPago()`: Cálculos de totales por tipo de pago

### Patrón IPC
Comunicación entre proceso principal y renderer:
```javascript
// Renderer -> Main
const result = await electronAPI.invoke('guardar-movimiento', data);

// Main handler
ipcMain.handle('guardar-movimiento', (event, movimiento) => {
  // Lógica de base de datos
});
```

## 📋 Características Técnicas

- **Zona horaria**: Configurado para Venezuela (America/Caracas)
- **Formato de fecha**: DD/MM/YYYY HH:MM
- **Moneda**: Bolívares (Bs)
- **Base de datos**: SQLite con migración automática
- **Seguridad**: Context isolation habilitado
- **Rendimiento**: Prepared statements para consultas SQL

## 🐛 Solución de Problemas

### Error al construir
```bash
# Si better-sqlite3 falla al construir
npm run build:win
# Si la aplicación está corriendo, cerrarla primero
taskkill /f /im electron.exe
```

### Base de datos no se crea
- Verificar permisos de escritura en el directorio
- En producción, la DB se crea en `%APPDATA%/gestion-financiera/`

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para reportar bugs o solicitar nuevas características, por favor abre un issue en GitHub.

---

**Desarrollado con ❤️ para la gestión financiera personal** 
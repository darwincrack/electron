const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const formIngreso = document.getElementById('formIngreso');
  const cantidadIngreso = document.getElementById('cantidadIngreso');
  const descripcionIngreso = document.getElementById('descripcionIngreso');
  const successIngreso = document.getElementById('successIngreso');

  formIngreso.addEventListener('submit', (e) => {
    e.preventDefault();
    const cantidad = parseFloat(cantidadIngreso.value);
    const descripcion = descripcionIngreso.value.trim();
    if (!cantidad || cantidad <= 0) return;
    ipcRenderer.send('guardar-movimiento', {
      tipo: 'ingreso',
      cantidad,
      descripcion
    });
  });

  ipcRenderer.on('movimiento-guardado', () => {
    successIngreso.style.display = 'block';
    formIngreso.reset();
    cantidadIngreso.focus();
    setTimeout(() => {
      successIngreso.style.display = 'none';
    }, 1200);
  });
}); 
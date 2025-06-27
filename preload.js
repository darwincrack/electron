const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (canal, data) => ipcRenderer.send(canal, data),
  invoke: (canal, data) => ipcRenderer.invoke(canal, data),
  on: (canal, callback) => ipcRenderer.on(canal, callback)
}); 
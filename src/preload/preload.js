const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openImage: () => ipcRenderer.invoke('open-image'),
  saveImage: (imageData) => ipcRenderer.invoke('save-image', imageData),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});

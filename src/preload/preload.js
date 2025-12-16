const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openImage: () => ipcRenderer.invoke('open-image'),
  saveImage: (imageData) => ipcRenderer.invoke('save-image', imageData),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});

// Expose electron object for OAuth callback listener
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on: (channel, callback) => {
      if (channel === 'oauth-callback') {
        ipcRenderer.on(channel, callback);
      }
    },
    removeListener: (channel, callback) => {
      if (channel === 'oauth-callback') {
        ipcRenderer.removeListener(channel, callback);
      }
    },
  },
});

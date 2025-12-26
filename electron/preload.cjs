const { contextBridge } = require('electron');

// Expose any APIs to the renderer process here
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true
});

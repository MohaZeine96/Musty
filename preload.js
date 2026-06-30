// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("musicAPI", {
  parseFolder: (dirPath) => ipcRenderer.invoke("read-music-directory", dirPath),
});

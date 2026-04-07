const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("planboardDesktop", {
  platform: "electron",
});

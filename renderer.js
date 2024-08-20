const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    fetchTablePerdoruesi: () => ipcRenderer.invoke('fetchTablePerdoruesi'),
    fetchTableTransaksionet: () => ipcRenderer.invoke('fetchTableTransaksionet'),
    fetchTableShitje: () => ipcRenderer.invoke('fetchTableShitje'),
    fetchTableServisi: () => ipcRenderer.invoke('fetchTableServisi'),
    fetchTableSubjekti: () => ipcRenderer.invoke('fetchTableSubjekti'),
    fetchTableProdukti: () => ipcRenderer.invoke('fetchTableProdukti'),
    fetchTableMenyratPageses: () => ipcRenderer.invoke('fetchTableMenyratPageses'),
    
    insertTransaksioniAndShitje: (data) => ipcRenderer.invoke('insert-transaksioni-and-shitje', data) 
});

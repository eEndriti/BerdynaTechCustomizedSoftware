const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

    fetchTablePerdoruesi: () => ipcRenderer.invoke('fetchTablePerdoruesi'),
    kontrolloNderriminAktual: () => ipcRenderer.invoke('kontrolloNderriminAktual'),
    filloNderriminERi: (perdoruesiID, avans) => ipcRenderer.invoke('filloNderriminERi', perdoruesiID, avans),
    mbyllNderriminAktual: () => ipcRenderer.invoke('mbyllNderriminAktual'),
    fetchTableTransaksionet: () => ipcRenderer.invoke('fetchTableTransaksionet'),
    fetchTableShitje: () => ipcRenderer.invoke('fetchTableShitje'),
    fetchTableQuery: (query) => ipcRenderer.invoke('fetchTableQuery',query),
    fetchTableServisi: () => ipcRenderer.invoke('fetchTableServisi'),
    fetchTableSubjekti: (lloji) => ipcRenderer.invoke('fetchTableSubjekti', lloji),
    fetchTableProdukti: () => ipcRenderer.invoke('fetchTableProdukti'),
    fetchTableMenyratPageses: () => ipcRenderer.invoke('fetchTableMenyratPageses'),
    fetchTableLlojetShpenzimeve: () => ipcRenderer.invoke('fetchTableLlojetShpenzimeve'),
    fetchTableShpenzimet: () => ipcRenderer.invoke('fetchTableShpenzimet'),
    fetchTableKategoria: () => ipcRenderer.invoke('fetchTableKategoria'),
    fetchTableBlerje: () => ipcRenderer.invoke('fetchTableBlerje'),
    fetchTablePagesa: () => ipcRenderer.invoke('fetchTablePagesa'),
    fetchTableProfiti: () => ipcRenderer.invoke('fetchTableProfiti'),
    fetchTableProfitiDitor: () => ipcRenderer.invoke('fetchTableProfitiDitor'),

    insertTransaksioniAndShitje: (data) => ipcRenderer.invoke('insert-transaksioni-and-shitje', data),
    insertShpenzimi: (data) => ipcRenderer.invoke('insertShpenzimi', data),
    kaloNgaStokuNeShpenzim: (data) => ipcRenderer.invoke('kaloNgaStokuNeShpenzim', data) ,
    insertLlojiShpenzimit: (data) => ipcRenderer.invoke('insertLlojiShpenzimit', data) ,
    insertLogs: (data) => ipcRenderer.invoke('insertLogs', data) ,
    insertBlerje: (data) => ipcRenderer.invoke('insertBlerje', data) ,
    insertProduktin: (data) => ipcRenderer.invoke('insertProduktin', data) ,
    insertKategorine: (data) => ipcRenderer.invoke('insertKategorine', data) ,
    insertSubjekti: (data) => ipcRenderer.invoke('insertSubjekti', data) ,
    insertServisi: (data) => ipcRenderer.invoke('insertServisi', data) ,
    
    anuloTransaksionin: (data) => ipcRenderer.invoke('anuloTransaksionin', data) ,
    anuloPorosineOnline: (idPerAnulim) => ipcRenderer.invoke('anuloPorosineOnline', idPerAnulim) ,
    fshijeProduktin: (idPerAnulim) => ipcRenderer.invoke('fshijeProduktin', idPerAnulim) ,
    deleteKategoria: (idPerAnulim) => ipcRenderer.invoke('deleteKategoria', idPerAnulim) ,
    deleteLlojiShpenzimit: (idPerAnulim) => ipcRenderer.invoke('deleteLlojiShpenzimit', idPerAnulim) ,
    deleteSubjekti: (idPerAnulim) => ipcRenderer.invoke('deleteSubjekti', idPerAnulim) ,
    deleteServisi: (idPerAnulim) => ipcRenderer.invoke('deleteServisi', idPerAnulim) ,

    ndryshoShpenzimin: (data) => ipcRenderer.invoke('ndryshoShpenzimin', data), 
    ndryshoLlojinShpenzimit: (data) => ipcRenderer.invoke('ndryshoLlojinShpenzimit', data),
    ndryshoKategorine: (data) => ipcRenderer.invoke('ndryshoKategorine', data),
    ndryshoServisin: (data) => ipcRenderer.invoke('ndryshoServisin', data),
    ndryshoSubjektin: (data) => ipcRenderer.invoke('ndryshoSubjektin', data)


});

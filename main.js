const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sql = require('mssql');

// MSSQL connection configuration
const config = {
  server: 'DESKTOP-OK6ASU1',
  database: 'berdynaTechDBKryesore',
  user: 'user2',
  password: '12345',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function fetchTablePerdoruesi() {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM perdoruesi`;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTablePerdoruesi', async () => {
  const data = await fetchTablePerdoruesi();
  return data;
});

async function fetchTableTransaksionet() {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM transaksioni`;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableTransaksionet', async () => {
  const data = await fetchTableTransaksionet();
  return data;
});


async function fetchTableShitje() {
  try {
    await sql.connect(config);
    const result = await sql.query`
select sh.shitjeID,sh.shifra,sh.lloji,sh.komenti,sh.totaliPerPagese,sh.totaliPageses,sh.mbetjaPerPagese,sh.dataShitjes,sh.nrPorosise,sh.menyraPagesesID,sh.perdoruesiID,sh.transaksioniID,s.emertimi as 'subjekti' from shitje sh
join subjekti s on s.subjektiID = sh.subjektiID
`;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableShitje', async () => {
  const data = await fetchTableShitje();
  return data;
});


async function fetchTableSubjekti() {
  try {
    await sql.connect(config);
    const result = await sql.query`
select * from subjekti
`;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableSubjekti', async () => {
  const data = await fetchTableSubjekti();
  return data;
});

async function fetchTableServisi() {
  try {
    await sql.connect(config);
    const result = await sql.query`
    select s.servisimiID,s.shifra,s.kontakti,s.komenti,s.pajisjetPercjellese,s.dataPranimit,s.statusi,s.shifraGarancionit,
    s.totaliPerPagese,s.totaliPageses,s.mbetjaPageses,s.dataPerfundimit,s.perdoruesiID,s.nderrimiID,s.transaksioniID,sb.emertimi as 'subjekti' from servisimi s
    join subjekti sb on s.subjektiID = sb.subjektiID
    `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableServisi', async () => {
  const data = await fetchTableServisi();
  return data;
});

async function fetchTableProdukti() {
  try {
    await sql.connect(config);
    const result = await sql.query`
    select  p.produktiID,p.shifra,p.emertimi,p.pershkrimi,p.sasia,p.cmimiBlerjes,p.cmimiShitjes,p.dataKrijimit,p.komenti,p.meFatureTeRregullt,k.emertimi as 'emertimiKategorise',k.kategoriaID from produkti p
join kategoria k on k.kategoriaID = p.kategoriaID
    `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableProdukti', async () => {
  const data = await fetchTableProdukti();
  return data;
});

async function fetchTableMenyratPageses() {
  try {
    await sql.connect(config);
    const result = await sql.query`
    select * from menyraPageses
    `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableMenyratPageses', async () => {
  const data = await fetchTableMenyratPageses();
  return data;
});

 const shifra = '' // ketu incializohet shifra globale, pastaj thirret prej ciles tabele kemi nevoje.

 async function generateNextShifra(tabela, shtojca) {
  let latestShifraNumber = 999; // Default starting number
  let nextShifra;
  let exists = true;

  try {
    // Connect to the database
    const pool = await sql.connect(config);

    while (exists) {
      // Query the database for the latest 'shifra'
      const result = await pool.request().query(`
        SELECT TOP 1 shifra 
        FROM ${tabela} 
        WHERE shifra LIKE '${shtojca}-%' 
        ORDER BY CAST(SUBSTRING(shifra, LEN('${shtojca}-') + 1, LEN(shifra)) AS INT) DESC
      `);

      if (result.recordset.length > 0) {
        // Extract the number from the latest 'shifra'
        latestShifraNumber = parseInt(result.recordset[0].shifra.replace(`${shtojca}-`, ''), 10);
      }

      // Increment the number
      nextShifra = `${shtojca}-${latestShifraNumber + 1}`;

      // Check if this 'shifra' already exists in the database
      const checkResult = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM ${tabela} 
        WHERE shifra = '${nextShifra}'
      `);

      // If count is 0, the 'shifra' is unique
      if (checkResult.recordset[0].count === 0) {
        exists = false; // Exit the loop
      } else {
        latestShifraNumber += 1; // Increment to try the next number
      }
    }

    return nextShifra;
  } catch (err) {
    console.error('Error generating next shifra:', err);
    throw err;
  }
}


ipcMain.handle('insert-transaksioni-and-shitje', async (event, data) => {
  let connection;

  try {
    // Connect to the database
    connection = await sql.connect(config);

    // Generate the next unique 'shifra' for transaksioni
    const shifra = await generateNextShifra('shitje', 'SH');
    // Insert into the 'transaksioni' table and get the inserted ID
    const insertTransaksioniQuery = `
      INSERT INTO transaksioni (
        shifra, lloji, totaliPerPagese, totaliIPageses, mbetjaPerPagese, dataTransaksionit, perdoruesiID, nderrimiID, komenti
      ) OUTPUT INSERTED.transaksioniID VALUES (
        @shifra, @lloji, @totaliPerPagese, @totaliIPageses, @mbetjaPerPagese, @dataTransaksionit, @perdoruesiID, @nderrimiID, @komenti
      )
    `;

    const transaksioniResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('lloji', sql.VarChar, data.lloji)
      .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
      .input('totaliIPageses', sql.Decimal(18, 2), data.totaliPageses)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
      .input('dataTransaksionit', sql.Date, data.dataShitjes)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('komenti', sql.VarChar, data.komenti)
      .query(insertTransaksioniQuery);

    const transaksioniID = transaksioniResult.recordset[0].transaksioniID;

    // Insert into the 'shitje' table and get the inserted ID
    const insertShitjeQuery = `
      INSERT INTO shitje (
        shifra, lloji, komenti, totaliPerPagese, totaliPageses, mbetjaPerPagese, dataShitjes, nrPorosise, menyraPagesesID, perdoruesiID, transaksioniID, subjektiID
      ) OUTPUT INSERTED.shitjeID VALUES (
        @shifra, @lloji, @komenti, @totaliPerPagese, @totaliPageses, @mbetjaPerPagese, @dataShitjes, @nrPorosise, @menyraPagesesID, @perdoruesiID, @transaksioniID, @subjektiID
      )
    `;

    const shitjeResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('lloji', sql.VarChar, data.lloji)
      .input('komenti', sql.VarChar, data.komenti)
      .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
      .input('totaliPageses', sql.Decimal(18, 2), data.totaliPageses)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
      .input('dataShitjes', sql.Date, data.dataShitjes)
      .input('nrPorosise', sql.Int, data.nrPorosise)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('transaksioniID', sql.Int, transaksioniID)
      .input('subjektiID', sql.Int, data.subjektiID)
      .query(insertShitjeQuery);

    const shitjeID = shitjeResult.recordset[0].shitjeID;
    console.log('in11')

    // Now insert into the 'shitjeProdukti' table with the retrieved 'shitjeID'
    const insertShitjeProduktiQuery = `
      INSERT INTO shitjeProdukti (
        shitjeID, produktiID, sasia, cmimiShitjesPerCope,totaliProduktit,komenti,profitiProduktit
      ) VALUES (
        @shitjeID, @produktiID, @sasia, @cmimiShitjesPerCope,@totaliProduktit,@komenti,@profitiProduktit
      )
    `;
    console.log('in')
    console.log(data.produktet)
    console.log('out')
    for (const produkt of data.produktet) {
      console.log({
        shitjeID,
        produktID: produkt.produktiID,
        sasia: produkt.sasiaShitjes,
        cmimiShitjesPerCope: produkt.cmimiPerCope,
        totaliProduktit: produkt.cmimiPerCope * produkt.sasiaShitjes,
        komenti: data.komenti,
        profitiProduktit: produkt.profiti
      });
    
      await connection.request()
        .input('shitjeID', sql.Int, shitjeID)
        .input('produktiID', sql.Int, produkt.produktiID)
        .input('sasia', sql.Int, produkt.sasiaShitjes)
        .input('cmimiShitjesPerCope', sql.Decimal(18, 2), produkt.cmimiPerCope)
        .input('totaliProduktit', sql.Decimal(18, 2), produkt.cmimiPerCope * produkt.sasiaShitjes)
        .input('komenti', sql.VarChar, data.komenti)
        .input('profitiProduktit', sql.Decimal(18, 2), produkt.profiti)
        .query(insertShitjeProduktiQuery);
    }
    

    return { success: true };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await sql.close();
    }
  }
});




const createWindow = () => {
  const win = new BrowserWindow({
   
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'), // Ensure the correct path to preload.js
      contextIsolation: true,  // Enable context isolation for security
      nodeIntegration: false,  // Disable nodeIntegration for security
    }
  });
  win.maximize()
  win.loadURL('http://localhost:5173'); // Assuming your React app is running on localhost:3000
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

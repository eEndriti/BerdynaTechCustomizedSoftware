const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sql = require('mssql');

// MSSQL connection configuration
const config = {
  server: 'DESKTOP-RJASQGG',
  database: 'berdynaTechDBKryesore',
  user: 'user1',
  password: '12345',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function getDateTime() {
  const apiUrl = 'http://worldtimeapi.org/api/ip'; // World Time API endpoint for datetime

  try {
    // Try to fetch the datetime from the World Time API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.datetime; // Returns the datetime in ISO 8601 format
  } catch (error) {
    console.error('Failed to fetch datetime from online server:', error);
    // Fallback to local system time if the request fails
    return new Date().toISOString(); // Return the current local datetime in ISO format
  }
}


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

async function kontrolloNderriminAktual() {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT TOP 1 * FROM nderrimi WHERE iHapur = 1 ORDER BY dataFillimit DESC`;
    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (err) {
    console.error('Error retrieving current shift:', err);
    return null;
  } finally {
    await sql.close();
  }
}

ipcMain.handle('kontrolloNderriminAktual', async () => {
  const shift = await kontrolloNderriminAktual();
  return shift;
});

async function filloNderriminERi(perdoruesiID, avans) {
  const currentDate = new Date();

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO nderrimi (perdoruesiID, dataFillimit, avansi, numriPercjelles, iHapur)
      VALUES (${perdoruesiID}, ${currentDate}, ${avans}, 1, 1)`;
  } catch (err) {
    console.error('Error starting new shift:', err);
  } finally {
    await sql.close();
  }
}

ipcMain.handle('filloNderriminERi', async (event, perdoruesiID, avans) => {
  await filloNderriminERi(perdoruesiID, avans);
});

async function mbyllNderriminAktual() {
  const currentDate = new Date();

  try {
    await sql.connect(config);
    await sql.query`
      UPDATE nderrimi
      SET dataMbarimit = ${currentDate}, iHapur = 0
      WHERE iHapur = 1`;
  } catch (err) {
    console.error('Error closing current shift:', err);
  } finally {
    await sql.close();
  }
}

ipcMain.handle('mbyllNderriminAktual', async () => {
  await mbyllNderriminAktual();
});


async function fetchTableTransaksionet() {
  try {
    await sql.connect(config);
    const result = await sql.query`
      select t.* ,p.emri as 'perdoruesi' from transaksioni t
      join Perdoruesi p on p.perdoruesiID = t.perdoruesiID`;
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

async function fetchTableQuery(query) {
  try {
    await sql.connect(config);
    const result = await sql.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}

ipcMain.handle('fetchTableQuery', async (event, query) => {
  const data = await fetchTableQuery(query);
  return data;
});

async function fetchTableShitje() {
  try {
    await sql.connect(config);
    const result = await sql.query`
        select sh.shitjeID,sh.shifra,sh.lloji,sh.komenti,sh.totaliPerPagese,sh.totaliPageses,
        sh.mbetjaPerPagese,sh.dataShitjes,sh.nrPorosise,sh.menyraPagesesID,sh.perdoruesiID,
        sh.transaksioniID,sh.kohaGarancionit,s.emertimi as 'subjekti',sh.subjektiID,m.emertimi as 'menyraPageses',p.emri as 'perdoruesi',n.numriPercjelles,n.dataFillimit from shitje sh
        join subjekti s on s.subjektiID = sh.subjektiID
        join menyraPageses m on m.menyraPagesesID = sh.menyraPagesesID
        join Perdoruesi p on p.perdoruesiID = sh.perdoruesiID
        join nderrimi n on n.nderrimiID = sh.nderrimiID
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

async function fetchTableBlerje() {
  try {
    await sql.connect(config);
    const result = await sql.query`
      select b.blerjeID,b.shifra,b.totaliPerPagese,b.totaliPageses,b.mbetjaPerPagese,b.dataBlerjes,
      b.dataFatures,b.komenti,b.fatureERregullt,b.nrFatures,p.emri as 'perdoruesi',s.subjektiID,s.emertimi as 'klienti',m.emertimi as 'menyraPagesese',b.transaksioniID,n.numriPercjelles,n.dataFillimit from Blerje b

        join perdoruesi p on p.perdoruesiID = b.perdoruesiID
        join subjekti s on s.subjektiID = b.subjektiID
        join menyraPageses m on m.menyraPagesesID = b.menyraPagesesID
        join nderrimi n on n.nderrimiID = b.nderrimiID
`;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableBlerje', async () => {
  const data = await fetchTableBlerje();
  return data;
});

async function fetchTablePagesa() {
  try {
    await sql.connect(config);
    const result = await sql.query`
      select p.pagesaID,p.shumaPageses,p.dataPageses,p.shifra,p.transaksioniID,p.subjektiID,p.menyraPagesesID,s.emertimi as 'subjekti',m.emertimi as 'menyraPageses' from pagesa p
	join subjekti s on s.subjektiID = p.subjektiID
	join menyraPageses m on m.menyraPagesesID  = p.menyraPagesesID
`;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTablePagesa', async () => {
  const data = await fetchTablePagesa();
  return data;
});

async function fetchTableSubjekti(lloji) {
  try {
    let tabela = '';
    if (lloji === 'klient') {
      tabela = 'shitje';
    } else if (lloji === 'furnitor') {
      tabela = 'blerje';
    } else {
      throw new Error('Invalid lloji parameter');
    }

    await sql.connect(config);
    const result = await sql.query(`
      SELECT s.subjektiID, s.lloji, s.emertimi, s.kontakti,
             COALESCE(SUM(sh.totaliPerPagese), 0) AS totalTotaliPerPagese,
             COALESCE(SUM(sh.totaliPageses), 0) AS totalTotaliPageses,
             COALESCE(SUM(sh.mbetjaPerPagese), 0) AS totalMbetjaPerPagese
      FROM subjekti s
      LEFT JOIN ${tabela} sh ON s.subjektiID = sh.subjektiID
      GROUP BY s.subjektiID, s.emertimi, s.kontakti, s.lloji;
    `);
    
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return []; // Consider returning a more informative response if needed
  } finally {
    await sql.close();
  }
}

ipcMain.handle('fetchTableSubjekti', async (event, lloji) => {
  const data = await fetchTableSubjekti(lloji);
  return data;
});


async function fetchTableServisi() {
  try {
    await sql.connect(config);
    const result = await sql.query`
    select s.servisimiID,s.shifra,s.kontakti,s.komenti,s.pajisjetPercjellese,s.dataPranimit,s.statusi,s.shifraGarancionit,
    s.totaliPerPagese,s.totaliPageses,s.mbetjaPageses,s.dataPerfundimit,s.perdoruesiID,s.nderrimiID,s.transaksioniID,s.subjektiID,
	p.emri as 'perdoruesi',sb.emertimi as 'subjekti' from servisimi s
    join subjekti sb on s.subjektiID = sb.subjektiID
	join Perdoruesi p on p.perdoruesiID = s.perdoruesiID
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
    select  p.produktiID,p.shifra,p.emertimi,p.pershkrimi,p.sasia,p.cmimiBlerjes,p.cmimiShitjes,p.dataKrijimit,p.komenti,p.meFatureTeRregullt,k.emertimi as 'emertimiKategorise',k.tvsh,k.kategoriaID from produkti p
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

async function fetchTableKategoria() {
  try {
    await sql.connect(config);
    const result = await sql.query`
    
      SELECT 
          k.kategoriaID,
          k.emertimi,
          k.tvsh,
          k.komponenta,
          COUNT(p.produktiID) AS total_produkte,
          SUM(p.sasia) AS total_sasia
      FROM 
          kategoria k
      LEFT JOIN 
          produkti p ON k.kategoriaID = p.kategoriaID
      GROUP BY 
          k.kategoriaID, k.emertimi, k.tvsh, k.komponenta;

    `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableKategoria', async () => {
  const data = await fetchTableKategoria();
  return data;
});

async function fetchTableMenyratPageses() {
  try {
    await sql.connect(config);
    const result = await sql.query`
        select b.balanciID,b.shuma,b.menyraPagesesID,m.emertimi from balanci b
    join menyraPageses m on m.menyraPagesesID = b.menyraPagesesID
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

async function fetchTableLlojetShpenzimeve() {
  try {
    await sql.connect(config);
    const result = await sql.query`
        SELECT 
        llojetShpenzimeve.*, 
        COUNT(shpenzimi.shpenzimiID) AS total_shpenzime
    FROM 
        llojetShpenzimeve
    LEFT JOIN 
        shpenzimi ON shpenzimi.llojetShpenzimeveID = llojetShpenzimeve.llojetShpenzimeveID
    GROUP BY 
        llojetShpenzimeve.llojetShpenzimeveID,
        llojetShpenzimeve.emertimi,
        llojetShpenzimeve.shumaStandarde
    `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableLlojetShpenzimeve', async () => {
  const data = await fetchTableLlojetShpenzimeve();
  return data;
});

async function fetchTableShpenzimet() {
  try {
    await sql.connect(config);
    const result = await sql.query`
      select sh.shpenzimiID,sh.shifra,sh.shumaShpenzimit,sh.dataShpenzimit,sh.komenti,lsh.llojetShpenzimeveID,lsh.emertimi,lsh.shumaStandarde,p.emri as 'perdoruesi',t.transaksioniID from shpenzimi sh
      join llojetShpenzimeve lsh on sh.llojetShpenzimeveID = lsh.llojetShpenzimeveID
      join Perdoruesi p on sh.perdoruesiID = p.perdoruesiID
      join transaksioni t on sh.transaksioniID = t.transaksioniID
    `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableShpenzimet', async () => {
  const data = await fetchTableShpenzimet();
  return data;
});

async function fetchTableProfiti() {
  try {
    await sql.connect(config);
    const result = await sql.query`
     SELECT p.profitiID, p.shuma, p.nderrimiID, p.transaksioniID, t.lloji,t.dataTransaksionit,t.nderrimiID
      FROM profiti p
      JOIN transaksioni t ON t.transaksioniID = p.transaksioniID
      LEFT JOIN shitje sh ON sh.transaksioniID = t.transaksioniID AND t.lloji = 'Shitje'
      LEFT JOIN servisimi s ON s.transaksioniID = t.transaksioniID AND t.lloji = 'Servisim'
      WHERE t.lloji = 'Shitje' OR t.lloji = 'Servisim';

    `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableProfiti', async () => {
  const data = await fetchTableProfiti();
  return data;
});

async function fetchTableProfitiDitor() {
  const dataSot = new Date().toISOString().split('T')[0];
  
  try {
    await sql.connect(config);

    const result = await sql.query`
     SELECT p.profitiID, p.shuma, p.nderrimiID, p.transaksioniID, t.lloji,t.dataTransaksionit,t.nderrimiID
      FROM profiti p
      JOIN transaksioni t ON t.transaksioniID = p.transaksioniID
      LEFT JOIN shitje sh ON sh.transaksioniID = t.transaksioniID AND t.lloji = 'Shitje'
      LEFT JOIN servisimi s ON s.transaksioniID = t.transaksioniID AND t.lloji = 'Servisim'
      WHERE (t.lloji = 'Shitje' OR t.lloji = 'Servisim') and t.dataTransaksionit = ${dataSot}


    `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}

ipcMain.handle('fetchTableProfitiDitor', async () => {
  const data = await fetchTableProfitiDitor();
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

ipcMain.handle('insertLogs', async (event, data) => {
  let connection;
  let dataDheOra
  try {
    dataDheOra = await getDateTime(); // Await the result of getDateTime
    // Connect to the database
    connection = await sql.connect(config);

    const insertLogs = `
      INSERT INTO logs (
        perdoruesiID, komponenta, pershkrimi, dataDheOra, nderrimiID
      ) VALUES (
        @perdoruesiID, @komponenta, @pershkrimi, @dataDheOra, @nderrimiID
      )
    `;
    const logsResult = await connection.request()
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('komponenta', sql.VarChar, data.komponenta)
      .input('pershkrimi', sql.VarChar, data.pershkrimi)
      .input('dataDheOra', sql.Date, dataDheOra)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .query(insertLogs);

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

ipcMain.handle('insertShpenzimi', async (event, data) => {
  let connection;
  let dataDheOra
  try {
    dataDheOra = await getDateTime(); // Await the result of getDateTime
    // Connect to the database
    connection = await sql.connect(config);

    // Generate the next unique 'shifra' for transaksioni
    const shifra = await generateNextShifra('shpenzimi', 'SHP');
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
      .input('lloji', sql.VarChar, 'Shpenzim')
      .input('totaliPerPagese', sql.Decimal(18, 2), data.shumaShpenzimit)
      .input('totaliIPageses', sql.Decimal(18, 2), data.shumaShpenzimit)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), 0)
      .input('dataTransaksionit', sql.Date, dataDheOra)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('komenti', sql.VarChar, data.komenti)
      .query(insertTransaksioniQuery);

    const transaksioniID = transaksioniResult.recordset[0].transaksioniID;

    const insertShpenzimi = `
      INSERT INTO shpenzimi (
        shifra, shumaShpenzimit, dataShpenzimit, komenti, llojetShpenzimeveID, perdoruesiID, transaksioniID
      ) OUTPUT INSERTED.shpenzimiID VALUES (
        @shifra, @shumaShpenzimit, @dataShpenzimit, @komenti, @llojetShpenzimeveID, @perdoruesiID, @transaksioniID
      )
    `;

    const shpenzimiResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('shumaShpenzimit', sql.Decimal(18,2), data.shumaShpenzimit)
      .input('dataShpenzimit', sql.Date, dataDheOra)
      .input('komenti', sql.VarChar, data.komenti)
      .input('llojetShpenzimeveID', sql.Int, data.llojetShpenzimeveID)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('transaksioniID', sql.Int, transaksioniID)
      .query(insertShpenzimi);

      const updateBalanci = `
       UPDATE balanci
       SET shuma = shuma - @shuma
       WHERE menyraPagesesID = @menyraPagesesID
     `;

     await connection.request()
       .input('shuma', sql.Decimal(18,2), data.shumaShpenzimit)
       .input('menyraPagesesID', sql.Int, 1)
       .query(updateBalanci);

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

ipcMain.handle('kaloNgaStokuNeShpenzim', async (event, data) => {
  let connection;
  let dataDheOra
  try {
    dataDheOra = await getDateTime(); // Await the result of getDateTime
    // Connect to the database
    connection = await sql.connect(config);

    // Generate the next unique 'shifra' for transaksioni
    const shifra = await generateNextShifra('shpenzimi', 'SHP');
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
      .input('lloji', sql.VarChar, 'Shpenzim')
      .input('totaliPerPagese', sql.Decimal(18, 2), data.cmimiFurnizimit)
      .input('totaliIPageses', sql.Decimal(18, 2), data.cmimiFurnizimit)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), 0)
      .input('dataTransaksionit', sql.Date, dataDheOra)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('komenti', sql.VarChar, 'nga Stoku')
      .query(insertTransaksioniQuery);

    const transaksioniID = transaksioniResult.recordset[0].transaksioniID;

    const insertShpenzimi = `
      INSERT INTO shpenzimi (
        shifra, shumaShpenzimit, dataShpenzimit, komenti, llojetShpenzimeveID, perdoruesiID, transaksioniID
      ) OUTPUT INSERTED.shpenzimiID VALUES (
        @shifra, @shumaShpenzimit, @dataShpenzimit, @komenti, @llojetShpenzimeveID, @perdoruesiID, @transaksioniID
      )
    `;

    const shpenzimiResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('shumaShpenzimit', sql.Decimal(18,2), data.cmimiFurnizimit)
      .input('dataShpenzimit', sql.Date, dataDheOra)
      .input('komenti', sql.VarChar, 'nga Stoku')
      .input('llojetShpenzimeveID', sql.Int, data.llojetShpenzimeveID)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('transaksioniID', sql.Int, transaksioniID)
      .query(insertShpenzimi);

      const shpenzimiID = shpenzimiResult.recordset[0].shpenzimiID;

      const insertShpenzimProdukti = `
      INSERT INTO shpenzimProdukti (
        shpenzimiID, produktiID, sasia, cmimiFurnizimit,transaksioniID
      )  VALUES (
        @shpenzimiID, @produktiID, @sasia, @cmimiFurnizimit,@transaksioniID
      )
    `;

       await connection.request()
      .input('shpenzimiID', sql.Int, shpenzimiID)
      .input('produktiID', sql.Int, data.produktiID)
      .input('sasia', sql.Int, data.sasia)
      .input('cmimiFurnizimit', sql.Decimal(18,2), data.cmimiFurnizimit)
      .input('transaksioniID', sql.Int, transaksioniID)
      .query(insertShpenzimProdukti)



      const updateStoku = `
       UPDATE produkti
       SET sasia = sasia - @sasia
       WHERE produktiID = @produktiID
     `;

     await connection.request()
       .input('sasia', sql.Int, data.sasia)
       .input('produktiID', sql.Int, data.produktiID)
       .query(updateStoku);

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


ipcMain.handle('insertProduktin', async (event, data) => {
  let connection;
  let dataDheOra
  try {
    dataDheOra = await getDateTime(); // Await the result of getDateTime
    // Connect to the database
    connection = await sql.connect(config);

    // Generate the next unique 'shifra' for transaksioni
    const shifra = await generateNextShifra('produkti', 'P');
    // Insert into the 'transaksioni' table and get the inserted ID

   
    const insertProdukti = `
      INSERT INTO produkti (
        shifra, emertimi, pershkrimi, sasia, cmimiBlerjes, cmimiShitjes, kategoriaID,dataKrijimit,komenti,cpu,ram,gpu,disku
      )  VALUES (
       @shifra, @emertimi, @pershkrimi, @sasia, @cmimiBlerjes, @cmimiShitjes, @kategoriaID,@dataKrijimit,@komenti,@cpu,@ram,@gpu,@disku
      )
    `;

    const produktiResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('pershkrimi', sql.VarChar, data.pershkrimi)
      .input('sasia', sql.Int, data.sasia)
      .input('cmimiBlerjes', sql.Decimal(18,2), data.cmimiBlerjes)
      .input('cmimiShitjes', sql.Decimal(18,2), data.cmimiShitjes)
      .input('kategoriaID', sql.Int, data.kategoriaID)
      .input('dataKrijimit', sql.Date, dataDheOra)
      .input('komenti', sql.VarChar, data.komenti)
      .input('cpu', sql.VarChar, data.cpu)
      .input('ram', sql.VarChar, data.ram)
      .input('gpu', sql.VarChar, data.gpu)
      .input('disku', sql.VarChar, data.disku)
      .query(insertProdukti);

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

ipcMain.handle('insertKategorine', async (event, data) => {
  let connection;
  try {
    // Connect to the database
    connection = await sql.connect(config);

    const insertKategorineQuery = `
      INSERT INTO kategoria (
        emertimi, tvsh, komponenta
      ) VALUES (
        @emertimi, @tvsh, @komponenta
      )
    `;
    const kategoriaResult = await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('tvsh', sql.Int, data.tvsh)
      .input('komponenta',sql.VarChar,data.komponenta)
      .query(insertKategorineQuery);

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

ipcMain.handle('insertSubjekti', async (event, data) => {
  let connection;
  try {
    // Connect to the database
    connection = await sql.connect(config);

    const insertSubjektiQuery = `
      INSERT INTO subjekti (
        emertimi, kontakti, lloji
      ) VALUES (
        @emertimi, @kontakti, @lloji
      )
    `;
    const subjektiResult = await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('kontakti', sql.Int, data.kontakti)
      .input('lloji',sql.VarChar,data.lloji)
      .query(insertSubjektiQuery);

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

ipcMain.handle('insertServisi', async (event, data) => {
  let connection;
  let dataDheOra
  try {
    dataDheOra = await getDateTime(); // Await the result of getDateTime
    // Connect to the database
    connection = await sql.connect(config);

    // Generate the next unique 'shifra' for transaksioni
    const shifra = await generateNextShifra('servisimi', 'S');
    // Insert into the 'transaksioni' table and get the inserted ID

   
    const insertServisimi = `
      INSERT INTO servisimi (
        shifra, kontakti, komenti, pajisjetPercjellese, dataPranimit, statusi, shifraGarancionit,perdoruesiID,nderrimiID,subjektiID
      )  VALUES (
        @shifra, @kontakti, @komenti, @pajisjetPercjellese, @dataPranimit, @statusi, @shifraGarancionit,@perdoruesiID,@nderrimiID,@subjektiID
      )
    `;

    const servisiResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('kontakti', sql.VarChar, data.kontakti)
      .input('komenti', sql.VarChar, data.komenti)
      .input('pajisjetPercjellese', sql.VarChar, data.pajisjetPercjellese)
      .input('dataPranimit', sql.DateTime, dataDheOra)
      .input('statusi', sql.VarChar, data.statusi)
      .input('shifraGarancionit', sql.VarChar, data.shifraGarancionit)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('subjektiID', sql.Int, data.subjektiID)
      .query(insertServisimi);

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

ipcMain.handle('deleteSubjekti', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deleteSubjektiQuery = `
        DELETE FROM subjekti 
        WHERE subjektiID = @subjektiID
      `;

      await connection.request().input('subjektiID', sql.Int, idPerAnulim).query(deleteSubjektiQuery);
      
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

ipcMain.handle('deleteServisi', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deleteQuery = `
        DELETE FROM servisimi 
        WHERE servisimiID = @servisimiID
      `;

      await connection.request().input('servisimiID', sql.Int, idPerAnulim).query(deleteQuery);
      
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

ipcMain.handle('ndryshoSubjektin', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const updateSubjektiQuery = `
        Update subjekti 
        SET emertimi = @emertimi,
            kontakti = @kontakti
        where subjektiID = @subjektiID
      `;

      await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('kontakti', sql.Int, data.kontakti)
      .input('subjektiID', sql.Int, data.subjektiID)
      .query(updateSubjektiQuery);   

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

ipcMain.handle('ndryshoServisin', async (event, data) => {
  let connection;
  let dataDheOra
  try {
    dataDheOra = await getDateTime();
    connection = await sql.connect(config);

    if(data.updateType == 'perfundo'){
      console.log('eata::',data)
      const insertTransaksioniQuery = `
      INSERT INTO transaksioni (
        shifra, lloji, totaliPerPagese, totaliIPageses, mbetjaPerPagese, dataTransaksionit, perdoruesiID, nderrimiID, komenti
      ) OUTPUT INSERTED.transaksioniID VALUES (
        @shifra, @lloji, @totaliPerPagese, @totaliIPageses, @mbetjaPerPagese, @dataTransaksionit, @perdoruesiID, @nderrimiID, @komenti
      )
    `;
    const transaksioniResult = await connection.request()
      .input('shifra', sql.VarChar, data.shifra)
      .input('lloji', sql.VarChar, 'Servisim')
      .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
      .input('totaliIPageses', sql.Decimal(18, 2), data.totaliIPageses)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
      .input('dataTransaksionit', sql.Date, dataDheOra)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('komenti', sql.VarChar, data.komenti)
      .query(insertTransaksioniQuery);

      const transaksioniID = transaksioniResult.recordset[0].transaksioniID;

      const updateServisinQuery = `
        Update servisimi 
        SET totaliPerPagese = @totaliPerPagese,
            totaliPageses = @totaliPageses,
            mbetjaPageses = @mbetjaPerPagese,
            statusi = @statusi,
            dataPerfundimit = @dataPerfundimit,
            transaksioniID = @transaksioniID
        where shifra = @shifra
      `;

      await connection.request()
      .input('totaliPerPagese', sql.Decimal(10,2), data.totaliPerPagese)
      .input('totaliPageses', sql.Decimal(10,2), data.totaliIPageses)
      .input('mbetjaPerPagese', sql.Decimal(10,2), data.mbetjaPerPagese)
      .input('statusi', sql.VarChar, 'Perfunduar')
      .input('dataPerfundimit', sql.DateTime, dataDheOra)
      .input('transaksioniID', sql.Int, transaksioniID)
      .input('shifra', sql.VarChar, data.shifra)
      .query(updateServisinQuery);
      
        const updateBalanci = `
        UPDATE balanci
        SET shuma = shuma + @shuma
        WHERE menyraPagesesID = @menyraPagesesID
      `;

      await connection.request()
        .input('shuma', sql.Decimal(18,2), data.totaliIPageses)
        .input('menyraPagesesID', sql.Int, 1)
        .query(updateBalanci);


      return { success: true };

    }else{
        const updateServisinQuery = `
        Update servisimi 
        SET komenti = @komenti,
            pajisjetPercjellese = @pajisjetPercjellese,
            shifraGarancionit = @shifraGarancionit
        where shifra = @shifra
      `;

      await connection.request()
      .input('komenti', sql.VarChar, data.komenti)
      .input('pajisjetPercjellese', sql.VarChar, data.pajisjetPercjellese)
      .input('shifraGarancionit', sql.VarChar, data.shifraGarancionit)
      .input('shifra', sql.VarChar, data.shifra)
      .query(updateServisinQuery);
      return { success: true };
    }
      

      

  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await sql.close();
    }
  }
});

ipcMain.handle('insertLlojiShpenzimit', async (event, data) => {
  let connection;
  try {
    // Connect to the database
    connection = await sql.connect(config);

    const insertLlojiShpenzimit = `
      INSERT INTO llojetShpenzimeve (
        emertimi, shumaStandarde
      ) OUTPUT INSERTED.llojetShpenzimeveID VALUES (
        @emertimi, @shumaStandarde
      )
    `;

    const llojiShpenzimeveResult = await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('shumaStandarde', sql.Decimal(18,2), data.shumaStandarde)
      .query(insertLlojiShpenzimit);

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

ipcMain.handle('insertBlerje', async (event, data) => {
  let connection;
  let dataDheOra

  try {
    dataDheOra = await getDateTime(); // Await the result of getDateTime

    connection = await sql.connect(config);

    // Generate the next unique 'shifra' for transaksioni
    const shifra = await generateNextShifra('blerje', 'B');
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
      .input('lloji', sql.VarChar, 'Blerje')
      .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
      .input('totaliIPageses', sql.Decimal(18, 2), data.totaliPageses)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
      .input('dataTransaksionit', sql.Date, dataDheOra)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('komenti', sql.VarChar, data.komenti)
      .query(insertTransaksioniQuery);

    const transaksioniID = transaksioniResult.recordset[0].transaksioniID;

    // Insert into the 'blerje' table and get the inserted ID
    const insertBlerjeQuery = `
      INSERT INTO blerje (
        shifra, totaliPerPagese, totaliPageses, mbetjaPerPagese,dataBlerjes, dataFatures, komenti, fatureERregullt,nrFatures, perdoruesiID, subjektiID, transaksioniID,menyraPagesesID, nderrimiID
      ) OUTPUT INSERTED.blerjeID VALUES (
        @shifra, @totaliPerPagese, @totaliPageses, @mbetjaPerPagese, @dataBlerjes, @dataFatures, @komenti, @fatureERregullt,@nrFatures, @perdoruesiID,@subjektiID, @transaksioniID, @menyraPagesesID,@nderrimiID
      )
    `;
        const fatureERregulltValue = data.fatureERregullt ? 'true' : 'false';

    const blerjeResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
      .input('totaliPageses', sql.Decimal(18, 2), data.totaliPageses)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
      .input('dataBlerjes', sql.Date, dataDheOra)
      .input('dataFatures', sql.Date, data.dataFatures)
      .input('komenti', sql.VarChar, data.komenti)
      .input('fatureERregullt', sql.VarChar, fatureERregulltValue)
      .input('nrFatures', sql.VarChar, data.nrFatures)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('subjektiID', sql.Int, data.subjektiID)
      .input('transaksioniID', sql.Int, transaksioniID)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .query(insertBlerjeQuery);

    const blerjeID = blerjeResult.recordset[0].blerjeID;

    const insertBlerjeProdukt = `
    INSERT INTO blerjeProdukt (
      cmimiPerCope, sasia, totaliProduktit,totaliTvsh,blerjeID,produktiID
    ) VALUES (
       @cmimiPerCope, @sasia, @totaliProduktit,@totaliTvsh,@blerjeID,@produktiID
    )
    `;

    for (const produkt of data.produktet) {
    if (produkt.produktiID && produkt.sasiaBlerjes && produkt.cmimiPerCope) {
      const totali = produkt.cmimiBlerjes * produkt.sasiaBlerjes
      await connection.request()
        .input('cmimiPerCope', sql.Decimal(18, 2), produkt.cmimiBlerjes)
        .input('sasia', sql.Int, produkt.sasiaBlerjes)
        .input('totaliProduktit', sql.Decimal(18, 2), totali)
        .input('totaliTvsh', sql.Decimal(18, 2), (totali*produkt.tvsh)/100)
        .input('blerjeID', sql.Int, blerjeID)
        .input('produktiID', sql.Int, produkt.produktiID)
        .query(insertBlerjeProdukt);

 
        
      const updateProduktiQuery = `
        UPDATE produkti
        SET sasia = sasia + @sasia
        WHERE produktiID = @produktiID
      `;
      
      await connection.request()
        .input('produktiID', sql.Int, produkt.produktiID)
        .input('sasia', sql.Int, produkt.sasiaBlerjes)
        .query(updateProduktiQuery);
    
    }
    }
    const insertPagesatQuery = `
      insert into pagesa (
        shumaPageses,dataPageses,shifra,transaksioniID,subjektiID,menyraPagesesID
      ) values (
        @shumaPageses,@dataPageses,@shifra,@transaksioniID,@subjektiID,@menyraPagesesID
      )
    `
    await connection.request()
      .input('shumaPageses',sql.Decimal(10,2),data.totaliPageses)
      .input('dataPageses',sql.Date, dataDheOra)
      .input('shifra',sql.VarChar , shifra)
      .input('transaksioniID',sql.Int , transaksioniID)
      .input('subjektiID',sql.Int, data.subjektiID)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .query(insertPagesatQuery)

       const updateBalanci = `
       UPDATE balanci
       SET shuma = shuma - @shuma
       WHERE menyraPagesesID = @menyraPagesesID
     `;

     await connection.request()
       .input('shuma', sql.Decimal(10,2), data.totaliPageses)
       .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
       .query(updateBalanci);
   

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

ipcMain.handle('insert-transaksioni-and-shitje', async (event, data) => {
  let connection;
  let dataDheOra

  let transaksioniID = null

  try {
    dataDheOra = await getDateTime(); 

    connection = await sql.connect(config);

    const shifra = await generateNextShifra('shitje', 'SH');

    if(data.lloji == 'dyqan'){
      const insertTransaksioniQuery = `
      INSERT INTO transaksioni (
        shifra, lloji, totaliPerPagese, totaliIPageses, mbetjaPerPagese, dataTransaksionit, perdoruesiID, nderrimiID, komenti
      ) OUTPUT INSERTED.transaksioniID VALUES (
        @shifra, @lloji, @totaliPerPagese, @totaliIPageses, @mbetjaPerPagese, @dataTransaksionit, @perdoruesiID, @nderrimiID, @komenti
      )
    `;

    const transaksioniResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('lloji', sql.VarChar, 'Shitje')
      .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
      .input('totaliIPageses', sql.Decimal(18, 2), data.totaliPageses)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
      .input('dataTransaksionit', sql.Date, dataDheOra)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('komenti', sql.VarChar, data.komenti)
      .query(insertTransaksioniQuery);

     transaksioniID = transaksioniResult.recordset[0].transaksioniID;
    }

    const insertShitjeQuery = `
      INSERT INTO shitje (
        shifra, lloji, komenti, totaliPerPagese, totaliPageses, mbetjaPerPagese, dataShitjes, nrPorosise, menyraPagesesID, perdoruesiID, transaksioniID, subjektiID,nderrimiID,kohaGarancionit
      ) OUTPUT INSERTED.shitjeID VALUES (
        @shifra, @lloji, @komenti, @totaliPerPagese, @totaliPageses, @mbetjaPerPagese, @dataShitjes, @nrPorosise, @menyraPagesesID, @perdoruesiID, @transaksioniID, @subjektiID,@nderrimiID,@kohaGarancionit
      )
    `;

    const shitjeResult = await connection.request()
      .input('shifra', sql.VarChar, shifra)
      .input('lloji', sql.VarChar, data.lloji)
      .input('komenti', sql.VarChar, data.komenti)
      .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
      .input('totaliPageses', sql.Decimal(18, 2), data.totaliPageses)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
      .input('dataShitjes', sql.Date, dataDheOra)
      .input('nrPorosise', sql.Int, data.nrPorosise)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .input('transaksioniID', sql.Int, transaksioniID)
      .input('subjektiID', sql.Int, data.subjektiID)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('kohaGarancionit', sql.Int, data.kohaGarancionit)
      .query(insertShitjeQuery);

    const shitjeID = shitjeResult.recordset[0].shitjeID;

    // Now insert into the 'shitjeProdukti' table with the retrieved 'shitjeID'
    const insertShitjeProduktiQuery = `
    INSERT INTO shitjeProdukti (
      shitjeID, produktiID, sasia, cmimiShitjesPerCope, totaliProduktit, komenti, profitiProduktit
    ) VALUES (
      @shitjeID, @produktiID, @sasia, @cmimiShitjesPerCope, @totaliProduktit, @komenti, @profitiProduktit
    )
    `;
    console.log('data',data)

    let profitiShitjes = 0
    for (const produkt of data.produktet) {
    if (produkt.profiti > 0) {

      await connection.request()
        .input('shitjeID', sql.Int, shitjeID)
        .input('produktiID', sql.Int, produkt.produktiID)
        .input('sasia', sql.Int, produkt.sasiaShitjes)
        .input('cmimiShitjesPerCope', sql.Decimal(18, 2), produkt.cmimiPerCope)
        .input('totaliProduktit', sql.Decimal(18, 2), produkt.cmimiPerCope * produkt.sasiaShitjes)
        .input('komenti', sql.VarChar, data.komenti)
        .input('profitiProduktit', sql.Decimal(18, 2), produkt.profiti)
        .query(insertShitjeProduktiQuery);

        profitiShitjes = produkt.profiti + profitiShitjes

      // Update the 'sasia' in 'produkti' table
      const updateProduktiQuery = `
        UPDATE produkti
        SET sasia = sasia - @sasia
        WHERE produktiID = @produktiID
      `;

      await connection.request()
        .input('produktiID', sql.Int, produkt.produktiID)
        .input('sasia', sql.Int, produkt.sasiaShitjes)
        .query(updateProduktiQuery);
    }
    }
    console.log('profiti',profitiShitjes)

    const insertProfitiShitjes = `
      insert into profiti (
        shuma,nderrimiID,transaksioniID
      ) values (
        @shuma,@nderrimiID,@transaksioniID
      )
    `
    await connection.request()
    .input('shuma' , sql.Decimal(10,2), profitiShitjes)
    .input('nderrimiID' , sql.Int, data.nderrimiID)
    .input('transaksioniID' , sql.Int, transaksioniID)
    .query(insertProfitiShitjes)
    
    console.log('ner profit')

    const insertPagesatQuery = `
    insert into pagesa (
      shumaPageses,dataPageses,shifra,transaksioniID,subjektiID,menyraPagesesID
    ) values (
      @shumaPageses,@dataPageses,@shifra,@transaksioniID,@subjektiID,@menyraPagesesID
    )
  `

    await connection.request()
      .input('shumaPageses',sql.Decimal(10,2),data.totaliPageses)
      .input('dataPageses',sql.Date, dataDheOra)
      .input('shifra',sql.VarChar , shifra)
      .input('transaksioniID',sql.Int , transaksioniID)
      .input('subjektiID',sql.Int, data.subjektiID)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .query(insertPagesatQuery)

      console.log('nderInsertPagesa')
      const updateBalanci = `
      UPDATE balanci
      SET shuma = shuma + @shuma
      WHERE menyraPagesesID = @menyraPagesesID
    `;

    await connection.request()
      .input('shuma', sql.Decimal(10,2), data.totaliPageses)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .query(updateBalanci);
  
      console.log('nderBalanci')

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

ipcMain.handle('anuloPorosineOnline', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      // Step 1: Retrieve sold products from shitjeProdukti for the specified transaksioniID
      const getShitjeProduktiQuery = `
        SELECT produktiID, sasia 
        FROM shitjeProdukti 
        WHERE shitjeID IN (
          SELECT shitjeID 
          FROM shitje 
          WHERE shitjeID = @shitjeID
        )
      `;

      const shitjeProduktiResult = await connection.request()
        .input('shitjeID', sql.Int, idPerAnulim)
        .query(getShitjeProduktiQuery);

      const soldProducts = shitjeProduktiResult.recordset;

      // Step 2: Update product quantities in produkti table
      const updateProduktiQuery = `
        UPDATE produkti
        SET sasia = sasia + @sasia
        WHERE produktiID = @produktiID
      `;

      for (const produkt of soldProducts) {
        await connection.request()
          .input('produktiID', sql.Int, produkt.produktiID)
          .input('sasia', sql.Int, produkt.sasia)
          .query(updateProduktiQuery);
      }

      // Step 3: Delete records from shitjeProdukti, shitje, and transaksioni tables
      const deleteShitjeProduktiQuery = `
        DELETE FROM shitjeProdukti 
        WHERE shitjeID IN (
          SELECT shitjeID 
          FROM shitje 
          WHERE shitjeID = @shitjeID
        )
      `;

      const deleteShitjeQuery = `
        DELETE FROM shitje 
        WHERE shitjeID = @shitjeID
      `;

      await connection.request().input('shitjeID', sql.Int, idPerAnulim).query(deleteShitjeProduktiQuery);
      await connection.request().input('shitjeID', sql.Int, idPerAnulim).query(deleteShitjeQuery);
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

ipcMain.handle('anuloShitjen', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

      // Hapi 1: i marrim produktet e shitura nga tabela shitjeProdukti ne baze te transaksioniID 
      const getShitjeProduktiQuery = `
        SELECT produktiID, sasia 
        FROM shitjeProdukti 
        WHERE shitjeID IN (
          SELECT shitjeID 
          FROM shitje 
          WHERE transaksioniID = @transaksioniID
        )
      `;

      

      const shitjeProduktiResult = await connection.request()
        .input('transaksioniID', sql.Int, data.transaksioniID)
        .query(getShitjeProduktiQuery);

      const soldProducts = shitjeProduktiResult.recordset;

      // Hapi 2: e perditsojme sasine e produkteve

      const updateProduktiQuery = `
        UPDATE produkti
        SET sasia = sasia + @sasia
        WHERE produktiID = @produktiID
      `;

      for (const produkt of soldProducts) {
        await connection.request()
          .input('produktiID', sql.Int, produkt.produktiID)
          .input('sasia', sql.Int, produkt.sasia)
          .query(updateProduktiQuery);
      }

      // Hapi 3: i fshijme te dhenat nga tabelat  shitjeProdukti,profiti,pagesa, shitje, dhe transaksioni 


      const deleteProfiti = `
      DELETE FROM profiti 
      WHERE  transaksioniID = @transaksioniID
    `;

      const deleteShitjeProduktiQuery = `
        DELETE FROM shitjeProdukti 
        WHERE shitjeID IN (
          SELECT shitjeID 
          FROM shitje 
          WHERE transaksioniID = @transaksioniID
        )
      `;

      const deleteShitjeQuery = `
        DELETE FROM shitje 
        WHERE transaksioniID = @transaksioniID
      `;

      const deleteTransaksioniQuery = `
        DELETE FROM transaksioni 
        WHERE transaksioniID = @transaksioniID
      `;

      const deletePagesaQuery = `
        delete from pagesa 
        where transaksioniID = @transaksioniID
      `
      //ktu fillon pjesa per menaxhim bilanci
      const getShumaMenyraPageses = `
        Select totaliPageses,menyraPagesesID
        from shitje
        where transaksioniID = @transaksioniID
      `
      const getShumaMenyraPagesesResult = await connection.request()
        .input('transaksioniID', sql.Int, data.transaksioniID)
        .query(getShumaMenyraPageses)

        const shumaMenyraPageses = getShumaMenyraPagesesResult.recordset

      const updateBalanci = `
        UPDATE balanci
        SET shuma = shuma - @shuma
        WHERE menyraPagesesID = @menyraPagesesID
      `;

      for (const shmn of shumaMenyraPageses) {
        await connection.request()
        .input('shuma', sql.Decimal(10,2), shmn.totaliPageses)
        .input('menyraPagesesID', sql.Int, shmn.menyraPagesesID)
        .query(updateBalanci);
      }
      
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteProfiti);
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deletePagesaQuery);
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteShitjeProduktiQuery);
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteShitjeQuery);
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteTransaksioniQuery);

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

ipcMain.handle('anuloBlerjen', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

          // Hapi 1: Marrim produktet e regjistruara ne blerje
          const getBlerjeProduktiQuery = `
          SELECT produktiID, sasia 
          FROM blerjeProdukt 
          WHERE blerjeID IN (
            SELECT blerjeID 
            FROM blerje 
            WHERE transaksioniID = @transaksioniID
          )
        `;

        const blerjeProduktiResult = await connection.request()
          .input('transaksioniID', sql.Int, data.transaksioniID)
          .query(getBlerjeProduktiQuery);

        const produktetEBlera = blerjeProduktiResult.recordset;

        // Hapi 2: Ndryshojme sasine e produkteve 
        const updateProduktiQuery = `
          UPDATE produkti
          SET sasia = sasia - @sasia
          WHERE produktiID = @produktiID
        `;

        for (const produkt of produktetEBlera) {
          await connection.request()
            .input('produktiID', sql.Int, produkt.produktiID)
            .input('sasia', sql.Int, produkt.sasia)
            .query(updateProduktiQuery);
        }

        // Hapi 3: Fshijme te dhenat nga tabelat
        const deleteBlerjeProduktiQuery = `
          DELETE FROM blerjeProdukt 
          WHERE blerjeID IN (
            SELECT blerjeID 
            FROM blerje 
            WHERE transaksioniID = @transaksioniID
          )
        `;

        const deleteBlerjeQuery = `
          DELETE FROM blerje 
          WHERE transaksioniID = @transaksioniID
        `;

        const deleteTransaksioniQuery = `
          DELETE FROM transaksioni 
          WHERE transaksioniID = @transaksioniID
        `;
        const deletePagesaQuery = `
        delete from pagesa 
        where transaksioniID = @transaksioniID
      `
        //ktu fillon pjesa per menaxhim bilanci
      const getShumaMenyraPageses = `
        Select totaliPageses,menyraPagesesID
        from blerje
        where transaksioniID = @transaksioniID
      `
      const getShumaMenyraPagesesResult = await connection.request()
        .input('transaksioniID', sql.Int, data.transaksioniID)
        .query(getShumaMenyraPageses)

        const shumaMenyraPageses = getShumaMenyraPagesesResult.recordset

      const updateBalanci = `
        UPDATE balanci
        SET shuma = shuma + @shuma
        WHERE menyraPagesesID = @menyraPagesesID
      `;

      for (const shmn of shumaMenyraPageses) {
        await connection.request()
        .input('shuma', sql.Decimal(10,2), shmn.totaliPageses)
        .input('menyraPagesesID', sql.Int, shmn.menyraPagesesID)
        .query(updateBalanci);
      }

        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deletePagesaQuery);
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteBlerjeProduktiQuery);
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteBlerjeQuery);
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteTransaksioniQuery);

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


ipcMain.handle('anuloShpenzimin', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);


        connection = await sql.connect(config);

        const getNenLloji = `SELECT nenLloji FROM shpenzimi WHERE transaksioniID = @transaksioniID`;

        const result = await connection.request()
          .input('transaksioniID', sql.Int, data.transaksioniID)
          .query(getNenLloji);

        const nenLloji = result.recordset.length > 0 ? result.recordset[0].nenLloji : null;

        if(nenLloji == 'ngaStoku'){ 
          
          // ktu menagjohet nje produkt qe osht hi shpenzim prej stokit
              // Hapi 1: Marrim produktin qe e kemi regjistru si shpenzim
              const getShpenzimProduktQuery = `
              SELECT produktiID, sasia 
              FROM shpenzimProdukti 
              WHERE shpenzimiID IN (
                SELECT shpenzimiID 
                FROM shpenzimi 
                WHERE transaksioniID = @transaksioniID
              )
            `;
              const shpenzimProduktiResult = await connection.request()
              .input('transaksioniID', sql.Int, data.transaksioniID)
              .query(getShpenzimProduktQuery);

            const Products = shpenzimProduktiResult.recordset;

            // Hapi 2: Ndryshojme sasine e atij produkti
            const updateProduktiQuery = `
              UPDATE produkti
              SET sasia = sasia + @sasia
              WHERE produktiID = @produktiID
            `;

            for (const produkt of Products) {
              await connection.request()
                .input('produktiID', sql.Int, produkt.produktiID)
                .input('sasia', sql.Int, produkt.sasia)
                .query(updateProduktiQuery);
            }

            const deleteShpenzimiFromShpenzimProdukt = `
            DELETE FROM shpenzimProdukti 
            WHERE transaksioniID = @transaksioniID
          `
          await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteShpenzimiFromShpenzimProdukt);

         }else{
                    //ktu fillon pjesa per menaxhim bilanci
              const getShuma = `
              Select shumaShpenzimit
              from shpenzimi
              where transaksioniID = @transaksioniID
            `
            const getShumaResult = await connection.request()
              .input('transaksioniID', sql.Int, data.transaksioniID)
              .query(getShuma)

              const shuma = getShumaResult.recordset

            const updateBalanci = `
              UPDATE balanci
              SET shuma = shuma + @shuma
              WHERE menyraPagesesID = @menyraPagesesID
            `;

            for (const shmn of shuma) {
              await connection.request()
              .input('shuma', sql.Decimal(10,2), shmn.shumaShpenzimit)
              .input('menyraPagesesID', sql.Int, 1)
              .query(updateBalanci);
            }
         }

         const deleteShpenzimiFromTransaksioni = `
            DELETE FROM transaksioni 
            WHERE transaksioniID = @transaksioniID
          `
          const deleteShpenzimiQuery = `
            DELETE FROM shpenzimi 
            WHERE transaksioniID = @transaksioniID
          `;
          await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteShpenzimiQuery);
          await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteShpenzimiFromTransaksioni);

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

ipcMain.handle('fshijeProduktin', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deleteProduktinQuery = `
        DELETE FROM produkti 
        WHERE produktiID = @produktiID
      `;

      await connection.request().input('produktiID', sql.Int, idPerAnulim).query(deleteProduktinQuery);
      
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

ipcMain.handle('deleteKategoria', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deleteKategoriaQuery = `
        DELETE FROM kategoria 
        WHERE kategoriaID = @kategoriaID
      `;

      await connection.request().input('kategoriaID', sql.Int, idPerAnulim).query(deleteKategoriaQuery);
      
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

ipcMain.handle('deleteLlojiShpenzimit', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deleteLlojetShpenzimeveQuery = `
        DELETE FROM llojetShpenzimeve 
        WHERE llojetShpenzimeveID = @llojetShpenzimeveID
      `;

      await connection.request().input('llojetShpenzimeveID', sql.Int, idPerAnulim).query(deleteLlojetShpenzimeveQuery);

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

ipcMain.handle('ndryshoKategorine', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const updateKategoriaQuery = `
        Update Kategoria 
        SET emertimi = @emertimi,
            tvsh = @tvsh,
            komponenta = @komponenta
        where kategoriaID = @kategoriaID
      `;

      await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('tvsh', sql.Int, data.tvsh)
      .input('komponenta', sql.VarChar, data.komponenta)
      .input('kategoriaID', sql.Int, data.kategoriaID)
      .query(updateKategoriaQuery);   

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
ipcMain.handle('ndryshoShpenzimin', async (event, data) => {
  let connection;
  try {
    connection = await sql.connect(config);
    let shumaFillestare

    const getShuma = `
      Select shumaShpenzimit
      from shpenzimi
      where transaksioniID = @transaksioniID
    `
    const getShumaResult = await connection.request()
    .input('transaksioniID', sql.Int, data.transaksioniID)
    .query(getShuma)

    const shuma = getShumaResult.recordset

    for (const shmn of shuma) {
        shumaFillestare = shmn.shumaShpenzimit
      }    


    // Single request to reuse between queries
    const request = connection.request()
      .input('totaliperPagese', sql.Decimal(10,2), data.shumaShpenzimit)
      .input('totaliIPageses', sql.Decimal(10,2), data.shumaShpenzimit)
      .input('komenti', sql.VarChar, data.komenti)
      .input('transaksioniID', sql.Int, data.transaksioniID)
      .input('llojetShpenzimeveID', sql.Int, data.llojetShpenzimeveID)
      .input('shumaShpenzimit', sql.Decimal(10,2), data.shumaShpenzimit)
      .input('shpenzimiID', sql.Int, data.shpenzimiID);

    // Update transaksioni query
    const updateTransaksioniQuery = `
      UPDATE transaksioni
      SET totaliperPagese = @totaliperPagese,
          totaliIPageses = @totaliIPageses,
          komenti = @komenti
      WHERE transaksioniID = @transaksioniID
    `;

    await request.query(updateTransaksioniQuery);

    // Update shpenzimi query
    const updateShpenzimiQuery = `
      UPDATE shpenzimi 
      SET llojetShpenzimeveID = @llojetShpenzimeveID,
          shumaShpenzimit = @shumaShpenzimit,
          komenti = @komenti
      WHERE shpenzimiID = @shpenzimiID
    `;
    await request.query(updateShpenzimiQuery);

      //ktu fillon pjesa per menaxhim bilanci

      let diferenca  = shumaFillestare - data.shumaShpenzimit
      
         const  updateBalanci = `
          UPDATE balanci
          SET shuma = shuma + @shuma
          WHERE menyraPagesesID = @menyraPagesesID
        `;     
      await connection.request()
            .input('shuma', sql.Decimal(10,2), diferenca)
            .input('menyraPagesesID', sql.Int, 1)
            .query(updateBalanci);

    return { success: true };

  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error: error.message }; // Returning a detailed error
  } finally {
    if (connection) {
      await sql.close();
    }
  }
});

ipcMain.handle('ndryshoLlojinShpenzimit', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const updateLlojetShpezimeveQuery = `
        Update llojetShpenzimeve 
        SET emertimi = @emertimi,
            shumaStandarde = @shumaStandarde
        where llojetShpenzimeveID = @llojetShpenzimeveID
      `;

      await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('shumaStandarde', sql.Decimal(10,2), data.shumaStandarde)
      .input('llojetShpenzimeveID', sql.Int, data.llojetShpenzimeveID)
      .query(updateLlojetShpezimeveQuery);   

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
    autoHideMenuBar: true, 
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

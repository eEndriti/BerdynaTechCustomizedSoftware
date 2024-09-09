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
select sh.shitjeID,sh.shifra,sh.lloji,sh.komenti,sh.totaliPerPagese,sh.totaliPageses,
sh.mbetjaPerPagese,sh.dataShitjes,sh.nrPorosise,sh.menyraPagesesID,sh.perdoruesiID,
sh.transaksioniID,s.emertimi as 'subjekti',sh.subjektiID,m.emertimi as 'menyraPageses',p.emri as 'perdoruesi',n.numriPercjelles,n.dataNderrimit from shitje sh
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
      b.dataFatures,b.komenti,b.fatureERregullt,b.nrFatures,p.emri as 'perdoruesi',s.emertimi as 'klienti',m.emertimi as 'menyraPagesese',b.transaksioniID,n.numriPercjelles,n.dataNderrimit from Blerje b

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

async function fetchTableSubjekti() {
  try {
    await sql.connect(config);
    const result = await sql.query`
SELECT s.subjektiID,s.lloji, s.emertimi, s.kontakti, -- adjust the column names as needed
       COALESCE(SUM(sh.totaliPerPagese), 0) AS totalTotaliPerPagese,
       COALESCE(SUM(sh.totaliPageses), 0) AS totalTotaliPageses,
       COALESCE(SUM(sh.mbetjaPerPagese), 0) AS totalMbetjaPerPagese
FROM subjekti s
LEFT JOIN shitje sh ON s.subjektiID = sh.subjektiID
GROUP BY s.subjektiID, s.emertimi, s.kontakti,s.lloji;
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
    if (produkt.produktiID && produkt.sasiaShitjes && produkt.cmimiPerCope) {
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
        SET sasia += @sasia
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

  let transaksioniID = 0

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
        shifra, lloji, komenti, totaliPerPagese, totaliPageses, mbetjaPerPagese, dataShitjes, nrPorosise, menyraPagesesID, perdoruesiID, transaksioniID, subjektiID,nderrimiID
      ) OUTPUT INSERTED.shitjeID VALUES (
        @shifra, @lloji, @komenti, @totaliPerPagese, @totaliPageses, @mbetjaPerPagese, @dataShitjes, @nrPorosise, @menyraPagesesID, @perdoruesiID, @transaksioniID, @subjektiID,@nderrimiID
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

    for (const produkt of data.produktet) {
    if (produkt.produktiID && produkt.sasiaShitjes && produkt.cmimiPerCope && produkt.profiti !== null) {
      await connection.request()
        .input('shitjeID', sql.Int, shitjeID)
        .input('produktiID', sql.Int, produkt.produktiID)
        .input('sasia', sql.Int, produkt.sasiaShitjes)
        .input('cmimiShitjesPerCope', sql.Decimal(18, 2), produkt.cmimiPerCope)
        .input('totaliProduktit', sql.Decimal(18, 2), produkt.cmimiPerCope * produkt.sasiaShitjes)
        .input('komenti', sql.VarChar, data.komenti)
        .input('profitiProduktit', sql.Decimal(18, 2), produkt.profiti)
        .query(insertShitjeProduktiQuery);
      
      // Update the 'sasia' in 'produkti' table
      const updateProduktiQuery = `
        UPDATE produkti
        SET sasia = sasia - @sasiaShitjes
        WHERE produktiID = @produktiID
      `;

      await connection.request()
        .input('produktiID', sql.Int, produkt.produktiID)
        .input('sasiaShitjes', sql.Int, produkt.sasiaShitjes)
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

ipcMain.handle('anuloTransaksionin', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

    if (data.lloji === 'Shitje') {
      // Step 1: Retrieve sold products from shitjeProdukti for the specified transaksioniID
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
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deletePagesaQuery);
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteShitjeProduktiQuery);
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteShitjeQuery);
      await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteTransaksioniQuery);

      return { success: true };
    } 
    else if(data.lloji == 'Blerje') {
          // Step 1: Retrieve sold products from shitjeProdukti for the specified transaksioniID
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

        // Step 2: Update product quantities in produkti table
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

        // Step 3: Delete records from shitjeProdukti, shitje, and transaksioni tables
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
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deletePagesaQuery);
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteBlerjeProduktiQuery);
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteBlerjeQuery);
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteTransaksioniQuery);

        return { success: true };

    }else if(data.lloji == 'Shpenzim') {
        connection = await sql.connect(config);
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

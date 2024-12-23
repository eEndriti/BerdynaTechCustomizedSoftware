const { app, BrowserWindow, ipcMain,dialog,shell } = require('electron');
const path = require('path');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const fs = require('fs')

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

async function hashData(plainTextPassword) {
  try {
    const saltRounds = 10;

    // Generate the salt
    const salt = await bcrypt.genSalt(saltRounds);
    
    // Generate the hash using the salt
    const hash = await bcrypt.hash(plainTextPassword, salt);
    
    // Return both the salt and hash
    return { success: true, salt, hash };
  } catch (error) {
    console.error('Error generating hash and salt:', error);
    return { success: false, error: error.message };
  }
}

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
    console.error('Failed to fetch datetime from online server:');
    // Fallback to local system time if the request fails
    return new Date().toISOString(); // Return the current local datetime in ISO format
  }
}

async function verifyHashData(input, storedHash) {
  try {
    // Compare the input password with the stored hash
    const isMatch = await bcrypt.compare(input, storedHash);

    if (isMatch) {
      return { success: true, message: 'Fjalekalimi i sakte' };
    } else {
      return { success: false, message: 'Fjalekalimi i gabuar' };
    }
  } catch (error) {
    console.error('Error verifying:', error);
    return { success: false, message: error.message };
  }
}

ipcMain.handle('login', async (event, data) => {
  let connection;
  try {
    connection = await sql.connect(config);

    // Query to get the user by their ID
    const result = await connection.request()
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .query('SELECT * FROM Perdoruesi WHERE perdoruesiID = @perdoruesiID');

    if (result.recordset.length === 0) {
      return { success: false, message: 'Nuk Egziston Perdoruesi!' };
    }

    const user = result.recordset[0];

    const matchResult = await verifyHashData( data.fjalekalimi, user.fjalekalimiHash);

    if (!matchResult.success) {
      return { success: false, message: matchResult.message }; 
    }

    return {
      success: true,
      perdoruesiID: user.perdoruesiID,
      emertimi: user.emri,
      roli: user.roli
    };

  } catch (error) {
    console.error('Database error:', error);
    return { success: false, message: error.message };
  } finally {
    if (connection) {
      await sql.close();
    }
  }
});

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

async function fetchTablePunonjesit() {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM punonjesit`;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}

ipcMain.handle('fetchTablePunonjesit', async () => {
  const data = await fetchTablePunonjesit();
  return data;
});

async function fetchTableNderrimi() {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM nderrimi`;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}

ipcMain.handle('fetchTableNderrimi', async () => {
  const data = await fetchTableNderrimi();
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
  const formattedDate = currentDate.toISOString().split('T')[0]; 

  try {
    await sql.connect(config);

    // Kontrollojm sa nderrime egzistojne per daten aktuale 
    const result = await sql.query`
      SELECT COUNT(*) AS shiftCount
      FROM nderrimi
      WHERE CONVERT(date, dataFillimit) = ${formattedDate}`;

    // e Llogaritim numri Percjelles
    const shiftCount = result.recordset[0].shiftCount;
    const numriPercjelles = shiftCount + 1;

    // i insertojme te dhenat e reja
    await sql.query`
      INSERT INTO nderrimi (perdoruesiID, dataFillimit, avansi, numriPercjelles, iHapur)
      VALUES (${perdoruesiID}, ${currentDate}, ${avans}, ${numriPercjelles}, 1)`;
    
    console.log(`New shift started with numriPercjelles: ${numriPercjelles}`);
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

    // Return success
    return { success: true };
  } catch (err) {
    console.error('Error closing current shift:', err);
    // Return failure with error message
    return { success: false, error: err.message };
  } finally {
    await sql.close();
  }
}

ipcMain.handle('mbyllNderriminAktual', async () => {
  const result = await mbyllNderriminAktual();
  return result; // Ensure the result is returned to the renderer process
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
        sh.mbetjaPerPagese,sh.dataShitjes,sh.menyraPagesesID,sh.perdoruesiID,
        sh.transaksioniID,sh.kohaGarancionit,s.emertimi as 'subjekti',sh.subjektiID,m.emertimi as 'menyraPageses',p.emri as 'perdoruesi',n.numriPercjelles,n.dataFillimit,sho.nrPorosise,sho.statusi,pr.profitiID from shitje sh
        join subjekti s on s.subjektiID = sh.subjektiID
        join menyraPageses m on m.menyraPagesesID = sh.menyraPagesesID
        join Perdoruesi p on p.perdoruesiID = sh.perdoruesiID
        join nderrimi n on n.nderrimiID = sh.nderrimiID
		    join profiti pr on pr.transaksioniID = sh.transaksioniID
        left join shitjeOnline sho on sho.shitjeID  = sh.shitjeID
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

async function fetchTableShitjeOnline() {
  try {
    await sql.connect(config);
    const result = await sql.query`
        select sh.shitjeID,sh.shifra,sh.lloji,sh.komenti,sh.totaliPerPagese,sh.totaliPageses,
        sh.mbetjaPerPagese,sh.dataShitjes,sh.menyraPagesesID,sh.perdoruesiID,
        sh.transaksioniID,sh.kohaGarancionit,s.emertimi as 'subjekti',sh.subjektiID,m.emertimi as 'menyraPageses',p.emri as 'perdoruesi',n.numriPercjelles,n.dataFillimit,sho.nrPorosise,sho.profitiID,sho.statusi from shitje sh
        join subjekti s on s.subjektiID = sh.subjektiID
        join menyraPageses m on m.menyraPagesesID = sh.menyraPagesesID
        join Perdoruesi p on p.perdoruesiID = sh.perdoruesiID
        join nderrimi n on n.nderrimiID = sh.nderrimiID
		    join shitjeOnline sho on sho.shitjeID = sh.shitjeID
        `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableShitjeOnline', async () => {
  const data = await fetchTableShitjeOnline();
  return data;
});

async function fetchTablePagat() {
  try {
    await sql.connect(config);
    const result = await sql.query`
        select p.pagaID,p.punonjesID,p.dataPageses,p.paga,p.bonusi,p.zbritje,pn.emri,m.emertimi as 'menyraPageses' from paga p
        join punonjesit pn on pn.punonjesID = p.punonjesID
		    join menyraPageses m on m.menyraPagesesID = p.menyraPagesesID
        `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTablePagat', async () => {
  const data = await fetchTablePagat();
  return data;
});

async function fetchTableBonuset() {
  try {
    await sql.connect(config);
    const result = await sql.query`
        select * from bonuset
        `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTableBonuset', async () => {
  const data = await fetchTableBonuset();
  return data;
});

async function fetchTablePushimet() {
  try {
    await sql.connect(config);
    const result = await sql.query`
        select * from pushimet
        `;
    return result.recordset;
  } catch (err) {
    console.error('Error retrieving data:', err);
    return [];
  } finally {
    await sql.close();
  }
}
ipcMain.handle('fetchTablePushimet', async () => {
  const data = await fetchTablePushimet();
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
    s.totaliPerPagese,s.totaliPageses,s.mbetjaPageses,s.dataPerfundimit,s.perdoruesiID,s.nderrimiID,s.transaksioniID,s.subjektiID,s.menyraPagesesID,
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
    select  p.produktiID,p.shifra,p.emertimi,p.pershkrimi,p.sasia,p.cmimiBlerjes,p.cmimiShitjes,p.dataKrijimit,p.komenti,p.meFatureTeRregullt,p.cpu,p.ram,p.gpu,p.disku,k.emertimi as 'emertimiKategorise',k.tvsh,k.kategoriaID from produkti p
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
      WHERE (t.lloji = 'Shitje' OR t.lloji = 'Servisim') and t.dataTransaksionit = ${dataSot} and p.statusi = 0


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

 async function generateNextShifra(tabela, shtojca, connection) {
  let latestShifraNumber = 999; // Default starting number
  let nextShifra;
  let exists = true;

  try {
      // Check if the connection is closed, reconnect if necessary
      if (!connection.connected) {
          console.log('Reconnecting SQL...');
          await connection.connect();
      }

      while (exists) {
          const request = connection.request();

          // Query to get the latest 'shifra'
          const result = await request.query(`
              SELECT TOP 1 shifra 
              FROM ${tabela} 
              WHERE shifra LIKE '${shtojca}-%' 
              ORDER BY CAST(SUBSTRING(shifra, LEN('${shtojca}-') + 1, LEN(shifra)) AS INT) DESC
          `);

          if (result.recordset.length > 0) {
              latestShifraNumber = parseInt(result.recordset[0].shifra.replace(`${shtojca}-`, ''), 10);
          }

          // Increment the number
          nextShifra = `${shtojca}-${latestShifraNumber + 1}`;

          // Check if this 'shifra' already exists
          const checkRequest = connection.request();
          const checkResult = await checkRequest.query(`
              SELECT COUNT(*) as count 
              FROM ${tabela} 
              WHERE shifra = '${nextShifra}'
          `);

          if (checkResult.recordset[0].count === 0) {
              exists = false;
          } else {
              latestShifraNumber += 1;
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

ipcMain.handle('shtoPerdoruesin', async (event, data) => {
  let connection;
  try {
    connection = await sql.connect(config);

    const { success, hash, salt, error } = await hashData(data.fjalekalimi);

    if (!success) {
      return { success: false, error: error };
    }

    const insert = `
      INSERT INTO Perdoruesi (
        emri, fjalekalimiHash, salt, roli
      ) VALUES (
        @emri, @fjalekalimiHash, @salt, @roli
      )
    `;
    await connection.request()
      .input('emri', sql.VarChar, data.emri)
      .input('fjalekalimiHash', sql.VarChar, hash)
      .input('salt', sql.VarChar, salt)
      .input('roli', sql.VarChar, data.roli)
      .query(insert);

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

ipcMain.handle('shtoOpsionPagese', async (event, data) => {
  let connection;
  try {
    connection = await sql.connect(config);

    const insert = `
      INSERT INTO menyraPageses (
        emertimi
      ) OUTPUT INSERTED.menyraPagesesID VALUES (
        @emertimi
      )
    `;

    const insertedResult  = await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .query(insert);

      const menyraID = insertedResult.recordset[0].menyraPagesesID;

      const insertBalanci = `
      INSERT INTO balanci (
        shuma,menyraPagesesID
      ) OUTPUT INSERTED.menyraPagesesID VALUES (
        @shuma,@menyraPagesesID
      )
    `;

    await connection.request()
      .input('shuma', sql.VarChar, data.shuma)
      .input('menyraPagesesID', sql.Int, menyraID)
      .query(insertBalanci);

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



ipcMain.handle('shtoPunonjes', async (event, data) => {
  let connection;
  let dataDheOra
  try {
    dataDheOra = await getDateTime(); // Await the result of getDateTime
    // Connect to the database
    connection = await sql.connect(config);

    const insertPunonjesi = `
      INSERT INTO punonjesit (
        emri, mbiemri, dataPunësimit, pagaBaze, aktiv, nrTelefonit
      ) VALUES (
        @emri, @mbiemri, @dataPunësimit, @pagaBaze, @aktiv, @nrTelefonit
      )
    `;

    await connection.request()
      .input('emri', sql.VarChar, data.emri)
      .input('mbiemri', sql.VarChar, data.mbiemri)
      .input('dataPunësimit', sql.Date, dataDheOra)
      .input('pagaBaze', sql.Decimal(18, 2), data.pagaBaze)
      .input('aktiv', sql.Int, 1)
      .input('nrTelefonit', sql.Int, data.nrTelefonit)
      .query(insertPunonjesi);

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
    const shifra = await generateNextShifra('shpenzimi', 'SHP',connection);
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

      await ndryshoBalancin(1, data.shumaShpenzimit, '-',connection);

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
    const shifra = await generateNextShifra('shpenzimi', 'SHP',connection);

    

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
    connection = await sql.connect(config);


    // Generate the next unique 'shifra' for transaksioni
    const shifra = await generateNextShifra('produkti', 'P',connection);

     // Connect to the database
    // Insert into the 'transaksioni' table and get the inserted ID

   
    const insertProdukti = `
      INSERT INTO produkti (
        shifra, emertimi, pershkrimi, sasia, cmimiBlerjes, cmimiShitjes, kategoriaID,dataKrijimit,komenti,cpu,ram,gpu,disku,meFatureTeRregullt
      )  VALUES (
       @shifra, @emertimi, @pershkrimi, @sasia, @cmimiBlerjes, @cmimiShitjes, @kategoriaID,@dataKrijimit,@komenti,@cpu,@ram,@gpu,@disku,@meFatureTeRregullt
      )
    `;
    const meFature = data.meFature ? 'po' : 'jo'

    await connection.request()
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
      .input('meFatureTeRregullt', sql.VarChar, meFature)
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

ipcMain.handle('ndryshoProduktin', async (event, data) => {
  let connection;
  let dataDheOra
  try {
    dataDheOra = await getDateTime(); // Await the result of getDateTime
    // Connect to the database
    connection = await sql.connect(config);
   
    const insertProdukti = `
     Update produkti 
        SET emertimi = @emertimi,
            pershkrimi = @pershkrimi,
            cmimiBlerjes = @cmimiBlerjes,
            cmimiShitjes = @cmimiShitjes,
            kategoriaID = @kategoriaID,
            komenti = @komenti,
            cpu = @cpu,
            ram = @ram,
            gpu = @gpu,
            disku = @disku,
            meFatureTeRregullt = @meFatureTeRregullt
        where produktiID = @produktiID
`
    const meFature = data.meFature ? 'po' : 'jo'
    console.log('daaaaaaaaaaaaaaaadaaaaaaaa',data)
    await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('pershkrimi', sql.VarChar, data.pershkrimi)
      .input('cmimiBlerjes', sql.Decimal(18,2), data.cmimiBlerjes)
      .input('cmimiShitjes', sql.Decimal(18,2), data.cmimiShitjes)
      .input('kategoriaID', sql.Int, data.kategoriaID)
      .input('komenti', sql.VarChar, data.komenti)
      .input('cpu', sql.VarChar, data.cpu)
      .input('ram', sql.VarChar, data.ram)
      .input('gpu', sql.VarChar, data.gpu)
      .input('disku', sql.VarChar, data.disku)
      .input('meFatureTeRregullt', sql.VarChar, meFature)
      .input('produktiID', sql.Int, data.produktiID)
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
    const shifra = await generateNextShifra('servisimi', 'S',connection);

     
    // Insert into the 'transaksioni' table and get the inserted ID

   
    const insertServisimi = `
      INSERT INTO servisimi (
        shifra, kontakti, komenti, pajisjetPercjellese, dataPranimit, statusi, shifraGarancionit,perdoruesiID,nderrimiID,subjektiID
      )  VALUES (
        @shifra, @kontakti, @komenti, @pajisjetPercjellese, @dataPranimit, @statusi, @shifraGarancionit,@perdoruesiID,@nderrimiID,@subjektiID
      )
    `;

    await connection.request()
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

ipcMain.handle('deleteOpsionPagese', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deleteFromBalanci = `
        DELETE FROM balanci 
        WHERE menyraPagesesID = @menyraPagesesID
      `;

      const deleteFromMenyraPagesave = `
        DELETE FROM menyraPageses 
        WHERE menyraPagesesID = @menyraPagesesID
      `;

      await connection.request().input('menyraPagesesID', sql.Int, idPerAnulim).query(deleteFromBalanci);
      await connection.request().input('menyraPagesesID', sql.Int, idPerAnulim).query(deleteFromMenyraPagesave);
      
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

ipcMain.handle('deletePerdoruesi', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deletePerdoruesi = `
        DELETE FROM Perdoruesi 
        WHERE perdoruesiID = @perdoruesiID
      `;

      await connection.request().input('perdoruesiID', sql.Int, idPerAnulim).query(deletePerdoruesi);
      
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

ipcMain.handle('deleteServisi', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

      // Hapi 1: i marrim produktet e shitura nga tabela servisProdukti ne baze te servisimiID 

      const getServisProdukti = `
      SELECT produktiID,sasia
      from servisProdukti
      WHERE servisimiID = @servisimiID
    `;
     
    const servisProduktiResult = await connection.request()
        .input('servisimiID', sql.Int, data.idPerAnulim)
        .query(getServisProdukti);

      const soldProducts = servisProduktiResult.recordset;

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

      const deleteFromTransaksioni = `
        Delete from transaksioni
        where transaksioniID = @transaksioniID
      ` 
      const deleteFromServisProdukti = `
      DELETE FROM servisProdukti 
      WHERE servisimiID = @servisimiID
    `;

      const deleteFromServisimi = `
        DELETE FROM servisimi 
        WHERE servisimiID = @servisimiID
      `;

      const deletePagesaQuery = `
        delete from pagesa 
        where transaksioniID = @transaksioniID
      `

      const deleteFromProfiti = `
      delete from profiti 
      where transaksioniID = @transaksioniID
    `

      if(data.statusi == 'Perfunduar'){      
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteFromProfiti);
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deletePagesaQuery);
        await connection.request().input('servisimiID', sql.Int, data.idPerAnulim).query(deleteFromServisProdukti);
        await connection.request().input('servisimiID', sql.Int, data.idPerAnulim).query(deleteFromServisimi);
        await connection.request().input('transaksioniID', sql.Int, data.transaksioniID).query(deleteFromTransaksioni);
        await ndryshoBalancin(data.menyraPagesesID,data.totaliPageses,'-',connection)

      }else{
        await connection.request().input('servisimiID', sql.Int, data.idPerAnulim).query(deleteFromServisimi);
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

ipcMain.handle('ndryshoOpsionPagese', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const updateBalanci = `
        Update balanci 
        SET shuma = @shuma
        where menyraPagesesID = @menyraPagesesID
      `;

      await connection.request()
      .input('shuma', sql.Decimal(18,2), data.shuma)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .query(updateBalanci);   

      const updateMenyra = `
      Update menyraPageses 
      SET emertimi = @emertimi
      where menyraPagesesID = @menyraPagesesID
      `;

      await connection.request()
      .input('emertimi', sql.VarChar, data.emertimi)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .query(updateMenyra);   

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

ipcMain.handle('ndryshoPerdorues', async (event, data) => {
  let connection;

  const { success, hash, salt, error } = await hashData(data.fjalekalimi);

    if (!success) {
      return { success: false, error: error };
    }

  try {
    connection = await sql.connect(config);

      const update = `
        Update Perdoruesi 
        SET emri = @emri,
            fjalekalimiHash = @hash,
            salt = @salt,
            roli = @roli
        where perdoruesiID = @perdoruesiID
      `;

      await connection.request()
      .input('emri', sql.VarChar, data.emri)
      .input('hash', sql.VarChar, hash)
      .input('salt', sql.VarChar, salt)
      .input('roli', sql.VarChar, data.roli)
      .input('perdoruesiID', sql.Int, data.perdoruesiID)
      .query(update);   

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
            transaksioniID = @transaksioniID,
            menyraPagesesID = @menyraPagesesID
        where shifra = @shifra
      `;

      await connection.request()
      .input('totaliPerPagese', sql.Decimal(10,2), data.totaliPerPagese)
      .input('totaliPageses', sql.Decimal(10,2), data.totaliIPageses)
      .input('mbetjaPerPagese', sql.Decimal(10,2), data.mbetjaPerPagese)
      .input('statusi', sql.VarChar, 'Perfunduar')
      .input('dataPerfundimit', sql.DateTime, dataDheOra)
      .input('transaksioniID', sql.Int, transaksioniID)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .input('shifra', sql.VarChar, data.shifra)
      .query(updateServisinQuery);
      
      let profitiServisit = 0;

      for (const produkt of data.products) {
        
        const insertServisProduktiQuery = `
        INSERT INTO servisProdukti (
          servisimiID, produktiID, sasia, cmimiShitjesPerCope, totaliProduktit, komenti, profitiProduktit
        ) VALUES (
          @servisimiID, @produktiID, @sasia, @cmimiShitjesPerCope, @totaliProduktit, @komenti, @profitiProduktit
        )
        `;
            await connection.request()
          .input('servisimiID', sql.Int, data.servisimiID)
          .input('produktiID', sql.Int, produkt.produktiID)
          .input('sasia', sql.Int, produkt.sasiaShitjes)
          .input('cmimiShitjesPerCope', sql.Decimal(18, 2), produkt.cmimiPerCope)
          .input('totaliProduktit', sql.Decimal(18, 2), produkt.cmimiPerCope * produkt.sasiaShitjes)
          .input('komenti', sql.VarChar, produkt.komenti)
          .input('profitiProduktit', sql.Decimal(18, 2), produkt.profiti)
          .query(insertServisProduktiQuery);


          profitiServisit = produkt.profiti + profitiServisit

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

      const insertPagesatQuery = `
        insert into pagesa (
          shumaPageses,dataPageses,shifra,transaksioniID,subjektiID,menyraPagesesID
        ) values (
          @shumaPageses,@dataPageses,@shifra,@transaksioniID,@subjektiID,@menyraPagesesID
        )
      `
      await connection.request()
      .input('shumaPageses', sql.Decimal(10,2), data.totaliIPageses)
      .input('dataPageses', sql.DateTime, dataDheOra)
      .input('shifra', sql.VarChar, data.shifra)
      .input('transaksioniID', sql.Int, transaksioniID)
      .input('subjektiID', sql.Int, data.subjektiID)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .query(insertPagesatQuery);

      let statusiProfitit

      if(data.totaliPerPagese == data.totaliIPageses){
        statusiProfitit = 0
      }else{
        statusiProfitit = 1
      }
      console.log('profitiServisit', profitiServisit,'statusi',statusiProfitit)

      await insertProfiti(data,profitiServisit,transaksioniID,dataDheOra,statusiProfitit,connection)
      
      await ndryshoBalancin(data.menyraPagesesID,data.totaliIPageses,'+',connection)

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

ipcMain.handle('ndryshoShitje', async (event, data) => {
  let connection;
  let dataDheOra

  let transaksioniID = null

  try {
    dataDheOra = await getDateTime(); 

    connection = await sql.connect(config);
    let pershkrimi
    const newTpp = data.totaliPerPagese
    const oldTpp = data.totaliPerPageseFillestare
    const newTp = data.totaliPageses
    const oldTp = data.totaliPagesesFillestare
    let logjikaPerPagese 
            // Rasti 1 , pagesa nuk ndryshon
            console.log(newTpp,oldTpp,newTp,oldTp)
        if (newTpp !== oldTpp && newTp === oldTp) {
          pershkrimi = "Totali për Pagesë është ndryshuar, pa ndikuar në Totalin e Paguar. Ka mundësi që janë shtuar ose hequr produkte.";
          logjikaPerPagese = 'nukNdryshon'
        }

        // Rasti 2 
        else if (newTpp !== oldTpp && newTp !== oldTp) {
          if (newTp > oldTp) { //  shtohet nje pagese e re
            pershkrimi = "Totali për Pagesë është ndryshuar, dhe Totali i Paguar është rritur. Mundësi për produkte të shtuara dhe pagesë të shtuar.";
            logjikaPerPagese = 'shtohet+'

          } else { // shtohet nje pagese e re me minus
            pershkrimi = "Totali për Pagesë është ndryshuar, dhe Totali i Paguar është zvogëluar. Mundësi për produkte të hequra dhe pagesë të reduktuar.";
            logjikaPerPagese = 'shtohet-'

          }
        }

        // Rasti 3
        else if (newTpp === oldTpp && newTp !== oldTp) {
          if (newTp > oldTp) { // pagesa shtohet
            pershkrimi = "Totali i Paguar është rritur, ndërsa Totali për Pagesë ka mbetur i pandryshuar. Pagesë shtesë është bërë.";
            logjikaPerPagese = 'shtohet+'

          } else { // pagesa shtohet me minus
            pershkrimi = "Totali i Paguar është zvogëluar, ndërsa Totali për Pagesë ka mbetur i pandryshuar. Reduktim ose korrigjim i shumës së paguar.";
            logjikaPerPagese = 'shtohet-'
          }
        }

        // Rasti 5
        else {
          pershkrimi = "Shitja është ndryshuar për arsye të tjera. Kontrollo detajet.";
          logjikaPerPagese = 'nukNdryshon'
        }



        const transaksioniQuery = `
        INSERT INTO transaksioni (
          shifra, lloji, pershkrimi,totaliPerPagese, totaliIPageses, mbetjaPerPagese, dataTransaksionit, perdoruesiID, nderrimiID, komenti
        ) OUTPUT INSERTED.transaksioniID VALUES (
          @shifra, @lloji,@pershkrimi, @totaliPerPagese, @totaliIPageses, @mbetjaPerPagese, @dataTransaksionit, @perdoruesiID, @nderrimiID, @komenti
        )
      `;
        console.log(data.mbetjaPerPagese,'mbetjaPerPagese')
      const transaksioniResult = await connection.request()
        .input('shifra', sql.VarChar, data.shifra)
        .input('lloji', sql.VarChar, 'Shitje')
        .input('pershkrimi', sql.VarChar, pershkrimi)
        .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
        .input('totaliIPageses', sql.Decimal(18, 2), data.totaliPageses)
        .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
        .input('dataTransaksionit', sql.Date, dataDheOra)
        .input('perdoruesiID', sql.Int, data.perdoruesiID)
        .input('nderrimiID', sql.Int, data.nderrimiID)
        .input('komenti', sql.VarChar, data.komenti)
        .query(transaksioniQuery);

      transaksioniID = transaksioniResult.recordset[0].transaksioniID;

      const updateShitjeQuery = `
          UPDATE shitje
          SET 
              lloji = @lloji,
              komenti = @komenti,
              totaliPerPagese = @totaliPerPagese,
              totaliPageses = @totaliPageses,
              mbetjaPerPagese = @mbetjaPerPagese,
              dataShitjes = @dataShitjes,
              menyraPagesesID = @menyraPagesesID,
              subjektiID = @subjektiID,
              kohaGarancionit = @kohaGarancionit
          OUTPUT INSERTED.shitjeID
          WHERE shitjeID = @shitjeID
      `;
      

    const shitjeResult = await connection.request()
      .input('lloji', sql.VarChar, data.lloji)
      .input('komenti', sql.VarChar, data.komenti)
      .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliPerPagese)
      .input('totaliPageses', sql.Decimal(18, 2), data.totaliPageses)
      .input('mbetjaPerPagese', sql.Decimal(18, 2), data.mbetjaPerPagese)
      .input('dataShitjes', sql.Date, data.dataShitjes)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .input('subjektiID', sql.Int, data.subjektiID)
      .input('kohaGarancionit', sql.Int, data.kohaGarancionit)
      .input('shitjeID', sql.Int, data.shitjeID)
      .query(updateShitjeQuery);

      const shitjeID = shitjeResult.recordset[0].shitjeID;

     /* let shitjeOnlineQuery ;

      if(data.llojiFillestarIShitjes == 'online' && data.llojiShitjes == 'dyqan'){
          shitjeOnlineQuery = `
            delete from shitjeOnline
            where shitjeID  = @shitjeID
          `
      }else if(data.llojiFillestarIShitjes == 'dyqan' && data.llojiShitjes == 'online'){
          shitjeOnlineQuery = `
          Insert into shitjeOnline (
            shitjeID,statusi,nrPorosise,profitiID
          ) VALUES (
            @shitjeID,@statusi,@dataPranimit,@kostoPostes,@totaliPranimit,@nrPorosise,@profitiID
          )
        `
      }else if(data.llojiFillestarIShitjes == 'online' && data.llojiShitjes == 'online'){
        shitjeOnlineQuery = `
        UPDATE shitjeOnline
              Set
                  nrPorosise = @nrPorosise
                  where shitjeID = @shitjeID
        `
      }

      await connection.request()
      .input('shitjeID', sql.Int, data.shitjeID)
      .input('statusi', sql.TinyInt, 0)
      .input('nrPorosise', sql.Int, data.totaliPerPagese)
      .input('profitiID', sql.Int, data.profitiID)
      .query(shitjeOnlineQuery); 
*/
      let profitiShitjes = 0

      await anuloShitjeProdukti(data);
      

      for (const produkt of data.produktet) {
        
          const insertShitjeProduktiQuery = `
          INSERT INTO shitjeProdukti (
            shitjeID, produktiID, sasia, cmimiShitjesPerCope, totaliProduktit, komenti, profitiProduktit
          ) VALUES (
            @shitjeID, @produktiID, @sasia, @cmimiShitjesPerCope, @totaliProduktit, @komenti, @profitiProduktit
          )
          `;
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

      let statusi;
      if (data.mbetjaPerPagese <= 0) {
        statusi =  0;
      } else {
        statusi =  1;
      }

      const updateProfitiShitjes = `
      UPDATE profiti
      SET 
        shuma = @shuma,
        statusi = @statusi
      WHERE 
        transaksioniID = @transaksioniID
    `;

    await connection.request()
      .input('shuma', sql.Decimal(18, 2), profitiShitjes) 
      .input('transaksioniID', sql.Int, data.transaksioniIDFillestar) 
      .input('statusi', sql.Int, statusi) 
      .query(updateProfitiShitjes);

      const tp = newTp - oldTp // sa € osht shtu ose minusu pagesa 

      if(logjikaPerPagese == 'shtohet+' || logjikaPerPagese == 'shtohet-'){

        const insertPagesatQuery = `
          insert into pagesa (
            shumaPageses,dataPageses,shifra,transaksioniID,subjektiID,menyraPagesesID
          ) values (
            @shumaPageses,@dataPageses,@shifra,@transaksioniID,@subjektiID,@menyraPagesesID
          )
        `
       
          await connection.request()
            .input('shumaPageses',sql.Decimal(10,2),tp)
            .input('dataPageses',sql.Date, dataDheOra)
            .input('shifra',sql.VarChar , data.shifra)
            .input('transaksioniID',sql.Int , transaksioniID)
            .input('subjektiID',sql.Int, data.subjektiID)
            .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
            .query(insertPagesatQuery)
          console.log(data.menyraPagesesID,data.menyraPagesesIDFillestare)
            if(data.menyraPagesesID != data.menyraPagesesIDFillestare){

              await ndryshoBalancin
(data.menyraPagesesIDFillestare,data.totaliPagesesFillestare,'-',connection)
              await ndryshoBalancin
(data.menyraPagesesID,data.totaliPageses,'+',connection)
    
            }else{
              await ndryshoBalancin
(data.menyraPagesesID,tp,'+',connection)
            } }      
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

ipcMain.handle('shtoPushimin', async (event, data) => {
  let connection;
  try {
    // Connect to the database
    connection = await sql.connect(config);

    const insertPushimi = `
      INSERT INTO pushimet (
        punonjesID,dataFillimit,dataMbarimit,lloji,aprovohet,arsyeja,nrDiteve
      )  VALUES (
        @punonjesID,@dataFillimit,@dataMbarimit,@lloji,@aprovohet,@arsyeja,@nrDiteve
      )
    `;

    await connection.request()
      .input('punonjesID', sql.Int, data.punonjesID)
      .input('dataFillimit', sql.Date, data.dataFillimit)
      .input('dataMbarimit', sql.Date, data.dataMbarimit)
      .input('lloji', sql.VarChar, data.lloji)
      .input('aprovohet', sql.Bit, 1)
      .input('arsyeja', sql.VarChar, data.arsyeja)
      .input('nrDiteve', sql.Int, data.nrDiteve)
      .query(insertPushimi);

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

ipcMain.handle('paguajBonuset', async (event, data) => {
    let connection;
    let dataDheOra
    console.log('data logged',data)
    try {
      dataDheOra = await getDateTime(); 
      connection = await sql.connect(config);

      const insert = `
        INSERT INTO bonusetPunonjesit (
          punonjesiID, bonusetID,statusi,menyraPagesesID,dataPageses
        )  VALUES (
          @punonjesiID, @bonusetID,@statusi,@menyraPagesesID,@dataPageses
        )
      `;

      for (const item of data.bonusetPerPunonjes) {
        await connection.request()
            .input('punonjesiID', sql.Int, data.punonjesiID)
            .input('bonusetID', sql.Int, item.bonusetID)
            .input('statusi', sql.TinyInt, 1)
            .input('dataPageses', sql.Date, dataDheOra)
            .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
            .query(insert);
    }

      await ndryshoBalancin(data.menyraPagesesID,data.totalBonuset,'+',connection)

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

  const ndryshoBalancin = async (menyraPagesesID, shuma, veprimi,connection) => {
    try {
  
      const updateBalanci = veprimi == '+' 
        ? `UPDATE balanci SET shuma = shuma + @shuma WHERE menyraPagesesID = @menyraPagesesID`
        : `UPDATE balanci SET shuma = shuma - @shuma WHERE menyraPagesesID = @menyraPagesesID`;
  
      await connection.request()
        .input('shuma', sql.Decimal(10,2), shuma)
        .input('menyraPagesesID', sql.Int, menyraPagesesID)
        .query(updateBalanci);
  
      return { success: true };
  
    } catch (error) {
      console.error('Database error:', error);
      return { success: false, error: error.message };
    } 
  };

ipcMain.handle('paguajPagen', async (event, data) => {
    let connection;
    try {
      // Connect to the database
      connection = await sql.connect(config);

      const insert = `
        INSERT INTO paga (
          punonjesID, dataPageses,paga,bonusi,zbritje,menyraPagesesID
        )  VALUES (
          @punonjesID, @dataPageses,@paga,@bonusi,@zbritje,@menyraPagesesID
        )
      `;
      console.log('asssssssssssssssssssss',data)
      await connection.request()
        .input('punonjesID', sql.Int, data.punonjesID)
        .input('dataPageses', sql.Date, data.dataPageses)
        .input('paga', sql.Decimal(18,2), data.paga)
        .input('bonusi', sql.Decimal(18,2), data.bonusi)
        .input('zbritje', sql.Decimal(18,2), data.zbritje)
        .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
        .query(insert);

      const shumaPerPagese = Number(data.paga) + Number(data.bonusi) - Number(data.zbritje)
      await ndryshoBalancin
(data.menyraPagesesID,shumaPerPagese,'-',connection)

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




ipcMain.handle('transferoMjetet', async (event, data) => {
    let connection;
    try {
      // Connect to the database

      connection = await sql.connect(config);
      
      await ndryshoBalancin(data.ngaOpsioni,data.shuma,'-',connection)
      await ndryshoBalancin(data.neOpsionin,data.shuma,'+',connection)

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
    dataDheOra = await getDateTime(); 

    connection = await sql.connect(config);

    const shifra = await generateNextShifra('blerje', 'B',connection);


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

      await ndryshoBalancin(data.menyraPagesesID,data.totaliPageses,'-',connection)

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
  let dataDheOra;
  let transaksioniID = null;

  try {
      dataDheOra = await getDateTime();
      connection = await sql.connect(config); 

      const shifra = await generateNextShifra('shitje', 'SH', connection);

      if (data.lloji == 'dyqan') {
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

      // Insert into shitje
      const insertShitjeQuery = `
          INSERT INTO shitje (
              shifra, lloji, komenti, totaliPerPagese, totaliPageses, mbetjaPerPagese, dataShitjes, menyraPagesesID, perdoruesiID, transaksioniID, subjektiID,nderrimiID,kohaGarancionit
          ) OUTPUT INSERTED.shitjeID VALUES (
              @shifra, @lloji, @komenti, @totaliPerPagese, @totaliPageses, @mbetjaPerPagese, @dataShitjes, @menyraPagesesID, @perdoruesiID, @transaksioniID, @subjektiID,@nderrimiID,@kohaGarancionit
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
          .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
          .input('perdoruesiID', sql.Int, data.perdoruesiID)
          .input('transaksioniID', sql.Int, transaksioniID)
          .input('subjektiID', sql.Int, data.subjektiID)
          .input('nderrimiID', sql.Int, data.nderrimiID)
          .input('kohaGarancionit', sql.Int, data.kohaGarancionit)
          .query(insertShitjeQuery);

            const shitjeID = shitjeResult.recordset[0].shitjeID;

            const insertShitjeOnline = `
            INSERT INTO shitjeOnline (
                shitjeID,statusi,nrPorosise,profitiID
            ) VALUES (
                @shitjeID,@statusi,@nrPorosise,@profitiID               
            )`

            

          const insertShitjeProduktiQuery = `
          INSERT INTO shitjeProdukti (
            shitjeID, produktiID, sasia, cmimiShitjesPerCope, totaliProduktit, komenti, profitiProduktit
          ) VALUES (
            @shitjeID, @produktiID, @sasia, @cmimiShitjesPerCope, @totaliProduktit, @komenti, @profitiProduktit
          )
          `;
    

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

          let statusi;
            if ( data.mbetjaPerPagese <= 0) {
              statusi =  0;
            } else {
              statusi =  1;
            }
    
          const profitiID = await insertProfiti(data,profitiShitjes,transaksioniID,dataDheOra,statusi,connection)
   
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

            if(data.lloji == 'online'){
              await connection.request()
              .input('shitjeID', sql.Int, shitjeID)
              .input('statusi', sql.TinyInt, 1)
              .input('nrPorosise', sql.VarChar, data.nrPorosise)
              .input('profitiID', sql.Int, profitiID)
              .query(insertShitjeOnline);
            }

            if(data.lloji == 'dyqan'){
              await ndryshoBalancin(data.menyraPagesesID,data.totaliPageses,'+',connection)
            }

    return { success: true,shifra:shifra };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error: error.message };
  } 
});

ipcMain.handle('perfundoShitjenOnline', async (event, data) => {
  let connection;
  let dataDheOra;
  let transaksioniID = null;

  try {
      dataDheOra = await getDateTime();
      connection = await sql.connect(config); 


          const insertTransaksioniQuery = `
              INSERT INTO transaksioni (
                  shifra, lloji, totaliPerPagese, totaliIPageses, mbetjaPerPagese, dataTransaksionit, perdoruesiID, nderrimiID, komenti
              ) OUTPUT INSERTED.transaksioniID VALUES (
                  @shifra, @lloji, @totaliPerPagese, @totaliIPageses, @mbetjaPerPagese, @dataTransaksionit, @perdoruesiID, @nderrimiID, @komenti
              )
          `;
      console.log('nderrimiID',data.nderrimiID)

          const transaksioniResult = await connection.request()
              .input('shifra', sql.VarChar, data.shifra)
              .input('lloji', sql.VarChar, 'Shitje')
              .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliIPranuar)
              .input('totaliIPageses', sql.Decimal(18, 2), data.totaliIPranuar)
              .input('mbetjaPerPagese', sql.Decimal(18, 2), 0)
              .input('dataTransaksionit', sql.Date, dataDheOra)
              .input('perdoruesiID', sql.Int, data.perdoruesiID)
              .input('nderrimiID', sql.Int, data.nderrimiID)
              .input('komenti', sql.VarChar, data.komenti)
              .query(insertTransaksioniQuery);

          transaksioniID = transaksioniResult.recordset[0].transaksioniID;

      // Insert into shitje
      const updateShitjeQuery = `
          UPDATE shitje 
            SET totaliPerPagese = @totaliPerPagese,
                totaliPageses = @totaliPageses,       
                mbetjaPerPagese = @mbetjaPerPagese,
                transaksioniID = @transaksioniID
            WHERE shitjeID = @shitjeID
      `;

      await connection.request()
          .input('totaliPerPagese', sql.Decimal(18, 2), data.totaliIPranuar)
          .input('totaliPageses', sql.Decimal(18, 2), data.totaliIPranuar)
          .input('mbetjaPerPagese', sql.Decimal(18, 2), 0)
          .input('transaksioniID', sql.Int, transaksioniID)
          .input('shitjeID', sql.Int, data.shitjeID)
          .query(updateShitjeQuery);

            const updateShitjeOnline =`
                UPDATE shitjeOnline
                  SET statusi = @statusi,
                      dataPranimit = @dataPranimit,       
                      kostoPostes = @kostoPostes,
                      totaliIPranimit = @totaliIPranimit
                WHERE shitjeID = @shitjeID
            `;

            await connection.request()
              .input('statusi', sql.TinyInt, 0)
              .input('dataPranimit', sql.DateTime, dataDheOra)
              .input('kostoPostes', sql.Decimal(18,2), data.kostoPostes)
              .input('totaliIPranimit', sql.Decimal(18,2), data.totaliIPranuar)
              .input('shitjeID', sql.Int, data.shitjeID)
              .query(updateShitjeOnline);

              const updateProfitiShitjes = `
              UPDATE profiti
              SET 
                statusi = @statusi,
                transaksioniID = @transaksioniID
              WHERE 
                profitiID = @profitiID
            `;
        
            await connection.request()
              .input('transaksioniID', sql.Int, transaksioniID) 
              .input('statusi', sql.Int, 0) 
              .input('profitiID', sql.Int, data.profitiID) 
              .query(updateProfitiShitjes);
       
          const insertPagesatQuery = `
          insert into pagesa (
            shumaPageses,dataPageses,shifra,transaksioniID,subjektiID,menyraPagesesID
          ) values (
            @shumaPageses,@dataPageses,@shifra,@transaksioniID,@subjektiID,@menyraPagesesID
          )
        `

          await connection.request()
            .input('shumaPageses',sql.Decimal(10,2),data.totaliIPranuar)
            .input('dataPageses',sql.Date, dataDheOra)
            .input('shifra',sql.VarChar , data.shifra)
            .input('transaksioniID',sql.Int , transaksioniID)
            .input('subjektiID',sql.Int, data.subjektiID)
            .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
            .query(insertPagesatQuery)

          await ndryshoBalancin(data.menyraPagesesID,data.totaliIPranuar,'+',connection)

    return { success: true };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error: error.message };
  } 
});

const insertProfiti = async (data, profitiShitjes, transaksioniID, dataDheOra, statusi, connection) => {
  try {
    const insertProfitiShitjes = `
      INSERT INTO profiti (
        shuma, nderrimiID, dataProfitit, transaksioniID, statusi
      ) 
      OUTPUT INSERTED.profitiID
      VALUES (
        @shuma, @nderrimiID, @dataProfitit, @transaksioniID, @statusi
      )
    `;

    const result = await connection.request()
      .input('shuma', sql.Decimal(10, 2), profitiShitjes)
      .input('nderrimiID', sql.Int, data.nderrimiID)
      .input('dataProfitit', sql.Date, dataDheOra)
      .input('transaksioniID', sql.Int, transaksioniID)
      .input('statusi', sql.Bit, statusi)
      .query(insertProfitiShitjes);

    const profitiID = result.recordset[0].profitiID; // Extract the inserted ID

    await kalkuloBonuset();

    return profitiID; // Return the inserted ID
  } catch (error) {
    console.log(error);
    return null; // Return null in case of an error
  }
};


const kalkuloBonuset = async () => {
  let connection;
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  
  try {
    connection = await sql.connect(config);
    
    const getProfitQuery = `SELECT SUM(shuma) AS totaliProfititDitor FROM profiti WHERE CAST(dataProfitit AS DATE) = @data`;
    const profitResult = await connection.request()
      .input('data', sql.Date, formattedDate)
      .query(getProfitQuery);
    
    const totaliProfititDitor = profitResult.recordset[0]?.totaliProfititDitor || 0;

    const bonusiDitor = totaliProfititDitor >= 200 ? Math.floor((totaliProfititDitor - 200) / 100) * 5 + 10 : 0;

    const getBonusQuery = `SELECT bonusetID FROM bonuset WHERE CAST(dataBonuseve AS DATE) = @todayDate`;
    const bonusResult = await connection.request()
      .input('todayDate', sql.Date, formattedDate)
      .query(getBonusQuery);

    const bonusetID = bonusResult.recordset[0]?.bonusetID;

    if (bonusetID && bonusiDitor > 0) {
      await connection.request()
        .input('bonusiDitor', sql.Int, bonusiDitor)
        .input('bonusetID', sql.Int, bonusetID)
        .query(`UPDATE bonuset SET shuma = @bonusiDitor WHERE bonusetID = @bonusetID`);
      
      console.log('Bonus updated:', bonusiDitor);
      
    } else if (!bonusetID && bonusiDitor > 0) {
      await connection.request()
        .input('bonusiDitor', sql.Int, bonusiDitor)
        .input('formattedDate', sql.Date, formattedDate)
        .query(`INSERT INTO bonuset (shuma, dataBonuseve) VALUES (@bonusiDitor, @formattedDate)`);
     
      console.log('Bonus inserted:', bonusiDitor);
    }

    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  } 
};


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

      for (const shmn of shumaMenyraPageses) {

        await ndryshoBalancin
(shmn.menyraPagesesID,shmn.totaliPageses,'-',connection)

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

const anuloShitjeProdukti = async (data) => {
 let connection 
 connection = await sql.connect(config);
  // Hapi 1: i marrim produktet e shitura nga tabela shitjeProdukti ne baze te shitjeID 
  const getShitjeProduktiQuery = `
  SELECT produktiID, sasia 
  FROM shitjeProdukti 
  WHERE shitjeID IN (
    SELECT shitjeID 
    FROM shitje 
    WHERE shitjeID = @shitjeID
  )
`;

console.log('ddddddddddddddddddddddddddddddddddddddd',data)

const shitjeProduktiResult = await connection.request()
  .input('shitjeID', sql.Int, data.shitjeID)
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

const deleteShitjeProduktiQuery = `
        DELETE FROM shitjeProdukti 
        WHERE shitjeID IN (
          SELECT shitjeID 
          FROM shitje 
          WHERE shitjeID = @shitjeID
        )
      `;

await connection.request().input('shitjeID', sql.Int, data.shitjeID).query(deleteShitjeProduktiQuery);

}

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

      await ndryshoBalancin
(shmn.menyraPagesesID,shmn.totaliPageses,'+',connection)

      for (const shmn of shumaMenyraPageses) {
        await ndryshoBalancin
(shmn.menyraPagesesID,shmn.totaliPageses,'+',connection)

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

ipcMain.handle('anuloBonusin', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

       
        const deleteQuery = `
          DELETE FROM bonusetPunonjesit 
          WHERE bonusetID = @bonusetID and punonjesiID = @punonjesiID
        `;

       await connection.request()
        .input('bonusetID', sql.Int, data.bonusetID)
        .input('punonjesiID', sql.Int, data.punonjesID)
        .query(deleteQuery)

    console.log('dddddaaaaaaaaatttttttaaaaaa',data)
      await ndryshoBalancin(data.menyraPagesesID,data.shumaPageses,'-',connection)

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

            for (const shmn of shuma) {
              await ndryshoBalancin
(1,shmn.shumaShpenzimit,'+',connection)
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

ipcMain.handle('fshijePunonjesin', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deleteQuery = `
        DELETE FROM punonjesit 
        WHERE punonjesID = @punonjesID
      `;

      await connection.request().input('punonjesID', sql.Int, idPerAnulim).query(deleteQuery);
      
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

ipcMain.handle('fshijePagen', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

    const oldDataQuery = `SELECT menyraPagesesID, paga,bonusi,zbritje FROM paga WHERE pagaID = @pagaID`;
    const oldDataResult = await connection.request()
        .input('pagaID', sql.Int, idPerAnulim)
        .query(oldDataQuery);

    if (oldDataResult.recordset.length === 0) {
        throw new Error("Record not found");
    }

    const oldData = oldDataResult.recordset[0];
    const oldMenyraPagesesID = oldData.menyraPagesesID
    const oldBilanci = oldData.paga + oldData.bonusi

    console.log(oldMenyraPagesesID,oldBilanci,oldData)

    await ndryshoBalancin (oldMenyraPagesesID,oldBilanci,'+',connection)

      const deleteQuery = `
        DELETE FROM paga 
        WHERE pagaID = @pagaID
      `;

      await connection.request().input('pagaID', sql.Int, idPerAnulim).query(deleteQuery);
      
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

ipcMain.handle('deletePushimi', async (event, idPerAnulim) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const deleteLlojetShpenzimeveQuery = `
        DELETE FROM pushimet 
        WHERE pushimID = @pushimID
      `;

      await connection.request().input('pushimID', sql.Int, idPerAnulim).query(deleteLlojetShpenzimeveQuery);

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

ipcMain.handle('ndryshoPagen', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);
      const oldDataQuery = `SELECT menyraPagesesID, paga,bonusi,zbritje FROM paga WHERE pagaID = @pagaID`;
      const oldDataResult = await connection.request()
          .input('pagaID', sql.Int, data.pagaID)
          .query(oldDataQuery);

      if (oldDataResult.recordset.length === 0) {
          throw new Error("Record not found");
      }

      const oldData = oldDataResult.recordset[0];
      const oldBalanci = oldData.paga + oldData.bonusi ;
      const newBalanci = Number(data.paga) +Number(data.bonusi)  - Number(data.zbritje)

      await ndryshoBalancin(oldData.menyraPagesesID,oldBalanci,'+',connection)
      await ndryshoBalancin(data.menyraPagesesID,newBalanci,'-',connection)

      const update = `
        Update paga 
        SET paga = @paga,
            bonusi = @bonusi,
            zbritje = @zbritje,
            menyraPagesesID = @menyraPagesesID
        where pagaID = @pagaID
      `;

      await connection.request()
      .input('paga', sql.Decimal(18,2), data.paga)
      .input('bonusi', sql.Decimal(18,2), data.bonusi)
      .input('zbritje', sql.Decimal(18,2), data.zbritje)
      .input('pagaID', sql.Int, data.pagaID)
      .input('menyraPagesesID', sql.Int, data.menyraPagesesID)
      .query(update);   

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

      await ndryshoBalancin
(1,diferenca,'+',connection)

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

ipcMain.handle('ndryshoPushimin', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const updateLlojetShpezimeveQuery = `
        Update pushimet 
        SET dataFillimit = @dataFillimit,
            dataMbarimit = @dataMbarimit,
            lloji = @lloji,
            arsyeja = @arsyeja,
            nrDiteve = @nrDiteve
        where pushimID = @pushimID
      `;

      await connection.request()
      .input('dataFillimit', sql.Date, data.dataFillimit)
      .input('dataMbarimit', sql.Date, data.dataMbarimit)
      .input('lloji', sql.VarChar, data.lloji)
      .input('arsyeja', sql.VarChar, data.arsyeja)
      .input('nrDiteve', sql.Int, data.nrDiteve)
      .input('pushimID', sql.Int, data.pushimID)
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


ipcMain.handle('ndryshoPunonjes', async (event, data) => {
  let connection;

  try {
    connection = await sql.connect(config);

      const updatePunonjes = `
        Update punonjesit 
        SET emri = @emri,
            mbiemri = @mbiemri,
            pagaBaze = @pagaBaze,
            aktiv = @aktiv,
            nrTelefonit = @nrTelefonit
        where punonjesID = @punonjesID
      `;

      await connection.request()
      .input('emri', sql.VarChar, data.emri)
      .input('mbiemri', sql.VarChar, data.mbiemri)
      .input('pagaBaze', sql.Decimal(10,2), data.pagaBaze)
      .input('aktiv', sql.Int, data.aktiv)
      .input('nrTelefonit', sql.VarChar, data.nrTelefonit)
      .input('punonjesID', sql.Int, data.punonjesID)
      .query(updatePunonjes);   

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

ipcMain.on('savePDF', (event, { pdfBase64, folderPath, fileName }) => { const filePath = path.join(folderPath, fileName); const buffer = Buffer.from(pdfBase64, 'base64'); fs.writeFile(filePath, buffer, (error) => { if (error) { console.error('Failed to save PDF:', error); } else { console.log('PDF saved successfully to', filePath); } }); });


ipcMain.on('openFile', (event, filePath) => { shell.openPath(filePath) .then(() => console.log('File opened successfully')) .catch((error) => console.error('Failed to open file:', error)); });


const createWindow = () => {
  const win = new BrowserWindow({
    autoHideMenuBar: true, 
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'), // Ensure the correct path to preload.js
      contextIsolation: true,  // Enable context isolation for security
      nodeIntegration: true,  // Disable nodeIntegration for security
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

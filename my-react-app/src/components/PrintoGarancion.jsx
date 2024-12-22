import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";
import { formatCurrency } from '../useAuthData';

export const PrintoGarancion = (data,shifra) => {


  const folderPath = 'C:\\Users\\BerdynaTech\\Documents\\btechPDFtest'
  const fileName = `Garancioni ${shifra}.pdf`
  const dataGarancionit = getCurrentDateInAlbanian()
  const currentYear = new Date().getFullYear();

  const handlePrint = async () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'letter',
      putOnlyUsedFonts: true,
      floatPrecision: 16, // or "smart", default is 16
    });

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Fletë Garancioni ${shifra}`, 65, 20);

  // Client Details
    const clientDetails = `Klienti: ${data.emertimiSubjektit} | Kontakti: ${data.kontaktiSubjektit}`;

    const pageWidth = doc.internal.pageSize.width;

    const clientDetailsWidth = doc.getTextWidth(clientDetails);


    const adjustedWidth = clientDetailsWidth * 0.6; 
    const startX = (pageWidth - adjustedWidth) / 2;

    // Add text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(clientDetails, startX, 28);

    // Header
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`Garancioni për produktin e blerë është `, 15, 43);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.kohaGarancionit} Muaj`, 101, 43);
    doc.setFont("helvetica", "normal");
    doc.text(`nga data e blerjes: ${dataGarancionit}`, 117, 43);

    // Add a subtle dividing line for better separation
    doc.line(10, 35, doc.internal.pageSize.width - 10, 35);

    // Additional Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Në garancion përfshihet mbulesa e plotë përpos nëse produkti është:", 11, 54);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`• I dëmtuar nga shkarkesat e ndryshme elektrike te cilat qojne në demtime dhe mosfunksionim.`, 15, 65);
    doc.text(`• Dëmtimet fizike te cilat vijnë si pasojë e moskujdesit te klientit si psh(Dëmtimet nga përplasjet,
            hudhja e lëngjeve apo ujit,goditje,ndrydhjet etj.)`, 15, 72);
    doc.text(`• Në rast se aq kohë produkti është i mbrojtur me garancion tek ne,klienti dërgon këtë produkt për
            intervinime/servisime të ndryshme te ndonjë organizatë apo individë, përveq në raste kur
            ne e sygjerojmë për një veprim të tillë.`, 15, 85);
    doc.text(`• Në garancion nuk përfshihet vendosja e sistemeve operative`, 15, 102);
    doc.setFont("helvetica", "bold");
    doc.text(`Windows/IOS (Formatizimet)`, 132, 102);
    doc.setFont("helvetica", "normal");
    doc.text(`• Bateria garantohet sa për tu testuar në kohë-zgjatje prej 14 ditësh(Pjesa tjetër e kohës mbetet në
            përkujdesje të klientit)`, 15, 109);
    doc.text(`• Në rast të demtimit të diskut, garancioni përfshin vetëm diskun, ndërsa të dhënat mbeten në
            përgjegjesin e klientit`, 15, 122);
    doc.text(`• Blerja e Produktit tek ne nuk nenkupton mundesine e shitjes apo nderrimit te atij produkti serish 
            tek ne. `, 15, 135);

    // Table Columns
    const columns = [
      { header: "Nr", dataKey: "nr" },
      { header: "Shifra", dataKey: "shifraProduktit" },
      { header: "Emertimi", dataKey: "emertimiProduktit" },
      { header: "Pershkrimi", dataKey: "pershkrimiProduktit" },
      { header: "Cmimi per Cope", dataKey: "cmimiPerCope" },
      { header: "Sasia", dataKey: "sasiaShitjes" },
      { header: "Vlera Totale", dataKey: "vleraTotaleProduktit" },
      { header: "Komenti per Produkt", dataKey: "komentiProduktit" },
    ];

    // Example Data
    const rows = data.produktet

    autoTable(doc, {
      columns,
      body: rows,
      startY: 148,
      theme: 'grid',
      styles: { fontSize: 10, textColor: [1, 1, 1], cellPadding: 2 },
      headStyles: { fillColor: [209, 209, 209], textColor: [1, 1, 1] },
      columnStyles: {
        pershkrimi: { cellWidth: 60 },
        emertimi: { cellWidth: 'wrap' },
      },
      bodyStyles: {
        minCellHeight: 10,
      },
      didDrawPage: (data) => {
        const footerY = doc.internal.pageSize.height - 15;

        // Footer
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`${dataGarancionit}`, 100, footerY);

        const line1XStart = pageWidth - 60;
        const line1XEnd = pageWidth - 10;

        const line2XStart = pageWidth - 200;
        const line2XEnd = pageWidth - 150;

        doc.line(line1XStart, footerY, line1XEnd, footerY);
        doc.line(line2XStart, footerY, line2XEnd, footerY);

        doc.setFontSize(7);
        doc.text(`Nënshkrimi i Klientit`, 30, footerY + 4);
        doc.text(`Nënshkrimi i Shitësit`, pageWidth - 45, footerY+4);

        // Footer Branding
        const YForBranding = doc.internal.pageSize.height - 6;
        doc.setFontSize(8);
        const brandingText = `Berdyna Tech © 2016 - ${currentYear} | Tel: +383 49 988 833 | Adresa: Rr. Konferenca e Bujanit, Pejë, Kosovë`;
        const textWidth = doc.getTextWidth(brandingText);
        const startX = (pageWidth - textWidth) / 2;
        doc.setFontSize(8);
        doc.text(brandingText, startX, YForBranding);
      },
    });
    
      const startY = doc.lastAutoTable.finalY + 12; // Position text 10 units below the table
      const textX = pageWidth - 15; // Align the text to the right

      // Calculate the maximum width of the texts to ensure alignment
      doc.line(10, startY-6, doc.internal.pageSize.width - 10, startY-6);

      const rows2 = [
        `Totali per Pagese : ${formatCurrency(data.totaliPerPagese)}`,
        `Totali i Pageses : ${formatCurrency(data.totaliPageses)}`,
        `Mbetja per Pagese : ${formatCurrency(data.mbetjaPerPagese)}`
      ];

      let currentY = startY;

      // Add text to the doc, and calculate the Y position dynamically to ensure it stays in line
      rows2.forEach((row2, index) => {
        const textWidth = doc.getTextWidth(row2);
        
        // Adjust X position if needed (right-aligned text)
        doc.text(row2, textX - textWidth, currentY);
        currentY += 6; // Add space between rows
      });

    // Save the PDF
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    await window.api.savePDF({ pdfBase64, folderPath, fileName });
    const filePath = folderPath + '\\' + fileName
    await window.api.openFile(filePath );

  };

  // Trigger print
  handlePrint();
};



function getCurrentDateInAlbanian() {
  const albanianMonths = [
    'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
    'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
  ];

  // Set Albania's timezone offset (+1 GMT)
  const albaniaTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Tirane" }));

  const day = String(albaniaTime.getDate()).padStart(2, '0'); // Add leading zero for single-digit days
  const month = albanianMonths[albaniaTime.getMonth()]; // Get Albanian month name
  const year = albaniaTime.getFullYear(); // Get year

  return `${day}-${month}-${year}`;
}

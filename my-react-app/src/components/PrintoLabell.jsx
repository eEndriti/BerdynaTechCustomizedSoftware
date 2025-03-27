import React, { useRef } from 'react';

const PrintoLabell = () => {
  const labelRef = useRef(null);

  const handlePrint = () => {
    const content = labelRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Label</title>
          <style>
            @page { margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; }
            .label { 
              width: 2in; 
              height: 1in; 
              border: 1px solid #000; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div class="label">${content}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const labelStyle = {
    width: '2in',
    height: '1in',
    border: '1px solid #000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px auto'
  };

  return (
    <div>
      <div style={labelStyle} ref={labelRef}>
        <p style={{ margin: 0, fontSize: '10px' }}>Dummy: Product Name</p>
        <p style={{ margin: 0, fontSize: '8px' }}>Price: $9.99</p>
      </div>
      <button onClick={handlePrint}>Print Label</button>
    </div>
  );
};

export default PrintoLabell;

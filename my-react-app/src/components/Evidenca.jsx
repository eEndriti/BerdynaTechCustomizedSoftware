import { useState, useEffect } from 'react';
import { Container, Spinner, Col, Row } from 'react-bootstrap';

export default function Evidenca() {
  const [loading, setLoading] = useState(true);
  const [menyratEPageses, setMenyratEPageses] = useState([]);
  const [vleraShitjevePaPaguar, setVleraShitjevePaPaguar] = useState([]);
  const [vleraBlerjevePaPaguar, setVleraBlerjevePaPaguar] = useState([]);
  const [produktiData, setProduktiData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data concurrently
        const [menyratResponse, shitjeResponse, blerjeResponse, produktiResponse] = await Promise.all([
          window.api.fetchTableMenyratPageses(),
          window.api.fetchTableQuery('SELECT SUM(mbetjaPerPagese) as vleraShitjevePaPaguar FROM shitje'),
          window.api.fetchTableQuery('SELECT SUM(mbetjaPerPagese) as vleraBlerjevePaPaguar FROM blerje'),
          window.api.fetchTableQuery(`
            SELECT 
              SUM(p.sasia * p.cmimiBlerjes) AS vleraEBlerjeve, 
              SUM(p.sasia * p.cmimiShitjes) AS VleraShitjeve,
              SUM(p.sasia) AS sasiaTotale,
              COUNT(*) AS nrProdukteve,
              SUM(CASE WHEN p.meFatureTeRregullt = 'po' THEN 1 ELSE 0 END) AS meFatureTeRregulltCount
            FROM produkti p
          `)
        ]);

        // Set state with fetched data
        setMenyratEPageses(menyratResponse);
        setVleraShitjevePaPaguar(shitjeResponse);
        setVleraBlerjevePaPaguar(blerjeResponse);
        setProduktiData(produktiResponse);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Col className='d-flex justify-content-center'>
        <Spinner className='text-success fw-bold fs-5'
          as="span"
          animation="border"
          size="lg"
          role="status"
          aria-hidden="true"
        />
      </Col>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const bgColors = ['bg-success', 'bg-info', 'bg-warning', 'bg-warning', 'bg-secondary'];

  return (
    <Container>
      <Row>
        <Col className='d-flex flex-row'>
          {menyratEPageses.map((menyra, index) => (
            <Col key={menyra.menyraPagesesID} className={`m-2 p-3 text-center rounded ${bgColors[index % bgColors.length]}`}>
              <h3>{menyra.emertimi}</h3>
              <h1>125.00€</h1>
            </Col>
          ))}
        </Col>
      </Row>
      <hr />

      <Row>
        <h4 className='text-center'>Evidenca Mujore: 'Qershor 1999'</h4>
        <Col className='text-center d-flex flex-wrap justify-content-start align-items-center p-2 m-2'>
            <h5 className='mx-5 mt-2 border rounded p-3'>Totali i Qarkullimit : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[1]?.vleraEBlerjeve.toFixed(2) || 'N/A'} €</span></h5>
            <h5 className='mx-5 mt-2 border rounded p-3'>Totali i Qarkullimit : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[1]?.vleraEBlerjeve.toFixed(2) || 'N/A'} €</span></h5>
            <h5 className='mx-5 mt-2 border rounded p-3'>Totali i Qarkullimit : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[1]?.vleraEBlerjeve.toFixed(2) || 'N/A'} €</span></h5>
            <h5 className='mx-5 mt-2 border rounded p-3'>Totali i Qarkullimit : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[1]?.vleraEBlerjeve.toFixed(2) || 'N/A'} €</span></h5>
          </Col>
      </Row>
          <hr/><br/>
      <Row>
      <h4 className='text-center'>Evidenca e Pergjithshme:</h4>
        <Col className='text-center d-flex flex-wrap justify-content-start align-items-center p-2 m-2'>
          <h5 className='mx-5 mt-2 border rounded p-3'>Vlera e Stokit ne Blerje : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[0]?.vleraEBlerjeve.toFixed(2) || 'N/A'} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Vlera e Stokit ne Shitje : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[0]?.VleraShitjeve.toFixed(2) || 'N/A'} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Nr. i Produkteve : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[0]?.nrProdukteve || 'N/A'}</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Vlera e Shitjeve te Pa Paguara : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{vleraShitjevePaPaguar[0]?.vleraShitjevePaPaguar.toFixed(2) || 'N/A'} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Vlera e Blerjeve te Pa Paguara : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{vleraBlerjevePaPaguar[0]?.vleraBlerjevePaPaguar.toFixed(2) || 'N/A'} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Nr. i Produkteve me Fature : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[0]?.meFatureTeRregulltCount || 'N/A'}</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Totali i Sasise : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[0]?.sasiaTotale || 'N/A'}</span></h5>
          
          
          <h5 className='mx-5 mt-2 border rounded p-3'>Kalkulimi Perfundimtar : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{vleraShitjevePaPaguar[0]?.vleraShitjevePaPaguar.toFixed(2) || 'N/A'} €</span></h5>
        </Col>
      </Row> 
      <hr />
    </Container>
  );
}

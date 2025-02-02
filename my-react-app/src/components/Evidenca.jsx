import { useState, useEffect } from 'react';
import { Container, Spinner, Col, Row,Form,Button,Card } from 'react-bootstrap';
import AnimatedSpinner from './AnimatedSpinner';
import ChartComponent from './ChartComponent';
import { formatCurrency } from "../components/AuthContext";

export default function Evidenca() {
  const [loading, setLoading] = useState(true);
  const [menyratEPageses, setMenyratEPageses] = useState([]);
  const [vleraShitjevePaPaguar, setVleraShitjevePaPaguar] = useState([]);
  const [vleraBlerjevePaPaguar, setVleraBlerjevePaPaguar] = useState([]);
  const [produktiData, setProduktiData] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [totalQarkullimi,setTotalQarkullimi] = useState(0)
  const [totalBlerje,setTotalBlerje] = useState(0)
  const [totalShitje,setTotalShitje] = useState(0)
  const [totalHyrje,setTotalHyrje] = useState(0)
  const [totalServisime,setTotalServisime] = useState(0)
  const [totalShpenzime,setTotalShpenzime] = useState(0)
  const [loading2,setLoading2] = useState(false)
  const [tregoGrafikun,setTregoGrafikun] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        setStartDate(() => {
          const today = new Date();
          today.setDate(2); 
          return today.toISOString().split('T')[0]; 
        })
        setEndDate(() => new Date().toISOString().split('T')[0])
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;  
  
    const fetchData = async () => {
      setLoading2(true);
      try {
        const query1 = `
          SELECT SUM(b.totaliPerPagese) as totaliPagesesBlerje
          FROM blerje b 
          WHERE b.dataBlerjes BETWEEN '${startDate}' AND '${endDate}'
        `;
        const data1 = await window.api.fetchTableQuery(query1);

        const query2 = `
           select sum(s.totaliPerPagese) as totaliPagesesShitje from shitje s
            where s.dataShitjes BETWEEN '${startDate}' AND '${endDate}'
          `;
        const data2 = await window.api.fetchTableQuery(query2);

        const query3 = `
          select sum(sh.shumaShpenzimit) as totaliPagesesShpenzim from shpenzimi sh
          where sh.dataShpenzimit BETWEEN '${startDate}' AND '${endDate}'
        `;
        const data3 = await window.api.fetchTableQuery(query3);

        const query4 = `
          select ISNULL(SUM(s.totaliPageses), 0) as totaliPagesesServisim  from servisimi s
          where statusi = 'perfunduar' and s.dataPerfundimit BETWEEN '${startDate}' AND '${endDate}'
        `;
        const data4 = await window.api.fetchTableQuery(query4);

        const query5 = `
           select sum(p.shuma) as totalHyrje from profiti p
          where p.statusi = 0 AND p.dataProfitit BETWEEN '${startDate}' AND '${endDate}'
        `;
        const data5 = await window.api.fetchTableQuery(query5);
        
        setTotalBlerje(data1[0].totaliPagesesBlerje)
        setTotalShitje(data2[0].totaliPagesesShitje)
        setTotalShpenzime(data3[0].totaliPagesesShpenzim)
        setTotalServisime(data4[0].totaliPagesesServisim)
        setTotalHyrje(data5[0].totalHyrje)

        const totalQarkullimi = (data1[0].totaliPagesesBlerje || 0) + (data2[0].totaliPagesesShitje || 0) + (data3[0].totaliPagesesShpenzim || 0) + (data4[0].totaliPagesesServisim || 0);
        setTotalQarkullimi(totalQarkullimi);
                
      } catch (error) {
        console.error(error);
      } finally {
        setLoading2(false);
      }
    };
  
    fetchData();
  }, [startDate, endDate]);  
  

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

  const bgColors = ['bg-success', 'bg-info', 'bg-warning', 'bg-primary', 'bg-secondary','bg-danger'];

  return (
    <Container fluid className='mt-5'>
      <Row>
        <Col className='d-flex flex-row'>
          {menyratEPageses.map((menyra, index) => (
            <Col key={menyra.menyraPagesesID} className={`m-2 p-3 text-center rounded ${bgColors[index % bgColors.length]}`}>
              <h3>{menyra.emertimi}</h3>
              <h1>{formatCurrency(menyra.shuma)}</h1>
            </Col>
          ))}
        </Col>
      </Row>
      <hr />

      <Row className='d-flex flex-column'>
          <Col className='d-flex flex-row justify-content-center '>
            <h4 className='px-3 '>Evidenca brenda Periudhes :</h4>
              <Col className='d-flex'>
                <Form.Group className='mx-1'>
                  <Form.Control
                    type='date'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className='mx-1'>
                  <Form.Control
                    type='date'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Button variant='outline-primary' onClick={() => setTregoGrafikun(!tregoGrafikun)}>{tregoGrafikun ? 'Mbylle Grafikun' : 'Trego Grafikun'}</Button>
          </Col>
         {loading2 ? <AnimatedSpinner/> : 
            <Col>
              {tregoGrafikun ?   
              <ChartComponent totalShitje={totalShitje} totalBlerje={totalBlerje} totalShpenzime={totalShpenzime} totalServisime={totalServisime} totalHyrje={totalHyrje}/>     
              :
              <Col className="d-flex flex-wrap justify-content-start align-items-center gap-3 p-3">
                {[
                  { label: 'Totali i Qarkullimit', value: totalQarkullimi },
                  { label: 'Totali i Shitjeve', value: totalShitje },
                  { label: 'Totali i Hyrjeve', value: totalHyrje },
                  { label: 'Totali i Blerjeve', value: totalBlerje },
                  { label: 'Totali i Servisimeve', value: totalServisime },
                  { label: 'Totali i Shpenzimeve', value: totalShpenzime },
                ].map((item, index) => (
                  <Card
                    key={index}
                    className="shadow-sm p-3 d-flex flex-column align-items-center text-center bg-light border border-0 rounded"
                    style={{ minWidth: '200px', flex: '1 1 calc(33.333% - 1rem)' }}
                  >
                    <Card.Body>
                      <h5 className="text-secondary">{item.label}</h5>
                      <span className="fs-4 fw-bold text-dark">{formatCurrency(item.value)}</span>
                    </Card.Body>
                  </Card>
                ))}
              </Col>}
            </Col>     

        }
      </Row>
          <hr/><br/>
          <Row>
            <h4 className="text-center mb-4">Evidenca e Pergjithshme:</h4>
            <Col className="d-flex flex-wrap justify-content-start align-items-center gap-3 p-3">
              {[
                { label: 'Vlera e Stokit ne Blerje', value: produktiData[0]?.vleraEBlerjeve, isCurrency: true },
                { label: 'Vlera e Stokit ne Shitje', value: produktiData[0]?.VleraShitjeve, isCurrency: true },
                { label: 'Nr. i Produkteve', value: produktiData[0]?.nrProdukteve, isCurrency: false },
                { label: 'Vlera e Shitjeve te Pa Paguara', value: vleraShitjevePaPaguar[0]?.vleraShitjevePaPaguar, isCurrency: true },
                { label: 'Vlera e Blerjeve te Pa Paguara', value: vleraBlerjevePaPaguar[0]?.vleraBlerjevePaPaguar, isCurrency: true },
                { label: 'Nr. i Produkteve me Fature', value: produktiData[0]?.meFatureTeRregulltCount, isCurrency: false },
                { label: 'Totali i Sasise', value: produktiData[0]?.sasiaTotale, isCurrency: false },
                { label: 'Kalkulimi Perfundimtar', value: '', isCurrency: false },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="shadow-sm p-3 d-flex flex-column align-items-center text-center bg-light border-0 rounded"
                  style={{ minWidth: '200px', flex: '1 1 calc(33.333% - 1rem)' }}
                >
                  <Card.Body>
                    <h5 className="text-secondary">{item.label}</h5>
                    <span className="fs-4 fw-bold text-dark">
                      {item.isCurrency ? formatCurrency(item.value) : item.value || 'N/A'}
                    </span>
                  </Card.Body>
                </Card>
              ))}
            </Col>
          </Row>

      <hr />
    </Container>
  );
}

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Form } from 'react-bootstrap';
import AnimatedSpinner from './AnimatedSpinner';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';

export default function DetajePerProdukt() {
  const { produktiID } = useParams();
  const [loading, setLoading] = useState(true);
  const [produkti, setProdukti] = useState(null); // Change to null to handle loading state
  const [transaksionet, setTransaksionet] = useState([]);
  const [filteredTransaksionet, setFilteredTransaksionet] = useState([]);
  const [filterShifra, setFilterShifra] = useState('');
  const [filterLloji, setFilterLloji] = useState('');
  const [filterSubjekti, setFilterSubjekti] = useState('');
  const [sasiaShitur,setSasiaShitur] = useState(0)
  const [showProfiti,setShowProfiti] = useState(false)
  const [profiti,setProfiti] = useState()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const produktiData = await window.api.fetchTableProdukti();
        const produkti = produktiData.filter(item => item.produktiID == produktiID);
        setProdukti(produkti);
        console.log(produkti)
        const transaksioneData = await window.api.fetchTableQuery(`
          SELECT 'blerje' AS lloji, b.shifra, s.emertimi AS subjekti, bp.sasia,'0' as profitiProduktit, bp.cmimiPerCope
          FROM blerje b
          JOIN blerjeProdukt bp ON b.blerjeID = bp.blerjeID
          JOIN subjekti s ON b.subjektiID = s.subjektiID
          JOIN transaksioni t ON t.transaksioniID = b.transaksioniID AND t.lloji = 'blerje'
          WHERE bp.produktiID = ${produktiID}

          UNION ALL

          SELECT 'shitje' AS lloji, sh.shifra, s.emertimi AS subjekti, sp.sasia,sp.profitiProduktit as 'profitiProduktit',  sp.cmimiShitjesPerCope
          FROM shitje sh
          JOIN shitjeProdukti sp ON sh.shitjeID = sp.shitjeID
          JOIN subjekti s ON sh.subjektiID = s.subjektiID
          JOIN transaksioni t ON t.transaksioniID = sh.transaksioniID AND t.lloji = 'shitje'
          WHERE sp.produktiID = ${produktiID}

          UNION ALL

          SELECT 'shpenzim' AS lloji, sh.shifra, 'sp' AS subjekti,'0' as profitiProduktit, shp.sasia, shp.cmimiFurnizimit
          FROM shpenzimi sh
          JOIN shpenzimProdukti shp ON sh.shpenzimiID = shp.shpenzimProduktiID
          JOIN transaksioni t ON t.transaksioniID = sh.transaksioniID AND t.lloji = 'shpenzim'
          WHERE shp.produktiID = ${produktiID}
        `);
        
        setTransaksionet(transaksioneData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after both data fetches are complete
      }
    };

    fetchData();
  }, [produktiID]);

  // Filter the transactions based on the filter criteria
  useEffect(() => {
    const filteredData = transaksionet.filter(item => {
      return (
        (filterShifra === '' || item.shifra.includes(filterShifra)) &&
        (filterLloji === '' || item.lloji.includes(filterLloji)) &&
        (filterSubjekti === '' || item.subjekti.includes(filterSubjekti))
      );
    });
    setFilteredTransaksionet(filteredData);
  }, [transaksionet, filterShifra, filterLloji, filterSubjekti]);

  useEffect(() => {
    const totalSasiaShitur = filteredTransaksionet.reduce((total, item) => {
      return item.lloji == 'shitje' ? total + item.sasia : total;
    }, 0);
    setSasiaShitur(totalSasiaShitur)
    
  }, [filteredTransaksionet]);

  useEffect(() => {
    const totalProfitit = filteredTransaksionet.reduce((total, item) => {
      return item.lloji == 'shitje' ? total + item.profitiProduktit : total;
    }, 0);
    setProfiti(totalProfitit)
    
  }, [filteredTransaksionet]);


 
  return (
    <>
      {loading ? (
        <AnimatedSpinner />
      ) : (
        <Container>
          <Row>
            <Col >
                  <h5 className="w-25 float-end"><span className="w-25 float-end" onMouseEnter={()=> setShowProfiti(true)} onMouseLeave={() => setShowProfiti(false)}><FontAwesomeIcon icon={faUserSecret} className={showProfiti ? 'text-dark' : 'text-light'}/></span></h5>
            </Col>
          </Row>
            <Row>
              {produkti ? <Col className="border-top border-dark border px-2 py-3 d-flex flex-row flex-wrap justify-content-between">
                <h5 className="m-2">Shifra: <span className="fs-5 fw-bold float-center">{produkti? produkti[0].shifra : ''}</span></h5>
                <h5 className="m-2">Emertimi: <span className="fs-5 fw-bold float-center">{produkti[0].emertimi}</span></h5>
                <h5 className="m-2">Cmimi i Blerjes: <span className="fs-5 fw-bold float-center">{produkti[0].cmimiBlerjes.toFixed(2)}€</span></h5>
                <h5 className="m-2">Cmimi i Shitjes: <span className="fs-5 fw-bold float-center">{produkti[0].cmimiShitjes.toFixed(2)}€</span></h5>
                <h5 className="m-2">Sasia Aktuale: <span className="fs-5 fw-bold float-center">{produkti[0].sasia}</span></h5>
                <h5 className="m-2">Sasia e Shitur: <span className="fs-5 fw-bold float-center">{sasiaShitur}</span></h5>
                {showProfiti &&                 <h5 className="m-2">Profiti nga ky Produkt: <span className="fs-5 fw-bold float-center">{profiti.toFixed(2)} €</span></h5>
                }
              </Col>:''}
            </Row>
        
          

          <Row className="my-3 pt-5">
            <Col>
              <Form>
                <Row>
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder="Filtro me Shifer..."
                      value={filterShifra}
                      onChange={(e) => setFilterShifra(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder="Filtro me llojin..."
                      value={filterLloji}
                      onChange={(e) => setFilterLloji(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder="Filtro me Subjektin..."
                      value={filterSubjekti}
                      onChange={(e) => setFilterSubjekti(e.target.value)}
                    />
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>

          <Row>
            <div className="container my-3">
              <div className="table-responsive tableHeight50">
                <table className="table table-sm table-striped border table-hover text-center">
                  <thead className="table-secondary">
                    <tr className="fs-5">
                      <th scope="col">Nr</th>
                      <th scope="col">Shifra</th>
                      <th scope="col">Lloji</th>
                      <th scope="col">Subjekti</th>
                      <th scope="col">Sasia</th>
                      <th scope="col">Cmimi per Cope</th>
                      <th scope="col">Totali</th>
                    </tr>
                  </thead>
                  <tbody className="border-dark">
                    {filteredTransaksionet.length > 0 ? (
                      filteredTransaksionet.slice().reverse().map((item, index) => {
                        const totali = item.sasia * item.cmimiPerCope;
                        return (
                          <tr key={index}>
                            <th scope="row">{filteredTransaksionet.length - index}</th>
                            <td>{item.shifra || ''}</td>
                            <td>{item.lloji}</td>
                            <td>{item.subjekti}</td>
                            <td>{item.sasia}</td>
                            <td>{item.cmimiPerCope.toFixed(2)} €</td>
                            <td>{totali.toFixed(2) || ''} €</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7">Nuk ka të dhëna.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Row>
          
        </Container>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form,Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan,faPen } from '@fortawesome/free-solid-svg-icons'; 
import Spinner from './AnimatedSpinner';

export default function Transaksionet() {
  const [transaksionet, setTransaksionet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterShifra, setFilterShifra] = useState('');
  const [filterLloji, setFilterLloji] = useState('');
  const [filterPerdoruesi,setFilterPerdoruesi] = useState('')
  const [filterDataTransaksionitStart, setFilterDataTransaksionitStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [filterDataTransaksionitEnd, setFilterDataTransaksionitEnd] = useState(new Date().toISOString().split('T')[0]);
  const [totaliPerPagese,setTotaliPerPagese] = useState()
  const [totaliIPaguar,setTotaliIPaguar] = useState()
  const [mbetjaPerPagese,setMbetjaPerPagese] = useState()
  
  useEffect(() => {
    window.api.fetchTableTransaksionet().then(receivedData => {
      setTransaksionet(receivedData);
      setLoading(false);
    });
  }, []);

  const filteredTransaksionet = transaksionet.filter(item => {
    const itemDate = new Date(item.dataTransaksionit).toISOString().split('T')[0];
    return (
      (!filterShifra || item.shifra.toLowerCase().includes(filterShifra)) &&
      (!filterPerdoruesi || item.perdoruesi.toLowerCase().includes(filterPerdoruesi)) &&
      (!filterLloji || item.lloji.toLowerCase().includes(filterLloji.toLowerCase())) &&
      itemDate >= filterDataTransaksionitStart &&
      itemDate <= filterDataTransaksionitEnd
    );
  });

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Shifra</Form.Label>
            <Form.Control
              type="text"
              value={filterShifra}
              onChange={(e) => setFilterShifra(e.target.value)}
              placeholder="Filtroni sipas shifres"
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Lloji</Form.Label>
            <Form.Control
              type="text"
              value={filterLloji}
              onChange={(e) => setFilterLloji(e.target.value)}
              placeholder="Filtroni sipas llojit"
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Perdoruesi</Form.Label>
            <Form.Control
              type="text"
              value={filterPerdoruesi}
              onChange={(e) => setFilterPerdoruesi(e.target.value)}
              placeholder="Filtroni sipas perdoruesit"
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Data e fillimit</Form.Label>
            <Form.Control
              type="date"
              value={filterDataTransaksionitStart}
              onChange={(e) => setFilterDataTransaksionitStart(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Data e mbarimit</Form.Label>
            <Form.Control
              type="date"
              value={filterDataTransaksionitEnd}
              onChange={(e) => setFilterDataTransaksionitEnd(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <Spinner animation="border" role="status" />
      ) : (
        <Row className='tableHeight50'>
          <Table striped bordered hover responsive >
            <thead>
              <tr>
                <th>Shifra</th>
                <th>Lloji</th>
                <th>Totali per Pagese</th>
                <th>Totali i Pageses</th>
                <th>Mbetja per Pagese</th>
                <th>Komenti</th>
                <th>Nderrimi / Data Transaksionit</th>
                <th>Perdoruesi</th>
                <th>Opsionet</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransaksionet.map((transaksion) => (
                <tr key={transaksion.transaksioniID}>
                  <td>{transaksion.shifra}</td>
                  <td>{transaksion.lloji}</td>
                  <td>{transaksion.totaliperPagese}</td>
                  <td>{transaksion.totaliIPageses}</td>
                  <td>{transaksion.mbetjaPerPagese}</td>
                  <td>{transaksion.komenti}</td>
                  <td>{new Date(transaksion.dataTransaksionit).toLocaleDateString()}</td>
                  <td>{transaksion.perdoruesi}</td>
                  <td>
                      <Button className='btn btn-primary' onClick={() => ndryshoTransaksionin(item.lloji, item.transaksioniID)}>
                      <FontAwesomeIcon className=" mt-1" icon={faPen} />
                      </Button>
                      <Button className='btn btn-danger mx-2' onClick={() => thirreModal(item.lloji, item.transaksioniID, 'anuloTransaksionin')}>
                        <FontAwesomeIcon className=" mt-1" icon={faTrashCan} />
                      </Button>
                    </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Row>
      )}
      <Row>
        <Col className='text-center d-flex flex-wrap justify-content-start align-items-center p-2 m-2'>
          <h5 className='mx-5 mt-2 border rounded p-3'>Totali per Pagese : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[0]?.vleraEBlerjeve.toFixed(2) || 'N/A'} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Totali i Paguar : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[0]?.VleraShitjeve.toFixed(2) || 'N/A'} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Mbetja per Pagese : <span className='fs-4 fw-bold text-dark p-2 d-inline'>{produktiData[0]?.nrProdukteve || 'N/A'}</span></h5>
        </Col>
      </Row>
    </Container>
  );
}

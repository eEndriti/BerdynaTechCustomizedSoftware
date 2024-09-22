import { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Form,Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan,faPen } from '@fortawesome/free-solid-svg-icons'; 
import Spinner from './AnimatedSpinner';
import ModalPerPyetje from './ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Transaksionet() {
  const [transaksionet, setTransaksionet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterShifra, setFilterShifra] = useState('');
  const [filterLloji, setFilterLloji] = useState('');
  const [filterPerdoruesi,setFilterPerdoruesi] = useState('')
  const [showModal,setShowModal] = useState(false)
  const [burimiThirrjes,setBurimiThirrjes] = useState('')
  const [llojiPerAnulim,setLlojiPerAnulim] = useState('')
  const [idPerAnulim,setIdPerAnulim] = useState('')

  let muaji = new Date().getMonth()+1
  {muaji < 10 ? muaji = `0${muaji}` : null}
  const [filterDataTransaksionitStart, setFilterDataTransaksionitStart] = useState(`${new Date().getFullYear()}-${muaji}-01`);
  const [filterDataTransaksionitEnd, setFilterDataTransaksionitEnd] = useState(new Date().toISOString().split('T')[0]);

  
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


  const ndryshoTransaksionin = (lloji, transaksioniID) => {
    alert(`Ndryshimi Transaksionit ${transaksioniID} ne Proces e mesiperm!!`)
  }

  const anuloTransaksionin =async () => {
    const data = {
      lloji:llojiPerAnulim,
      transaksioniID:idPerAnulim
    }

    const result = await window.api.anuloTransaksionin(data)

    if (result.success) {
      toast.success(`Transaksioni i llojit ${llojiPerAnulim} u Anulua me Sukses !`, {
        position: "top-center",  
        autoClose: 1500,
        onClose: () =>       window.location.reload()
      });            ;
      
    } else {
      toast.error('Gabim gjate Anulimit: ' + result.error);
    }
  }

  const thirreModal = (lloji,transaksioniID,burimiThirrjes) =>{
    setShowModal(true)
    setBurimiThirrjes(burimiThirrjes)
    setLlojiPerAnulim(lloji)
    setIdPerAnulim(transaksioniID)
  }
  const handleConfirmModal = () => {
    console.log('Confirmed!');
    if(burimiThirrjes == 'anuloTransaksionin'){
      anuloTransaksionin()
    }
  };

  const handleCloseModal = () => setShowModal(false);


  const calculateTotal = (transaksionet, field) => 
    transaksionet.reduce((acc, transaksion) => acc + transaksion[field], 0).toFixed(2);
  
  const totalPerPagese = calculateTotal(filteredTransaksionet, 'totaliperPagese');
  const totaliIPaguar = calculateTotal(filteredTransaksionet, 'totaliIPageses');
  const mbetjaPerPagese = calculateTotal(filteredTransaksionet, 'mbetjaPerPagese');
  

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
                <th>Nderrimi / Data dhe Ora Transaksionit</th>
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
                      <Button className='btn btn-primary' onClick={() => ndryshoTransaksionin(transaksion.lloji, transaksion.transaksioniID)}>
                      <FontAwesomeIcon className=" mt-1" icon={faPen} />
                      </Button>
                      <Button className='btn btn-danger mx-2' onClick={() => thirreModal(transaksion.lloji, transaksion.transaksioniID, 'anuloTransaksionin')}>
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
        <Col className='text-center d-flex flex-wrap justify-content-center align-items-end mt-5 p-2 m-2'>
          <h5 className='mx-5 mt-2 border rounded p-3'>Totali per Pagese : <span className='fs-4 fw-bold mainTextColor p-2 d-inline'>{totalPerPagese} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Totali i Paguar : <span className='fs-4 fw-bold mainTextColor p-2 d-inline'>{totaliIPaguar} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Mbetja per Pagese : <span className='fs-4 fw-bold mainTextColor p-2 d-inline'>{mbetjaPerPagese} €</span></h5>
        </Col>
      </Row>
      <ModalPerPyetje
        show={showModal}
        handleClose={handleCloseModal}
        handleConfirm={handleConfirmModal}
      />
      <ToastContainer/>
    </Container>
  );
}

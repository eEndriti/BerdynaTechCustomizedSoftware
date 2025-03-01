import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Form, Card, Badge, Container,Row,Col,Alert, InputGroup, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faCheck, faBan, faHistory,faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from "../components/AuthContext";
import Cookies from 'js-cookie';
import AnimatedSpinner from './AnimatedSpinner';
import {ToastContainer } from 'react-toastify';
import { useToast } from './ToastProvider';

export default function Nderrimet() {
    const [loading,setLoading] = useState()
    const [buttonLoading,setButtonLoading] = useState()
    const [nderrimi, setNderrimi] = useState([{}]);
    const [filteredNderrimi,setFilteredNderrimi] = useState([{}])
    const [nderrimiAktiv, setNderrimiAktiv] = useState(true);
    const [showMbyllNderriminModal, setShowMbyllNderriminModal] = useState(false);
    let muaji = new Date().getMonth()+1
      {muaji < 10 ? muaji = `0${muaji}` : null}
    const [dataFillimit,setDataFillimit] = useState(`${new Date().getFullYear()}-${muaji}-01`)
    const [dataMbarimit,setDataMbarimit] = useState(new Date().toISOString().slice(0, 10))
    const albanianMonths = [
      "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
      "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"
    ];
    const showToast = useToast()
    const [triggerReload, setTriggerReload] = useState(false);
    const [ndryshojeAvansinModal, setNdryshojeAvansinModal] = useState(false);

    useEffect(()  => {

        
        
        fetchData()

    }, [triggerReload]);

    const fetchData = async () => {
        setLoading(true)
        try{
          const data = await window.api.fetchTableNderrimi()
          setNderrimi(data)
          setNderrimiAktiv(data.find(item => item.iHapur))
        }catch(e){
          showToast('Gabim gjate marrjes se te dhenave'+e,'error')
        }finally{
          setLoading(false)
        }
      }
      
    useEffect(() => {
        if(nderrimi.length > 1){
          const filteredData = nderrimi.filter(item => {

            const dataFillimitFormated = item.dataFillimit.toISOString().split('T')[0]
            const dataMbarimitFormated = item.dataMbarimit
            ? new Date(item.dataMbarimit).toISOString().split('T')[0]
            : null;
   
              return (
                dataFillimitFormated >= dataFillimit &&
                dataMbarimitFormated <= dataMbarimit
              );
          });
          setFilteredNderrimi(filteredData);

        }
  }, [dataFillimit, dataMbarimit,nderrimi]);

  const formatLongDateToAlbanian = (dateString) => {
    const date = new Date(dateString);  
    const time = new Date(dateString).toTimeString().split('GMT')[0]
    const day = date.getDate()    
    const month = albanianMonths[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}-${month}-${year} / ${time}`;
  };



    const mbyllNderrimin = async () => {
        setButtonLoading(true)
        let result
        try{
           await window.api.mbyllNderriminAktual()
            showToast('Nderrimi u Mbyll me Sukses!','success')
        }catch(e){
            showToast('Gabim gjate mbylljes se nderrimit'+e,'error')
        }finally{
          setButtonLoading(false)
          if(result){          
              localStorage.clear();
              window.location.href = '/login';
          }else{
            setTriggerReload(!triggerReload)
          }
        }
    };
    
    const ndryshojeAvansin = async () => {
        setButtonLoading(true)

        try{
            await window.api.ndryshojeAvansinNderrimitAktual(nderrimiAktiv)
            showToast('Avansi u Ndryshua me Sukses!','success')
        }catch(e){
            showToast('Gabim gjate ndryshimit te avansit'+e,'error')
        }finally{
            setButtonLoading(false)
            setNdryshojeAvansinModal(false)
            Cookies.set('avansi', nderrimiAktiv.avansi);
            setTriggerReload(!triggerReload)
        }
    }
    return (
        
       <>
       {loading ? <AnimatedSpinner/> : 
        <Container >
        <h2 className="mb-4">
            Menaxhimi i Nderrimeve
        </h2>

        {/* Kartela e Nderrimit aktiv */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <h5>
                        Nderrimi Aktual <Badge bg="success">Aktive</Badge>
                    </h5>
                    <p>
                        <strong>Filloi me:</strong> {new Date(nderrimiAktiv.dataFillimit).toLocaleString()}
                    </p>   
                    <p>
                        <strong>Avansi:</strong> {formatCurrency(nderrimiAktiv.avansi)}
                    </p>   
                    <Button variant="primary" className='mx-2' onClick={() => setNdryshojeAvansinModal(true)}>
                        <FontAwesomeIcon icon={faArrowsRotate} className="me-2" />
                          Ndryshoje Avansin e Nderrimit Aktual 
                    </Button>               
                    <Button variant="danger" className='mx-2' onClick={() => setShowMbyllNderriminModal(true)}>
                        <FontAwesomeIcon icon={faBan} className="me-2" />
                          Mbylle Nderrimin Aktual
                    </Button> 
                </Card.Body>
            </Card>
      
          {/** Hapsira per Filtrime */}
          <Row className="mb-3">
            <Col md={6}>
                <Form.Group controlId="filterStartDate">
                    <Form.Label>Data Fillimit</Form.Label>
                    <Form.Control
                        type="date"
                        value={dataFillimit}
                        onChange={e => setDataFillimit(e.target.value)}
                    />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group controlId="filterEndDate">
                    <Form.Label>Data Mbarimit</Form.Label>
                    <Form.Control
                        type="date"
                        value={dataMbarimit}
                        onChange={e => setDataMbarimit(e.target.value)}
                    />
                </Form.Group>
            </Col>
        </Row>

        {/* Historia e Nderrimeve */}
        <Card className="shadow-sm">
            <Card.Header>
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                  Historia e Nderrimeve
            </Card.Header>
            <Card.Body className='tableHeight50'>
                <Table responsive bordered hover >
                    <thead className="table-light">
                        <tr>
                            <th>Nr.</th>
                            <th>Koha e Fillimit</th>
                            <th>Koha e Mbylljes</th>
                            <th>Statusi</th>
                            <th>Avansi</th>
                            <th>Totali i Arkes me Avans</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNderrimi.slice().reverse().map((nderrimi, index) => (
                            <tr key={index}>
                                <td>{filteredNderrimi.length - index}</td>
                                <td>{formatLongDateToAlbanian(nderrimi.dataFillimit)}</td>
                                <td>{nderrimi.dataMbarimit ? formatLongDateToAlbanian(nderrimi.dataMbarimit) : '-'}</td>
                                <td>
                                    <Badge bg={nderrimi.iHapur ? 'success' : 'secondary'}>
                                        {nderrimi.iHapur ? 'Aktive' : 'i Mbyllur'}
                                    </Badge>
                                </td>
                                <td>{nderrimi.avansi ? `€${nderrimi.avansi}` : '-'}</td>
                                <td>{`€${nderrimi.totaliArkes}`}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>

        {/* Ndryshon Avansin */}
        <Modal show={ndryshojeAvansinModal} onHide={() => {buttonLoading ? null :setNdryshojeAvansinModal(false)}}>
            <Modal.Header closeButton>
                <Modal.Title>Ndryshoje Vleren e Avansit te Nderrimit Aktual</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Vlera e Avansit:</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="number"
                            placeholder="€"
                            value={nderrimiAktiv.avansi}
                            onChange={(e) => setNderrimiAktiv({ ...nderrimiAktiv, avansi: e.target.value })} />
                            <InputGroup.Text>€</InputGroup.Text>
                    </InputGroup>
                </Form.Group>                  
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {buttonLoading ? null :setNdryshojeAvansinModal(false)}}>
                    Anulo
                </Button>
                <Button variant="danger" onClick={() => {buttonLoading ? null : ndryshojeAvansin()}} disabled={buttonLoading || nderrimiAktiv.avansi < 1 || !nderrimiAktiv.avansi }>
                    {buttonLoading ? <Spinner animation="border" size="sm" /> : 
                    <><FontAwesomeIcon icon={faCheck} className="me-2" />
                    Ruaj Ndryshimet...</>}
                </Button>
            </Modal.Footer>
        </Modal>

        {/* Mbyll Nderrimin Modal */}
        <Modal show={showMbyllNderriminModal} onHide={() => {buttonLoading ? null :setShowMbyllNderriminModal(false)}}>
            <Modal.Header closeButton>
                <Modal.Title>Konfirmo Mbylljen e Nderrimit Aktual</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Alert variant="warning" className="d-flex align-items-center mt-3">
                  <FontAwesomeIcon icon={faTriangleExclamation} size={20} className="me-2" />
                  <span>
                      <strong>Kujdes!</strong> Do duhet te Kyqeni nga Fillimi dhe te Startoni Nderrimin!
                  </span>
              </Alert>                    
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {buttonLoading ? null :setShowMbyllNderriminModal(false)}}>
                    Anulo
                </Button>
                <Button variant="danger" onClick={() => {buttonLoading? null : mbyllNderrimin()}}>
                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                        Mbyll Nderrimin
                </Button>
            </Modal.Footer>
        </Modal>
    </Container>
    }
       </>
    );
};


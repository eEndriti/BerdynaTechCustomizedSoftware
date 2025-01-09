import { useState,useEffect } from 'react'
import { Container,Button,Row,Col,Modal,Form, Spinner, InputGroup,Table,Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from './ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateServise from './UpdateServise';
import AnimatedSpinner from './AnimatedSpinner';
import useAuthData, { formatCurrency } from '../useAuthData';

function FaqjaKryesoreAdmin() {
  const [loading,setLoading] = useState(true)
  const [transaksionet,setTransaksionet] = useState([])
  const [shitjet,setShitjet] = useState([])
  const [shitjetOnline,setShitjetOnline] = useState([])
  const [serviset,setServiset] = useState([])
  const [transaksionetENderrimit,setTransaksionetENderrimit] = useState([])
  const [servisetAktive,setServisetAktive] = useState([])
  const [showModal,setShowModal] = useState(false)
  const [burimiThirrjes,setBurimiThirrjes] = useState('')
  const [llojiPerAnulim,setLlojiPerAnulim] = useState('')
  const [idPerAnulim,setIdPerAnulim] = useState('')
  const [modalPerServisUpdate,setModalPerServisUpdate] = useState()
  const [data,setData] = useState('')
  const [updateServisType,setUpdateServisType] = useState()
  const { nderrimiID,perdoruesiID } = useAuthData()
  const [aprovoShitjenOnlineModal,setAprovoShitjenOnlineModal] = useState(false)
  const [dataPerAprovim,setDataPerAprovim] = useState({kostoPostes:3,totaliIPranuar:0})
  const [buttonLoading,setButtonLoading] = useState(false)
  useEffect(() => {

    const fetchData = async () => {
      try{
        const [transaksionetData, shitjetData, servisetData,shitjetOnlineData] = await Promise.all([
          window.api.fetchTableTransaksionet(),
          window.api.fetchTableShitje(),
          window.api.fetchTableServisi(),
          window.api.fetchTableShitjeOnline(),
        ]);
    
        setTransaksionet(transaksionetData);
        setShitjet(shitjetData)
        setServiset(servisetData)
        setShitjetOnline(shitjetOnlineData.filter(item => item.statusi))
    
        const servisetAktive = servisetData.filter(item => item.statusi === 'Aktiv');
        setServisetAktive(servisetAktive);
        
      }catch(e){
        console.log(e)
      }finally{
        setLoading(false)
      }
    };
  
    fetchData();

  }, []);
  
  useEffect(() => {
    const filteredTransaksionet = transaksionet.filter(item => item.nderrimiID === Number(nderrimiID));
    setTransaksionetENderrimit(filteredTransaksionet);
  }, [transaksionet, nderrimiID]);
  

  const ndryshoTransaksionin = (lloji, transaksioniID) => {
    alert(`Ndryshimi Transaksionit ${transaksioniID} ne Proces e mesiperm!!`)
  }


  const anuloTransaksionin =async () => {
    const data = {
      lloji:llojiPerAnulim,
      transaksioniID:idPerAnulim
    }

    let result
    if(llojiPerAnulim == 'Shitje'){
      result = await window.api.anuloShitjen(data)
    }else if (llojiPerAnulim == 'Shpenzim'){
      result = await window.api.anuloShpenzimin(data)
    }else if(llojiPerAnulim == 'Blerje'){
      result = await window.api.anuloBlerjen(data)
    }

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

    if(burimiThirrjes == 'anuloTransaksionin'){
      anuloTransaksionin()
    }else if(burimiThirrjes == 'anuloServisin'){
      deleteServisin()
    }else if(burimiThirrjes == 'anuloPorosineOnline'){
      anuloPorosineOnline()
    }
  };

  const anuloPorosineOnline = async () => {
    
    const result = await window.api.anuloPorosineOnline(idPerAnulim)

    if (result.success) {
      toast.success(`Shitja Online u Anulua me Sukses !`, {
        position: "top-center",  
        autoClose: 1500,
        onClose: () =>       window.location.reload()
      });            ;
      
    } else {
      toast.error('Gabim gjate Anulimit: ' + result.error);
    }
  }
  const handleCloseModal = () => setShowModal(false);
  
  const closeModalPerServisUpdate = () => setModalPerServisUpdate(false)

  const ndryshoServisin = (data,type) =>{

    setData(data)
    setUpdateServisType(type)
    setModalPerServisUpdate(true)
  }

  const deleteServisin = async () => {
    const result = await window.api.deleteServisi(idPerAnulim);

    if (result.success) {
        toast.success(`Servisi u Anulua me Sukses !`, {
            position: 'top-center',
            autoClose: 1500,
            onClose: () => window.location.reload(),
        });
    } else {
        toast.error('Gabim gjate Anulimit: ' + result.error);
    }
}
const handleAprovoShitjenOnline = async () => {
  const updatedDataPerAprovim = {
    ...dataPerAprovim,
    perdoruesiID: perdoruesiID,
    nderrimiID: nderrimiID
  };

  setButtonLoading(true);

  try {
    await window.api.perfundoShitjenOnline(updatedDataPerAprovim);
  } catch (error) {
    console.log(error);
  } finally {
    setButtonLoading(false);
    setAprovoShitjenOnlineModal(false);
  }
};

  const handleDataPerAprovimChange = (e) => {

    const {name , value} = e.target;

    setDataPerAprovim({
      ...dataPerAprovim,
      [name]:value
    })
  }

  useEffect(()=>{

      const totaliPranuar = dataPerAprovim.totaliPerPagese - dataPerAprovim.kostoPostes
      setDataPerAprovim({
        ...dataPerAprovim,
        totaliIPranuar:totaliPranuar
      })
  },[dataPerAprovim.kostoPostes,dataPerAprovim.totaliIPranuar])


const x = 2025
  return (
    <Container fluid className="pt-3 modern-container">
      {loading ? (
        <AnimatedSpinner />
      ) : (
        <div>
          {/* Transactions Section */}
          <section className="section-container mb-4">
            <h3 className="section-title">Transaksionet e Nderrimit{x % 100}</h3>
            <div className="table-container tableHeight50">
              <Table responsive striped bordered hover size="sm" className="custom-table">
                <thead className="table-header">
                  <tr>
                    <th>Nr</th>
                    <th>Shifra</th>
                    <th>Lloji</th>
                    <th>Pershkrimi</th>
                    <th>Totali Per Pagese</th>
                    <th>Totali Pageses</th>
                    <th>Mbetja Per Pagese</th>
                    <th>Komenti</th>
                    <th>Koha</th>
                    <th>Opsionet</th>
                  </tr>
                </thead>
                <tbody className='text-nowrap'>
                  {transaksionetENderrimit.slice().reverse().map((item, index) => (
                    item.transaksioniID !== 0 && (
                      <tr key={index}>
                        <td>{transaksionetENderrimit.length - index}</td>
                        <td>{item.shifra}</td>
                        <td>{item.lloji}</td>
                        <td className='text-wrap'>{item.pershkrimi}</td>
                        <td>{formatCurrency(item.totaliperPagese)}</td>
                        <td>{formatCurrency(item.totaliIPageses)}</td>
                        <td
                          className={
                            item.mbetjaPerPagese > 0
                              ? 'text-danger fw-bold'
                              : 'text-success fw-bold'
                          }
                        >
                          {formatCurrency(item.mbetjaPerPagese)}
                        </td>
                        <td>{item.komenti}</td>
                        <td>{item.dataTransaksionit.toLocaleTimeString()}</td>
                        <td className='d-flex flex-row justify-content-around'>
                          <Button  variant='btn btn-outline-primary' className='mx-1'
                            disabled
                            onClick={() => ndryshoTransaksionin(item.lloji, item.transaksioniID)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button  variant='btn btn-outline-danger' className='mx-1'
                            onClick={() =>
                              thirreModal(item.lloji, item.transaksioniID, 'anuloTransaksionin')
                            }
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </Table>
            </div>
          </section>

          <div className="d-flex flex-wrap">
            {/* Orders Section */}
            <section className="section-container col-lg-6 px-2 mb-4">
              <h3 className="section-title">Porosite ne Pritje</h3>
              <div className="table-container">
                <Table responsive striped bordered hover size="sm" className="custom-table">
                  <thead className="table-header">
                    <tr>
                      <th>Nr</th>
                      <th>Shifra</th>
                      <th>NrPorosise</th>
                      <th>Data</th>
                      <th>Subjekti</th>
                      <th>Totali</th>
                      <th>Komenti</th>
                      <th>Opsionet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shitjetOnline.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.shifra}</td>
                        <td>{item.nrPorosise}</td>
                        <td>
                          {item.dataShitjes
                            ? new Date(item.dataShitjes).toLocaleDateString()
                            : ''}
                        </td>
                        <td>{item.subjekti}</td>
                        <td>{item.totaliPerPagese}</td>
                        <td>{item.komenti}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            className="action-btn mx-1"
                            disabled
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            className="action-btn mx-1"
                            onClick={() =>
                              thirreModal('ShitjeOnline', item.shitjeID, 'anuloPorosineOnline')
                            }
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                          <Button
                            variant="outline-success"
                            className="action-btn mx-1"
                            onClick={() => {
                              setDataPerAprovim(item);
                              setAprovoShitjenOnlineModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </section>

            {/* Services Section */}
            <section className="section-container col-lg-6 px-2 mb-4">
              <h3 className="section-title">Serviset Aktive</h3>
              <div className="table-container">
                <Table responsive striped bordered hover size="sm" className="custom-table">
                  <thead className="table-header">
                    <tr>
                      <th>Nr</th>
                      <th>Klienti</th>
                      <th>Kontakti</th>
                      <th>Komenti</th>
                      <th>Pajisjet Percjellese</th>
                      <th>Opsionet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servisetAktive.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.subjekti}</td>
                        <td>{item.kontakti}</td>
                        <td>{item.komenti}</td>
                        <td>{item.pajisjetPercjellese}</td>
                        <td>
                          <Button
                            className="action-btn btn-primary"
                            onClick={() => ndryshoServisin(item, 'ndrysho')}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            className="action-btn btn-danger mx-1"
                            onClick={() => thirreModal('', item.servisimiID, 'anuloServisin')}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                          <Button
                            className="action-btn btn-success"
                            onClick={() => ndryshoServisin(item, 'perfundo')}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </section>
          </div>
      <ModalPerPyetje
        show={showModal}
        handleClose={handleCloseModal}
        handleConfirm={handleConfirmModal}
      />
      <UpdateServise show={modalPerServisUpdate} handleClose={closeModalPerServisUpdate} updateType={updateServisType} data = {data} />
      
      <Modal show={aprovoShitjenOnlineModal} onHide={() => {buttonLoading ? null : setAprovoShitjenOnlineModal(false)}}>
      <Modal.Header closeButton>
        <Modal.Title>Aprovo Perfundimin e Shitjes Online</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {dataPerAprovim &&  <Form>
              <Col className='d-flex flex-row justify-content-around'>
                <Form.Group>
                  <Form.Label>Shifra e Shitjes:</Form.Label>
                  <Form.Control disabled value={dataPerAprovim.shifra} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Nr Porosise:</Form.Label>
                  <Form.Control disabled value={dataPerAprovim.nrPorosise} />
                </Form.Group>
              </Col>
              <Col className='d-flex flex-row mt-3 justify-content-around'>
                <Form.Group>
                  <Form.Label>Subjekti:</Form.Label>
                  <Form.Control disabled value={dataPerAprovim.subjekti} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Totali i Shitjes:</Form.Label>
                  <InputGroup >
                    <Form.Control  disabled value={formatCurrency(dataPerAprovim.totaliPerPagese,true)} />
                    <InputGroup.Text>€</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col className='d-flex flex-row mt-3 justify-content-around'>
                <Form.Group>
                  <Form.Label>Kosto e Postes:</Form.Label>
                  <InputGroup >
                    <Form.Control min={0} type='number' name='kostoPostes' value={dataPerAprovim.kostoPostes} onChange={handleDataPerAprovimChange}/>
                    <InputGroup.Text>€</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Totali i Pranuar nga Posta:</Form.Label>
                  <InputGroup >
                    <Form.Control min={0} type='number' name='totaliIPranuar' value={dataPerAprovim.totaliIPranuar} onChange={handleDataPerAprovimChange}/>
                    <InputGroup.Text>€</InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
       </Form>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {buttonLoading ? null : setAprovoShitjenOnlineModal(false)}} disabled={loading}>
          Mbyll
        </Button>
        <Button
          variant="success"
          onClick={() => handleAprovoShitjenOnline()}
          disabled={loading}
        >
          {buttonLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              Duke ruajtur...
            </>
          ) : (
              'Aprovo'
          )}
        </Button>
      </Modal.Footer>
      <ToastContainer />
    </Modal>

      <ToastContainer/>
   
    
    </div>
     )}
    </Container>

  )
}

export default FaqjaKryesoreAdmin
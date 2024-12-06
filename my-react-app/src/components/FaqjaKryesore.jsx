import { useState,useEffect } from 'react'
import { Container,Button,Row,Col,Modal,Form, Spinner, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
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

  

  return (
    <Container fluid className='pt-3'>
      {loading ? <AnimatedSpinner /> : 
      <div>
      <div className="Container fluid my-3 tabelaTransaksioneve ">
        <h3>Transaksionet e Nderrimit:</h3>
        <div className="table-responsive tabeleMeMaxHeight">
          <table className="table table-sm table-striped border table-hover">
            <thead className="table-secondary">
              <tr className='fs-5 '>
                <th scope="col">Nr</th>
                <th scope="col">Shifra</th>
                <th scope="col">Lloji</th>
                <th scope="col">Pershkrimi</th>
                <th scope="col">Totali Per Pagese</th>
                <th scope="col">Totali Pageses</th>
                <th scope="col">Mbetja Per Pagese</th>
                <th scope="col">Komenti</th>
                <th scope="col">Koha</th>
                <th scope="col">Opsionet</th>
              </tr>
            </thead>
            <tbody>
            {transaksionetENderrimit.slice().reverse().map((item, index) => (
              <tr key={index}>
                {item.transaksioniID != 0 ? (
                  <>
                    <th scope="row">{transaksionetENderrimit.length - index}</th>
                    <td>{item.shifra}</td>
                    <td>{item.lloji}</td>
                    <td>{item.pershkrimi}</td>
                    <td>{formatCurrency(item.totaliperPagese)}</td>
                    <td>{formatCurrency(item.totaliIPageses)}</td>
                    <td className={item.mbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{formatCurrency(item.mbetjaPerPagese)}</td>
                    <td>{item.komenti}</td>
                    <td>{item.dataTransaksionit.toLocaleTimeString()}</td>
                    <td>
                      <Button className='btn btn-primary' disabled onClick={() => ndryshoTransaksionin(item.lloji, item.transaksioniID)}>
                        <FontAwesomeIcon icon={faPen}/>
                      </Button>
                      <Button className='btn bg-transparent border-0 text-danger' onClick={() => thirreModal(item.lloji, item.transaksioniID, 'anuloTransaksionin')}>
                        <FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} />
                      </Button>
                    </td>
                  </>
                ) : null}
              </tr>
            ))}

            </tbody>
          </table>
        </div>
      </div>
      <hr/>
      
      <div className="Container fluid mt-5 d-flex flex-row align-items-top">

        <div className='tabelaPorosive col-xs-12 col-sm-12 col-md-6 col-lg-6'>
          <h3>Porosite ne Pritje:</h3>
          <div className="table-responsive tabeleMeMaxHeight">
            <table className="table table-sm table-striped border table-hover">
              <thead className="table-secondary">
                <tr className='fs-5'>
                  <th scope="col">Nr</th>
                  <th scope="col">Shifra</th>
                  <th scope="col">NrPorosise</th>
                  <th scope="col">Data</th>
                  <th scope="col">Subjekti</th>
                  <th scope="col">Totali</th>
                  <th scope="col">Komenti</th>
                  <th scope="col">Opsionet</th>
                </tr>
              </thead>
              <tbody>
                {shitjetOnline.map((item,index) => (
                <tr key={index}>
                  <th scope="row">{index+1}</th>
                  <td>{item.shifra}</td>
                  <td>{item.nrPorosise}</td>
                  <td>{item.dataShitjes ? new Date(item.dataShitjes).toLocaleDateString() : ''}</td>
                  <td>{item.subjekti}</td>
                  <td>{item.totaliPerPagese}</td>
                  <td>{item.komenti}</td>
                  <td>
                    <Button  variant='outline-primary'className='mx-1' disabled><FontAwesomeIcon icon={faPen}/></Button>
                    <Button  variant='outline-danger' className='mx-1' onClick={() => thirreModal('ShitjeOnline',item.shitjeID,'anuloPorosineOnline')}><FontAwesomeIcon icon={faTrashCan} /></Button>
                    <Button variant='outline-success' className='mx-1' onClick={() => {setDataPerAprovim(item);setAprovoShitjenOnlineModal(true)}}><FontAwesomeIcon icon={faCheck}/></Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
              
        <div className='tabelaServiseve  col-xs-12 col-sm-12 col-md-6 col-lg-6 px-3'>
          <h3>Serviset Aktive:</h3>
          <div className="table-responsive tabeleMeMaxHeight">
            <table className="table table-sm table-striped border table-hover">
              <thead className="table-secondary">
                <tr className='fs-5'>
                  <th scope="col">Nr</th>
                  <th scope="col">Klienti</th>
                  <th scope="col">Kontakti</th>
                  <th scope="col">Komenti</th>
                  <th scope="col">Pajisjet Percjellese</th>
                  <th scope="col">Opsionet</th>
                </tr>
              </thead>
              <tbody>
              {servisetAktive.map((item,index) => (
                <tr key={index}>
                  <th scope="row">{index+1}</th>
                  <td>{item.subjekti}</td>
                  <td>{item.kontakti}</td>
                  <td>{item.komenti}</td>
                  <td>{item.pajisjetPercjellese}</td>
                  <td>
                        <Button className='btn btn-primary' onClick={() => ndryshoServisin(item,'ndrysho')}>
                            <FontAwesomeIcon icon={faPen} />
                        </Button>
                        <Button className='btn bg-danger m-1 border-danger' onClick={() => thirreModal('',item.servisimiID,'anuloServisin')}>
                            <FontAwesomeIcon  icon={faTrashCan} />
                        </Button>
                         <Button className='btn btn-success ' onClick={() => ndryshoServisin(item,'perfundo')}>
                            <FontAwesomeIcon  icon={faCheck} />
                        </Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

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
    }
    </Container>
  )
}

export default FaqjaKryesoreAdmin
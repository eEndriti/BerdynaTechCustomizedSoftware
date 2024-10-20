import { useState,useEffect } from 'react'
import { Container,Button,Row,Col } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from './ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateServise from './UpdateServise';
import AnimatedSpinner from './AnimatedSpinner';

function FaqjaKryesoreAdmin() {
  const [loading,setLoading] = useState(true)
  const [transaksionet,setTransaksionet] = useState([])
  const [shitjet,setShitjet] = useState([])
  const [serviset,setServiset] = useState([])
  const [transaksionetENderrimit,setTransaksionetENderrimit] = useState([])
  const [porositeNePritje,setPorositeNePritje] = useState([])
  const [servisetAktive,setServisetAktive] = useState([])
  const [showModal,setShowModal] = useState(false)
  const [burimiThirrjes,setBurimiThirrjes] = useState('')
  const [llojiPerAnulim,setLlojiPerAnulim] = useState('')
  const [idPerAnulim,setIdPerAnulim] = useState('')
  const [modalPerServisUpdate,setModalPerServisUpdate] = useState()
  const [data,setData] = useState('')
  const [updateServisType,setUpdateServisType] = useState()
  const [nderrimiID,setNderrimiID] = useState()
  
  useEffect(() => {
    setNderrimiID(Number(localStorage.getItem('nderrimiID')) || 0); 

    const fetchData = async () => {
      const [transaksionetData, shitjetData, servisetData] = await Promise.all([
        window.api.fetchTableTransaksionet(),
        window.api.fetchTableShitje(),
        window.api.fetchTableServisi(),
      ]);
  
      setTransaksionet(transaksionetData);
      setShitjet(shitjetData)
      setServiset(servisetData)

      const shitjetEFiltruara = shitjetData.filter(item => item.lloji === 'online');
      setPorositeNePritje(shitjetEFiltruara);
  
      // Filter serviset
      const servisetAktive = servisetData.filter(item => item.statusi === 'Aktiv');
      setServisetAktive(servisetAktive);

      setLoading(false)
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

  const calculateTotal = (transaksionet, field) => 
    transaksionet.reduce((acc, transaksion) => {
      if (transaksion.nderrimiID === nderrimiID) {
        if (transaksion.lloji === 'Blerje') {
          // Subtract the value from acc if 'Blerje'
          return acc - transaksion[field];
        } else {
          // Add the value for other transaction types
          return acc + transaksion[field];
        }
      }
      // If nderrimiID does not match, return acc unchanged
      return acc;
    }, 0).toFixed(2);
  
  
  const totalPerPagese = calculateTotal(transaksionet, 'totaliperPagese');
  const totaliIPaguar = calculateTotal(transaksionet, 'totaliIPageses');
  const mbetjaPerPagese = calculateTotal(transaksionet, 'mbetjaPerPagese');
  
  const closeModalPerServisUpdate = () => setModalPerServisUpdate(false)

  const ndryshoServisin = (data,type) =>{

    setData(data)
    setUpdateServisType(type)
    setModalPerServisUpdate(true)
  }

  const deleteServisin = async () => {
    console.log(idPerAnulim)
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
                    <td>{item.totaliperPagese.toFixed(2)} €</td>
                    <td>{item.totaliIPageses.toFixed(2)} €</td>
                    <td className={item.mbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{item.mbetjaPerPagese.toFixed(2)} €</td>
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

      <Row>
        <Col className='text-center d-flex flex-wrap justify-content-center align-items-end mt-2 p-2 m-2'>
          <h5 className='mx-5 mt-2 border rounded p-3'>Totali per Pagese : <span className='fs-4 fw-bold mainTextColor p-2 d-inline'>{totalPerPagese} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Totali i Paguar : <span className='fs-4 fw-bold mainTextColor p-2 d-inline'>{totaliIPaguar} €</span></h5>
          <h5 className='mx-5 mt-2 border rounded p-3'>Mbetja per Pagese : <span className='fs-4 fw-bold mainTextColor p-2 d-inline'>{mbetjaPerPagese} €</span></h5>
        </Col>
      </Row>
      
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
              {porositeNePritje.map((item,index) => (
                <tr key={index}>
                  <th scope="row">{index+1}</th>
                  <td>{item.shifra}</td>
                  <td>{item.nrPorosise}</td>
                  <td>{item.dataShitjes ? new Date(item.dataShitjes).toLocaleDateString() : ''}</td>
                  <td>{item.subjekti}</td>
                  <td>{item.totaliPerPagese}</td>
                  <td>{item.komenti}</td>
                  <td>
                    <Button className='btn btn-primary' disabled><FontAwesomeIcon icon={faPen}/></Button>
                    <Button className='btn bg-transparent border-0 text-danger' onClick={() => thirreModal('ShitjeOnline',item.shitjeID,'anuloPorosineOnline')}><FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} /></Button>
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
      <ToastContainer/>
    </div>
    }
    </Container>
  )
}

export default FaqjaKryesoreAdmin
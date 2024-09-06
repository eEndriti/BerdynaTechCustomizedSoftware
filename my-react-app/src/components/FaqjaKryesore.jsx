import { useState,useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from './ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FaqjaKryesoreAdmin() {
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
  
  useEffect(() => {
    window.api.fetchTableTransaksionet().then(receivedData => {
      setTransaksionet(receivedData);
    });
  }, []);

  useEffect(() => {
    window.api.fetchTableShitje().then(receivedData => {
      setShitjet(receivedData);
    });
  }, []);

  useEffect(() => {
    window.api.fetchTableServisi().then(receivedData => {
      setServiset(receivedData);
    });
  }, []);

  useEffect(() => {
    const filteredTransaksionet = transaksionet.filter(item => item.nderrimiID === 1);
    setTransaksionetENderrimit(filteredTransaksionet);
  }, [transaksionet]);

  useEffect(() => {
    const shitjetEFiltruara = shitjet.filter(item => item.lloji == 'online');
    setPorositeNePritje(shitjetEFiltruara);
  }, [shitjet]);

  useEffect(() => {
    const servisetAktive = serviset.filter(item => item.statusi == 'Aktiv');
    setServisetAktive(servisetAktive);
  }, [shitjet]);
  
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

  return (
    <div>
      <div className="container my-3 tabelaTransaksioneve ">
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
                <th scope="col">Opsionet</th>
              </tr>
            </thead>
            <tbody>
            {transaksionetENderrimit.map((item,index) => (
              <tr key={index}>
                <th scope="row">{index+1}</th>
                <td>{item.shifra}</td>
                <td>{item.lloji}</td>
                <td>{item.totaliperPagese.toFixed(2)} €</td>
                <td className={item.mbetjaPerPagese > 0 ? 'text-danger' : 'text-success'}>{item.totaliIPageses.toFixed(2)} €</td>
                <td>{item.mbetjaPerPagese.toFixed(2)} €</td>
                <td>{item.komenti}</td>
                <td>
                  <Button className='btn btn-primary' onClick={() => ndryshoTransaksionin(item.lloji, item.transaksioniID)}>Ndrysho</Button>
                  <Button className='btn bg-transparent border-0 text-danger' onClick={() => thirreModal(item.lloji, item.transaksioniID,'anuloTransaksionin')}><FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} /></Button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
      <hr/>

      <div className="container mt-5 d-flex flex-row align-items-top">

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
                    <Button className='btn btn-primary'>Ndrysho</Button>
                    <Button className='btn bg-transparent border-0 text-danger'><FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} /></Button>
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
                    <Button className='btn btn-primary'>Ndrysho</Button>
                    <Button className='btn bg-transparent border-0 text-danger'><FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} /></Button>
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
      <ToastContainer/>
    </div>
  )
}

export default FaqjaKryesoreAdmin
import { useState,useEffect, useContext } from 'react'
import { Container,Button,Row,Col,Modal,Form, Spinner, InputGroup,Table,Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from '../ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateServise from '../UpdateServise';
import AnimatedSpinner from '../AnimatedSpinner';
import AuthContext,{formatCurrency} from '../AuthContext';

export default function Serviset() {
  const [loading,setLoading] = useState(true)
  const [serviset,setServiset] = useState([])
  const [servisetAktive,setServisetAktive] = useState([])
  const [showModal,setShowModal] = useState(false)
  const [burimiThirrjes,setBurimiThirrjes] = useState('')
  const [llojiPerAnulim,setLlojiPerAnulim] = useState('')
  const [idPerAnulim,setIdPerAnulim] = useState('')
  const [modalPerServisUpdate,setModalPerServisUpdate] = useState()
  const [data,setData] = useState('')
  const [updateServisType,setUpdateServisType] = useState()
  const { authData } = useContext(AuthContext)
  const [buttonLoading,setButtonLoading] = useState(false)

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true)

      try{
        const [servisetFetched] = await Promise.all([
          window.api.fetchTableServisi(),
        ]);

        setServiset(servisetFetched.filter(item => item.statusi === 'Aktiv'))
        console.log(serviset)

      }catch(e){
        console.log(e)
      }finally{
        setLoading(false)
      }
    };
  
    fetchData();

  }, []);

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


  const thirreModal = (lloji,transaksioniID,burimiThirrjes) =>{
    setShowModal(true)
    setBurimiThirrjes(burimiThirrjes)
    setLlojiPerAnulim(lloji)
    setIdPerAnulim(transaksioniID)
  }

  return (
    <Container fluid >
      <Col>
              <h3 className="section-title">Serviset Aktive</h3>
              <div className="table-container">
                <Table responsive striped bordered hover size="sm" className="custom-table">
                  <thead className="table-header">
                    <tr>
                      <th>Nr</th>
                      <th>Klienti</th>
                      <th>Kontakti</th>
                      <th>Data dhe Ora Pranimit</th>
                      <th>Komenti</th>
                      <th>Pajisjet Percjellese</th>
                      <th>Opsionet</th>
                    </tr>
                  </thead>
                  <tbody className='text-nowrap'>
                    {serviset.slice().reverse().map((item, index) => (
                      <tr key={index}>
                        <td>{serviset.length - index}</td>
                        <td>{item.subjekti}</td>
                        <td>{item.kontakti}</td>
                        <td>{item.dataPranimit.toLocaleDateString()} / {item.dataPranimit.toLocaleTimeString()}</td>
                        <td>{item.komenti}</td>
                        <td>{item.pajisjetPercjellese}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            className="action-btn mx-1"
                            onClick={() => ndryshoServisin(item, 'ndrysho')}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                             variant="outline-danger"
                            className="action-btn mx-1"
                            onClick={() => thirreModal('', item.servisimiID, 'anuloServisin')}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                          <Button
                            variant="outline-success"
                            className="action-btn mx-1"
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
            </Col>

            <ModalPerPyetje
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleConfirm={() => deleteServisin()}
      />
      <UpdateServise show={modalPerServisUpdate} handleClose={() => setModalPerServisUpdate(false)} updateType={updateServisType} data = {data} />
      
      

      <ToastContainer/>
    </Container>
  )
}

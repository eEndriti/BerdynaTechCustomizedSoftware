import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from './ModalPerPyetje';
import { useNavigate } from 'react-router-dom';
import ShtoNdryshoSubjektin from './ShtoNdryshoSubjektin';
import { formatCurrency } from '../useAuthData';

export default function Klient() {
    const navigate = useNavigate()
    const [klientet,setKlientet] = useState([])
    const [loading,setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('');
    const [showModalPerPyetje, setShowModalPerPyetje] = useState(false);
    const [idPerAnulim, setIdPerAnulim] = useState();
    const [modalShow,setModalShow] = useState(false)
    const [data,setData] = useState({inputEmertimi:'',inputKontakti:'',ndrysho:false,idPerNdryshim:null,lloji:'klient'})

    useEffect(() => {
        window.api.fetchTableSubjekti('klient').then((receivedData) => {
            const filteredData = receivedData.filter(item => item.lloji == 'klient');
            setKlientet(filteredData);
            setLoading(false);
        });
    }, []);
    

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const filteredKlientet = klientet.filter(item => {
        return (
            item.emertimi.toLowerCase().includes(searchTerm.toLowerCase()) 
        );
    });

    const thirreModalPerPyetje = (idPerAnulim) =>{
        setShowModalPerPyetje(true)
        setIdPerAnulim(idPerAnulim)
    }
    const handleConfirmModal = () =>{
        handleDeleteSubjekti()
    }
    const handleDeleteSubjekti = async () =>{
        if(idPerAnulim){
            try {
                const result = await window.api.deleteSubjekti(idPerAnulim);
                if (result.success) {
                  toast.success('Klienti u Fshi me Sukses!', {
                    position: "top-center",  
                    autoClose: 1500
                  }); 
                } else {
                  toast.error('Gabim gjate Fshirjes: ' + result.error);
                }
              } catch (error) {
                toast.error('Gabim gjate komunikimit me server: ' + error.message);
              } finally {
                setLoading(false);
                window.location.reload()
              }
        }else{
            toast.error('Gabim, Rifreskoni faqen dhe provoni serish: ');
        }
    }
    const handleCloseModalPerPyetje = () => {
        setShowModalPerPyetje(false)
    }
    const handleClose = () => setModalShow(false);

    const handleShow = () => {
        setData({
            lloji:'klient',
            ndrysho:false
        })
        setModalShow(true)
    };
    
    const handleShowNdrysho = (item) => {
        setData({
            inputEmertimi:item.emertimi,
            inputKontakti:item.kontakti,
            idPerNdryshim:item.subjektiID,
            lloji:'klient',
            ndrysho:true
        })
        setModalShow(true)
    }
    
   
      const handleDetaje = (subjektiID) =>{
        navigate(`/detajePerSubjekt/${'klient'}/${subjektiID}`)
      }
  return (
    <Container className='mt-5'>
        <Row>
            <Col md={2}>
                <Button className='fs-5' variant='success' onClick={handleShow}>Krijo nje Klient</Button>
            </Col>
           
        </Row>

        <Col>
            <h4 className="text-center fw-bold">Klientet:</h4>
        </Col>
        <hr />

        <Row className="mb-3 p-1 ">
            <Col md={2}>
                <Form.Control
                    type="text"
                    placeholder="Kërko sipas emertimit"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </Col>
        </Row>

    {loading ? (
        <div className="d-flex justify-content-center">
            <Spinner animation="border" />
        </div>
    ) : (
        <Row>
            <Col>
                {filteredKlientet.length < 1 ? (
                    <h5 className="text-center text-danger mt-5">
                        Ende nuk keni ndonje klient te regjistruar!
                    </h5>
                ) : (
                    <div className="container my-3 ">
                        <div className="table-responsive tableHeight50">
                            <table className="table table-sm table-striped border table-hover text-center">
                                <thead className="table-secondary">
                                    <tr className="fs-5">
                                        <th scope="col">Nr</th>
                                        <th scope="col">Emertimi</th>
                                        <th scope="col">Kontakti</th>
                                        <th scope="col">Totali Per Pagese</th>
                                        <th scope="col">Totali Pageses</th>
                                        <th scope="col">Mbetja Per Pagese</th>
                                        <th scope="col">Opsionet</th>
                                    </tr>
                                </thead>
                                <tbody className="border-dark">
                                    {filteredKlientet.slice().reverse().map((item, index) => (
                                        <tr key={index}>
                                            <th scope="row">{filteredKlientet.length - index}</th>
                                            <td>{item.emertimi}</td>
                                            <td>{item.kontakti}</td>
                                            <td>{formatCurrency(item.totalTotaliPerPagese)}</td>
                                            <td>{formatCurrency(item.totalTotaliPageses)}</td>
                                            <td className={item.totalMbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{formatCurrency(item.totalMbetjaPerPagese)}</td>
                                            <td className="text-center">
                                                <Button variant="info" className="m-1 fw-bold" onClick={() => handleDetaje(item.subjektiID)}>
                                                    Detaje...
                                                </Button>
                                                <Button variant="primary" className="m-1" onClick={() => handleShowNdrysho(item)}>
                                                    <FontAwesomeIcon className="mt-1" icon={faPen} />
                                                </Button>
                                                {item.totalTotaliPerPagese > 0 ? null : <Button variant="danger" className="m-1" onClick={() => thirreModalPerPyetje(item.subjektiID)}>
                                                    <FontAwesomeIcon className="mt-1" icon={faTrashCan} />
                                                </Button>}
                                                
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Col>
        </Row>
    )}
    <ToastContainer />
    <ModalPerPyetje show={showModalPerPyetje} handleClose={handleCloseModalPerPyetje} handleConfirm={handleConfirmModal} />
    <ShtoNdryshoSubjektin show={modalShow} handleClose={handleClose} data={data} />
</Container>
  )
}

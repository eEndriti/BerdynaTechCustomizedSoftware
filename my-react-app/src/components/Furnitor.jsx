import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner,Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from './ModalPerPyetje';
import { useNavigate } from 'react-router-dom';

export default function Furnitor() {

    const navigate = useNavigate()
    const [furnitoret,setFurnitoret] = useState([])
    const [loading,setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('');
    const [showModalPerPyetje, setShowModalPerPyetje] = useState(false);
    const [idPerAnulim, setIdPerAnulim] = useState();
    const [modalShow,setModalShow] = useState(false)
    const [inputEmertimi,setInputEmertimi] = useState('')
    const [inputKontakti,setInputKontakti] = useState('')
    const [idPerNdryshim,setIdPerNdryshim] = useState()
    const [ndrysho,setNdrysho] = useState(false)

    useEffect(() => {
        window.api.fetchTableSubjekti().then((receivedData) => {
            const filteredData = receivedData.filter(item => item.lloji == 'furnitor');
            setFurnitoret(filteredData);
            setLoading(false);
        });
    }, []);
    

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const filteredFurnitoret = furnitoret.filter(item => {
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
                  toast.success('Furnitori u Fshi me Sukses!', {
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
        setInputEmertimi('')
        setInputKontakti('')
        setNdrysho(false)
        setModalShow(true)
    };

    const handleShowNdrysho = (subjektiID,emertimi,kontakti) => {
        setInputEmertimi(emertimi)
        setInputKontakti(kontakti)
        setIdPerNdryshim(subjektiID)
        setNdrysho(true)
        setModalShow(true)
    }
    const handleSubmit = () =>{
        if(ndrysho){
            handleNdryshoFurnitorin()
        }else 
            handleShtoFurnitorin()
    }
    const handleNdryshoFurnitorin = async () => {
        setLoading(true)
        if(inputEmertimi.length > 1 && inputKontakti > 1){
            const data={
                emertimi:inputEmertimi,
                kontakti:inputKontakti,
                subjektiID:idPerNdryshim
            }
            try {
                const result = await window.api.ndryshoSubjektin(data);
                if (result.success) {
                  toast.success('Furnitori u Ndryshua me Sukses!', {
                    position: "top-center",  
                    autoClose: 1500,
                    onClose:() => window.location.reload()
                  }); 
                } else {
                  toast.error('Gabim gjate Ndryshimit: ' + result.error);
                }
              } catch (error) {
                toast.error('Gabim gjate komunikimit me server: ' + error.message);
              } finally {
                setLoading(false);
              }
        }else{
            toast.warning('Plotesoni fushat me më shume karaktere!', {
                position:'top-center',
                autoClose:1500
            })
            setLoading(false)
        }
      };

    const handleShtoFurnitorin = async () => {
        setLoading(true)
        if(inputEmertimi.length > 1 && inputKontakti > 1){
            const data={
                emertimi:inputEmertimi,
                kontakti:inputKontakti,
                lloji:'furnitor'
            }
            try {
                const result = await window.api.insertSubjekti(data);
                if (result.success) {
                  toast.success('Furnitori u Regjistrua me Sukses!', {
                    position: "top-center",  
                    autoClose: 1500
                  }); 
                } else {
                  toast.error('Gabim gjate regjistrimit: ' + result.error);
                }
              } catch (error) {
                toast.error('Gabim gjate komunikimit me server: ' + error.message);
              } finally {
                setLoading(false);
                window.location.reload()
              }
        }else{
            toast.warning('Plotesoni fushat me më shume karaktere!', {
                position:'top-center',
                autoClose:1500
            })
            setLoading(false)
        }
      };
      const handleDetaje = (subjektiID) =>{
        navigate(`/detajePerSubjekt/${'furnitor'}/${subjektiID}`)
      }
  return (
    <Container>
        <Row>
            <Col md={2}>
                <Button className='fs-5' variant='success' onClick={handleShow}>Krijo nje Furnitor</Button>
            </Col>
           
        </Row>

        <Col>
            <h4 className="text-center fw-bold">Furnitoret:</h4>
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
                {filteredFurnitoret.length < 1 ? (
                    <h5 className="text-center text-danger mt-5">
                        Ende nuk keni ndonje furnitor te regjistruar!
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
                                    {filteredFurnitoret.slice().reverse().map((item, index) => (
                                        <tr key={index}>
                                            <th scope="row">{filteredFurnitoret.length - index}</th>
                                            <td>{item.emertimi}</td>
                                            <td>{item.kontakti}</td>
                                            <td>{item.totalTotaliPerPagese} €</td>
                                            <td>{item.totalTotaliPageses} €</td>
                                            <td className={item.totalMbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{item.totalMbetjaPerPagese} €</td>
                                            <td className="text-center">
                                                <Button variant="info" className="m-1 fw-bold" onClick={() => handleDetaje(item.subjektiID)}>
                                                    Detaje...
                                                </Button>
                                                <Button variant="primary" className="m-1" onClick={() => handleShowNdrysho(item.subjektiID,item.emertimi,item.kontakti)}>
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
    <Modal show={modalShow} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>{ndrysho ? 'Ndrysho': 'Shto'} nje Furnitor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Emertimi:</Form.Label>
                    <Form.Control type='text' value={inputEmertimi} onChange={(e) => setInputEmertimi(e.target.value)} placeholder='Emertimi i Furnitorit...' /> 
                </Form.Group>
                <Form.Group className='mb-3 fw-bold'>
                    <Form.Label>Kontakti:</Form.Label>
                    <Form.Control type='number' value={inputKontakti} onChange={(e) => setInputKontakti(e.target.value)} placeholder='Kontakti i Furnitorit...' /> 
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='secondary' onClick={handleClose}>
                Anulo
            </Button>
            <Button variant='primary' onClick={handleSubmit} disabled={loading}>
            {loading ? (
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
            ) : <>
                {ndrysho ? 'Ruaj Ndryshimet...' : 'Regjistro Furnitorin e Ri'}
                </>}
                
            </Button>
        </Modal.Footer>
    </Modal>
</Container>
  )
}

import {useState,useEffect} from 'react'
import { Container, Row, Col, Button, Table, Modal, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import AnimatedSpinner from './AnimatedSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthData from '../useAuthData';
import ModalPerPyetje from './ModalPerPyetje'

export default function Perdoruesit() {
    
    const [loading,setLoading] = useState(true)
    const [perdoruesit,setPerdoruesit] = useState([])
    const [buttonLoading,setButtonLoading] = useState(false)
    const [dataPerPerdorues,setDataPerPerdorues] = useState({emri:'',fjalekalimi:'',roli:''})
    const [shtoPerdoruesModal,setShtoPerdoruesModal] = useState(false)
    const [perNdryshim,setPerNdryshim] = useState()
    const { perdoruesiID } = useAuthData()
    const [idPerPerdorim,setIdPerPerdorim] = useState()
    const [modalPerPyetje,setModalPerPyetje] = useState(false)

    useEffect(() =>{
        const fetchData = async () => {
            try {
                const receivedData = await window.api.fetchTableQuery(
                    `SELECT  *,
                            CASE 
                                WHEN EXISTS (SELECT 1 FROM blerje WHERE perdoruesiID = perdoruesi.perdoruesiID)
                                    OR EXISTS (SELECT 1 FROM shitje WHERE perdoruesiID = perdoruesi.perdoruesiID)
                                    OR EXISTS (SELECT 1 FROM transaksioni WHERE perdoruesiID = perdoruesi.perdoruesiID)
                                    OR EXISTS (SELECT 1 FROM servisimi WHERE perdoruesiID = perdoruesi.perdoruesiID)
                                    OR EXISTS (SELECT 1 FROM shpenzimi WHERE perdoruesiID = perdoruesi.perdoruesiID)
                                    OR EXISTS (SELECT 1 FROM logs WHERE perdoruesiID = perdoruesi.perdoruesiID)
                                THEN CAST(1 AS BIT)  -- Returns TRUE if related data exists
                                ELSE CAST(0 AS BIT)   -- Returns FALSE if no related data exists
                            END AS DataExists
                        FROM 
                            perdoruesi;
`
                )
                setPerdoruesit(receivedData)
            }catch(error){
                console.log(error)
            }finally{
                setLoading(false)
            }
        }
        fetchData()
        if (localStorage.getItem('sukses') === 'true') {
            toast.success(localStorage.getItem('msg'));
            setTimeout(() => {
              setTimeout((localStorage.removeItem('sukses'),localStorage.removeItem('msg')) , 1500)
            }, 1000)
        }else if(localStorage.getItem('sukses') === 'false') {
            toast.error('Punonjesi u shtua me sukses!');
            setTimeout(() => {
              setTimeout((localStorage.removeItem('sukses'),localStorage.removeItem('msg')) , 1500)
            }, 1000)
        }

        
    },[])

    const handleChangeShtoPerdorues = (event) => {
        const { name, value } = event.target;
        setDataPerPerdorues({
            ...dataPerPerdorues,
            [name]: value
        });

    };

    const emptyDataPerPerdorues = () => {
      setDataPerPerdorues({
        emri:'',
        mbiemri:'',
        pagaBaze:'',
        nrTelefonit:'',
        aktiv:1,
        punonjesID:''
      })
      setPerNdryshim(null)
    }


    const shtoPerdorues = async () => {
        
        setButtonLoading(true);
        console.log(dataPerPerdorues)
        
        try {
            await window.api.shtoPerdoruesin(dataPerPerdorues);
            localStorage.setItem('sukses', 'true');
            localStorage.setItem('msg', 'Perdoruesi u Shtua me Sukses');
        } catch (error) {
            localStorage.setItem('sukses', 'false');
            localStorage.setItem('msg', error);
        } finally {
            setButtonLoading(false);
            window.location.reload();
        } 
    };

    const ndryshoPerdorues = async () => {
        setButtonLoading(true);

        try {
            await window.api.ndryshoPerdorues(dataPerPerdorues);
            localStorage.setItem('sukses', 'true');
            localStorage.setItem('msg', 'Perdoruesi u Ndryshua me Sukses');
        } catch (error) {
            localStorage.setItem('sukses', 'false');
            localStorage.setItem('msg', error);
        } finally {
            setButtonLoading(false);
            window.location.reload();
        } 
    };
    const thirreModalPerPyetje = (id) => {
        setIdPerPerdorim(id)
        setModalPerPyetje(true)
    }
    const handleConfirm = async () => {
        setButtonLoading(true)
        try {
            await window.api.deletePerdoruesi(idPerPerdorim);
            localStorage.setItem('sukses', 'true');
            localStorage.setItem('msg', 'Perdoruesi u Fshie me Sukses');
        } catch (error) {
            localStorage.setItem('sukses', 'false');
            localStorage.setItem('msg', error);
        } finally {
            setButtonLoading(false);
            window.location.reload();
        } 
    }

  return (
  <>
    {loading ? <AnimatedSpinner/> : <Container>
        <Row>    
            <Button variant="success" className='w-25' onClick={()=> {emptyDataPerPerdorues(); setShtoPerdoruesModal(true)}}>Shto Perdorues të Ri</Button>
        </Row>
        <Row>
        <Table striped bordered hover className="mt-3">
            <thead>
            <tr>
                <th>Nr.</th>
                <th>Emri i Perdoruesit</th>
                <th>Roli</th>
                <th>Veprime</th>
            </tr>
            </thead>
            <tbody>
            {perdoruesit.slice().reverse().map((item, index) => (
            <tr key={index}>
                {item.punonjesit != 0 ? (
                <>
                    <th scope="row">{perdoruesit.length - index}</th>
                    <td>{item.emri}</td>
                    <td>{item.roli}</td>
                    <td>
                        {perdoruesiID != item.perdoruesiID ? <>
                            <Button variant="outline-primary" className="me-2" onClick={() => {setDataPerPerdorues(item);setPerNdryshim(true);setShtoPerdoruesModal(true)}}>
                              <FontAwesomeIcon icon={faEdit} /> Ndrysho
                            </Button>
                            <Button 
                                    variant="outline-danger"
                                    onClick={() => thirreModalPerPyetje(item.perdoruesiID)}
                                    disabled={item.DataExists}>
                                    <FontAwesomeIcon icon={faTrashCan} /> Fshij
                            </Button>
                        </>:'Nuk Mund te Veprohet me Perdoruesin Aktual'}
                    </td>
                </>
                ) : 'Nuk ka te dhena!'}
            </tr>
            ))}

            </tbody>
        </Table>
        </Row>
        <ToastContainer/>

        <Modal
                        show={shtoPerdoruesModal}
                        onHide={() => {
                            buttonLoading ? null : setShtoPerdoruesModal(false);
                        }}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title className="text-dark">{!perNdryshim ? <>Forma për Regjistrim të Perdoruesit</> : <>Forma për Ndryshim të Perdoruesit</>}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group controlId="formFirstName">
                                            <Form.Label>Emri</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="emri"
                                                value={dataPerPerdorues.emri}
                                                onChange={handleChangeShtoPerdorues}
                                                placeholder="Shkruaj Emrin..."
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formLastName">
                                            <Form.Label>Fjalekalimi</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fjalekalimi"
                                                value={dataPerPerdorues.fjalekalimi}
                                                onChange={handleChangeShtoPerdorues}
                                                placeholder="Shkruaj Fjalekalimin..."
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-3 align-items-center">
                                    <Col >
                                        <Form.Group controlId="formRole">
                                            <Form.Label>Roli</Form.Label>
                                            <Form.Select
                                                name="roli"
                                                value={dataPerPerdorues.roli || ""}
                                                onChange={handleChangeShtoPerdorues}
                                            >
                                                <option value="" disabled hidden>Zgjidh Rolin...</option>
                                                <option value="admin">admin</option>
                                                <option value="perdorues">perdorues</option>
                                            </Form.Select>
                                        </Form.Group>

                                    </Col>
                                </Row>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" disabled={buttonLoading} onClick={() => setShtoPerdoruesModal(false)}>
                                Mbyll
                            </Button>
                            <Button variant="primary" disabled={buttonLoading} onClick={() => {perNdryshim ? ndryshoPerdorues() : shtoPerdorues()}}>
                                {buttonLoading ? (
                                    <>
                                        <Spinner size="sm" /> {'Duke ruajtur'}
                                    </>
                                ) : (
                                    <>{perNdryshim ? 'Ruaj Ndryshimet' : 'Regjistro'}</>
                                )}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <ModalPerPyetje show={modalPerPyetje} handleClose={() => {setModalPerPyetje(false)}} handleConfirm={handleConfirm} />

    </Container>}
  </>
  )
}

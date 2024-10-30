import {useState,useEffect} from 'react'
import { Container,Row,Col,Button,Table,Modal,Form,Spinner,InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import AnimatedSpinner from './AnimatedSpinner';
import ModalPerPyetje from './ModalPerPyetje'

export default function MenyratPagesave() {
    const [loading,setLoading] = useState(true)
    const [menyratPagesave,setMenyratPagesave] = useState([])
    const [data,setData] = useState({emertimi:'',shuma:''})
    const [perNdryshim,setPerNdryshim] = useState(false)
    const [modal,setModal] = useState(false)
    const [buttonLoading,setButtonLoading] = useState(false)
    const [idPerNdryshim,setIdPerNdryshim] = useState()
    const [modalPerPyetje,setModalPerPyetje] = useState()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const receivedData = await window.api.fetchTableQuery(
                    `SELECT 
                        m.menyraPagesesID, 
                        m.emertimi, 
                        b.shuma, 
                        CASE 
                            WHEN EXISTS (SELECT 1 FROM blerje WHERE menyraPagesesID = m.menyraPagesesID)
                                OR EXISTS (SELECT 1 FROM shitje WHERE menyraPagesesID = m.menyraPagesesID)
                                OR EXISTS (SELECT 1 FROM pagesa WHERE menyraPagesesID = m.menyraPagesesID)
                            THEN CAST(1 AS BIT)  -- Returns TRUE if data exists
                            ELSE CAST(0 AS BIT)   -- Returns FALSE if no data exists
                        END AS DataExists
                    FROM 
                        menyraPageses m 
                    JOIN 
                        balanci b ON b.menyraPagesesID = m.menyraPagesesID;`
                );
                setMenyratPagesave(receivedData);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false); 
            }
        };
        fetchData();
    
        if (localStorage.getItem('sukses') === 'true') {
            toast.success(localStorage.getItem('msg'));
            setTimeout(() => localStorage.removeItem('sukses'), 1500);
            setTimeout(() => localStorage.removeItem('msg'), 1500);
        } else if (localStorage.getItem('sukses') === 'false') {
            toast.error(localStorage.getItem('msg'));
            setTimeout(() => localStorage.removeItem('sukses'), 1500);
            setTimeout(() => localStorage.removeItem('msg'), 1500);
        }
    }, []);

    const handleChangeData = (event) => {
        const { name, value } = event.target;
        setData({
            ...data,
            [name]: value
        });
    };

    const emptyData = () => {
        setData({
          emri:'',
          shuma:''
        })
        setPerNdryshim(null)
      }

      const shtoOpsion = async () => {
        setButtonLoading(true);
        try {
            await window.api.shtoOpsionPagese(data);
            localStorage.setItem('sukses', 'true');
            localStorage.setItem('msg', 'Menyra e Pageses u Shtua me Sukses');
        } catch (error) {
            localStorage.setItem('sukses', 'false');
            localStorage.setItem('msg', error);
        } finally {
            setButtonLoading(false);
            window.location.reload();
        }
    };

    const ndryshoOpsion = async () => {
        setButtonLoading(true);
        try {
            await window.api.ndryshoOpsionPagese(data);
            localStorage.setItem('sukses', 'true');
            localStorage.setItem('msg', 'Menyra e Pageses u Ndryshua me Sukses');
        } catch (error) {
            localStorage.setItem('sukses', 'false');
            localStorage.setItem('msg', error);
        } finally {
            setButtonLoading(false);
            window.location.reload();
        }
    };

    const thirreModalPerPyetje = (id) => {
        setIdPerNdryshim(id)
        setModalPerPyetje(true)
    }
    const handleConfirm = async() => {
        if(idPerNdryshim){
          try{
            await window.api.deleteOpsionPagese(idPerNdryshim)
            localStorage.setItem('sukses', 'true');
            localStorage.setItem('msg', 'Menyra e Pageses u Fshie me Sukses');
        } catch (error) {
            localStorage.setItem('sukses', 'false');
            localStorage.setItem('msg', error);
        } finally {
            setButtonLoading(false);
            window.location.reload();
        }
        }
      }
  
  return (
  <>
    {loading ? <AnimatedSpinner/> : <Container>
        <Row>    
            <Button variant="success" className='w-25' onClick={() => {emptyData();setModal(true)}}>Shto Opsion të Ri Pagese</Button>
        </Row>
        <Row>
        <Table striped bordered hover className="mt-3">
            <thead>
            <tr>
                <th>Nr.</th>
                <th>Emertimi</th>
                <th>Bilanci Aktual</th>
                <th>Veprime</th>
            </tr>
            </thead>
            <tbody>
            {menyratPagesave.slice().reverse().map((item, index) => (
            <tr key={index}>
                {menyratPagesave.length != 0 ? (
                <>
                    <th scope="row">{menyratPagesave.length - index}</th>
                    <td>{item.emertimi}</td>
                    <td>{item.shuma.toFixed(2)} €</td>
                    <td>
                        <Button variant="outline-primary" className="me-2" onClick={() => {setPerNdryshim(true); setData(item);setModal(true)}}>
                            <FontAwesomeIcon icon={faPen} /> Ndrysho
                        </Button>
                                
                        <Button
                            variant="outline-danger"
                            className="me-2"
                            onClick={() => thirreModalPerPyetje(item.menyraPagesesID)}
                            disabled={item.DataExists}
                        >
                             <FontAwesomeIcon icon={faTrashCan} /> Fshij
                        </Button>
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
                show={modal}
                onHide={() => {
                    buttonLoading ? null : setModal(false);
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className="text-dark">{!perNdryshim ? <>Forma për Regjistrim të Menyres se Pagesave</> : <>Forma për Ndryshim të Menyres se Pagesave</>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formFirstName">
                                    <Form.Label>Emertimi:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="emertimi"
                                        value={data.emertimi}
                                        onChange={handleChangeData}
                                        placeholder="Shkruaj Emertimin..."
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formLastName">
                                    <Form.Label>Shuma Aktuale:</Form.Label>
                                    <InputGroup>
                                    <Form.Control
                                        type="text"
                                        name="shuma"
                                        value={data.shuma}
                                        onChange={handleChangeData}
                                        placeholder="Shkruaj Shumen Aktuale..."
                                    />
                                    <InputGroup.Text>€</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" disabled={buttonLoading} onClick={() => setModal(false)}>
                        Mbyll
                    </Button>
                    <Button variant="primary" disabled={buttonLoading} onClick={() => {perNdryshim ? ndryshoOpsion() : shtoOpsion()}}>
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

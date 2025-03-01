import {useState,useEffect} from 'react'
import { Container,Row,Col,Button,Table,Modal,Form,Spinner,InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashCan,faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import {ToastContainer } from 'react-toastify';
import { useToast } from './ToastProvider';
import AnimatedSpinner from './AnimatedSpinner';
import ModalPerPyetje from './ModalPerPyetje'
import { formatCurrency } from "../components/AuthContext";
import { useNavigate } from 'react-router-dom';
export default function MenyratPagesave() {
    const [loading,setLoading] = useState(true)
    const [buttonLoading,setButtonLoading] = useState(false)
    const [menyratPagesave,setMenyratPagesave] = useState([])
    const [menyratPagesaveFiltered,setMenyratPagesaveFiltered] = useState([])
    const [data,setData] = useState({emertimi:'',shuma:''})
    const [perNdryshim,setPerNdryshim] = useState(false)
    const [modal,setModal] = useState(false)
    const [idPerNdryshim,setIdPerNdryshim] = useState()
    const [modalPerPyetje,setModalPerPyetje] = useState()
    const [levizjeModal,setLevizjeModal] = useState(false)
    const [ngaOpsioni, setngaOpsioni] = useState("");
    const [neOpsionin, setneOpsionin] = useState("");
    const [shuma, setshuma] = useState("");
    const [emertimiSearch,setEmertimiSearch] = useState('')
    const showToast = useToast()
    const [triggerReload,setTriggerReload] = useState(false)
    const navigate = useNavigate()
    
    const handleFromChange = (e) => {
      setngaOpsioni(e.target.value);
    };
  
    const handleToChange = (e) => {
      setneOpsionin(e.target.value);
    };
  
    const handleshumaChange = (e) => {
      setshuma(e.target.value);
    };

    useEffect(() => {
       
        fetchData();

    }, [triggerReload]);

    const fetchData = async () => {
        try {
            setLoading(true)
            const receivedData = await window.api.fetchTableQuery(
                `SELECT 
                    m.menyraPagesesID, 
                    m.emertimi, 
                    m.asociuarMeArken,
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
            setMenyratPagesaveFiltered(receivedData)
        } catch (error) {
            showToast('Gabim gjate marrjes se te dhenave: ' + error, 'error');
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() =>{
        if(menyratPagesave){
            const filterResult = menyratPagesave.filter(m => {
                return m.emertimi.toLowerCase().includes(emertimiSearch.toLowerCase())
            })
            setMenyratPagesaveFiltered(filterResult)
        }
    },[menyratPagesave,emertimiSearch])

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
            showToast('Menyra e Pageses u Regjistrua me Sukses', 'success');
    
            setTimeout(() => {
                setModal(false);
                setTriggerReload(prev => !prev);
            }, 2500); 
        } catch (error) {
            showToast('Gabim gjate Regjistrimit te Menyres se Pageses: ' + error, 'error');
        } finally {
            setButtonLoading(false);
        }
    };
    

    const ndryshoOpsion = async () => {
        setButtonLoading(true);
        try {
            await window.api.ndryshoOpsionPagese(data);
            showToast('Menyra e Pageses u Ndryshua me Sukses', 'success')
            setTimeout(() => {
                setModal(false);
                setTriggerReload(prev => !prev);
            }, 2500); 
        } catch (error) {
            showToast('Gabim gjate Ndryshimit te Menyres se Pageses: ' + error, 'error');
        } finally {
            setButtonLoading(false);
            
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
            showToast('Menyra e Pageses u Anulua me Sukses','success')
            setTimeout(() => {
                setTriggerReload(prev => !prev);
            }, 2500); 
        } catch (error) {
            showToast('Gabim gjate Anulimit se Menyres se Pageses: ' + error, 'error');
        } finally {
            setButtonLoading(false);
        }
        }
      }
  
      const handleTransferoMjete = async () => {
        setButtonLoading(true)

        const data = {
            ngaOpsioni,
            neOpsionin,
            shuma
        }

        try{
            await window.api.transferoMjetet(data)
            showToast('Mjetet u Transferuan me Sukses','success')
            setTimeout(() => {
                setLevizjeModal(false)
                setTriggerReload(prev => !prev);
            }, 2500); 
        }catch(error){
            showToast('Gabim gjate Transferimit te Mjeteve: ' + error, 'error');
        }finally{
            setButtonLoading(false)
        }
      }
  return (
  <>
    {loading ? <AnimatedSpinner/> : <Container>
        <Row>
            <Col lg={4} >
                <Form.Control placeholder='Kerko me Emertim...' value={emertimiSearch} onChange={(e) => setEmertimiSearch(e.target.value)} />
            </Col>
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
                {loading ? <AnimatedSpinner/> :<>
                
                    {menyratPagesaveFiltered.slice().reverse().map((item, index) => (
                <tr key={index}>
                    {menyratPagesaveFiltered.length != 0 ? (
                    <>  {console.log(item)}
                        <th scope="row">{menyratPagesaveFiltered.length - index}</th>
                        <td>{item.asociuarMeArken ? <>{item.emertimi} (Asociuar me Arken!)</> : item.emertimi }</td>
                        <td>{formatCurrency(item.shuma)}</td>
                        <td>
                            <Button variant="outline-primary" className="me-2" onClick={() => {setPerNdryshim(true); setData(item);setModal(true)}}>
                                <FontAwesomeIcon icon={faEdit} /> Ndrysho
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
                </>}

                </tbody>
            </Table>
            <Row>  
            <Col className='d-flex flex-row flex-wrap justify-content-between mt-3'>
                <Button variant="success" className='w-25' onClick={() => {emptyData();setModal(true)}}>Shto Opsion të Ri Pagese</Button>
                <Button variant='secondary' onClick={() => setLevizjeModal(true)}>Levizje Interne ( Deponim / Terheqje )</Button>
            </Col>            
        </Row>
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
                    <Button variant="outline-secondary" disabled={buttonLoading } onClick={() => setModal(false)}>
                        Mbyll
                    </Button>
                    <Button variant="primary" disabled={buttonLoading|| !data.emertimi || !data.shuma} onClick={() => {perNdryshim ? ndryshoOpsion() : shtoOpsion()}}>
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

            <Modal show={levizjeModal} onHide={()=> {buttonLoading ? null :setLevizjeModal(false)}}>
                <Modal.Header closeButton>
                    <Modal.Title>
                    <FontAwesomeIcon icon={faExchangeAlt} /> Transfero Mjetet
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                    <Form.Group controlId="ngaOpsioni">
                        <Form.Label>Nga:</Form.Label>
                        <Form.Control as="select" value={ngaOpsioni} onChange={handleFromChange} disabled={buttonLoading} >
                        <option value="">Selekto Opsionin e Pageses</option>
                        {menyratPagesave.map((method, index) => (
                            <option key={index} value={method.menyraPagesesID}>
                            {method.emertimi}
                            </option>
                        ))} 
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="neOpsionin">
                        <Form.Label>Transfero në:</Form.Label>
                        <Form.Control
                        as="select"
                        value={neOpsionin}
                        onChange={handleToChange}
                        disabled={!ngaOpsioni || buttonLoading}
                        >
                        <option value="">Selekto Opsionin Perfitues:</option>
                        {menyratPagesave
                            .filter((method) => method !== ngaOpsioni)
                            .map((method, index) => (
                            <option key={index} value={method.menyraPagesesID}>
                                {method.emertimi}
                            </option>
                            ))} 
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="shuma">
                        <Form.Label>Shuma:</Form.Label>
                        <Form.Control
                        type="number"
                        value={shuma}
                        onChange={handleshumaChange}
                        placeholder="Shkruaj Shumen..."
                        disabled={buttonLoading}
                        />
                    </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={()=> {buttonLoading ? null :setLevizjeModal(false)}}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={()=> handleTransferoMjete()} disabled={!ngaOpsioni || !neOpsionin || !shuma || buttonLoading}>
                        Transfero
                    </Button>
                </Modal.Footer>
            </Modal>

    </Container>}
  </>
  )
}

import { useState,useEffect } from 'react'
import { Container,Row,Col,Button,Table,Form,Spinner, Modal } from 'react-bootstrap'
import KerkoSubjektin from './KerkoSubjektin'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from './ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Serviset() {
    const [loading,setLoading] = useState(true)
    const [selectedSubjekti, setSelectedSubjekti] = useState({ emertimi: "", kontakti: "", subjektiID: null });
    const [serviset,setServiset] = useState([])
    const [kontakti,setKontakti] = useState(selectedSubjekti.kontakti)
    const [komenti,setKomenti] = useState()
    const [aKaData,setAKaData] = useState(false)
    const [aKaAdapter,setAKaAdapter] = useState(false)
    const [aKaÇante,setAKaÇante] = useState(false)
    const [aKaGarancion,setAKaGarancion] = useState(false)
    const [shifraGarancionit,setShifraGarancionit] = useState('')
    const [idPerAnulim,setIdPerAnulim] = useState()
    const [modalPerPyetje,setModalPerPyetje] = useState(false)
    useEffect(() => {
        window.api.fetchTableServisi().then(receivedData => {
          setServiset(receivedData);
          setLoading(false)
        });
      }, []);
    
    const handleSelectSubjekti = (result) => {
        setSelectedSubjekti({
          emertimi: result.emertimi,
          kontakti: result.kontakti,
          subjektiID: result.subjektiID,
        });
      };
    
    const checkData = () => {
        if(selectedSubjekti.emertimi.length > 1){
            if(aKaGarancion){
                if(shifraGarancionit.length < 1) {
                    toast.warning('Duhet te shenoni shifren e garancionit!')
                }else{
                    handleShtoServisin()
                }
            }
        }else{
            toast.warning('Selektoni subjektin per te vazhduar!')
        }
    }
    const handleShtoServisin = async () => {
        let pajisjetPercjellese = ''

        {aKaData ? pajisjetPercjellese = 'Data/' : ''}
        {aKaAdapter ? pajisjetPercjellese += 'Adapter/' : ''}
        {aKaÇante ? pajisjetPercjellese += 'Çante' : ''}

            setLoading(true)
                const data ={
                    kontakti:kontakti,
                    komenti,
                    pajisjetPercjellese,
                    statusi:'Aktiv',
                    shifraGarancionit,
                    perdoruesiID:1,
                    nderrimiID:1,
                    subjektiID:selectedSubjekti.subjektiID
                }
                try {
                    const result = await window.api.insertServisi(data);
                    if (result.success) {
                      toast.success('Servisi u Regjistrua me Sukses!', {
                        position: "top-center",  
                        autoClose: 1500,
                        onClose:() => window.location.reload()
                      }); 
                    } else {
                      toast.error('Gabim gjate regjistrimit: ' + result.error);
                    }
                  } catch (error) {
                    toast.error('Gabim gjate komunikimit me server: ' + error.message);
                  } finally {
                    setLoading(false);
                  }
    }
    const thirreModal = (idPerAnulim) => {
        setIdPerAnulim(idPerAnulim)
        setModalPerPyetje(true)
    }
    const confirmModal = () => {
        deleteServisin()
    }
    const closeModalPerPyetje = () => {
        setModalPerPyetje(false)
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
  return (
    <Container>
        <Row>
            <Form className=" rounded-3 ">
                <h4 className="text-center mb-2 fw-bold">Prano Servisin:</h4>
                <Col className="d-flex flex-row justify-content-between mb-2">
                    <Form.Group className="me-3" style={{ flex: 1 }}>
                        <Form.Label className="fw-bold">Klienti</Form.Label>
                        <KerkoSubjektin
                            filter="klient"
                            value={selectedSubjekti.emertimi}
                            onSelect={handleSelectSubjekti}
                            className="form-control form-control-lg bg-dark"
                        />
                    </Form.Group>

                    <Form.Group style={{ flex: 1 }}>
                        <Form.Label className="fw-bold">Kontakti</Form.Label>
                        <Form.Control
                            type="number"
                            defaultValue={selectedSubjekti.kontakti} onChange={(e) => setKontakti(e.target.value)}
                            className="form-control form-control-lg"
                        />
                    </Form.Group>
                </Col>

                <Col className="d-flex flex-row justify-content-between mb-4">
                    <Form.Group style={{ flex: 1 }}>
                        <Form.Label className="fw-bold">Komente</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-lg"
                            placeholder="Shto komente për servisin..."
                            onChange={(e) => setKomenti(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="ms-3" style={{ flex: 0.5 }}>
                        <Form.Label className="fw-bold">Data</Form.Label>
                        <Form.Check className="fs-4 text-info" checked={aKaData} onClick={() => setAKaData(!aKaData)}/>
                    </Form.Group>

                    <Form.Group className="ms-3" style={{ flex: 0.5 }}>
                        <Form.Label className="fw-bold">Adapter</Form.Label>
                        <Form.Check className="fs-4 text-info" checked={aKaAdapter} onClick={() => setAKaAdapter(!aKaAdapter)}/>
                    </Form.Group>

                    <Form.Group className="ms-3" style={{ flex: 0.5 }}>
                        <Form.Label className="fw-bold">Çantë</Form.Label>
                        <Form.Check className="fs-4 text-info" checked={aKaÇante} onClick={() => setAKaÇante(!aKaÇante)}/>
                    </Form.Group>

                    <Form.Group className="ms-3" style={{ flex: 0.5 }}>
                        <Form.Label className="fw-bold">Garancion:</Form.Label>
                        <Form.Check className="fs-4 text-info" checked={aKaGarancion} onClick={() => setAKaGarancion(!aKaGarancion)}/>
                        {aKaGarancion && <Form.Control type='text' className='mt-3'                             onChange={(e) => setShifraGarancionit(e.target.value)}
                        placeholder='Shifren e Garancionit...'/>}
                    </Form.Group>
                </Col>

                <Button variant="success" size="lg" className="w-100" onClick={() => checkData()} disabled={loading}>
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
                    ) : (
                        'Shto Servisin...'
                    )}
                </Button>
            </Form>
        </Row>
        <hr/>

        <Row className='mt-5'>
            <div className="table-responsive tabeleMeMaxHeight">
            <Table className="table table-sm table-striped border table-hover">
                <thead className="table-secondary">
                <tr className='fs-5 '>
                    <th scope="col">Nr</th>
                    <th scope="col">Shifra</th>
                    <th scope="col">Subjekti</th>
                    <th scope="col">Kontakti</th>
                    <th scope="col">Komenti</th>
                    <th scope="col">Pajisjet Percjellese</th>
                    <th scope="col">Totali per Pagese</th>
                    <th scope="col">Mbetja per Pagese</th>
                    <th scope="col">Data dhe Ora e Pranimit</th>
                    <th scope="col">Data e Perfundimit</th>
                    <th scope="col">Perdoruesi</th>
                    <th scope="col">Statusi</th>
                    <th scope="col">Garancioni</th>
                    <th scope="col">Opsionet</th>
                </tr>
                </thead>
                <tbody>
                {serviset.slice().reverse().map((item, index) => (
                <tr key={index}>
                    {item.transaksioniID != 0 ? (
                    <>
                        <th scope="row">{serviset.length - index}</th>
                        <td>{item.shifra}</td>
                        <td>{item.subjekti}</td>
                        <td>{item.kontakti}</td>
                        <td>{item.komenti}</td>
                        <td>{item.pajisjetPercjellese}</td>
                        <td>{item.totaliPerPagese != null ? item.totaliPerPagese.toFixed(2) : ''}</td>
                        <td className={item.mbetjaPageses > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                            {item.mbetjaPageses != null ? item.mbetjaPageses.toFixed(2) : ''} </td>
                        <td>{item.dataPranimit.toLocaleDateString()}<br/>{item.dataPranimit.toLocaleTimeString()}</td>
                        {item.dataPerfundimit != null ? <td>{item.dataPerfundimit.toLocaleDateString()}<br/>{item.dataPerfundimit.toLocaleTimeString()}</td> : <td></td>}
                        <td>{item.perdoruesi}</td>
                        <td className={item.statusi == 'Perfunduar' ? 'text-success fw-bold' : 'fw-bold text-danger'}>{item.statusi}</td>
                        <td>{item.shifraGarancionit}</td>
                        <td>
                        <Button className='btn btn-primary' >
                            <FontAwesomeIcon icon={faPen} />
                        </Button>
                        <Button className='btn bg-danger m-1 border-danger' onClick={() => thirreModal(item.servisimiID)}>
                            <FontAwesomeIcon  icon={faTrashCan} />
                        </Button>
                        {item.statusi == 'Aktiv' ? <Button className='btn btn-success '>
                            <FontAwesomeIcon  icon={faCheck} />
                        </Button>: null}
                        </td>
                    </>
                    ) : null}
                </tr>
                ))}

                </tbody>
            </Table>
            </div>
        </Row>
        <ToastContainer />
        <ModalPerPyetje show={modalPerPyetje} handleClose={closeModalPerPyetje} handleConfirm={confirmModal} />
    </Container>
  )
}

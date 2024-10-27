import { useState,useEffect } from 'react'
import { Container,Row,Col,Button,Table,Form,Spinner } from 'react-bootstrap'
import KerkoSubjektin from './KerkoSubjektin'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from './ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateServise from './UpdateServise'
import useAuthData from '../useAuthData';

export default function Serviset() {
    const [loading,setLoading] = useState(true)
    const [selectedSubjekti, setSelectedSubjekti] = useState({ emertimi: "", kontakti: "", subjektiID: null });
    const [serviset,setServiset] = useState([])
    const [filteredServiset,setFilteredServiset] = useState([])
    const [kontakti,setKontakti] = useState(selectedSubjekti.kontakti)
    const [komenti,setKomenti] = useState()
    const [aKaData,setAKaData] = useState(false)
    const [aKaAdapter,setAKaAdapter] = useState(false)
    const [aKaÇante,setAKaÇante] = useState(false)
    const [aKaGarancion,setAKaGarancion] = useState(false)
    const [shifraGarancionit,setShifraGarancionit] = useState('')
    const [idPerAnulim,setIdPerAnulim] = useState()
    const [modalPerPyetje,setModalPerPyetje] = useState(false)
    const [filterDataPranimit, setFilterDataPranimit] = useState('');
    const [filterShifra, setFilterShifra] = useState('');
    const [filterSubjekti, setFilterSubjekti] = useState('');
    const [filterKontakti, setFilterKontakti] = useState('');
    const [filterStatusi, setFilterStatusi] = useState('Aktiv');
    const [modalPerUpdate,setModalPerUpdate] = useState(false)
    const [data,setData] = useState({})
    const [updateType,setUpdateType] = useState()
    const {nderrimiID} = useAuthData()

    useEffect(() => {
        window.api.fetchTableServisi().then(receivedData => {
          setServiset(receivedData);
          setFilteredServiset(receivedData.filter(item => item.statusi === 'Aktiv')); // Default filtering to 'Aktiv'
          setLoading(false);
        });

    }, []);

    useEffect(() => {
        // Filtering logic that applies on change
        let filteredData = serviset;

        if (filterDataPranimit) {
            filteredData = filteredData.filter(item =>
                new Date(item.dataPranimit).toISOString().split('T')[0] === filterDataPranimit
            );
        }

        if (filterShifra) {
            filteredData = filteredData.filter(item =>
                item.shifra.includes(filterShifra)
            );
        }

        if (filterSubjekti) {
            filteredData = filteredData.filter(item =>
                item.subjekti.toLowerCase().includes(filterSubjekti.toLowerCase())
            );
        }

        if (filterKontakti) {
            filteredData = filteredData.filter(item =>
                item.kontakti.toLowerCase().includes(filterKontakti.toLowerCase())
            );
        }

        filteredData = filteredData.filter(item =>
            item.statusi === filterStatusi
        );

        setFilteredServiset(filteredData);
    }, [filterDataPranimit, filterShifra, filterSubjekti, filterKontakti, filterStatusi, serviset]);

    
    const handleSelectSubjekti = (result) => {
        setSelectedSubjekti({
          emertimi: result.emertimi,
          kontakti: result.kontakti,
          subjektiID: result.subjektiID,
        });
        setKontakti(result.kontakti)
      };
    
    const checkData = () => {
        if(selectedSubjekti.emertimi.length > 1){
            if(aKaGarancion){
                if(shifraGarancionit.length < 1) {
                    toast.warning('Duhet te shenoni shifren e garancionit!')
                }else{
                    handleShtoServisin()
                    console.log('asd')
                }
            }else{
                handleShtoServisin()
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
                    nderrimiID,
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
    
    const handleShowUpdateModal = (data,type) => {
        setData(data)
        setUpdateType(type)
        setModalPerUpdate(true)
    }
    const closeModalPerUpdate = () => {
        setModalPerUpdate(false)
    }
  return (
    <Container fluid className='mt-5'>
        <Row className='bg-light'>
            <Form className=" rounded-3 ">
                <h4 className="text-center mb-3 fw-bold border-bottom">Prano Servisin:</h4>
            
                <Col className="d-flex flex-row justify-content-start mb-2">
                    <Form.Group className="me-3" >
                        <Form.Label className="fw-bold">Klienti</Form.Label>
                        <KerkoSubjektin
                            filter="klient"
                            value={selectedSubjekti.emertimi}
                            onSelect={handleSelectSubjekti}
                            className="form-control form-control-lg bg-dark"
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="fw-bold">Kontakti</Form.Label>
                        <Form.Control
                            type="number"
                            value={kontakti} onChange={(e) => setKontakti(e.target.value)}
                            className="form-control form-control-lg"
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

                <Col className="d-flex flex-row justify-content-between">
                    <Form.Group >
                        <Form.Label className="fw-bold ">Komenti:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-lg"
                            placeholder="Shto komente për servisin..."
                            onChange={(e) => setKomenti(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="success" className='fs-5 h-25 m-5 p-3' onClick={() => checkData()} disabled={loading}>
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
                    
                </Col>

                
            </Form>
        </Row>
        <hr/>
        <Row className="mt-4">
                <Form className="p-3 bg-light rounded">
                    <Row>
                        <Col>
                            <Form.Group>
                                <Form.Label>Data Pranimit</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filterDataPranimit}
                                    onChange={(e) => setFilterDataPranimit(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Shifra</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={filterShifra}
                                    placeholder="Shifra..."
                                    onChange={(e) => setFilterShifra(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Subjekti</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={filterSubjekti}
                                    placeholder="Subjekti..."
                                    onChange={(e) => setFilterSubjekti(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Kontakti</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={filterKontakti}
                                    placeholder="Kontakti..."
                                    onChange={(e) => setFilterKontakti(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Statusi</Form.Label>
                                <Form.Check
                                    type="switch"
                                    label={filterStatusi === 'Aktiv' ? 'Aktiv' : 'Perfunduar'}
                                    checked={filterStatusi === 'Aktiv'}
                                    onChange={() => setFilterStatusi(filterStatusi === 'Aktiv' ? 'Perfunduar' : 'Aktiv')}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Row>
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
                    {filterStatusi != 'Aktiv' ? <><th scope="col">Totali per Pagese</th>
                        <th scope="col">Mbetja per Pagese</th></>:null}
                    <th scope="col">Data dhe Ora e Pranimit</th>
                    {filterStatusi == 'Aktiv' ? null : <th scope="col">Data e Perfundimit</th>}
                    <th scope="col">Perdoruesi</th>
                    <th scope="col">Statusi</th>
                    <th scope="col">Garancioni</th>
                    <th scope="col">Opsionet</th>
                </tr>
                </thead>
                <tbody>
                {filteredServiset.slice().reverse().map((item, index) => (
                <tr key={index}>
                    {item.transaksioniID != 0 ? (
                    <>
                        <th scope="row">{serviset.length - index}</th>
                        <td>{item.shifra}</td>
                        <td>{item.subjekti}</td>
                        <td>{item.kontakti}</td>
                        <td>{item.komenti}</td>
                        <td>{item.pajisjetPercjellese}</td>
                        {filterStatusi != 'Aktiv' ? 
                        <>
                        <td>{item.totaliPerPagese == null ? null : item.totaliPerPagese.toFixed(2)}€</td>
                        <td>{item.mbetjaPageses == null ? null : item.mbetjaPageses.toFixed(2)}€</td>
                        </>:null}
                        <td>{item.dataPranimit.toLocaleDateString()}<br/>{item.dataPranimit.toLocaleTimeString()}</td>
                        {filterStatusi != 'Aktiv' ? 
                        <>
                        {item.dataPerfundimit != null ? <td>{item.dataPerfundimit.toLocaleDateString()}<br/>{item.dataPerfundimit.toLocaleTimeString()}</td> : null}
                        </>:null}
                        <td>{item.perdoruesi}</td>
                        <td className={item.statusi == 'Perfunduar' ? 'text-success fw-bold' : 'fw-bold text-danger'}>{item.statusi}</td>
                        <td>{item.shifraGarancionit}</td>
                        <td>
                        {item.statusi == 'Aktiv' ?
                       <>
                        <Button className='btn btn-primary' onClick={() => handleShowUpdateModal(item,item.statusi)}>
                            <FontAwesomeIcon icon={faPen} />
                        </Button>
                        <Button className='btn bg-danger m-1 border-danger' onClick={() => thirreModal(item.servisimiID)}>
                            <FontAwesomeIcon  icon={faTrashCan} />
                        </Button>
                         <Button className='btn btn-success ' onClick={() => handleShowUpdateModal(item,'perfundo')}>
                            <FontAwesomeIcon  icon={faCheck} />
                        </Button></>: null}
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
        <UpdateServise show={modalPerUpdate} handleClose={closeModalPerUpdate} updateType={updateType} data = {data} />
    </Container>
  )
  
}

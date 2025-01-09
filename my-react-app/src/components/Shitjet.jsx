import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan,faEdit,faChevronDown,faChevronRight,faFilePdf,faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from './ModalPerPyetje';
import AnimatedSpinner from './AnimatedSpinner'
import DetajePerShitjeBlerje from './DetajePerShitjeBlerje';
import { useNavigate } from 'react-router-dom';
import ShtoPagese from './ShtoPagese';

export default function Shitjet() {
    const navigate = useNavigate()
    const [shitjet, setShitjet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`);
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10)); // Default to current date
    const [showModalPerPyetje, setShowModalPerPyetje] = useState(false);
    const [shitjeIDPerAnulim, setShitjeIDPerAnulim] = useState();
    const [transaksioniIDPerAnulim, setTransaksioniIDPerAnulim] = useState();
    const [IDPerDetaje,setIDPerDetaje] = useState()
    const [llojiShitjes,setLlojiShitjes] = useState()
    const [shifraPerDetaje,setShifraPerDetaje] = useState()
    const [dataPerShtoPagese,setDataPerShtoPagese] = useState()
    const [showShtoPagese,setShowShtoPagese] = useState(false)
    useEffect(() => {
        window.api.fetchTableShitje().then((receivedData) => {
            setShitjet(receivedData);
            setLoading(false);
        });
       
    }, []);    

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleClientChange = (e) => setClientFilter(e.target.value);
    const handleUserChange = (e) => setUserFilter(e.target.value);
    const handleStartDateChange = (e) => setStartDate(e.target.value);
    const handleEndDateChange = (e) => setEndDate(e.target.value);

    const filteredShitjet = shitjet.filter(item => {
        const itemDate = new Date(item.dataShitjes).toISOString().slice(0, 10);
        return (
            item.shifra.toLowerCase().includes(searchTerm.toLowerCase()) &&
            item.subjekti.toLowerCase().includes(clientFilter.toLowerCase()) &&
            item.perdoruesi.toLowerCase().includes(userFilter.toLowerCase()) &&
            (!startDate || itemDate >= startDate) &&
            (!endDate || itemDate <= endDate)
        );
    });

    const thirreModalPerPyetje = (shitjeIDPerAnulim,transaksioniIDPerAnulim,llojiShitjes) => {
        setShowModalPerPyetje(true);
        setLlojiShitjes(llojiShitjes)
        setShitjeIDPerAnulim(shitjeIDPerAnulim);
        setTransaksioniIDPerAnulim(transaksioniIDPerAnulim)
    };
    
    const handleConfirmModal = () => {
        handleDeleteShitje();
    };
    const handleCloseModalPerPyetje = () => {
        setShowModalPerPyetje(false);
    };
    
    const handleDeleteShitje = async () => {
        const data = {
            lloji: 'Shitje',
            transaksioniID: transaksioniIDPerAnulim,
        };
        let result
        if(llojiShitjes == 'dyqan'){
            console.log('innnn',data)
             result = await window.api.anuloShitjen(data);
        }else if (llojiShitjes == 'online'){
            result = await window.api.anuloPorosineOnline(shitjeIDPerAnulim)
        }
        if (result.success) {
            toast.success(`Shitja u Anulua me Sukses !`, {
                position: 'top-center',
                autoClose: 1500,
                onClose: () => window.location.reload(),
            });
        } else {
            toast.error('Gabim gjate Anulimit: ' + result.error);
        }
    };

    const shfaqProduktetEShitjes = (ID,shifra) => {
        setShifraPerDetaje(shifra)
       if(IDPerDetaje == ID){
            setIDPerDetaje(null)
       }else{
            setIDPerDetaje(ID)
            
       }
}   
const kontrolloStatusinGarancionit = (koha, dataShitjes) => {
    const dataAktuale = new Date(); // Data aktuale
    const dataSkadimit = new Date(dataShitjes);

    // Shto muajt e garancionit
    dataSkadimit.setMonth(dataSkadimit.getMonth() + koha);
    
    // Kontrollo nëse garancioni ka skaduar
    if (dataAktuale >= dataSkadimit) {
        return "I Skaduar";
    } else {
        // Llogarit ditët e mbetura
        const diferencaNeMs = dataSkadimit - dataAktuale;
        const diteMbetura = Math.floor(diferencaNeMs / (1000 * 60 * 60 * 24));

        return `${diteMbetura} Ditë te Mbetura`;
    }
};

const hapePdf = async (shifra) =>{
    const folderPath = 'C:\\Users\\BerdynaTech\\Documents\\btechPDFtest'
    const filePath = folderPath + '\\Garancioni ' + shifra +'.pdf'
    await window.api.openFile(filePath );
}

const hapeShtoPagese = (item) =>{
    setDataPerShtoPagese({
        ...item,
        llojiDokumentit:'shitje',
        IDDokumentit:item.shitjeID
    })
    setShowShtoPagese(true)
}

    return (
        <Container fluid className="pt-5">
            <h4 className="text-center fw-bold">Të Gjitha Shitjet:</h4>
            <hr />

            <Row className="mb-3 p-1 ">
                <Col md={2}>
                    <Form.Control
                        type="text"
                        placeholder="Kërko sipas shifrës"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </Col>
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder="Kërko sipas klientit"
                        value={clientFilter}
                        onChange={handleClientChange}
                    />
                </Col>
                <Col md={3}>
                    <Form.Control
                        type="text"
                        placeholder="Kërko sipas përdoruesit"
                        value={userFilter}
                        onChange={handleUserChange}
                    />
                </Col>
                <Col md={2}>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                    />
                </Col>
                <Col md={2} className=''>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                    />
                </Col>
            </Row>

            {loading ? (
                <div className="d-flex justify-content-center">
                    <AnimatedSpinner animation="border" />
                </div>
            ) : (
                <Row>
                    <Col>
                        {filteredShitjet.length < 1 ? (
                            <h5 className="text-center text-danger mt-5">
                                Nuk Ekzistojnë Shitje në këtë Interval Kohor!
                            </h5>
                        ) : (
                            <div className=" my-3 tabelaTransaksioneve">
                                <div className="table-responsive tableHeight50">
                                    <table className="table table-sm table-striped border table-hover text-center">
                                        <thead className="table-secondary">
                                            <tr className="fs-5">
                                                <th scope="col">Nr</th>
                                                <th scope="col">Shifra</th>
                                                <th scope="col">Lloji</th>
                                                <th scope="col">Totali Per Pagese</th>
                                                <th scope="col">Totali Pageses</th>
                                                <th scope="col">Mbetja Per Pagese</th>
                                                <th scope="col">Subjekti</th>
                                                <th scope="col">Nderrimi dhe Data e Shitjes</th>
                                                <th scope="col">Menyra e Pageses</th>
                                                <th scope="col">Perdoruesi</th>
                                                <th scope="col">Nr Porosise</th>
                                                <th scope="col">Koha dhe Statusi Garancionit</th>
                                                <th scope="col">Opsionet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-dark">
                                            {filteredShitjet.slice().reverse().map((item, index) => (
                                                <tr key={index} >
                                                    <th scope="row">{filteredShitjet.length - index}</th>
                                                    <td>{item.shifra}</td>
                                                    <td>{item.lloji}</td>
                                                    <td>{item.totaliPerPagese} €</td>
                                                    <td>{item.totaliPageses} €</td>
                                                    <td className={item.mbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{item.mbetjaPerPagese.toFixed(2)} €</td>
                                                    <td>{item.subjekti}</td>
                                                    <td>{item.numriPercjelles + '-' + new Date(item.dataFillimit).toLocaleDateString()}</td>
                                                    <td>{item.menyraPageses}</td>
                                                    <td>{item.perdoruesi}</td>
                                                    <td>{item.nrPorosise}</td>
                                                    <td>{item.kohaGarancionit > 1 ? <>{item.kohaGarancionit} Muaj / {kontrolloStatusinGarancionit(item.kohaGarancionit,item.dataShitjes)}</>:'Pa Garancion'}</td>
                                                    <td >
                                                       <Col className="d-flex flex-wrap-flex-row justify-content-center align-items-center mt-1">
                                                        <Button variant="btn btn-outline-primary" onClick={() => navigate(`/ndryshoShitjen/${item.shitjeID}`)}>
                                                                <FontAwesomeIcon  icon={faEdit} />
                                                            </Button>
                                                            <Button variant="btn btn-outline-danger" className='mx-2' onClick={() => thirreModalPerPyetje(item.shitjeID,item.transaksioniID,item.lloji)}>
                                                                <FontAwesomeIcon  icon={faTrashCan} />
                                                            </Button>
                                                            <Button variant='btn btn-outline-transparent'   onClick={() => shfaqProduktetEShitjes(item.shitjeID,item.shifra)} 
                                                                    >
                                                            <FontAwesomeIcon 
                                                                    className={` ${IDPerDetaje === item.shitjeID ? 'text-primary fs-4 fw-bold' : 'text-secondary fw-bold'}`}
                                                                    icon={IDPerDetaje === item.shitjeID ? faChevronDown : faChevronRight}
                                                                />
                                                            </Button>
                                                            <Button variant="" className='mx-2 btn btn-link' onClick={() => hapePdf(item.shifra)} disabled = {item.kohaGarancionit < 1}>
                                                                <FontAwesomeIcon  icon={faFilePdf} />
                                                            </Button>
                                                            <Button variant="btn btn-outline-success"  onClick={() => hapeShtoPagese(item)} disabled={item.mbetjaPerPagese == 0 || item.lloji == 'online'}>
                                                                <FontAwesomeIcon  icon={faEuroSign} />
                                                            </Button>
                                                       </Col>
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

            {IDPerDetaje ? <>
                <DetajePerShitjeBlerje shifraPerDetaje = {shifraPerDetaje}  IDPerDetaje = {IDPerDetaje} lloji = {'shitje'} />
                </>:null}

            <ToastContainer />
            <ModalPerPyetje show={showModalPerPyetje} handleClose={handleCloseModalPerPyetje} handleConfirm={handleConfirmModal} />
            <ShtoPagese show={showShtoPagese} handleClose={() => setShowShtoPagese(false)} data={dataPerShtoPagese} />
        </Container>
    );
}

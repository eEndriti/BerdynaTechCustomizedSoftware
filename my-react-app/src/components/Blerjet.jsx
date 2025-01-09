import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faEdit,faChevronRight,faChevronDown,faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from './ModalPerPyetje';
import DetajePerShitjeBlerje from './DetajePerShitjeBlerje';
import AnimatedSpinner from './AnimatedSpinner';
import { formatCurrency } from '../useAuthData';
import ShtoPagese from './ShtoPagese';

export default function Blerjet() {
    const [blerjet, setBlerjet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`);
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10)); 
    const [showModalPerPyetje, setShowModalPerPyetje] = useState(false);
    const [idPerAnulim, setIdPerAnulim] = useState();
    const [IDPerDetaje,setIDPerDetaje] = useState()
    const [shifraPerDetaje,setShifraPerDetaje] = useState()
    const [dataPerShtoPagese,setDataPerShtoPagese] = useState()
    const [showShtoPagese,setShowShtoPagese] = useState(false)

    useEffect(() => {
        window.api.fetchTableBlerje().then((receivedData) => {
            setBlerjet(receivedData);
            setLoading(false);
        });
    }, []);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleClientChange = (e) => setClientFilter(e.target.value);
    const handleUserChange = (e) => setUserFilter(e.target.value);
    const handleStartDateChange = (e) => setStartDate(e.target.value);
    const handleEndDateChange = (e) => setEndDate(e.target.value);

    const filteredBlerjet = blerjet.filter(item => {
        const itemDate = new Date(item.dataBlerjes).toISOString().slice(0, 10);
        return (
            item.shifra.toLowerCase().includes(searchTerm.toLowerCase()) &&
            item.klienti.toLowerCase().includes(clientFilter.toLowerCase()) &&
            item.perdoruesi.toLowerCase().includes(userFilter.toLowerCase()) &&
            (!startDate || itemDate >= startDate) &&
            (!endDate || itemDate <= endDate)
        );
    });

    const thirreModalPerPyetje = (idPerAnulim) => {
        setShowModalPerPyetje(true);
        setIdPerAnulim(idPerAnulim);
    };
    
    const handleConfirmModal = () => {
        handleDeleteBlerje();
    };
    
    const handleCloseModalPerPyetje = () => {
        setShowModalPerPyetje(false);
    };
    
    const handleDeleteBlerje = async () => {
        const data = {
            lloji: 'Blerje',
            transaksioniID: idPerAnulim,
        };

        const result = await window.api.anuloBlerjen(data);

        if (result.success) {
            toast.success(`Blerja u Anulua me Sukses !`, {
                position: 'top-center',
                autoClose: 1500,
                onClose: () => window.location.reload(),
            });
        } else {
            toast.error('Gabim gjate Anulimit: ' + result.error);
        }
    };
    const shfaqProduktetEBlerjes = (ID,shifra) => {
        setShifraPerDetaje(shifra)
       if(IDPerDetaje == ID){
            setIDPerDetaje(null)
       }else{
            setIDPerDetaje(ID)
       }
}   

const hapeShtoPagese = (item) =>{
    setDataPerShtoPagese({
        ...item,
        llojiDokumentit:'blerje',
        IDDokumentit:item.blerjeID,
        subjekti:item.klienti
    })
    console.log('prejblej',dataPerShtoPagese)
    setShowShtoPagese(true)
}
    return (
        <Container fluid>
            <h4 className="text-center fw-bold pt-4">Të Gjitha Blerjet:</h4>
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
                        {filteredBlerjet.length < 1 ? (
                            <h5 className="text-center text-danger mt-5">
                                Nuk Ekzistojnë Blerje në këtë Interval Kohor!
                            </h5>
                        ) : (
                            <div className=" my-3 tabelaTransaksioneve">
                                <div className="table-responsive tableHeight50">
                                    <table className="table table-sm table-striped border table-hover text-center">
                                        <thead className="table-secondary">
                                            <tr className="fs-5">
                                                <th scope="col">Nr</th>
                                                <th scope="col">Shifra</th>
                                                <th scope="col">Klienti</th>
                                                <th scope="col">Totali Per Pagese</th>
                                                <th scope="col">Totali Pageses</th>
                                                <th scope="col">Mbetja Per Pagese</th>
                                                <th scope="col">Perdoruesi</th>
                                                <th scope="col">Nderrimi dhe Data e Blerjes</th>
                                                <th scope="col">Data e Fatures</th>
                                                <th scope="col">Fature e Rregullt</th>
                                                <th scope="col">Nr i Fatures</th>
                                                <th scope="col">Menyra e Pageses</th>
                                                <th scope="col">Opsionet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-dark">
                                            {filteredBlerjet.slice().reverse().map((item, index) => (
                                                <tr key={index}>
                                                    <th scope="row">{filteredBlerjet.length - index}</th>
                                                    <td>{item.shifra}</td>
                                                    <td>{item.klienti}</td>
                                                    <td>{formatCurrency(item.totaliPerPagese)} </td>
                                                    <td>{formatCurrency(item.totaliPageses)} </td>
                                                    <td className={item.mbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{formatCurrency(item.mbetjaPerPagese)}</td>
                                                    <td>{item.perdoruesi}</td>
                                                    <td>{item.numriPercjelles + '-' + new Date(item.dataBlerjes).toLocaleDateString()}</td>
                                                    <td>{new Date(item.dataFatures).toLocaleDateString()}</td>
                                                    <td>{item.fatureERregullt === 'true' ? 'Po' : 'Jo'}</td>
                                                    <td>{item.nrFatures}</td>
                                                    <td>{item.menyraPagesese}</td>
                                                    <td className='d-flex flex-row justify-content-around'>
                                                        <Button variant='btn btn-outline-primary' className='mx-1'>
                                                            <FontAwesomeIcon  icon={faEdit} />
                                                        </Button>
                                                        <Button variant="btn btn-outline-danger"  className='mx-1' onClick={() => thirreModalPerPyetje(item.transaksioniID)}>
                                                            <FontAwesomeIcon  icon={faTrashCan} />
                                                        </Button>
                                                        <Button variant='btn btn-outline-transparent'  className='mx-1'  onClick={() => shfaqProduktetEBlerjes(item.blerjeID,item.shifra)} 
                                                                 >
                                                        <FontAwesomeIcon 
                                                                className={` ${IDPerDetaje === item.blerjeID ? 'text-primary fs-4 fw-bold' : 'text-secondary fw-bold'}`}
                                                                icon={IDPerDetaje === item.blerjeID ? faChevronDown : faChevronRight}
                                                            />
                                                        </Button>
                                                        <Button variant="btn btn-outline-success"  className='mx-1' onClick={() => hapeShtoPagese(item)} disabled={item.mbetjaPerPagese == 0 }>
                                                            <FontAwesomeIcon  icon={faEuroSign} />
                                                        </Button>
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
                <DetajePerShitjeBlerje shifraPerDetaje = {shifraPerDetaje}  IDPerDetaje = {IDPerDetaje} lloji = {'blerje'}/>
                </>:null}

            <ToastContainer />
            <ModalPerPyetje show={showModalPerPyetje} handleClose={handleCloseModalPerPyetje} handleConfirm={handleConfirmModal} />
            <ShtoPagese show={showShtoPagese} handleClose={() => setShowShtoPagese(false)} data={dataPerShtoPagese} />

        </Container>
    );
}

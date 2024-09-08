import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from './ModalPerPyetje';

export default function Shitjet() {
    const [shitjet, setShitjet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10)); // Default to current date
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10)); // Default to current date
    const [showModalPerPyetje, setShowModalPerPyetje] = useState(false);
    const [idPerAnulim, setIdPerAnulim] = useState();

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
        console.log('item',item)
        return (
            item.shifra.toLowerCase().includes(searchTerm.toLowerCase()) &&
            item.subjekti.toLowerCase().includes(clientFilter.toLowerCase()) &&
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
        handleDeleteShitje();
    };
    
    const handleCloseModalPerPyetje = () => {
        setShowModalPerPyetje(false);
    };
    
    const handleDeleteShitje = async () => {
        const data = {
            lloji: 'Shitje',
            transaksioniID: idPerAnulim,
        };

        const result = await window.api.anuloTransaksionin(data);

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

    return (
        <Container>
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
                    <Spinner animation="border" />
                </div>
            ) : (
                <Row>
                    <Col>
                        {filteredShitjet.length < 1 ? (
                            <h5 className="text-center text-danger mt-5">
                                Nuk Ekzistojnë Shitje në këtë Interval Kohor!
                            </h5>
                        ) : (
                            <div className="container my-3 tabelaTransaksioneve">
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
                                                <th scope="col">Data e Shitjes</th>
                                                <th scope="col">Menyra e Pageses</th>
                                                <th scope="col">Perdoruesi</th>
                                                <th scope="col">Nr Porosise</th>
                                                <th scope="col">Nderrimi</th>
                                                <th scope="col">Opsionet</th>
                                            </tr>
                                        </thead>
                                        <tbody className="border-dark">
                                            {filteredShitjet.slice().reverse().map((item, index) => (
                                                <tr key={index}>
                                                    <th scope="row">{filteredShitjet.length - index}</th>
                                                    <td>{item.shifra}</td>
                                                    <td>{item.lloji}</td>
                                                    <td>{item.totaliPerPagese} €</td>
                                                    <td>{item.totaliPageses} €</td>
                                                    <td>{item.mbetjaPerPagese} €</td>
                                                    <td>{item.subjekti}</td>
                                                    <td>{new Date(item.dataShitjes).toLocaleDateString()}</td>
                                                    <td>{item.menyraPageses}</td>
                                                    <td>{item.perdoruesi}</td>
                                                    <td>{item.nrPorosise}</td>
                                                    <td>{item.numriPercjelles + '-' + new Date(item.dataNderrimit).toLocaleDateString()}</td>
                                                    <td className="text-center">
                                                        <Button variant="primary" className="m-2">
                                                            <FontAwesomeIcon className="mt-1" icon={faPen} />
                                                        </Button>
                                                        <Button variant="danger" onClick={() => thirreModalPerPyetje(item.transaksioniID)}>
                                                            <FontAwesomeIcon className="mt-1" icon={faTrashCan} />
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
            <ToastContainer />
            <ModalPerPyetje show={showModalPerPyetje} handleClose={handleCloseModalPerPyetje} handleConfirm={handleConfirmModal} />
        </Container>
    );
}

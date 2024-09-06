import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan,faPen } from '@fortawesome/free-solid-svg-icons'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Blerjet() {
    const [blerjet, setBlerjet] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
   

    useEffect(() => {
        window.api.fetchTableBlerje().then((receivedData) => {
            setBlerjet(receivedData);
            setLoading(false);
        });
    }, []);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleDateChange = (e) => setSelectedDate(e.target.value);
    const handleClientChange = (e) => setClientFilter(e.target.value);
    const handleUserChange = (e) => setUserFilter(e.target.value);
   
    const filteredBlerjet = blerjet.filter(item => 
        item.shifra.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedDate ? new Date(item.dataBlerjes).toLocaleDateString() === new Date(selectedDate).toLocaleDateString() : true) &&
        (clientFilter ? item.klienti.toLowerCase().includes(clientFilter.toLowerCase()) : true) &&
        (userFilter ? item.perdoruesi.toLowerCase().includes(userFilter.toLowerCase()) : true) 
       
    );

    return (
        <Container>
            <h4 className='text-center fw-bold'>Të Gjitha Blerjet:</h4>
            <hr/>

            <Row className="mb-3">
                <Col md={3}>
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
                <Col md={3}>
                    <Form.Control 
                        type="date" 
                        value={selectedDate} 
                        onChange={handleDateChange} 
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
                    {filteredBlerjet.length < 1 ? 
                                        <>
                                            <h5 className='text-center text-danger mt-5'>Nuk Egzistojne Blerje ne kete Interval Kohor !</h5>
                                        </>
                                        :<>
                        <div className="container my-3 tabelaTransaksioneve ">
                            <div className="table-responsive tableHeight50">
                                <table className="table table-sm table-striped border table-hover text-center">
                                    <thead className="table-secondary">
                                        <tr className='fs-5'>
                                            <th scope="col">Nr</th>
                                            <th scope="col">Shifra</th>
                                            <th scope="col">Klienti</th>
                                            <th scope="col">Totali Per Pagese</th>
                                            <th scope="col">Totali Pageses</th>
                                            <th scope="col">Mbetja Per Pagese</th>
                                            <th scope="col">Perdoruesi</th>
                                            <th scope="col">Data e Blerjes</th>
                                            <th scope="col">Data e Fatures</th>
                                            <th scope="col">Fature e Rregullt</th>
                                            <th scope="col">Nr i Fatures</th>
                                            <th scope="col">Menyra e Pageses</th>
                                            <th scope="col">Nderrimi</th>
                                            <th scope="col">Opsionet</th>
                                        </tr>
                                    </thead>
                                    <tbody className='border-dark'>
                                        
                                        {filteredBlerjet.slice().reverse().map((item, index) => (
                                            <tr key={index}>
                                                        <th scope="row">{filteredBlerjet.length - index}</th>
                                                        <td>{item.shifra}</td>
                                                        <td>{item.klienti}</td>
                                                        <td>{item.totaliPerPagese} €</td>
                                                        <td>{item.totaliPageses} €</td>
                                                        <td>{item.mbetjaPerPagese} €</td>
                                                        <td>{item.perdoruesi}</td>
                                                        <td>{new Date(item.dataBlerjes).toLocaleDateString()}</td>
                                                        <td>{new Date(item.dataFatures).toLocaleDateString()}</td>
                                                        <td>{item.fatureERregullt === 'true' ? 'Po' : 'Jo'}</td>
                                                        <td>{item.nrFatures}</td>
                                                        <td>{item.menyraPagesese}</td>
                                                        <td>{item.numriPercjelles + '-' + new Date(item.dataNderrimit).toLocaleDateString()}</td>
                                                        <td className='text-center'>
                                                            <Button variant='primary' className='m-2'>
                                                                <FontAwesomeIcon className=" mt-1" icon={faPen} />
                                                            </Button>
                                                            <Button variant='danger' >
                                                                <FontAwesomeIcon className="mt-1" icon={faTrashCan} />
                                                            </Button>
                                                        </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </>}
                    </Col>
                </Row>
            )}
            <ToastContainer />
        </Container>
    );
}
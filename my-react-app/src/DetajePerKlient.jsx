import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner,Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye,faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DetajePerKlient() {
    const { subjektiID } = useParams();
    const [klienti, setKlienti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shitjet,setShitjet] = useState([])
    const [pagesat,setPagesat] = useState([])
    const [icon,setIcon] = useState(faEyeSlash)
    useEffect(() => {
        window.api.fetchTableSubjekti().then((receivedData) => {
            const filteredData = receivedData.filter((item) => item.subjektiID == subjektiID);
            setKlienti(filteredData);
            setLoading(false);
        });
    }, [subjektiID]);

    useEffect(() => {
        window.api.fetchTableShitje().then((receivedData) => {
            console.log('sh',receivedData)
            const filteredData = receivedData.filter((item) => item.subjektiID == subjektiID);
            setShitjet(filteredData);
            setLoading(false);
        });
    }, []);
    useEffect(() => {
        window.api.fetchTablePagesa().then((receivedData) => {
            const filteredData = receivedData.filter((item) => item.subjektiID == subjektiID);
            setPagesat(filteredData);
            setLoading(false);
        });
    }, [subjektiID]);

    console.log('shitjet',shitjet)

    const detajetEPagesave = (shifra) =>{

    }
    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            </div>
        );
    }

    if (klienti.length === 0) {
        return <h5 className="text-center text-danger">Nuk u gjet asnjë klient!</h5>;
    }

    return (
        <Container>
            <Row>
                <Col className='d-flex flex-row'>
                    <Form.Group className='d-flex flex-row'>
                        <Form.Label>Klienti:</Form.Label>
                        <Form.Control className="m-2" type="text" value={klienti[0].emertimi} disabled />
                    </Form.Group>
                    <Form.Group className='d-flex flex-row'>
                        <Form.Label>Kontakti:</Form.Label>
                        <Form.Control className="m-2" type="number" value={klienti[0].kontakti} disabled />
                    </Form.Group>
                </Col>
            </Row>
           
    {loading ? (
        <div className="d-flex justify-content-center">
            <Spinner animation="border" />
        </div>
    ) : (
        <Row>
            <Col>
                {shitjet.length < 1 ? (
                    <h5 className="text-center text-danger mt-5">
                        Klienti nuk ndonje transaksion te regjistruar!
                    </h5>
                ) : (
                    <div className="container my-3 ">
                        <div className="table-responsive tableHeight50">
                            <table className="table table-sm table-striped border table-hover text-center">
                                <thead className="table-secondary">
                                    <tr className="fs-5">
                                        <th scope="col">Nr</th>
                                        <th scope="col">Shifra e Shitjes</th>
                                        <th scope="col">Totali Per Pagese</th>
                                        <th scope="col">Totali Pageses</th>
                                        <th scope="col">Mbetja Per Pagese</th>
                                        <th scope="col">Data Shitjes</th>
                                        <th scope="col">Nr Pagesave</th>
                                    </tr>
                                </thead>
                                <tbody className="border-dark">
                                    {shitjet.slice().reverse().map((item, index) => (
                                        <tr key={index}>
                                            <th scope="row">{shitjet.length - index}</th>
                                            <td>{item.shifra}</td>
                                            <td>{item.totaliPerPagese} €</td>
                                            <td>{item.totaliPageses} €</td>
                                            <td className={item.mbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{item.mbetjaPerPagese} €</td>
                                            <td>{new Date(item.dataShitjes).toLocaleDateString()}</td>
                                            <td className='fw-bold'>{pagesat.filter(pagesa => pagesa.shifra === item.shifra).length} 
                                                <FontAwesomeIcon className='px-3 text-secondary' onMouseOver={() => setIcon(faEye)} onMouseLeave={() => setIcon(faEyeSlash)} onClick={() => detajetEPagesave(item.shifra)} icon={icon} /></td>
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
        </Container>
    );
}

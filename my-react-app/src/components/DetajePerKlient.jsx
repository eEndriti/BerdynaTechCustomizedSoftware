import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner,Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function DetajePerKlient() {
    const { subjektiID,lloji } = useParams();
    const [subjekti, setSubjekti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shitjet, setShitjet] = useState([]);
    const [blerjet,setBlerjet] = useState([])
    const [pagesat, setPagesat] = useState([]);
    const [activeShifra, setActiveShifra] = useState(null); 
    const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`);
    const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));

    useEffect(() => {
        window.api.fetchTableSubjekti().then((receivedData) => {
            const filteredData = receivedData.filter((item) => item.subjektiID == subjektiID);
            setSubjekti(filteredData);
            setLoading(false);
        });
    }, [subjektiID]);

    useEffect(() => {
        window.api.fetchTableShitje().then((receivedData) => {
            const filteredData = receivedData.filter((item) => item.subjektiID == subjektiID);
            setShitjet(filteredData);
            setLoading(false);
        });
    }, [subjektiID]);

    useEffect(() => {
        window.api.fetchTableBlerje().then((receivedData) => {
            const filteredData = receivedData.filter((item) => item.subjektiID == subjektiID);
            setBlerjet(filteredData);
            setLoading(false);
        });
    }, [subjektiID]);

    let filteredTransaksionet

    if(lloji == 'klient'){
         filteredTransaksionet =  shitjet.filter(item => {
            const itemDate = new Date(item.dataShitjes);
            return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        });
    }else{
         filteredTransaksionet =  blerjet.filter(item => {
            const itemDate = new Date(item.dataBlerjes);
            return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        });
    }
    

    useEffect(() => {
        window.api.fetchTablePagesa().then((receivedData) => {
            const filteredData = receivedData.filter((item) => item.subjektiID == subjektiID);
            setPagesat(filteredData);
            setLoading(false);
        });
    }, [subjektiID]);

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
      };
    
      const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
      };

    const detajetEPagesave = (shifra) => {
        if (activeShifra === shifra) {
            setActiveShifra(null); 
        } else {
            setActiveShifra(shifra); 
        }
    };
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); 
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };
    

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            </div>
        );
    }

    if (subjekti.length === 0) {
        return <h5 className="text-center text-danger">Nuk u gjet asnjë ${lloji}!</h5>;
    }

    return (
        <Container>
            <Row>
                <Col className='d-flex flex-row'>
                    <Form.Group className='d-flex flex-row'>
                        <Form.Label className='mt-3 fw-bold'>Klienti:</Form.Label>
                        <Form.Control className="m-2" type="text" value={subjekti[0].emertimi} disabled />
                    </Form.Group>
                    <Form.Group className='d-flex flex-row mx-3'>
                        <Form.Label className='mt-3 fw-bold'>Kontakti:</Form.Label>
                        <Form.Control className="m-2" type="number" value={subjekti[0].kontakti} disabled />
                    </Form.Group>
                </Col>
                <Col className='d-flex flex-column align-items-end'>
                    <h4 className='px-3 '>Transaksionet brenda Periudhes :</h4>
                   <Col className='d-flex flex-row '>
                    <Form.Group className='mx-1'>
                        <Form.Control
                            type='date'
                            value={startDate}
                            onChange={handleStartDateChange}
                        />
                        </Form.Group>
                        <Form.Group className='mx-1'>
                        <Form.Control
                            type='date'
                            value={endDate}
                            onChange={handleEndDateChange}
                        />
                        </Form.Group>
                   </Col>
                </Col>
            </Row>
           
            <Row>
                <Col>
                    {filteredTransaksionet.length < 1 ? (
                        <h5 className="text-center text-danger mt-5">
                            {lloji == 'klient' ? 'Klienti nuk ka ndonjë transaksion të regjistruar!' : 'Furnitori nuk ka ndonjë transaksion të regjistruar!'} 
                        </h5>
                    ) : (
                        <div className="container my-3">
                            <div className="table-responsive tableHeight50">
                                <table className="table table-sm table-striped border table-hover text-center">
                                    <thead className="table-secondary">
                                        <tr className="fs-5">
                                            <th scope="col">Nr</th>
                                            <th scope="col">Shifra e {lloji == 'klient' ? 'Shitjes' : 'Blerjes'}</th>
                                            <th scope="col">Totali Per Pagese</th>
                                            <th scope="col">Totali Pageses</th>
                                            <th scope="col">Mbetja Per Pagese</th>
                                            <th scope="col">Data e {lloji == 'klient' ? 'Shitjes' : 'Blerjes'}</th>
                                            <th scope="col">Nr Pagesave</th>
                                            <th scope="col">Detaje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-dark">
                                        {filteredTransaksionet.slice().reverse().map((item, index) => {
                                            const nrPagesave = item.totaliPageses === 0 ? 0 : pagesat.filter(pagesa => pagesa.shifra === item.shifra).length;
                                            
                                            return (
                                                <tr key={index}>
                                                    <th scope="row">{shitjet.length - index}</th>
                                                    <td>{item.shifra}</td>
                                                    <td>{item.totaliPerPagese} €</td>
                                                    <td>{item.totaliPageses} €</td>
                                                    <td className={item.mbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                                        {item.mbetjaPerPagese} €
                                                    </td>
                                                    {lloji == 'klient' ?  
                                                    <td>{new Date(item.dataShitjes).toLocaleDateString()}</td>
                                                    :  
                                                    <td>{new Date(item.dataBlerjes).toLocaleDateString()}</td>
                                                    }
                                                    <td className='fw-bold'>{nrPagesave}</td>
                                                    <td>
                                                        {nrPagesave > 0 && (
                                                            <FontAwesomeIcon 
                                                                className={`px-3 ${activeShifra === item.shifra ? 'text-primary' : 'text-secondary'}`}
                                                                onClick={() => detajetEPagesave(item.shifra)} 
                                                                icon={activeShifra === item.shifra ? faChevronDown : faChevronRight} 
                                                            />
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>

           {activeShifra ?
            <Row>
                    <hr/>

            <Col>
                    <div className='text-center'>
                        <h5>Pagesat e {lloji == 'klient' ? 'Shitjes' : 'Blerjes'} me Shifer: <span className='fs-3 fw-bold'>{activeShifra}</span></h5>
                    </div>
                    <div className="container my-3">
                        <div className="table-responsive tableHeight50">
                            <table className="table table-sm table-striped border table-hover text-center">
                                <thead className="table-secondary">
                                    <tr className="fs-5">
                                        <th scope="col">Nr</th>
                                        <th scope="col">Vlera e Pageses</th>
                                        <th scope="col">Data e Pageses</th>
                                        <th scope="col">Menyra e Pageses</th>
                                        <th scope="col">Opsionet</th>
                                    </tr>
                                </thead>
                                <tbody className="border-dark">
                                {pagesat
                                    .slice()
                                    .reverse()
                                    .filter(item => item.shifra === activeShifra) 
                                    .map((item, index,filteredPagesat) => (
                                        <tr key={index}>
                                        <th scope="row">{filteredPagesat.length - index}</th>
                                        <td className="fw-bold">{item.shumaPageses} €</td>
                                        <td>{new Date(item.dataPageses).toLocaleDateString()}</td>
                                        <td>{item.menyraPageses}</td>
                                        <td>
                                           ahhhhhhhh
                                        </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    </div>
                
            </Col>
            <hr/>

        </Row>
        :null}
    
        <Row >
            <Col className='d-flex flex-row m-5 pt-5 justify-content-center'>
                <Button variant='info' className='p-3 m-3 w-25 rounded fs-4'>Totali Per Pagese : <span className='fs-2'>{subjekti[0].totalTotaliPerPagese.toFixed(2)} €</span></Button> 
               <Button variant='success' className='p-3 m-3 w-25 rounded fs-4'>Totali i Paguar :<span className='fs-2'>{subjekti[0].totalTotaliPageses.toFixed(2)} €</span></Button>                     
               <Button variant='danger' className='p-3 m-3 w-25 rounded fs-4'>Mbetja per Pagese :<span className='fs-2'>{subjekti[0].totalMbetjaPerPagese.toFixed(2)} €</span></Button> 
            </Col>                                           
        </Row>
        </Container>
    );
}

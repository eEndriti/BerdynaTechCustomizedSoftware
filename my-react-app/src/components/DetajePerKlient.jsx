import { useState, useEffect,useMemo } from 'react';
import { Container, Row, Col, Form, Spinner, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight,faTrashCan,faEye } from '@fortawesome/free-solid-svg-icons';
import useAuthData, { formatCurrency } from '../useAuthData';
import AnimatedSpinner from './AnimatedSpinner';
import ModalPerPyetje from './ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DetajePerKlient() {
    const { subjektiID, lloji } = useParams();
    const [subjekti, setSubjekti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buttonLoading,setButtonLoading] = useState(false)
    const [shitjet, setShitjet] = useState([]);
    const [blerjet, setBlerjet] = useState([]);
    const [serviset, setServiset] = useState([]);
    const [pagesat, setPagesat] = useState([]);
    const [activeShifra, setActiveShifra] = useState(null); 
    const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`);
    const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
    const [profiti, setProfiti] = useState([]); 
    const [combinedData, setCombinedData] = useState([]);
    const [totals, setTotals] = useState({
        totalTotaliPerPagese: 0,
        totalTotaliPageses: 0,
        totalMbetjaPerPagese: 0
      });
    const [dataPerAnulimPagese,setDataPerAnulimPagese] = useState()
    const [modalPerPyetje,setModalPerPyetje] = useState(false)
    const {nderrimiID,perdoruesiID} = useAuthData()
      console.log('shitjet dhe serviset',combinedData,pagesat)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [subjektiData, shitjeData, blerjeData, servisiData, profitiResult, pagesaData] = await Promise.all([
                    window.api.fetchTableSubjekti(lloji),
                    window.api.fetchTableShitje(),
                    window.api.fetchTableBlerje(),
                    window.api.fetchTableServisi(),
                    window.api.fetchTableQuery(`SELECT SUM(p.shuma) AS TotalProfiti FROM profiti p JOIN shitje s ON p.transaksioniID = s.transaksioniID WHERE s.subjektiID = ${subjektiID};`),
                    window.api.fetchTablePagesa()
                ]);

                console.log(combinedData)
                // Process and filter data
                const filteredSubjekti = subjektiData.filter(item => item.subjektiID == subjektiID);
                const filteredShitjet = shitjeData.filter(item => item.subjektiID == subjektiID);
                const filteredBlerjet = blerjeData.filter(item => item.subjektiID == subjektiID);
                const filteredServiset = servisiData.filter(item => item.subjektiID == subjektiID);
                const filteredPagesa = pagesaData.filter(item => item.subjektiID == subjektiID);
        
                let combined 

                if(lloji == 'klient') {
                    combined = [...filteredShitjet, ...filteredServiset].map(item => ({
                        ...item,
                        mbetjaPerPagese: item.mbetjaPerPagese ?? item.mbetjaPageses
                    })).sort((a, b) => new Date(a.dataShitjes || a.dataPerfundimit) - new Date(b.dataShitjes || b.dataPerfundimit));
            
                }else{
                    combined = [...filteredBlerjet].map(item => ({
                        ...item,
                        mbetjaPerPagese: item.mbetjaPerPagese ?? item.mbetjaPageses
                    })).sort((a, b) => new Date(a.dataShitjes || a.dataPerfundimit) - new Date(b.dataShitjes || b.dataPerfundimit));
            
                }
                const totals = combined.reduce((acc, item) => {
                    acc.totalTotaliPerPagese += item.totaliPerPagese || 0;
                    acc.totalTotaliPageses += item.totaliPageses || 0;
                    acc.totalMbetjaPerPagese += item.mbetjaPerPagese || 0;
                    return acc;
                }, { totalTotaliPerPagese: 0, totalTotaliPageses: 0, totalMbetjaPerPagese: 0 });
                console.log('as',combined)

                // Update state
                setSubjekti(filteredSubjekti);
                setShitjet(filteredShitjet);
                setBlerjet(filteredBlerjet);
                setServiset(filteredServiset);
                setProfiti(profitiResult[0]?.TotalProfiti || 0);
                setPagesat(filteredPagesa);
                setCombinedData(combined);
                setTotals(totals);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [subjektiID, lloji]); // Include `lloji` since it's used in the API call
    

    const filteredTransaksionet = useMemo(() => {
        const data = lloji === 'klient' ? combinedData : blerjet;
        return data.filter(item => {
            const itemDate = new Date(item.dataShitjes || item.dataPerfundimit || item.dataBlerjes);
            return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        });
    }, [lloji, combinedData, blerjet, startDate, endDate]);
    

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
            <div className="d-flex justify-content-center pt-5 mt-5">
                <AnimatedSpinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            </div>
        );
    }

    if (subjekti.length == 0) {
        return <h5 className="text-center text-danger mt-5">Nuk u gjet asnjë {lloji}!</h5>;
    }

    const deletePagesa = (item) =>{
        let llojiDokumentit
        if(item.shifra.startsWith('S-')){
            llojiDokumentit = 'servisimi'
        }else if(item.shifra.startsWith('SH')){
            llojiDokumentit = 'shitje'
        }else if(item.shifra.startsWith('B')){
            llojiDokumentit = 'blerje'
        }
        setDataPerAnulimPagese({
            ...item,
            llojiDokumentit,
            perdoruesiID,
            nderrimiID
        })
        setModalPerPyetje(true)
    }
    const handleConfirmModal = async () => {
        console.log('fshijePagesen',dataPerAnulimPagese)
        setButtonLoading(true)

        try{
            const result = await window.api.deletePagesa(dataPerAnulimPagese)
            if(result.success){
                toast.success('Pagesa u fshi me sukses')
            }
        }catch(e){
            console.log(e)
        }finally{
            setButtonLoading(false)
        }
    }
    return (
        <Container fluid >
           <Row className='my-4'>
            <Col className='d-flex flex-row'>
                <Form.Group className='d-flex align-items-center me-3'>
                <Form.Label className='me-2 fw-bold'>{lloji == 'klient' ? 'Klienti:' : 'Furnitori:'}</Form.Label>
                <Form.Control type="text" value={subjekti[0].emertimi} disabled />
                </Form.Group>

                <Form.Group className='d-flex align-items-center'>
                <Form.Label className='me-2 fw-bold'>Kontakti:</Form.Label>
                <Form.Control type="number" value={subjekti[0].kontakti} disabled />
                </Form.Group>

                <OverlayTrigger placement="right" 
                    overlay={
                        <Tooltip id="tooltip-right">
                            Totali i Fitimit nga ky Klient eshte : {formatCurrency(profiti)} 
                        </Tooltip>
                    }
                >
                    <FontAwesomeIcon icon={faEye} style={{ cursor: 'pointer',opacity:0.03 }} />
                </OverlayTrigger>
            </Col>

            <Col className='d-flex flex-column align-items-end'>
                <h4 className='px-3 mb-3'>Transaksionet brenda Periudhes:</h4>

                <Col className='d-flex flex-row'>
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
                                                    <th scope="row">{lloji == 'klient' ? combinedData.length - index :blerjet.length - index}</th>
                                                    <td>{item.shifra}</td>
                                                    <td>{formatCurrency(item.totaliPerPagese)}</td>
                                                    <td>{formatCurrency(item.totaliPageses)}</td>
                                                    <td className={item.mbetjaPerPagese > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                                        {formatCurrency(item.mbetjaPerPagese)}
                                                    </td> 
                                                    {lloji == 'klient' ?  
                                                    <td>{item.shifra.startsWith('SH') ? new Date(item.dataShitjes).toLocaleDateString() :new Date(item.dataPerfundimit).toLocaleDateString()}</td>
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
                </Col>
            </Row>

           {activeShifra ?
            <Row>
                    <hr/>

            <Col className='d-flex flex-column align-items-center'>
                    <div className='text-center'>
                        <h5>Pagesat e {activeShifra.startsWith('S-')  ? 'Servisit' : null} 
                            {activeShifra.startsWith('SH')  ? 'Shitjes' : null}
                            {activeShifra.startsWith('B')  ? 'Blerjes' : null} me Shifer: <span className='fs-3 fw-bold'>{activeShifra}</span></h5>
                    </div>
                    <div className="w-50 my-3">
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
                                        <td className="fw-bold">{formatCurrency(item.shumaPageses)}</td>
                                        <td>{new Date(item.dataPageses).toLocaleDateString()}</td>
                                        <td>{item.menyraPageses}</td>
                                        <td>
                                            <Button  variant='btn btn-outline-danger' onClick={() => deletePagesa(item)}>
                                                <FontAwesomeIcon icon={faTrashCan}/>
                                            </Button>
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
                <Button variant='info' className='p-3 m-3 w-25 rounded fs-4'>Totali Per Pagese : <span className='fs-2'>{formatCurrency(totals.totalTotaliPerPagese)} </span></Button> 
               <Button variant='success' className='p-3 m-3 w-25 rounded fs-4'>Totali i Paguar :<span className='fs-2'>{formatCurrency(totals.totalTotaliPageses)}</span></Button>                     
               <Button variant='danger' className='p-3 m-3 w-25 rounded fs-4'>Mbetja per Pagese :<span className='fs-2'>{formatCurrency(totals.totalMbetjaPerPagese)}</span></Button> 
            </Col>                                           
        </Row>
        <ToastContainer />


        <ModalPerPyetje show={modalPerPyetje} handleClose={() => setModalPerPyetje(false)} handleConfirm={handleConfirmModal}/>
        </Container>
    );
}

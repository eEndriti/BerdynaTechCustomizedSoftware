import {useState,useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AnimatedSpinner from './AnimatedSpinner'
import { Container,Row,Form,Button,Col, InputGroup,Table, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faX,faTrashCan } from '@fortawesome/free-solid-svg-icons';
import KerkoSubjektin from './KerkoSubjektin'
import KerkoProduktin from './KerkoProduktin'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from './ModalPerPyetje'
import useAuthData from '../useAuthData'

export default function NdryshoShitjen() {
    const { shitjeID } = useParams()
    const navigate = useNavigate()
    const [shitje,setShitje] = useState([])
    const [loading , setLoading] = useState(true)
    const [llojiShitjes,setLlojiShitjes] = useState('')
    const [selectedSubjekti, setSelectedSubjekti] = useState({ emertimi: "", kontakti: "", subjektiID: null });
    const [products, setProducts] = useState([{}]);
    const [showModal, setShowModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [dataShitjes,setDataShitjes] = useState()
    const [ndryshoSubjektinModul,setNdryshoSubjektinModul] = useState(false)
    const [produktetFillestare,setProduktetFillestare] = useState([])
    const [aKaGarancion,setAKaGarancion] = useState(false)
    const [kohaGarancionit,setKohaGarancionit] = useState(6)
    const [komentiShitjes,setKomentiShitjes] = useState()
    const [menyraPagesesID,setMenyraPagesesID] = useState()
    const [menyratPageses,setMenyratPageses] = useState([])
    const [totaliPerPagese,setTotaliPerPagese] = useState()
    const [totaliPageses,setTotaliPageses] = useState()
    const [totaliPagesesFillestare,setTotaliPagesesFillestare] = useState()
    const [totaliPerPageseFillestare,setTotaliPerPageseFillestare] = useState()
    const [mbetjaPerPagese,setMbetjaPerPagese] = useState()
    const [nrPorosise,setNrPorosise] = useState()
    const [modalPerPyetje,setModalPerPyetje] = useState(false)
    const [inputDisabled,setInputDisabled] = useState(false)
    const {nderrimiID, perdoruesiID} = useAuthData()
    const [shitjeProdukti,setShitjeProdukti] = useState()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const receivedData = await window.api.fetchTableQuery( ` select sh.shitjeID,sh.shifra,sh.lloji,sh.komenti,sh.totaliPerPagese,sh.totaliPageses,
                    sh.mbetjaPerPagese,sh.dataShitjes,sh.nrPorosise,sh.menyraPagesesID,sh.perdoruesiID,
                    sh.transaksioniID,sh.kohaGarancionit,s.emertimi as 'subjekti',sh.subjektiID,m.emertimi as 'menyraPageses',p.emri as 'perdoruesi',n.numriPercjelles,n.dataFillimit from shitje sh
                    join subjekti s on s.subjektiID = sh.subjektiID
                    join menyraPageses m on m.menyraPagesesID = sh.menyraPagesesID
                    join Perdoruesi p on p.perdoruesiID = sh.perdoruesiID
                    join nderrimi n on n.nderrimiID = sh.nderrimiID
                    where sh.shitjeID = ${shitjeID}
                    `);
                setShitje(receivedData);

                const shitjeProdukti = await window.api.fetchTableQuery( ` select * from shitjeProdukti
                    where shitjeID = ${shitjeID}
                    `);
                setShitjeProdukti(shitjeProdukti);
            } catch (error) {
                toast.error('Error fetching data:', error);
            }

        };
        fetchData();
    }, [shitjeID]);

    useEffect(() => {
        const fetchData = async () => {
            if (shitje && shitje.length > 0) {
                try {
                    const subjectData = await window.api.fetchTableQuery(
                        `select * from subjekti where subjektiID = ${shitje[0].subjektiID}`
                    );
                    handleSelectSubjekti(subjectData[0]);
    
                    const productData = await window.api.fetchTableQuery(
                        `select p.produktiID, p.shifra, p.emertimi, p.pershkrimi, shp.cmimiShitjesPerCope as 'cmimiPerCope', p.sasia, shp.sasia as 'sasiaShitjes', shp.totaliProduktit, shp.komenti
                        from produkti p
                        join shitjeProdukti shp on shp.produktiID = p.produktiID
                        where shp.shitjeID = ${shitjeID}`
                    );
                    setProduktetFillestare(productData);
    
                    const menyratPagesesData = await window.api.fetchTableMenyratPageses();
                    setMenyratPageses(menyratPagesesData)

                    setLlojiShitjes(shitje[0].lloji);
                    setDataShitjes(shitje[0].dataShitjes.toISOString().slice(0, 10));
                    setKomentiShitjes(shitje[0].komenti)
                    if(shitje[0].kohaGarancionit > 0) {
                        setAKaGarancion(true)
                        setKohaGarancionit(shitje[0].kohaGarancionit)
                    }
                    setTotaliPerPagese(shitje[0].totaliPerPagese.toFixed(2))
                    setTotaliPageses(shitje[0].totaliPageses.toFixed(2))
                    setTotaliPagesesFillestare(shitje[0].totaliPageses.toFixed(2))
                    setTotaliPerPageseFillestare(shitje[0].totaliPerPagese.toFixed(2))
                    setMbetjaPerPagese(shitje[0].mbetjaPerPagese)
                    setMenyraPagesesID(shitje[0].menyraPagesesID)
                } catch (error) {
                    toast.error('Error fetching data:', error);
                }
            }
        };
    
        fetchData();
    }, [shitje])

    useEffect(() => {
        const shfaqi = async () => {
            if (produktetFillestare && produktetFillestare.length > 0) {
                const updatedProducts = [...products];
    
                produktetFillestare.forEach((product, index) => {
                    updatedProducts[index] = product;
                });
    
                if (updatedProducts.length < produktetFillestare.length + 1) {
                    updatedProducts.push({});
                }
    
                setProducts(updatedProducts);
            }
            setLoading(false);
        };
        shfaqi();
    }, [produktetFillestare]);

    useEffect(() => {
        const total = products.reduce((acc, product) => {
          const cmimiPerCope = parseFloat(product.cmimiPerCope) || 0;
          const sasiaShitjes = parseFloat(product.sasiaShitjes) || 0;
          const cmimiBlerjes = parseFloat(product.cmimiBlerjes) || 0;
    
          const totali = cmimiPerCope * sasiaShitjes;
          const profit = totali - (cmimiBlerjes * sasiaShitjes);
    
          product.profiti = profit;
    
          return acc + totali;
        }, 0);
        setTotaliPerPagese(total);
        setTotaliPageses(totaliPagesesFillestare)
      }, [products]);


      const handleSelectSubjekti = (result) => {
        setSelectedSubjekti({
          emertimi: result.emertimi,
          kontakti: result.kontakti,
          subjektiID: result.subjektiID,
        });
        setNdryshoSubjektinModul(false)
      };


      const handleProductSelect = (product) => {
        const updatedProducts = [...products];
        updatedProducts[selectedRow] = product;
    
        if (selectedRow === products.length - 1) {
          updatedProducts.push({});
        }
    
        setProducts(updatedProducts);
        setShowModal(false);
      };
      

      const openModalForRow = (index) => {
        setSelectedRow(index);
        setShowModal(true);
      };

      const handleDeleteRow = (index) => {
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);
      };

      const handleTotaliPagesesChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        if (value <= totaliPerPagese) {
          setTotaliPageses(value);
        } else {
          toast.error('Shuma e paguar nuk mund të jetë më e madhe se totali!');
        }
      };
      
      const handleNrPorosiseChange = (event) => {
        setNrPorosise(event.target.value);
      };

      const handleMenyraPagesesID = (menyraPagesesID) => {
        setMenyraPagesesID(menyraPagesesID);
      };
      
      const handleConfirmModal = () => {
        handleRuajNdryshimet()
      }

      const handleRuajNdryshimet = async () => {
        setInputDisabled(true)


        if (!perdoruesiID || !menyraPagesesID || !selectedSubjekti?.subjektiID || !products?.length) {
          toast.error('Të gjitha fushat e nevojshme duhet të plotësohen!');
          return;
        }
      
        setLoading(true);
        products.pop()  
        const data = {
          shitjeID,
          shifra:shitje[0].shifra,
          transaksioniIDFillestar:shitje[0].transaksioniID,
          menyraPagesesIDFillestare:shitje[0].menyraPagesesID,
          lloji: llojiShitjes,
          komenti: komentiShitjes,
          totaliPerPagese,
          totaliPerPageseFillestare,
          totaliPageses,
          totaliPagesesFillestare,
          mbetjaPerPagese,
          nrPorosise,
          menyraPagesesID,
          perdoruesiID,
          subjektiID: selectedSubjekti.subjektiID,
          nderrimiID,
          dataShitjes,
          kohaGarancionit:aKaGarancion ? kohaGarancionit:0,
          produktet: products.map(product => ({
            produktiID: product.produktiID,
            sasiaShitjes: product.sasiaShitjes,
            cmimiPerCope: product.cmimiPerCope,
            profiti:product.profiti
          }))
       };
  
    try {
        console.log('data',data)
      const result = await window.api.ndryshoShitje(data);
      if (result.success) {
        toast.success('Shitja u Ndryshua me Sukses!', {
          position: "top-center",  
          autoClose: 1500
        }); 
      } else {
        toast.error('Gabim gjate ndryshimit: ' + result.error);
      }
    } catch (error) {
      toast.error('Gabim gjate komunikimit me server: ' + error.message);
    } finally {
      setLoading(false);
      navigate('/faqjaKryesore/')
    }
}

      const handleAnulo =  () => {

      }
  return (
    <>
    {products.length == 1 ? <AnimatedSpinner /> 
    
    :
   
        <Container fluid className='mt-4 '>
            <Row><h4 className='text-center text-secondary fw-bold'>Ndryshimi i Shitjes : {shitje[0].shitjeID}</h4></Row>
            <hr/>

            <Row>
                <Col>
                    {ndryshoSubjektinModul ? 
                    <Col className='d-flex'>
                        <InputGroup >
                                <KerkoSubjektin filter='klient' value={selectedSubjekti.emertimi} onSelect={handleSelectSubjekti} />
                                <InputGroup.Text className='bg-transparent  border-0 mx-2' onClick={() => setNdryshoSubjektinModul(false)} style={{cursor:'pointer'}}><FontAwesomeIcon icon={faX} className='text-danger fs-4 fw-bold' /></InputGroup.Text>
                        </InputGroup>
                    </Col>
                    :
                    <Form className='d-flex justify-content-between'>
                        <Form.Group>
                            <Form.Label>Subjekti:</Form.Label>
                            <InputGroup >
                                <Form.Control disabled = {true} value={selectedSubjekti.emertimi} />
                                <InputGroup.Text disabled={inputDisabled} onClick={() => setNdryshoSubjektinModul(true)} style={{cursor:'pointer'}}><FontAwesomeIcon icon={faPen} className='text-primary' /></InputGroup.Text>
                            </InputGroup>
                            
                        </Form.Group>
                        <Form.Group className='mx-2'>
                            <Form.Label>Kontakti:</Form.Label>
                            <Form.Control disabled = {true} value={selectedSubjekti.kontakti} />
                        </Form.Group>
                    </Form>}
                </Col>
                <Col className="d-flex flex-row justify-content-center">
                <Button disabled={inputDisabled}
                    variant={llojiShitjes === "dyqan" ? "primary" : "outline-primary"}
                    size="md"
                    className="mx-1 w-25"
                    onClick={() => setLlojiShitjes('dyqan')}
                >
                    Shitje ne Dyqan
                </Button>
                <Button disabled={inputDisabled}
                    variant={llojiShitjes === "online" ? "primary" : "outline-primary"}
                    size="md"
                    className="mx-1 w-25"
                    onClick={() => setLlojiShitjes('online')}
                >
                    Shitje Online
                </Button>
                </Col>
                <Col>
                    <Form>
                        <Form.Label>Data</Form.Label>
                        <Form.Control disabled={inputDisabled} type='date' onChange={(e) => setDataShitjes(e.target.value)} value={dataShitjes}/>
                    </Form>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col xs={12}>
                <div className="table-responsive tabeleMeMaxHeight">
                    <Table striped bordered hover size="sm">
                    <thead>
                        <tr className="fs-5">
                        <th scope="col">Nr</th>
                        <th scope="col">Shifra</th>
                        <th scope="col">Emertimi</th>
                        <th scope="col">Pershkrimi</th>
                        <th scope="col">Cmimi Per Cope</th>
                        <th scope="col">Sasia e Disponueshme</th>
                        <th scope="col">Sasia e Shitjes</th>
                        <th scope="col">Totali</th>
                        <th scope="col">Komenti</th>
                        <th scope="col">Opsionet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => {
                        const cmimiPerCope = parseFloat(product.cmimiPerCope) || 0;
                        const sasiaShitjes = parseFloat(product.sasiaShitjes) || 0;
                        const totali = (cmimiPerCope * sasiaShitjes).toFixed(2);

                        return (
                            <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                                {product.shifra || (
                                <Button disabled={inputDisabled} onClick={() => openModalForRow(index)}>Kerko</Button>
                                )}
                            </td>
                            <td>{product.emertimi}</td>
                            <td>{product.pershkrimi}</td>
                            <td>
                                <Form.Control className="bg-light border-0" disabled={inputDisabled}
                                type="number"
                                value={product.cmimiPerCope || ''}
                                onChange={(e) => {
                                    const updatedProducts = [...products];
                                    updatedProducts[index].cmimiPerCope = e.target.value;
                                    setProducts(updatedProducts);
                                }}
                                />
                            </td>
                            <td>{product.sasia}</td>
                            <td>
                                <Form.Control className="bg-light border-0" disabled={inputDisabled}
                                type="number"
                                min={1}
                                max={product.sasia}
                                value={product.sasiaShitjes || ''}
                                onChange={(e) => {
                                    const newValue = Math.min(Number(e.target.value), product.sasia);
                                    const updatedProducts = [...products];
                                    updatedProducts[index] = {
                                    ...updatedProducts[index],
                                    sasiaShitjes: newValue
                                    };
                                    setProducts(updatedProducts);
                                }}
                                />
                            </td>
                            <td>{totali}</td>
                            <td>
                                <Form.Control className="bg-light border-0" disabled={inputDisabled}
                                type="text"
                                value={product.komenti || ''}
                                onChange={(e) => {
                                    const updatedProducts = [...products];
                                    updatedProducts[index].komenti = e.target.value;
                                    setProducts(updatedProducts);
                                }}
                                />
                            </td>
                            <td >
                            <Button variant='transparent' className="text-danger  text-center" disabled={inputDisabled} onClick={() => handleDeleteRow(index)} style={{ cursor: 'pointer' }}>
                                {product.shifra && <FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} disabled={inputDisabled} />}
                                </Button>                      
                                </td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </Table>
                    {showModal && (
                    <KerkoProduktin
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        meFatureProp={null}
                        onSelect={handleProductSelect}
                    />
                    )}
                </div>
                </Col>
            </Row>

            <Row className="mt-5 section2 d-flex justify-content-around bg-light py-4">
                <Col xs={12} md={6} className="d-flex flex-column align-items-center mb-3 mb-md-0">
                <h5 className="text-center mb-3">
                    Shtype Garancionin
                    <Form.Check  disabled={inputDisabled}
                    className="px-3 ms-2" 
                    inline 
                    onClick={() => setAKaGarancion(!aKaGarancion)} 
                    checked = {aKaGarancion}
                    />
                </h5>
                {aKaGarancion && (
                    <div className="d-flex align-items-center justify-content-center">
                    <Form.Control  disabled={inputDisabled}
                        type="number" 
                        className="me-2 w-50 w-md-25" 
                        placeholder="Muaj" 
                        min={1}
                        value={kohaGarancionit}
                        onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 1) {
                            setKohaGarancionit(value);
                        }
                        }}
                    />

                    <p className="mb-0">Muaj</p>
                    </div>
                )}
                </Col>
                
                <Col xs={12} md={6} className="d-flex justify-content-center">
                <Form.Control  disabled={inputDisabled}
                    as="textarea" 
                    onChange={(e) => setKomentiShitjes(e.target.value)} 
                    rows={3} 
                    className="p-3 w-100 w-md-75" 
                    placeholder="Shkruaj komentin..." 
                    value = {komentiShitjes}
                />
                </Col>
            </Row>

            <Row className="section3 my-5 d-flex justify-content-end">
                <Col xs={12} md={6} className="d-flex justify-content-center align-items-end">
                    <Button variant="danger" size="lg" className="mx-2 fs-1" onClick={handleAnulo} disabled={inputDisabled}>Anulo</Button>
                    <Button variant="success" size="lg" className="mx-2 fs-1" 
                        disabled={!(selectedSubjekti.subjektiID) || !(products.length>1) || !(menyraPagesesID) || inputDisabled} 
                        onClick={() => setModalPerPyetje(true)} >{inputDisabled ? (
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
                    'Ruaj Ndryshimet...'
                    )}</Button>
                </Col>
                <Col xs={12} md={6} className="d-flex flex-column align-items-end">
                    <div className="d-flex flex-column w-100 justify-content-end">
                    <div className="d-flex flex-column w-100">
                        
                        <Form.Group as={Row} controlId="totaliPerPageseShuma" className="mb-2">
                        <Form.Label column xs={6} className="text-end">Totali Per Pagese:</Form.Label>
                        <Col xs={6}>
                            <InputGroup>
                            <Form.Control
                                type="number"
                                value={totaliPerPagese}
                                readOnly
                            />
                            <InputGroup.Text>€</InputGroup.Text>
                            </InputGroup>
                        </Col>
                        </Form.Group>
                        {llojiShitjes == 'dyqan'? <>
                        <Form.Group as={Row} controlId="totaliPageses" className="mb-2">
                        <Form.Label column xs={6} className="text-end">Totali Pageses:</Form.Label>
                        <Col xs={6}>
                            <InputGroup>
                                <Form.Control disabled={inputDisabled}
                                type="number"
                                value={totaliPageses}
                                onChange={handleTotaliPagesesChange}
                                min={0}
                                />
                                <InputGroup.Text style={{cursor:'pointer'}} onClick={() => {totaliPageses > 0 ? setTotaliPageses(0)  : setTotaliPageses(totaliPerPagese)}}>€</InputGroup.Text>

                            </InputGroup>
                        </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="mbetjaPerPagese" className="mb-2">
                        <Form.Label column xs={6} className="text-end">Mbetja Per Pagese:</Form.Label>
                        <Col xs={6}>
                            <InputGroup >
                            <Form.Control
                                type="number"
                                value={totaliPerPagese - totaliPageses}
                                readOnly
                            />
                            <InputGroup.Text>€</InputGroup.Text>
                            </InputGroup>
                        </Col>
                        </Form.Group>
                        </>:
                        <Form.Group as={Row} controlId="nrPorosiseShuma" className="mb-2">
                        <Form.Label column xs={6} className="text-end">Nr. Porosise:</Form.Label>
                        <Col xs={6}>
                        <Form.Control disabled={inputDisabled}
                        type="text"  // Use "text" instead of "number"
                        maxLength={8}  // Set maxLength to 8
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 8) {
                            handleNrPorosiseChange(e);
                            }
                        }}
                        />
                        </Col>
                    </Form.Group>
                    }
                    </div>
                    <div className="d-flex flex-row justify-content-end">
                        {menyratPageses.map((menyraPageses) => (
                        
                        <Button disabled={inputDisabled}
                            key={menyraPageses.menyraPagesesID}
                            onClick={() => handleMenyraPagesesID(menyraPageses.menyraPagesesID)}
                            className={menyraPagesesID === menyraPageses.menyraPagesesID ? 'bg-primary mx-2' : 'mx-2 bg-transparent text-primary'}
                        >
                            {menyraPageses.emertimi}
                        </Button>
                        ))}
                    </div>
                    </div>
                </Col>
                </Row>
            <ToastContainer/>
            <ModalPerPyetje
                show={modalPerPyetje}
                handleClose={() => setModalPerPyetje(false)}
                handleConfirm={handleConfirmModal}
            />
        </Container>
        }
    </>
  )
}

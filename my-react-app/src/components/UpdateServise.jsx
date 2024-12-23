import { useState, useEffect } from 'react';
import { Modal, Button, Form,Spinner, Toast,InputGroup,Row,Col,Table } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthData from '../useAuthData';
import MenyratPagesesExport from './MenyratPagesesExport';
import KerkoProduktin from './KerkoProduktin'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrashCan } from '@fortawesome/free-solid-svg-icons';

function UpdateServise({ show, handleClose, updateType, data = {} }) {
    const [loading, setLoading] = useState(false);
    const [aKaData, setAKaData] = useState(false);
    const [aKaAdapter, setKaAdapter] = useState(false);
    const [aKaÇante, setAKaÇante] = useState(false);
    const [aKaGarancion, setAKaGarancion] = useState(false);
    const [shifraGarancionit, setShifraGarancionit] = useState();
    const [komenti, setKomenti] = useState();
    const [totaliPerPagese, setTotaliPerPagese] = useState(0);
    const [totaliIPageses, setTotaliIPageses] = useState(0);
    const [mbetjaPerPagese, setMbetjaPerPagese] = useState(0);
    const {nderrimiID} = useAuthData()
    const [menyraPagesesID,setMenyraPagesesID] = useState()
    const [products, setProducts] = useState([{}]);
    const [showModalKerkoProduktin,setShowModalKerkoProduktin] = useState(false)
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {

        if (data?.pajisjetPercjellese) {
            setKaAdapter(data.pajisjetPercjellese.includes('Adapter'));
            setAKaData(data.pajisjetPercjellese.includes('Data'));
            setAKaÇante(data.pajisjetPercjellese.includes('Çante'));
        }
        if (data?.shifraGarancionit) {
            setAKaGarancion(true);
        }else{setAKaGarancion(false)}
        setKomenti(data?.komenti)
        setShifraGarancionit(data?.shifraGarancionit)
    }, [data]);

    const updateMenyraPageses = (menyraPageses) => {
        setMenyraPagesesID(menyraPageses);
      };

    const handleConfirmClick = async () => {
        setLoading(true);
        let pajisjetPercjellese = ''

        {aKaData ? pajisjetPercjellese = 'Data/' : ''}
        {aKaAdapter ? pajisjetPercjellese += 'Adapter/' : ''}
        {aKaÇante ? pajisjetPercjellese += 'Çante' : ''}

        const dataPerNdryshim = {
            servisimiID:data.servisimiID,
            shifra:data.shifra,
            pajisjetPercjellese,
            shifraGarancionit,
            komenti,
            totaliPerPagese,
            totaliIPageses,
            mbetjaPerPagese,
            updateType,
            perdoruesiID:1,
            nderrimiID,
            dataPageses:new Date().getDate(),
            subjektiID: data.subjektiID ,
            menyraPagesesID:menyraPagesesID.menyraPagesesID,
            products:products.slice(0, products.length - 1)
        }
        try {
            console.log('dataPerndryshim',dataPerNdryshim)
            const result = await window.api.ndryshoServisin(dataPerNdryshim);
            if (result.success) {
              toast.success(`Servisi u ${updateType != 'perfundo' ? 'Ndryshua' : 'Perfundua'} me Sukses!`, {
                position: "top-center",  
                autoClose: 1500,
                onClose:() => window.location.reload()
              }); 
            } else {
              toast.error('Gabim gjate Ndryshimit: ' + result.error);
            }
          } catch (error) {
            toast.error('Gabim gjate komunikimit me server: ' + error.message);
          } finally {
            setLoading(false);
          }

    };

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
          setTotaliIPageses(total)
         

      }, [products]);

    const openModalForRow = (index) => {
        setSelectedRow(index);
        setShowModalKerkoProduktin(true);
      };

      const handleProductSelect = (product) => {
        const updatedProducts = [...products];
        updatedProducts[selectedRow] = product;
    
        if (selectedRow === products.length - 1) {
          updatedProducts.push({});
        }
    
        setProducts(updatedProducts);
        setShowModalKerkoProduktin(false);
      };

      const handleDeleteRow = (index) => {
        const updatedProducts = products.filter((_, i) => i !== index);
        setProducts(updatedProducts);
      };

      const handleTotaliPagesesChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        if (value <= totaliPerPagese) {
            setTotaliIPageses(value);
        } else {
          toast.error('Shuma e paguar nuk mund të jetë më e madhe se totali!');
        }
        setMbetjaPerPagese(totaliPerPagese - totaliIPageses)

      };

      useEffect(()=>{
            setMbetjaPerPagese(totaliPerPagese - totaliIPageses)
      },[totaliIPageses,mbetjaPerPagese])
      

    return (
        <Modal show={show} onHide={handleClose} size={updateType === 'perfundo' ? 'xl' : 'md'}>
            <Modal.Header closeButton>
                <Modal.Title>{updateType === 'perfundo' ? 'Mbyll Servisimin' : 'Ndrysho te Dhenat'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                
               <Form className='d-flex d-row justify-content-start'>
                    <Form.Group>
                        <Form.Label>Shifra:</Form.Label>
                        <Form.Control type="text" value={data?.shifra || ''} disabled />
                    </Form.Group>
                    <Form.Group className='mx-3'>
                        <Form.Label >Klienti:</Form.Label>
                        <Form.Control type="text" value={data?.subjekti || ''} disabled />
                    </Form.Group>
               </Form>
                {updateType === 'perfundo' ? (
                   <>
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
                                            <Button onClick={() => openModalForRow(index)}>Kerko</Button>
                                            )}
                                        </td>
                                        <td>{product.emertimi}</td>
                                        <td>{product.pershkrimi}</td>
                                        <td>
                                            <Form.Control className="bg-light border-0"
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
                                            <Form.Control className="bg-light border-0"
                                            type="number"
                                            min={0}
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
                                            <Form.Control className="bg-light border-0"
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
                                        <span className="text-danger  text-center" onClick={() => handleDeleteRow(index)} style={{ cursor: 'pointer' }}>
                                            {product.shifra && <FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} />}
                                            </span>                      
                                            </td>
                                        </tr>
                                    );
                                    })}
                                </tbody>
                                </Table>
                                {showModalKerkoProduktin && (
                                    <KerkoProduktin
                                        show={showModalKerkoProduktin}
                                        onHide={() => setShowModalKerkoProduktin(false)}
                                        meFatureProp={null}
                                        onSelect={handleProductSelect}
                                    />
                                )}
                            </div>
                            </Col>
                        </Row>
                            <hr/>  
                       <Row className='d-flex flex-row flex-wrap justify-content-between mt-5'>
                            <Col xs={12} md={6} className="d-flex justify-content-center align-items-end ">
                                <Button variant="danger" size="lg" className="mx-2 fs-1" onClick={handleClose}>Anulo</Button>
                                <Button variant="success" size="lg" className="mx-2 fs-1" onClick={handleConfirmClick} disabled={loading}>{loading ? (
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
                                'Regjistro...'
                                )}</Button>
                            </Col>
                        <Form className='w-25 '>
                                <Form.Group>
                                    <Form.Label>Totali per Pagese:</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type="number"
                                                value={totaliPerPagese.toFixed(2)}
                                                readOnly
                                            />
                                            <InputGroup.Text>€</InputGroup.Text>
                                        </InputGroup>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Totali i Pageses:</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                        type="number"
                                        value={totaliIPageses}
                                        onChange={handleTotaliPagesesChange}
                                        min={0}
                                        />
                                        <InputGroup.Text style={{cursor:'pointer'}} onClick={() => {totaliIPageses > 0 ? setTotaliIPageses(0) : setTotaliIPageses(totaliPerPagese)}}>€</InputGroup.Text>

                                    </InputGroup>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Mbetja Per Pagese:</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="number" value={mbetjaPerPagese} disabled />
                                        <InputGroup.Text>€</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group className='mt-3'>
                                    <MenyratPagesesExport updateMenyraPageses={updateMenyraPageses} />
                                </Form.Group>
                            </Form>
                       </Row>
                   </>
                    
                ) : (
                    <Form> 
                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label className="fw-bold">Komenti:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                className="form-control-lg"
                                defaultValue={data?.komenti}
                                onChange={(e) => setKomenti(e.target.value)}
                            />
                        </Form.Group>
                        <Form className="d-flex flex-row m-2">
                            <Form.Group className="p-1 mx-3">
                                <Form.Label>Data:</Form.Label>
                                <Form.Check checked={aKaData} onChange={() => setAKaData(!aKaData)} />
                            </Form.Group>
                            <Form.Group className="p-1 mx-3">
                                <Form.Label>Adapter:</Form.Label>
                                <Form.Check checked={aKaAdapter} onChange={() => setKaAdapter(!aKaAdapter)} />
                            </Form.Group>
                            <Form.Group className="p-1 mx-3">
                                <Form.Label>Çantë:</Form.Label>
                                <Form.Check checked={aKaÇante} onChange={() => setAKaÇante(!aKaÇante)} />
                            </Form.Group>
                            <Form.Group className="p-1 mx-3">
                                <Form.Label>Garancion:</Form.Label>
                                <Form.Check checked={aKaGarancion} onChange={() => setAKaGarancion(!aKaGarancion)} />
                                {aKaGarancion && (
                                    <Form.Control
                                        type="text"
                                        defaultValue={data?.shifraGarancionit || ''}
                                        onChange={(e) => setShifraGarancionit(e.target.value)}
                                    />
                                )}
                            </Form.Group>
                        </Form>
                    </Form>
                )}
            </Modal.Body>
            {updateType != 'perfundo' ? <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Anulo
                </Button>
                <Button variant="primary" onClick={handleConfirmClick} disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner
                                variant="success"
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
                    )}
                </Button>
            </Modal.Footer> : null}
            <ToastContainer/>
        </Modal>
    );
}

export default UpdateServise;

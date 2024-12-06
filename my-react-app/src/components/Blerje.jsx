import { useState,useEffect } from "react";
import { Container, Row,Col,Form, Button,Table,Spinner,InputGroup, Tooltip } from "react-bootstrap";
import KerkoSubjektin from './KerkoSubjektin'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import KerkoProduktin from "./KerkoProduktin";
import { useNavigate } from "react-router-dom";
import useAuthData,{formatCurrency} from "../useAuthData";

export default function Blerje() {

  const navigate = useNavigate();  
  const [selectedSubjekti, setSelectedSubjekti] = useState({ emertimi: "", kontakti: "", subjektiID: null });
  const [dataEFatures, setDataEFatures] = useState(new Date().toISOString().substring(0, 10));
  const [products, setProducts] = useState([{}]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [komentiBlerjes,setKomentiBlerjes] = useState()
  const [totaliPerPagese, setTotaliPerPagese] = useState(0);
  const [totaliPageses, setTotaliPageses] = useState(0);
  const [menyratPageses,setMenyratPageses] = useState([])
  const [menyraPagesesID, setMenyraPagesesID] = useState(0);
  const [meFatureTeRregullt,setMeFatureTeRregullt] = useState(false)
  const [totaliTvsh,setTotaliTvsh] = useState(0)
  const [nrFatures,setNrFatures] = useState()
  const [loading,setLoading] = useState(false)
  const [blerjet,setBlerjet] = useState([])
  const [nukPranohetNrFatures,setNukPranohetNrFatures] = useState(false)
  const { nderrimiID,perdoruesiID } = useAuthData()
  

  useEffect(() => {
    window.api.fetchTableMenyratPageses().then(receivedData => {
      setMenyratPageses(receivedData);
    });
    window.api.fetchTableBlerje().then(receivedData => {
      setBlerjet(receivedData);
    });

  }, []);

  const handleSelectSubjekti = (result) => {
    setSelectedSubjekti({
      emertimi: result.emertimi,
      kontakti: result.kontakti,
      subjektiID: result.subjektiID,
    });
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

  const handleDeleteRow = (index,productID) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleKomentiBlerjesChange = (event) =>{
    setKomentiBlerjes(event.target.value)
  }
  const handleMeFatureTeRregullt = () =>{
    setMeFatureTeRregullt(!meFatureTeRregullt)
  }

  useEffect(() => {
    let totalPerPagese = 0;
    let llogaritjaETvsh = 0;
  
    products.forEach((product) => {
      const cmimiBlerjes = parseFloat(product.cmimiBlerjes) || 0;
      const sasiaBlerjes = parseFloat(product.sasiaBlerjes) || 0;
      const tvsh = parseFloat(product.tvsh) || 0; 
      const totali = cmimiBlerjes * sasiaBlerjes;
  
      const tvshEProduktit = (totali * tvsh) / 100;
      
      llogaritjaETvsh += tvshEProduktit || 0; 
      totalPerPagese += totali;
    });
  
    setTotaliPerPagese(totalPerPagese);
    setTotaliTvsh(llogaritjaETvsh);
  }, [products]);
  

  const handleTotaliPagesesChange = (e) => {
    setTotaliPageses(parseFloat(e.target.value) || 0);
  };

  const mbetjaPerPagese = (totaliPerPagese - totaliPageses);

  const handleMenyraPagesesID = (menyraPagesesID) => {
    setMenyraPagesesID(menyraPagesesID);

  };
  const handleDataFatures = (e) => {
    setDataEFatures(e.target.value);
  };

  const handleAnulo = () => {
    navigate('/faqjaKryesore')
  }

  const handleRegjistro = async () => {
    setLoading(true);
  
    if (!perdoruesiID || !menyraPagesesID) {
      setLoading(false); 
      return toast.warn('Ju Lutem Plotesoni te Gjitha Fushat!', {
        position: "top-center",
        autoClose: 1500,
      });
    }
    const data = {
      totaliPerPagese,
      totaliPageses,
      mbetjaPerPagese,
      dataFatures: dataEFatures,
      komenti: komentiBlerjes,
      fatureERregullt: meFatureTeRregullt,
      nrFatures,
      perdoruesiID,
      subjektiID: selectedSubjekti.subjektiID,
      menyraPagesesID,
      nderrimiID,
      produktet: products,
    };
  
    try {
      const result = await window.api.insertBlerje(data);
  
      if (result.success) {
        toast.success('Blerja u Regjistrua me Sukses!', {
          position: "top-center",
          autoClose: 1500
        });
        navigate('/faqjaKryesore')
      } else {
        toast.error('Gabim gjate regjistrimit: ' + result.error, {
          position: "top-center",
          autoClose: 1500,
        });
      }
    } catch (error) {
      toast.error('Gabim gjate komunikimit me server: ' + error.message, {
        position: "top-center",
        autoClose: 1500,
      });
    } finally {
      setLoading(false); 
    }
  };
  
  const kontrolloValidetin = (nrFatures) =>{
    setNukPranohetNrFatures(false)
    setNrFatures(nrFatures)
    blerjet.map(item =>{
      if(item.subjektiID == selectedSubjekti.subjektiID && item.nrFatures == nrFatures){
        setNukPranohetNrFatures(true)
      }
    })
  }
  
  return (
    <Container fluid className="pt-5">
      <Row>
        <Col>
          <Form.Group as={Row} controlId="subjekti" className="mb-2">
            <Form.Label column xs={6} className="text-start w-auto">Furnitori:</Form.Label>
            <Col xs={6}>
              <KerkoSubjektin filter='furnitor' value={selectedSubjekti.emertimi} onSelect={handleSelectSubjekti} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="kontakti" className="mb-2">
            <Form.Label column xs={6} className="text-start w-auto">Kontakti:</Form.Label>
            <Col xs={6}>
              <Form.Control disabled type="number" value={selectedSubjekti.kontakti} />
            </Col>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label column xs={6} className="text-start w-auto">Nr i Fatures:</Form.Label>
            <Form.Control type="text" value={nrFatures} onChange={ (e) => kontrolloValidetin(e.target.value)}/>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label column xs={6} className="text-start w-auto">Data Fatures:</Form.Label>
            <Form.Control type="date" value={dataEFatures} onChange={handleDataFatures}/>
          </Form.Group>
        </Col>
        <Col className="d-flex justify-content-center align-items-center">
          <Button variant="info" className="p-2 fs-5" onClick={() => navigate('/blerjet')}>Te Gjitha Blerjet</Button>
        </Col>
        
      </Row>
      {nukPranohetNrFatures ? <p className="text-center text-danger">Numri i Fatures Egziston tek ky Subjekt, Nuk Lejohet!</p> : null}

      <hr/>

      <Row className="mt-5">
        <Col xs={12}>
          <div className="table-responsive tabeleMeMaxHeight">
            <Table striped bordered hover size="sm" className="text-center">
              <thead>
                <tr className="fs-5">
                  <th scope="col">Nr</th>
                  <th scope="col">Shifra e Produktit</th>
                  <th scope="col">Emertimi</th>
                  <th scope="col">Pershkrimi</th>
                  <th scope="col">Cmimi Blerjes Per Cope</th>
                  <th scope="col">Sasia Aktuale</th>
                  <th scope="col">Sasia e Blerjes</th>
                  <th scope="col">Totali</th>
                  {meFatureTeRregullt?
                    <>
                      <th scope="col">TVSH %</th>
                      <th scope="col">TVSH €</th>
                    </>:''}
                  <th scope="col">Komenti</th>
                  <th scope="col">Opsionet</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const sasiaBlerjes = parseFloat(product.sasiaBlerjes) || 0;
                  const totali = (product.cmimiBlerjes * sasiaBlerjes);
                  const tvsh = parseFloat(product.tvsh) || 0; 
                  const tvshEProduktit = ((totali * tvsh) / 100);
              
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
                      {product.cmimiBlerjes == null ? <td></td> : <td>{formatCurrency(product.cmimiBlerjes)}</td>}
                      <td>{product.sasia}</td>
                      <td>
                        <Form.Control className="bg-light border-0" type="number" min={0} value={product.sasiaBlerjes}
                          onChange={(e) => { const updatedProducts = [...products]; updatedProducts[index].sasiaBlerjes = e.target.value;setProducts(updatedProducts);
                          }}
                        />
                      </td>
                      {isNaN(totali) ? <td></td> : <td>{formatCurrency(totali)}</td>}
                      {meFatureTeRregullt ? (
                        <>
                          {tvsh == 0 ? <td></td> : <td>{tvsh} %</td>}
                          {isNaN(tvshEProduktit) ? <td></td> : <td>{formatCurrency(tvshEProduktit)}</td>} 
                        </>
                      ) : null}
                      <td>{product.komenti}</td>
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
            {showModal && (
              <KerkoProduktin
                show={showModal}
                onHide={() => setShowModal(false)}
                meFatureProp = {meFatureTeRregullt}
                onSelect={handleProductSelect}
              />
            )}
          </div>
        </Col>
      </Row>
            <hr/>
      <Row>
        <Col className="d-flex flex-row justify-content-center align-items-center">
            <Form.Group>
              <Form.Label>Fature e Rregullt</Form.Label>
              <Form.Check inline defaultChecked={meFatureTeRregullt} onChange={handleMeFatureTeRregullt} className="px-2" disabled={products.length > 1}/>
            </Form.Group>
        </Col>
        <Col xs={12} md={6} className="d-flex justify-content-center">
          <Form.Control as="textarea" onChange={handleKomentiBlerjesChange} rows={3} className="p-3" placeholder="Shkruaj komentin..." />
        </Col>
      </Row>

      <Row className="section3 my-5 d-flex justify-content-end">
        <Col xs={12} md={6} className="d-flex justify-content-center align-items-end">
          <Button variant="danger" size="lg" className="mx-2 fs-1" onClick={handleAnulo}>Anulo</Button>
          <Button variant="success" size="lg" className="mx-2 fs-1" 
          disabled={!(selectedSubjekti.subjektiID) || !(products.length>1) || nrFatures == null || nukPranohetNrFatures || loading || !menyraPagesesID} onClick={handleRegjistro} >{loading ? (
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

        <Col xs={12} md={6} className="d-flex flex-column align-items-end">
          <div className="d-flex flex-column w-100 justify-content-end">
            <div className="d-flex flex-column w-100">
            {meFatureTeRregullt?<>
              <Form.Group as={Row} controlId="totaliTvsh" className="mb-2">
                <Form.Label column xs={6} className="text-end">Totali i TVSH:</Form.Label>
                <Col xs={6}>
                  <InputGroup >
                    <Form.Control
                      type="text"
                      value={formatCurrency(totaliTvsh,true)}
                      readOnly
                    />
                    <InputGroup.Text>€</InputGroup.Text>
                  </InputGroup>
                </Col>
              </Form.Group>
            </>:''}
              <Form.Group as={Row} controlId="totaliPerPageseShuma" className="mb-2">
                <Form.Label column xs={6} className="text-end">Totali Per Pagese:</Form.Label>
                <Col xs={6}>
                  <InputGroup >
                    <Form.Control
                      type="text"
                      value={formatCurrency(totaliPerPagese,true)}
                      readOnly
                    />
                    <InputGroup.Text>€</InputGroup.Text>
                   </InputGroup>
                </Col>
              </Form.Group>
                <Form.Group as={Row} controlId="totaliPageses" className="mb-2">
                <Form.Label column xs={6} className="text-end">Totali Pageses:</Form.Label>
                <Col xs={6}>
                  <InputGroup >
                    <Form.Control
                      type="number"
                      defaultValuevalue={totaliPageses}
                      onChange={handleTotaliPagesesChange}
                      min={0}
                    />
                    <InputGroup.Text>€</InputGroup.Text>
                  </InputGroup>
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="mbetjaPerPagese" className="mb-2">
                <Form.Label column xs={6} className="text-end">Mbetja Per Pagese:</Form.Label>
                <Col xs={6}>
                  <InputGroup >
                    <Form.Control
                      type="text"
                      value={formatCurrency(mbetjaPerPagese,true)}
                      readOnly
                    />
                   <InputGroup.Text>€</InputGroup.Text>
                  </InputGroup>
                </Col>
              </Form.Group>
            </div>
            <div className="d-flex flex-row justify-content-end">
              {menyratPageses.map((menyraPageses) => (
                <Button
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
    </Container>
  )
}

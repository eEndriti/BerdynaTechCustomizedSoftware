import { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, InputGroup, Spinner,Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from "../components/AuthContext";
import AnimatedSpinner from './AnimatedSpinner';

const ShtoNjeProdukt = ({ show, handleClose,prejardhja,produkti = {} }) => {
  const [kategorite, setKategorite] = useState([]);
  const [selectedKategoria, setSelectedKategoria] = useState(null);
  const [aKa , setAka] = useState(true)
  const [loading, setLoading] = useState(false);
  const [showModal,setShowModal] = useState(false)
  const [meFature, setMeFature] = useState(false);
  const [sasiStatike, setSasiStatike] = useState(false);
  const [productDetails, setProductDetails] = useState({
    emertimi: '',
    cpu: '',
    ram: '',
    disku: '',
    gpu: '',
    cmimiBlerjes: '',
    cmimiShitjes: '',
    komenti: ''
  });
  const {authData} = useContext(AuthContext)

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      await window.api.fetchTableKategoria().then((data) => setKategorite(data));
  
      if(produkti && aKa){
        if(produkti.meFatureTeRregullt == "po"){
          setMeFature(true)
        }else{
          setMeFature(false)
        }
        setSasiStatike(produkti.sasiStatike)
        setProductDetails(produkti);
      }
   
    setProductDetails(produkti);

    // Only call handleCategoryChange if produkti.kategoriaID exists
    if (produkti?.kategoriaID) {
      handleCategoryChange(produkti.kategoriaID);
    }
    setLoading(false);
    setShowModal(true)
  }
  fetchData()
  }, [produkti]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleCategoryChange = (eOrId) => {
    let selectedCategoryId;
  
    if (typeof eOrId === "number") {
      // If a direct category ID is provided (like from produkti.kategoriaID)
      selectedCategoryId = eOrId;
    } else {
      // If the function is called from the <select> dropdown event
      selectedCategoryId = parseInt(eOrId.target.value, 10);
    }
  
    const selectedCategory = kategorite.find(
      (kategoria) => kategoria.kategoriaID === selectedCategoryId
    );
  
    setSelectedKategoria(selectedCategory || null);
  };
  
  
  const handleShtoProduktin = async () => {
    if ((parseFloat(productDetails.cmimiShitjes) <= parseFloat(productDetails.cmimiBlerjes))) {
        toast.warn('Cmimi Shitjes duhet të jetë më i madh se Cmimi Blerjes!', {
          position: 'top-center',
          autoClose: 1500,
        });
        return; 
      }
    setLoading(true);
    let pershkrimi = productDetails.pershkrimi || null;
    const cpu = productDetails.cpu + '/' || '';
    const ram = productDetails.ram + '/' || '';
    const disku = productDetails.disku + '/' || '';
    const gpu = productDetails.gpu + '/' || '';

    if (selectedKategoria.komponenta === 'true') {
      pershkrimi = cpu + ram + disku + gpu;
    }

    if (selectedKategoria && productDetails.emertimi && authData.perdoruesiID) {
      const data = {
        emertimi: productDetails.emertimi,
        pershkrimi: pershkrimi,
        sasia: 0,
        cmimiBlerjes: productDetails.cmimiBlerjes,
        cmimiShitjes: productDetails.cmimiShitjes,
        kategoriaID: selectedKategoria.kategoriaID,
        komenti: productDetails.komenti || '',
        cpu: cpu,
        ram: ram,
        disku: disku,
        gpu: gpu,
        meFature,
        sasiStatike
      };
      try {
        const result = await window.api.insertProduktin(data);

        if (result.success) {
          toast.success('Produkti u shtua me sukses!', {
            position: 'top-center',
            autoClose: 1500,
          });
          // Delay closing the modal to ensure the toast is visible
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          toast.error('Gabim gjatë regjistrimit: ' + result.error);
        }
      } catch (error) {
        toast.error('Gabim gjatë komunikimit me serverin.' + error);
      } finally {
        setLoading(false);
        if(prejardhja == 'meRefresh'){
            window.location.reload()
        }
      }
    } else {
      toast.warn('Ju Lutem Plotesoni te Gjitha Fushat!', {
        position: 'top-center',
        autoClose: 1500,
      });
      setLoading(false);
    }
  };

  const ndryshoProduktin = async () => {
    if (parseFloat(productDetails.cmimiShitjes) <= parseFloat(productDetails.cmimiBlerjes)) {
      toast.warn('Cmimi Shitjes duhet të jetë më i madh se Cmimi Blerjes!', {
        position: 'top-center',
        autoClose: 1500,
      });
      return; 
    }
  
    setLoading(true);
  
    let pershkrimi = productDetails.pershkrimi || null;
  
    if (selectedKategoria.komponenta === 'true') {
      const komponentet = [
        productDetails.cpu?.trim(), 
        productDetails.ram?.trim(), 
        productDetails.disku?.trim(), 
        productDetails.gpu?.trim()
      ].filter(Boolean); 
  
      pershkrimi = komponentet.join(' / '); 
    }else{
      productDetails.cpu = '';
      productDetails.ram = '';
      productDetails.disku = '';
      productDetails.gpu = '';
      
    }
  
    if (selectedKategoria && productDetails.emertimi && authData.perdoruesiID) {
      const data = {
        emertimi: productDetails.emertimi,
        pershkrimi: pershkrimi,
        sasia: 0,
        cmimiBlerjes: productDetails.cmimiBlerjes,
        cmimiShitjes: productDetails.cmimiShitjes,
        kategoriaID: selectedKategoria.kategoriaID,
        komenti: productDetails.komenti || '',
        cpu: productDetails.cpu || '',
        ram: productDetails.ram || '',
        disku: productDetails.disku || '',
        gpu: productDetails.gpu || '',
        meFature,
        produktiID: produkti.produktiID,
        sasiStatike
      };
  
      try {
        const result = await window.api.ndryshoProduktin(data);
  
        if (result.success) {
          toast.success('Produkti u Ndryshua me Sukses!', {
            position: 'top-center',
            autoClose: 1500,
          });
          setTimeout(() => {
            handleClose();
          }, 1500);
        } else {
          toast.error('Gabim gjatë regjistrimit: ' + result.error);
        }
      } catch (error) {
        toast.error('Gabim gjatë komunikimit me serverin.' + error);
      } finally {
        setLoading(false);
        if (prejardhja === 'meRefresh') {
          window.location.reload();
        }
      }
    } else {
      toast.warn('Ju Lutem Plotesoni te Gjitha Fushat!', {
        position: 'top-center',
        autoClose: 1500,
      });
      setLoading(false);
    }
  };
  
  const kontrolloValidetin = () => {
    let vlera = false

    loading || productDetails?.emertimi == ''  || !productDetails?.cmimiBlerjes || !productDetails?.cmimiShitjes || selectedKategoria == null || (
    selectedKategoria?.komponenta == 'true' &&(productDetails?.cpu === '' || productDetails?.ram === '' || productDetails?.disku === '' || productDetails?.gpu === '') )? vlera = true : vlera = false

    return vlera
  }

  return (
   <>{loading ? <AnimatedSpinner/> :  
   
    <>{showModal && <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>{produkti ? 'Ndrysho' : 'Shto'} Një Produkt</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group>
          <Form.Label>Emertimi</Form.Label>
          <Form.Control
            type="text"
            name="emertimi"
            required={true}
            value={productDetails?.emertimi || ''}
            onChange={handleInputChange}
          />
        </Form.Group>
 
        <Form.Group>
          <Form.Label>Kategoria</Form.Label>
          <Form.Control
            as="select"
            name="kategoria"
            required={true}
            value={selectedKategoria?.kategoriaID || ''}
            onChange={handleCategoryChange}
          >
            <option value="">Zgjidh Kategorinë</option>
            {kategorite.map((kategoria) => (
              <option key={kategoria.kategoriaID} value={kategoria.kategoriaID}>
                {kategoria.emertimi}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
 
        {selectedKategoria && selectedKategoria.komponenta === 'true' ? (
          <>
            <hr />
            <div className='d-flex flex-row justify-content-around'>
              <Form.Group>
                <Form.Label>Procesori:</Form.Label>
                <Form.Control
                  type="text"
                  name="cpu"
                  required={true}
                  placeholder='Modeli i Procesorit...'
                  value={productDetails.cpu}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>RAM</Form.Label>
                <Form.Control
                  type="text"
                  name="ram"
                  required={true}
                  placeholder='Kapaciteti i RAM...'
                  value={productDetails.ram}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>
            <div className='d-flex flex-row justify-content-around'>
              <Form.Group>
                <Form.Label>Disku</Form.Label>
                <Form.Control
                  type="text"
                  name="disku"
                  required={true}
                  placeholder='Kapaciteti i Disqeve...'
                  value={productDetails.disku}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>GPU</Form.Label>
                <Form.Control
                  type="text"
                  name="gpu"
                  required={true}
                  placeholder='Kapaciteti i Grafikes...'
                  value={productDetails.gpu}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>
            <hr />
          </>
        ) : (
          <>
            <Form.Group>
              <Form.Label>Pershkrimi</Form.Label>
              <Form.Control
                type="text"
                name="pershkrimi"
                required={true}
                placeholder='Pershkrimi i Produktit...'
                value={productDetails?.pershkrimi || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
          </>
        )}
 
        <Form.Group>
          <Form.Label>Cmimi Blerjes</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              name="cmimiBlerjes"
              required={true}
              value={productDetails?.cmimiBlerjes || ''}
              onChange={handleInputChange}
              step="0.01"
            />
            <InputGroup.Text>€</InputGroup.Text>
          </InputGroup>
        </Form.Group>
 
        <Form.Group>
          <Form.Label>Cmimi Shitjes</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              min={productDetails?.cmimiBlerjes+1 || ''}
              name="cmimiShitjes"
              required={true}
              value={productDetails?.cmimiShitjes || ''}  
              onChange={handleInputChange}
              step="0.01"
            />
            <InputGroup.Text>€</InputGroup.Text>
          </InputGroup>
        </Form.Group>
 
        <Form.Group>
          <Form.Label>Komenti</Form.Label>
          <Form.Control
            as="textarea"
            name="komenti"
            required={true}
            value={productDetails?.komenti || ''}
            onChange={handleInputChange}
          />
        </Form.Group>

       <Col className="d-flex flex-row justify-content-between align-items-center mt-4">
        <Form.Group controlId="employeeStatus" className="d-flex flex-column align-items-center">
              <Button
                onClick={() => setMeFature((prev) => !prev)}
                variant={meFature ? 'info' : 'secondary'}
                style={{
                  padding: '12px 25px',
                  fontSize: '1.2rem',
                  borderRadius: '30px',
                  transition: 'all 0.3s ease',
                  boxShadow: meFature 
                    ? '0px 4px 15px rgba(30, 126, 204, 0.5)' 
                    : '0px 4px 15px rgba(108, 117, 125, 0.5)'
                }}
              >
                {meFature ? 'Me Fature te Rregullt' : 'Pa Fature te Rregullt'}
              </Button>
          </Form.Group>
          
          <Form.Group controlId="employeeStatus" className="d-flex flex-column align-items-center">
              <Button
                onClick={() => setSasiStatike((prev) => !prev)}
                variant={sasiStatike ? 'info' : 'secondary'}
                style={{
                  padding: '12px 25px',
                  fontSize: '1.2rem',
                  borderRadius: '30px',
                  transition: 'all 0.3s ease',
                  boxShadow: sasiStatike 
                    ? '0px 4px 15px rgba(40, 167, 69, 0.5)' 
                    : '0px 4px 15px rgba(108, 117, 125, 0.5)'
                }}
              >
                {sasiStatike ? 'Sasi Statike' : 'Sasi Jo Statike'}
              </Button>
          </Form.Group>
       </Col>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose} disabled={loading}>
        Mbyll
      </Button>
      <Button
        variant="primary"
        onClick={() => {produkti != null ? ndryshoProduktin() : handleShtoProduktin()}}
        disabled={kontrolloValidetin()}
      >
        {loading ? (
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
          <>{produkti != null ? 'Ruaj Ndryshimet' : 'Shto Produktin'}</>
        )}
      </Button>
    </Modal.Footer>
    <ToastContainer />
  </Modal> } </>
    }</>
  );
};

export default ShtoNjeProdukt;

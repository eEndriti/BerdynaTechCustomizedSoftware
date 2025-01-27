import { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthData from '../useAuthData';
import AnimatedSpinner from './AnimatedSpinner';

const ShtoNjeProdukt = ({ show, handleClose,prejardhja,produkti = {} }) => {
  const [kategorite, setKategorite] = useState([]);
  const [aKa,setAKa] = useState(true)
  const [selectedKategoria, setSelectedKategoria] = useState(null);
  const [loading, setLoading] = useState(false);
  const [meFature, setMeFature] = useState(false);
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
  const {perdoruesiID} = useAuthData()
  
  useEffect(() => {
    
    window.api.fetchTableKategoria().then((data) => setKategorite(data));
    if(produkti && aKa){
      setMeFature(produkti.meFatureTeRregullt == 'po') 
      setProductDetails(produkti)
      console.log('prd',produkti)
      handleCategoryChange(produkti.kategoriaID)
      setAKa(false)
    }
    
  }, [produkti]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    let selectedCategoryId
    if(produkti){
      selectedCategoryId = parseInt(e, 10);
      
    }else{
      selectedCategoryId = parseInt(e.target.value, 10);
    }
    const selectedCategory = kategorite.find(
      (kategoria) => kategoria.kategoriaID === selectedCategoryId
    );
    setSelectedKategoria(selectedCategory);
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

    if (selectedKategoria && productDetails.emertimi && perdoruesiID) {
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
        meFature
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
    const cpu = productDetails.cpu + '/' || '';
    const ram = productDetails.ram + '/' || '';
    const disku = productDetails.disku + '/' || '';
    const gpu = productDetails.gpu + '/' || '';

    if (selectedKategoria.komponenta === 'true') {
      pershkrimi = cpu + ram + disku + gpu;
    }

    if (selectedKategoria && productDetails.emertimi && perdoruesiID) {
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
        produktiID:produkti.produktiID
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

  return (
    <Modal show={show} onHide={handleClose}>
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
              value={productDetails.emertimi}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Kategoria</Form.Label>
            <Form.Control
              as="select"
              name="kategoria"
              required={true}
              value={selectedKategoria ? selectedKategoria.kategoriaID : ''}
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
                  value={productDetails.pershkrimi}
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
                value={productDetails.cmimiBlerjes}
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
                min={productDetails.cmimiBlerjes+1}
                name="cmimiShitjes"
                required={true}
                value={productDetails.cmimiShitjes}
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
              value={productDetails.komenti}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className='d-flex mt-3'>
            <Form.Label className='mx-2'>Me Fature te Rregullt</Form.Label>
            <Form.Check
              checked = {meFature}
              onClick={() => setMeFature(prev => !prev)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Mbyll
        </Button>
        <Button
          variant="primary"
          onClick={() => {produkti != null ? ndryshoProduktin() : handleShtoProduktin()}}
          disabled={loading}
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
    </Modal>
  );
};

export default ShtoNjeProdukt;

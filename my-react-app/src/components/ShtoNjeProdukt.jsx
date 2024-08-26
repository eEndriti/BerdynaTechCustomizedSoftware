import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';

const ShtoNjeProdukt = ({ show, handleClose }) => {
  const [kategorite, setKategorite] = useState([]);
  const [selectedKategoria, setSelectedKategoria] = useState(null);
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

  useEffect(() => {
    // Fetch categories from Electron API
    window.api.fetchTableKategoria().then((data) => setKategorite(data));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = parseInt(e.target.value, 10);
    const selectedCategory = kategorite.find(
      (kategoria) => kategoria.kategoriaID === selectedCategoryId
    );
    setSelectedKategoria(selectedCategory);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Shto Një Produkt</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Emertimi</Form.Label>
            <Form.Control
              type="text"
              name="emertimi"
              value={productDetails.emertimi}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Kategoria</Form.Label>
            <Form.Control
              as="select"
              name="kategoria"
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
             
          {/* Conditionally render inputs based on the selected category's komponenta property */}
          {selectedKategoria && selectedKategoria.komponenta === 'true' && (
            <>
             <hr/>
            <div className='d-flex flex-row justify-content-around'>
                   
              <Form.Group>
                <Form.Label>Procesori:</Form.Label>
                <Form.Control
                  type="text"
                  name="cpu"
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
                  placeholder='Kapaciteti i Grafikes...'
                  value={productDetails.gpu}
                  onChange={handleInputChange}
                />
              </Form.Group>
              </div>
              <hr/>
            </>
          )}
            
          <Form.Group>
            <Form.Label>Cmimi Blerjes</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                name="cmimiBlerjes"
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
                name="cmimiShitjes"
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
              value={productDetails.komenti}
              onChange={handleInputChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Mbyll
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            /* Add your submit logic here */
          }}
        >
          Ruaj Produktin
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShtoNjeProdukt;

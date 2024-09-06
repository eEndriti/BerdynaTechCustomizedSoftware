import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPen } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import ModalPerPyetje from './ModalPerPyetje'

export default function Kategorite() {
  const [kategorite, setKategorite] = useState([]);
  const [emertimiPerTeShtuar, setEmertimiPerTeShtuar] = useState();
  const [tvshPerTeShtuar, setTvshPerTeShtuar] = useState();
  const [komponenta, setKomponenta] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPerPyetje,setModalPerPyetje] = useState(false)
  const [idPerAnulim,setIdPerAnulim] = useState()
  useEffect(() => {
    window.api.fetchTableKategoria().then((receivedData) => {
      setKategorite(receivedData);
      setLoading(false);
    });
  }, []);

  const handleCheckKomponenta = () => {
    setKomponenta(!komponenta);
  };

  const shtoKategorine = async () => {
    setSubmitLoading(true);
    const km = komponenta ? 'true' : 'false';

    const data = {
      emertimi: emertimiPerTeShtuar,
      tvsh: tvshPerTeShtuar,
      komponenta: km,
    };

    const result = await window.api.insertKategorine(data);

    if (result.success) {
      toast.success('Kategoria u Regjistrua me Sukses!', {
        position: 'top-center',
        autoClose: 1500,
        onClose: () => window.location.reload(),
      });
    } else {
      toast.error('Gabim gjate regjistrimit: ' + result.error);
    }

    setSubmitLoading(false);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };
  const thirreModalPerPyetje = (id) =>{
    setIdPerAnulim(id)
    setModalPerPyetje(true)
  }
  const handleConfirmModal = () => {
    handleDeleteCategory()
  };  

  const handleDeleteCategory = async () => {

    const result = await window.api.deleteKategoria(idPerAnulim);

    if (result.success) {
      toast.success('Kategoria u fshi me sukses!', {
        position: 'top-center',
        autoClose: 1500,
        onClose: () => window.location.reload(),
      });
    } else {
      toast.error('Gabim gjate fshirjes: ' + result.error);
    }
  };

  const handleCloseModalPerPyetje = () =>{
    setModalPerPyetje(false)
  }

  const handleUpdateCategory = async () => {
    const km = selectedCategory.komponenta == 'true' ? 'true' : 'false';

    const data = {
      kategoriaID: selectedCategory.kategoriaID,
      emertimi: selectedCategory.emertimi,
      tvsh: selectedCategory.tvsh,
      komponenta: km
    };
    const result = await window.api.ndryshoKategorine(data);

    if (result.success) {
      toast.success('Kategoria u ndryshua me sukses!', {
        position: 'top-center',
        autoClose: 1500,
        onClose: () => window.location.reload(),
      });
    } else {
      toast.error('Gabim gjate ndryshimit: ' + result.error);
    }
    setShowModal(false);
  };

  return (
    <Container>
      <Row>
        <Col lg={3} className="d-flex flex-column justify-content-start bg-light border py-3">
          <h3 className="text-center">Shto nje Kategori</h3>
          <div className="d-flex flex-column align-items-center justify-content-center">
            <Form.Group className="m-3">
              <Form.Label>Emertimi:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Emertimi i Kategorise..."
                onChange={(e) => setEmertimiPerTeShtuar(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mx-2 mb-3">
              <Form.Label>TVSH</Form.Label>
              <Form.Control
                type="number"
                placeholder="TVSH e Kategorise..."
                min={0}
                onChange={(e) => setTvshPerTeShtuar(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mx-2 mb-3">
              <Form.Label>Pajisje Procesuese?</Form.Label>
              <Form.Check
                inline
                className="px-3"
                onChange={handleCheckKomponenta}
                defaultChecked={komponenta}
              />
            </Form.Group>
          </div>
          <Button
            variant="success w-100 mt-3"
            onClick={shtoKategorine}
            disabled={!emertimiPerTeShtuar || !tvshPerTeShtuar || submitLoading}
          >
            {submitLoading ? <Spinner animation="border" size="sm" /> : 'Regjistro'}
          </Button>
        </Col>

        <Col className="d-flex flex-column mx-5 ">
          <h4 className="px-3">Kategorite :</h4>
          {loading ? (
            <div className="d-flex justify-content-center mt-5">
              <ClipLoader color="#36D7B7" loading={loading} size={50} />
            </div>
          ) : kategorite.length > 0 ? (
            <div className="tabelaKategorive">
              <div className="table-responsive tabeleMeMaxHeight">
                <table className="table table-sm table-striped text-center">
                  <thead className="table-light">
                    <tr className="fs-5">
                      <th>Nr</th>
                      <th>Emertimi</th>
                      <th>TVSH</th>
                      <th>Pajisje Procesuese</th>
                      <th>Sasia e Produkteve</th>
                      <th>Opsionet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kategorite.map((item, index) => (
                      <tr key={index}>
                        <th>{index + 1}</th>
                        <td>{item.emertimi}</td>
                        <td>{item.tvsh}%</td>
                        <td>{item.komponenta === 'true' ? 'Po' : 'Jo'}</td>
                        <td>{item.total_sasia || '0'}</td>
                        <td>
                          <Button variant="primary" className="m-1" onClick={() => handleEditCategory(item)}>
                            <FontAwesomeIcon icon={faPen}  />
                          </Button>
                         {item.total_sasia < 1 ?  <Button variant="danger" className='m-1' onClick={() => thirreModalPerPyetje(item.kategoriaID)}>
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button> : <></>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <h5 className="text-center mt-5 text-danger">Nuk Egzistojne Kategori te Regjistruara...</h5>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ndrysho Kategorine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategory && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Emertimi</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedCategory.emertimi}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, emertimi: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>TVSH</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedCategory.tvsh}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, tvsh: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3 d-flex flex-row">
                <Form.Label>Pajisje Procesuese?</Form.Label>
                <Form.Check
                  checked={selectedCategory.komponenta === 'true'} className='px-3 fs-5'
                  onChange={(e) =>
                    setSelectedCategory({ ...selectedCategory, komponenta: e.target.checked ? 'true' : 'false' })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Mbyll
          </Button>
          <Button variant="primary" onClick={handleUpdateCategory}>
            Ndrysho Kategorine
          </Button>
        </Modal.Footer>
      </Modal>
      <ModalPerPyetje
        show={modalPerPyetje}
        handleClose={handleCloseModalPerPyetje}
        handleConfirm={handleConfirmModal}
      />      <ToastContainer />
    </Container>
  );
}

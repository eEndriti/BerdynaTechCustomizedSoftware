import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Modal,
  Card,
  Badge,
  Table,
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faEdit } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import ModalPerPyetje from './ModalPerPyetje';

export default function Kategorite() {
  const [kategorite, setKategorite] = useState([]);
  const [emertimiPerTeShtuar, setEmertimiPerTeShtuar] = useState();
  const [tvshPerTeShtuar, setTvshPerTeShtuar] = useState();
  const [komponenta, setKomponenta] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPerPyetje, setModalPerPyetje] = useState(false);
  const [idPerAnulim, setIdPerAnulim] = useState();

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

  const thirreModalPerPyetje = (id) => {
    setIdPerAnulim(id);
    setModalPerPyetje(true);
  };

  const handleConfirmModal = () => {
    handleDeleteCategory();
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

  const handleCloseModalPerPyetje = () => {
    setModalPerPyetje(false);
  };

  const handleUpdateCategory = async () => {
    const km = selectedCategory.komponenta == 'true' ? 'true' : 'false';

    const data = {
      kategoriaID: selectedCategory.kategoriaID,
      emertimi: selectedCategory.emertimi,
      tvsh: selectedCategory.tvsh,
      komponenta: km,
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
    <Container fluid className="mt-5">
      <h3 className="text-center fw-bold text-dark">Kategorite:</h3>
      <hr />
      <Row>
        <Col lg={3} className="bg-light border rounded p-4">
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="text-center">Shto nje Kategori</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Emertimi</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Emertimi i Kategorise..."
                    onChange={(e) => setEmertimiPerTeShtuar(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>TVSH</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="TVSH e Kategorise..."
                    min={0}
                    onChange={(e) => setTvshPerTeShtuar(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Pajisje Procesuese?</Form.Label>
                  <Form.Check
                    inline
                    onChange={handleCheckKomponenta}
                    defaultChecked={komponenta}
                  />
                </Form.Group>
                <Button
                  variant="success"
                  className="w-100"
                  onClick={shtoKategorine}
                  disabled={!emertimiPerTeShtuar || !tvshPerTeShtuar || submitLoading}
                >
                  {submitLoading ? <Spinner animation="border" size="sm" /> : 'Regjistro'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9} className="mt-3 mt-lg-0">
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="text-center">Lista e Kategorive</Card.Title>
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <ClipLoader color="#36D7B7" loading={loading} size={50} />
                </div>
              ) : kategorite.length > 0 ? (
                <Table responsive striped bordered hover className="text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Nr</th>
                      <th>Emertimi</th>
                      <th>TVSH</th>
                      <th>Pajisje Procesuese</th>
                      <th>Sasia</th>
                      <th>Opsionet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kategorite.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.emertimi}</td>
                        <td>
                          <Badge bg="secondary">{item.tvsh}%</Badge>
                        </td>
                        <td>
                          {item.komponenta === 'true' ? (
                            <Badge bg="success">Po</Badge>
                          ) : (
                            <Badge bg="danger">Jo</Badge>
                          )}
                        </td>
                        <td>{item.total_sasia || '0'}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditCategory(item)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                            <Button disabled = {item.total_sasia > 1}
                              variant="outline-danger"
                              size="sm"
                              onClick={() => thirreModalPerPyetje(item.kategoriaID)}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <h5 className="text-center text-danger">Nuk ekzistojne kategori te regjistruara...</h5>
              )}
            </Card.Body>
          </Card>
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

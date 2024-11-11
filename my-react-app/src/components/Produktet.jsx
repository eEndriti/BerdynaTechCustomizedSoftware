import { useState, useEffect } from 'react';
import { Col, Container, Row, Button, Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan,faPencil } from '@fortawesome/free-solid-svg-icons';
import ModalPerPyetje from './ModalPerPyetje';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShtoNjeProdukt from './ShtoNjeProdukt';
import { useNavigate } from 'react-router-dom';
import AnimatedSpinner from './AnimatedSpinner';

export default function Produktet() {
  const navigate = useNavigate();
  const [produktet, setProduktet] = useState([]);
  const [filteredProduktet, setFilteredProduktet] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalPerPyetje, setShowModalPerPyetje] = useState(false);
  const [idPerAnulim, setIdPerAnulim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eliminoVleratZero, setEliminoVleratZero] = useState(false);
  const [filterShifra, setFilterShifra] = useState('');
  const [filterEmertimi, setFilterEmertimi] = useState('');
  const [filterSasia, setFilterSasia] = useState('');
  const [filterKategoria, setFilterKategoria] = useState('');
  const [produkti,setProdukti] = useState({})

  useEffect(() => {
    window.api.fetchTableProdukti().then(receivedData => {
      setProduktet(receivedData);
      setFilteredProduktet(receivedData);
    });
    setLoading(false)
  }, [produktet]);

  const thirreModalPerPyetje = (produktiID) => {
    setIdPerAnulim(produktiID);
    setShowModalPerPyetje(true);
  };

  const handleConfirmModalPerPyetje = async () => {
    setLoading(true);
    await handleDeleteProduktin();
    setLoading(false);
  };

  const handleCloseModalPerPyetje = () => setShowModalPerPyetje(false);
  const handleCloseModal = () => setShowModal(false);

  const handleDeleteProduktin = async () => {
    const result = await window.api.fshijeProduktin(idPerAnulim);
    setShowModalPerPyetje(false);

    if (result.success) {
      toast.success(`Produkti u fshie me Sukses!`, {
        position: "top-center",
        autoClose: 1500,
        onClose: () => window.location.reload(),
      });
    } else {
      toast.error('Gabim gjate Anulimit: ' + result.error);
    }
  };

  const handleFilterChange = () => {
    let filtered = produktet;

    if (filterShifra) {
      filtered = filtered.filter(item => item.shifra.toLowerCase().includes(filterShifra.toLowerCase()));
    }
    if (filterEmertimi) {
      filtered = filtered.filter(item => item.emertimi.toLowerCase().includes(filterEmertimi.toLowerCase()));
    }
    if (filterSasia) {
      filtered = filtered.filter(item => item.sasia.toString().includes(filterSasia));
    }
    if (filterKategoria) {
      filtered = filtered.filter(item => item.emertimiKategorise.toLowerCase().includes(filterKategoria.toLowerCase()));
    }
    if(eliminoVleratZero){
      filtered = filtered.filter(item => item.sasia > 0  );
    }

    setFilteredProduktet(filtered);
  };

  useEffect(() => {
    handleFilterChange();
  }, [filterShifra, filterEmertimi, filterSasia, filterKategoria,eliminoVleratZero]);

  const handleDetaje = (subjektiID) =>{
    navigate(`/detajePerProdukt/${subjektiID}`)
  }

  const thirreNdryshoProduktin = (produkti) => {
    setProdukti(produkti)
    setShowModal(true)
  }
  const thirreShtoProduktin = () => {
    setProdukti(null)
    setShowModal(true)
  }
  
  return (
    <Container fluid className='mt-5'>
      <Row>
        <Col className='d-flex justify-content-start'>
          <Button variant='success' className='text-light p-3 fs-5 mx-3' onClick={() => thirreShtoProduktin()}>Krijo Nje Produkt</Button>
          <Button variant='info' className='text-dark p-3 fs-5 mx-3' onClick={() => navigate('/kategorite')}>Kategorite</Button>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form>
            <Row>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Filter by Shifra"
                  value={filterShifra}
                  onChange={(e) => setFilterShifra(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Filter by Emertimi"
                  value={filterEmertimi}
                  onChange={(e) => setFilterEmertimi(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Filter by Sasia"
                  value={filterSasia}
                  onChange={(e) => setFilterSasia(e.target.value)}
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Filter by Kategoria"
                  value={filterKategoria}
                  onChange={(e) => setFilterKategoria(e.target.value)}
                />
              </Col>
              <Col>
              <Form.Group className='d-flex mt-2'>
              <Form.Label className='mx-3'>Elimino Vlerat Zero</Form.Label>
                <Form.Check
                  checked = {eliminoVleratZero}
                  onChange={() => setEliminoVleratZero(!eliminoVleratZero)}
                />
              </Form.Group>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>

      <Row>
        {loading ? <AnimatedSpinner /> : 
          <div className="table-responsive tableHeight50 mt-4">
          <table className="table table-sm table-striped border table-hover">
            <thead className="table-secondary">
              <tr className='fs-5 '>
                <th scope="col">Nr</th>
                <th scope="col">Shifra</th>
                <th scope="col">Emertimi</th>
                <th scope="col">Pershkrimi</th>
                <th scope="col">Sasia</th>
                <th scope="col">CmimiBlerjes</th>
                <th scope="col">CmimiShitjes</th>
                <th scope="col">Komenti</th>
                <th scope="col">me Fature te Rregullt</th>
                <th scope="col">Kategoria</th>
                <th scope="col">TVSH %</th>
                <th scope="col">Opsionet</th>
              </tr>
            </thead>
            <tbody>
              {filteredProduktet.map((item, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{item.shifra}</td>
                  <td>{item.emertimi}</td>
                  <td>{item.pershkrimi}</td>
                  <td>{item.sasia}</td>
                  <td>{item.cmimiBlerjes} €</td>
                  <td>{item.cmimiShitjes} €</td>
                  <td>{item.komenti}</td>
                  <td>{item.meFatureTeRregullt}</td>
                  <td>{item.emertimiKategorise}</td>
                  <td>{item.tvsh} %</td>
                  <td>
                    <Button  variant='info' onClick={() => handleDetaje(item.produktiID)}>Detaje...</Button>
                    {item.sasia > 0 ? '' :
                      <Button variant='outline-danger' className='m-1' onClick={() => thirreModalPerPyetje(item.produktiID)}>
                        {loading && idPerAnulim === item.produktiID ? (
                          <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        ) : (
                          <FontAwesomeIcon icon={faTrashCan} />
                        )}
                      </Button>
                    }
                    <Button  variant='outline-primary' className='m-1' onClick={() => thirreNdryshoProduktin(item)}><FontAwesomeIcon icon={faPencil}/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        }
      </Row>

      <ShtoNjeProdukt show={showModal} prejardhja={'meRefresh'} handleClose={handleCloseModal} produkti = {produkti}/>
      <ModalPerPyetje show={showModalPerPyetje} handleConfirm={handleConfirmModalPerPyetje} handleClose={handleCloseModalPerPyetje} />
      <ToastContainer />
    </Container>
  );
}

import { useState,useEffect } from 'react'
import { Col, Container, Row,Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from './ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShtoNjeProdukt from './ShtoNjeProdukt';


export default function Produktet() {
  const [produktet,setProduktet] = useState([])
  const [showModal,setShowModal] = useState(false)
  useEffect(() => {
    window.api.fetchTableProdukti().then(receivedData => {
      setProduktet(receivedData);
    });
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <Container>
      <Row>
        <Col className='d-flex justify-content-start'>

          <Button variant='success' className='text-light p-3 fs-5 mx-3' onClick={() => setShowModal(true)}>Krijo Nje Produkt</Button>
          <Button variant='info' className='text-dark p-3 fs-5 mx-3'>Kategorite</Button>

        </Col>
      </Row>

      <Row>
      <div className="table-responsive tabeleMeMaxHeight mt-4">
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
            {produktet.map((item,index) => (
              <tr key={index}>
                <th scope="row">{index+1}</th>
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
                    <Button className='btn btn-primary'>Detaje...</Button>
                    <Button className='btn bg-transparent border-0 text-danger'><FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} /></Button>
                  </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </Row>

      <ShtoNjeProdukt show={showModal} handleClose={handleCloseModal} />

    </Container>
  )
}

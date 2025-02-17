import  { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillTransfer, faList ,faExchangeAlt } from '@fortawesome/free-solid-svg-icons'; 
import { Row, Col, Button, Form,Spinner,Modal, Container, InputGroup, FormGroup} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from '../ModalPerPyetje'
import KerkoProduktin from '../stoku/KerkoProduktin';
import AuthContext, { normalizoDaten , localTodayDate, formatLongDateToAlbanian } from '../AuthContext';
import Shpenzimet from './Shpenzimet';
import LlojetShpenzimeve from './LlojetShpenzimeve'
import ShtoShpenzim from './ShtoShpenzim';
import NgaStokiNeShpenzim from './NgaStokiNeShpenzim';

export default function Shpenzim() {
  const [activeTab, setActiveTab] = useState("shpenzimet");


  return (
    <Container>
      <Row className="my-5 d-flex justify-content-center">
        <Col xs="auto">
          <Button
            variant={activeTab === "shpenzimet" ? "primary" : "outline-primary"}
            onClick={() => setActiveTab("shpenzimet")}
          >
            <FontAwesomeIcon icon={faMoneyBillTransfer} /> Shpenzimet
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant={
              activeTab === "llojetShpenzimeve" ? "primary" : "outline-primary"
            }
            onClick={() => setActiveTab("llojetShpenzimeve")}
          >
            <FontAwesomeIcon icon={faList} /> Llojet e Shpenzimeve
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant={
              activeTab === "kaloNgaStoki" ? "primary" : "outline-primary"
            }
            onClick={() => setActiveTab("kaloNgaStoki")}
          >
            <FontAwesomeIcon icon={faExchangeAlt} /> Kalo Nga Stoki ne Shpenzim
          </Button>
        </Col>
      </Row>

      {activeTab === "shpenzimet" && (
        <Row className="d-flex flex-row">
          <Col lg={3}> {/* Adjusted width for ShtoShpenzim */}
            <ShtoShpenzim />
          </Col>
          <Col lg={9}> {/* Adjusted width for Shpenzimet */}
            <Shpenzimet />
          </Col>
        </Row>
      )}

      {activeTab === "llojetShpenzimeve" && <LlojetShpenzimeve />}
      {activeTab === "kaloNgaStoki" && <NgaStokiNeShpenzim />}
    </Container>
  );
}

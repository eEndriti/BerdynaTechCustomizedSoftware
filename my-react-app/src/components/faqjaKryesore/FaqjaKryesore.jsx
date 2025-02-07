import { Container,Row,Col } from 'react-bootstrap'
import Transaksionet from './Transaksionet';
import Porosite from './Porosite';
import Serviset from './Serviset';

function FaqjaKryesoreAdmin() {
 

  return (
    <Container fluid className="pt-3 modern-container">
     
          <Row>
            <Transaksionet />
          </Row>

          <Row>

            <Col lg={6} md={12} className="mb-4">
              <Porosite />
            </Col>

            <Col lg={6} md={12} className="mb-4">
              <Serviset />
            </Col>
           
      </Row>
    </Container>

  )
}

export default FaqjaKryesoreAdmin
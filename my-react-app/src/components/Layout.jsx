import { Container, Row, Col } from 'react-bootstrap';
import logo from '../assets/BtechLogo.png';
import { Link, Outlet,useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation(); // Hook to get the current location object

  return (
    <div className='container-fluid p-0'>
      <div className='row no-gutters bg-dark text-light'>
        <div className='col-xs-12 col-sm-8 col-md-8 d-flex flex-row justify-content-between align-items-center'>
          <div className='col-xs-12 col-sm-4 col-md-4 col-lg-4'>
            <p>Totali me Avans <span>156</span> </p>
          </div>
          <div className='col-xs-12 col-sm-4 col-md-4 col-lg-4'>
            <p>Per Bonuse <span>156</span></p>
          </div>
          <div className='col-xs-12 col-sm-4 col-md-4 col-lg-4'>
            <p>Nderrimi<span>1/01.01.2024</span></p>
          </div>
        </div>
       
        <div className='col-xs-12 col-sm-4 col-md-4 d-flex flex-row justify-content-between align-items-center'>
          <div className='col-xs-12 col-sm-6 col-md-6 col-lg-6 text-center'>
            <p>Perdoruesi</p>
          </div>
          <div className='col-xs-12 col-sm-6 col-md-6 col-lg-6 text-center'>
            <Link to='/login'>Dil</Link>
          </div>
        </div>
      </div>

      <Container fluid className='h-100'>
      <Row className='h-100'>
        {/* Sidebar */}
        <Col xs={12} sm={4} md={2} className='bg-light d-flex flex-column h-100'>
          <div className='logo d-flex justify-content-center my-4'>
            <img className='w-75' src={logo} alt="logo" />
          </div>
          <div className='butonat d-flex flex-column flex-grow-1 h-100 justify-content-between '>
              <Link className='fs-4' to='/faqjaKryesore'>Kryefaqja</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>              
              <Link className='fs-4' to='/shitje'>Shitje</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>
              <Link className='fs-4' to='/shitje'>Shitje</Link>
            <div className='current-url p-3'>
              <p>Current URL: {location.pathname}</p> {/* Display the current URL */}
            </div>
          </div>
        </Col>

        {/* Main Content Area */}
        <Col xs={12} sm={8} md={10} className='p-0'>
          <Outlet />
        </Col>
      </Row>
    </Container>
    </div>
  );
}

export default Layout;

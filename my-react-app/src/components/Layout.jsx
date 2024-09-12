import { Container, Row, Col } from 'react-bootstrap';
import logo from '../assets/BtechLogo.png';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import '../assets/css/Layout.css'
function Layout() {
  const location = useLocation(); // Hook to get the current location object

  return (
    <div className='container-fluid p-0'>
      {/* Top Navigation Bar */}
      <div className='row no-gutters navTop text-light p-2'>
        <div className='col-xs-12 col-sm-8 col-md-8 d-flex flex-row justify-content-between align-items-center'>
          <div className='col-xs-12 col-sm-4 col-md-4 col-lg-4'>
            <p className='mb-0'>Totali me Avans <span>156</span></p>
          </div>
          <div className='col-xs-12 col-sm-4 col-md-4 col-lg-4'>
            <p className='mb-0'>Per Bonuse <span>156</span></p>
          </div>
          <div className='col-xs-12 col-sm-4 col-md-4 col-lg-4'>
            <p className='mb-0'>Nderrimi <span>1/01.01.2024</span></p>
          </div>
        </div>
       
        <div className='col-xs-12 col-sm-4 col-md-4 d-flex flex-row justify-content-between align-items-center'>
          <div className='col-xs-12 col-sm-6 col-md-6 col-lg-6 text-center'>
            <p className='mb-0'>Perdoruesi</p>
          </div>
          <div className='col-xs-12 col-sm-6 col-md-6 col-lg-6 text-center'>
            <NavLink to='/login' className='btn butoni'>Dil</NavLink>
          </div>
        </div>
      </div>

      <Container fluid className='p-0'>
        <Row className='g-0'>
          {/* Sidebar */}
          <Col xs={12} sm={3} md={2} className='bg-sidebar sidebar'>
            <div className='logo d-flex justify-content-center mt-4 w-75'>
              <img className='w-50' src={logo} alt="logo" />
            </div>
            <div className='sidebar-content d-flex flex-column '>
              <NavLink exact to='/faqjaKryesore' className='nav-link' activeClassName='active'>
                Kryefaqja
              </NavLink>
              <NavLink to='/shitje' className='nav-link' activeClassName='active'>
                Shitje
              </NavLink>
              <NavLink   to='/shpenzim'   className='nav-link'   activeClassName='active'>
                Shpenzim
              </NavLink>
              <NavLink exact to='/blerje' className='nav-link' activeClassName='active'>
                Blerje
              </NavLink>
              <NavLink to='/serviset' className='nav-link' activeClassName='active'>
                Serviset
              </NavLink>
              <NavLink to='/stoku' className='nav-link' activeClassName='active'>
                Stoku
              </NavLink>
              <NavLink   to='/klient'   className='nav-link'   activeClassName='active'>
                Klient
              </NavLink>
              <NavLink exact to='/furnitor' className='nav-link' activeClassName='active'>
                Furnitor
              </NavLink>
              <NavLink to='/nderrimet' className='nav-link' activeClassName='active'>
                Nderrimet
              </NavLink>
              <NavLink   to='/evidenca'   className='nav-link'   activeClassName='active'>
                Evidenca
              </NavLink>
              <NavLink exact to='/transaksionet' className='nav-link' activeClassName='active'>
                Transaksionet
              </NavLink>
              <NavLink to='/parametrat' className='nav-link' activeClassName='active'>
                Parametrat
              </NavLink>

              {/* Add other NavLinks similarly */}
              <div className='current-url p-3'>
                <p>Current URL: {location.pathname}</p> {/* Display the current URL */}
              </div>
            </div>
          </Col>

          {/* Main Content Area */}
          <Col xs={12} sm={9} md={10} className='p-4'>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Layout;

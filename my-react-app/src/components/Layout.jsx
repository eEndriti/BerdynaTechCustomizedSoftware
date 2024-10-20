import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import logo from '../assets/BtechLogo.png';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import '../assets/css/Layout.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faExchangeAlt, faCoins, faGift } from '@fortawesome/free-solid-svg-icons';
import AnimatedSpinner from './AnimatedSpinner'

function Layout() {
  const location = useLocation(); // Hook to get the current location object
  const [avansi, setAvansi] = useState(0);
  const [nderrimi, setNderrimi] = useState();
  const [numriPercjelles, setNumriPercjelles] = useState();
  const [user, setUser] = useState();
  const [userRole, setUserRole] = useState();
  const [perBonuse, setPerBonuse] = useState(0);
  const [profiti, setProfiti] = useState([]);
  const [totalShumaPerBonuse,setTotalShumaPerBonuse] = useState()

  useEffect(() => {
    setAvansi(localStorage.getItem('avansi'));
    const data = formatDate(localStorage.getItem('dataFillimit'));
    setNderrimi(data);
    setNumriPercjelles(localStorage.getItem('numriPercjelles'));
    setUser(localStorage.getItem('emriPerdoruesit'));
    setUserRole(localStorage.getItem('aKaUser'));
  }, []);

  useEffect(() => {

    window.api.fetchTableProfitiDitor().then((receivedData) => {
      if (JSON.stringify(receivedData) !== JSON.stringify(profiti)) {
        setProfiti(receivedData);
      }
    });
    kalkuloBonusetDitore();
  }, [profiti]);

  function kalkuloBonusetDitore() {
    const totalShuma = profiti.reduce((accumulator, current) => accumulator + current.shuma, 0);
    setTotalShumaPerBonuse(totalShuma)
    let bonus = 0;
    console.log('tsh',totalShuma)

    if (totalShuma > 199) {
      bonus = 10; 
      const additionalAmount = totalShuma - 200;
      bonus += Math.floor(additionalAmount / 100) * 5;
    }

    setPerBonuse(bonus);
  }

  const LoadingBar = () => {
    const totalShuma = profiti.reduce((accumulator, current) => accumulator + current.shuma, 0);
    const percentage = (totalShuma / 200) * 100;
      return (
        <div style={{ width: '100%', backgroundColor: '#e0e0df', borderRadius: '5px' }}>
          <div
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage >= 100 ? 'green' : 'red',
              height: '5px',
              borderRadius: '5px',
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </div>
      );
    
  };

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
  };

  const logOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

    return (
      <div className='container-fluid p-0'>
        {/* Top Navigation Bar */}
        <Container fluid className='navTop text-light p-3 '>
          <Row className='align-items-center '>
            <Col xs={12} md={8} className='d-flex justify-content-between'>
              <div className='d-flex align-items-center'>
                <FontAwesomeIcon icon={faCoins} className='me-2 text-warning fs-5' />
                <span className='me-4'>Avans: <strong>{avansi} €</strong></span>
  
                <FontAwesomeIcon icon={faExchangeAlt} className='me-2 text-success fs-5' />
                <span className='me-4'>Nderrimi: <strong>{numriPercjelles}-{nderrimi}</strong></span>
  
                <Col className='mt-2'>
                  <Col className='d-flex flex-row pb-2'>
                    <FontAwesomeIcon icon={faGift} className='me-2 text-info fs-5' />
                    <span>Bonuse: <strong>{perBonuse} €</strong> <span className='d-inline mx-4 text-secondary'>{totalShumaPerBonuse} €</span></span>
                  </Col>
                  <Col className='w-50'><LoadingBar  /> </Col>
                </Col>
              </div>
               
            </Col>
  
            <Col xs={12} md={4} className='d-flex justify-content-end align-items-center'>
              <span className='me-3'>
                <FontAwesomeIcon icon={faUser} className='me-2 text-success fs-4' />
                {user} <span className='d-block text-muted'>Roli: {userRole}</span>
              </span>
              <NavLink onClick={() => logOut()} className='btn btn-danger'>
                <FontAwesomeIcon icon={faSignOutAlt} className='me-1' /> Dil
              </NavLink>
            </Col>
          </Row>
        </Container>
  
        <Container fluid className='p-0 pt-5'>
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
                <NavLink to='/shpenzim' className='nav-link' activeClassName='active'>
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
                <NavLink to='/klient' className='nav-link' activeClassName='active'>
                  Klient
                </NavLink>
                <NavLink exact to='/furnitor' className='nav-link' activeClassName='active'>
                  Furnitor
                </NavLink>
                <NavLink to='/nderrimet' className='nav-link' activeClassName='active'>
                  Nderrimet
                </NavLink>
                <NavLink to='/evidenca' className='nav-link' activeClassName='active'>
                  Evidenca
                </NavLink>
                <NavLink exact to='/transaksionet' className='nav-link' activeClassName='active'>
                  Transaksionet
                </NavLink>
                <NavLink to='/parametrat' className='nav-link' activeClassName='active'>
                  Parametrat
                </NavLink>
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

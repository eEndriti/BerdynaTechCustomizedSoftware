import { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Modal, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnimatedSpinner from './AnimatedSpinner';
import Cookies from 'js-cookie';

export default function Login() {
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [perdoruesiID, setPerdoruesiID] = useState('');
  const [fjalekalimi, setFjalekalimi] = useState('');
  const [currentShift, setCurrentShift] = useState(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [avansAmount, setAvansAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [receivedData, receivedShift] = await Promise.all([
          window.api.fetchTablePerdoruesi(),
          window.api.kontrolloNderriminAktual(),
        ]);
        setPerdoruesit(receivedData);
        setCurrentShift(receivedShift);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        localStorage.clear();
        clearAllCookies();
      }
    };

    fetchData();
  }, []);

  const setSessionCookie = (name, value) => {
    Cookies.set(name, value);
  };

  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };

  const handleLogin = async () => {
    const data = { perdoruesiID, fjalekalimi }; 
    try {
      const result = await window.api.login(data);
      if (result.success) {
        return result; 
      } else {
        toast.error(result.message || 'Login failed'); 
        return null; 
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const kontrolloKredinencialet = async () => {
    try {
      const perdoruesi = await handleLogin();
      if (perdoruesi) {
        // Store user data in cookies
        setSessionCookie('perdoruesiID', perdoruesi.perdoruesiID);
        setSessionCookie('emriPerdoruesit', perdoruesi.emertimi);
        setSessionCookie('aKaUser', perdoruesi.roli);

        const currentDate = new Date().toLocaleDateString();

        if (currentShift) {
          const shiftDate = new Date(currentShift.dataFillimit).toLocaleDateString();

          setSessionCookie('nderrimiID', currentShift.nderrimiID);
          setSessionCookie('avansi', currentShift.avansi);
          setSessionCookie('numriPercjelles', currentShift.numriPercjelles);
          setSessionCookie('dataFillimit', currentShift.dataFillimit);

          if (currentDate !== shiftDate) {
            await window.api.mbyllNderriminAktual();
            console.log('Nderrimi paraprak u mbyll.');
            setShowAdvanceModal(true);
          } else {
            window.location.href = 'faqjaKryesore';
          }
        } else {
          setShowAdvanceModal(true);
        }
      } else {
        toast.error('Keni Gabuar Perdoruesin ose Fjalekalimin');
      }
    } catch (error) {
      console.error("Error during login process:", error);
    }
  };

  const filloNderriminERi = async () => {
    setButtonLoading(true);
    try {
      await window.api.filloNderriminERi(perdoruesiID, avansAmount);
      await dataForCookies(); 
      setShowAdvanceModal(false);
      setAvansAmount('');
    } catch (error) {
      console.error("Gabim gjate fillimit te nderrimit te ri:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  const dataForCookies = async () => {
    try {
      const receivedShift = await window.api.kontrolloNderriminAktual();
      setSessionCookie('nderrimiID', receivedShift.nderrimiID);
      setSessionCookie('avansi', receivedShift.avansi);
      setSessionCookie('numriPercjelles', receivedShift.numriPercjelles);
      setSessionCookie('dataFillimit', receivedShift.dataFillimit);
    } catch (error) {
      console.log(error);
    } finally {
      window.location.href = 'faqjaKryesore';
    }
  };

  const closeAndStartNewShift = () => {
    if (currentShift) {
      setShowAdvanceModal(true);
    } else {
      alert('No active shift to close.');
    }
  };

  return (
    <>
      {loading ? (
        <AnimatedSpinner />
      ) : (
        <Container>
          <Row className='mt-5 pt-5'>
            <Form className="col-md-6 shadow-lg p-4 rounded bg-light">
              <h3 className="text-center text-primary mb-4">Kyqu</h3>

              <Form.Group className="mb-3" controlId="formPerdoruesi">
                <Form.Label>Perdoruesi:</Form.Label>
                <Form.Control
                  as="select"
                  value={perdoruesiID}
                  onChange={e => setPerdoruesiID(e.target.value)}
                >
                  <option value="" disabled>
                    Selekto Perdoruesin
                  </option>
                  {perdoruesit.map(perdoruesi => (
                    <option key={perdoruesi.perdoruesiID} value={perdoruesi.perdoruesiID}>
                      {perdoruesi.emri}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formFjalekalimi">
                <Form.Label>Fjalekalimi:</Form.Label>
                <Form.Control
                  type="password"
                  value={fjalekalimi}
                  onChange={e => setFjalekalimi(e.target.value)}
                  placeholder="Shkruaj fjalekalimin..."
                />
              </Form.Group>

              <Button
                variant="primary"
                className="w-100"
                onClick={kontrolloKredinencialet} // Trigger login process
              >
                Kyqu
              </Button>
            </Form>
          </Row>

          {/* Modal per me shenu avansin */}
          <Modal show={showAdvanceModal} onHide={buttonLoading ? null : () => setShowAdvanceModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Sheno Avansin:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Control
                type="number"
                placeholder="Sheno Shumen e Avansit..."
                value={avansAmount}
                onChange={e => setAvansAmount(e.target.value)}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAdvanceModal(false)}>
                Anulo
              </Button>
              <Button variant="primary" disabled={buttonLoading} onClick={() => {
                if (currentShift) {
                  closeAndStartNewShift();
                } else {
                  filloNderriminERi();
                }
              }}>
                {buttonLoading ? <><Spinner size="sm" /> {'Duke Startuar...'}</> : 'Vazhdo'}
              </Button>
            </Modal.Footer>
          </Modal>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

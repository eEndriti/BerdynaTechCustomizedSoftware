import { useState, useEffect } from 'react';
import { Container,Form, Button, Row, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnimatedSpinner from './AnimatedSpinner';

export default function Login() {
  // Clear localStorage on load
  
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [perdoruesiID, setPerdoruesiID] = useState('');
  const [fjalekalimi, setFjalekalimi] = useState('');
  const [currentShift, setCurrentShift] = useState(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [avansAmount, setAvansAmount] = useState('');
  const [loading,setLoading] = useState(true)

  useEffect(() => {
    window.api.fetchTablePerdoruesi().then(receivedData => {
      setPerdoruesit(receivedData);
    });
    window.api.kontrolloNderriminAktual().then(receivedShift => {
      setCurrentShift(receivedShift);
      setLoading(false);
    });
    localStorage.removeItem('aKaUser');
    localStorage.removeItem('perdoruesiID');

  }, []);
  

  // Function to handle login and shift management
  const kontrolloKredinencialet = () => {
    const perdoruesi = perdoruesit.find(
      user => user.perdoruesiID == perdoruesiID && user.fjalekalimiHash == fjalekalimi
    );

    if (perdoruesi) {
      localStorage.setItem('perdoruesiID', perdoruesiID);
      localStorage.setItem('emriPerdoruesit',perdoruesi.emri)

      if (perdoruesi.roli === 'admin') {
        localStorage.setItem('aKaUser', 'admin');
      } else {
        localStorage.setItem('aKaUser', 'perdorues');
      }

      // Check if the shift belongs to the current day
      const currentDate = new Date().toLocaleDateString();
      alert(currentShift)
      if (currentShift) {
        const shiftDate = new Date(currentShift.dataFillimit).toLocaleDateString();
        localStorage.setItem('nderrimiID', currentShift.nderrimiID);
        localStorage.setItem('avansi', currentShift.avansi); // Assuming 'avansi' is a direct property
        localStorage.setItem('numriPercjelles', currentShift.numriPercjelles);
        localStorage.setItem('dataFillimit', currentShift.dataFillimit);

        if (currentDate !== shiftDate) {
          // Automatically close the previous day's shift if it's still open
          window.api.mbyllNderriminAktual().then(() => {
            console.log('Previous shift closed.');
            setShowAdvanceModal(true); // Show modal to enter advance amount for new shift
          });
        } else {
          // Join the current shift if it's open for the current day
          window.location.href = 'faqjaKryesore';
        }
      } else {
        // No shift exists yet, so start a new one
        setShowAdvanceModal(true); // Show modal for advance amount
      }
    } else {
      toast.error('Keni Gabuar Perdoruesin ose Fjalekalimin')
    }
  };

  // Start a new shift
  const filloNderriminERi = () => {
    window.api.filloNderriminERi(perdoruesiID, avansAmount).then(() => {
      alert('Nderrimi i Ri Filloi, Punoni Trima!');
      window.location.href = 'faqjaKryesore';
    });
    setShowAdvanceModal(false); // Close the modal
    setAvansAmount(''); // Clear the advance amount
  };

  // Admin can close the current shift and start a new one
  const closeAndStartNewShift = () => {
    if (currentShift) {
      setShowAdvanceModal(true); // Show modal for new shift's advance amount
    } else {
      alert('No active shift to close.');
    }
  };

  return (
    <Container>
      {loading ? <AnimatedSpinner /> : 
      <div className="container">
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
              onClick={kontrolloKredinencialet}
            >
              Kyqu
            </Button>
          </Form>
      </Row>

      {/* Modal for entering advance amount */}
      <Modal show={showAdvanceModal} onHide={() => setShowAdvanceModal(false)}>
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
          <Button variant="primary" onClick={() => {
            if (currentShift) {
              closeAndStartNewShift(); // Start a new shift after closing the current one
            } else {
              filloNderriminERi(); // Start a new shift directly
            }
          }}>
            Vazhdo
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer/>
    </div>
    }
    </Container>
  );
}

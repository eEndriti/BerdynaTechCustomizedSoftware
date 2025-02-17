import  { useState, useEffect, useContext } from 'react';
import { Row, Col, Button, Form,Spinner, Container, InputGroup} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';

export default function ShtoShpenzim() {
    const [llojetShpenzimeve, setLlojetShpenzimeve] = useState([]);
    const [llojiShpenzimeveSelektuarID, setLlojiShpenzimeveSelektuarID] = useState();
    const [selectedShumaStandarde, setSelectedShumaStandarde] = useState();
    const [komenti, setKomenti] = useState('');
    const [loading,setLoading] = useState(false)
    const {authData} = useContext(AuthContext)
    const [buttonLoading,setButtonLoading] = useState(false)
  
    useEffect(() => {
  
      const fetchData = async () => {    
        await window.api.fetchTableLlojetShpenzimeve().then(receivedData => {
          setLlojetShpenzimeve(receivedData);
        });
      }
  
      fetchData()
    }, []);
  
  
    
    const handleSelectChange = (event) => {
      const selectedValue = event.target.value;
      setLlojiShpenzimeveSelektuarID(selectedValue);
      const selectedItem = llojetShpenzimeve.find(item => item.llojetShpenzimeveID == selectedValue);
      if (selectedItem) {
        setSelectedShumaStandarde(selectedItem.shumaStandarde);
      }
    };
  
    const shtoShpenzimin = async () => {
      setButtonLoading(true)
      const data = {
        shumaShpenzimit: selectedShumaStandarde,
        komenti: komenti,
        llojetShpenzimeveID: llojiShpenzimeveSelektuarID,
        perdoruesiID: authData.perdoruesiID,
        nderrimiID:authData.nderrimiID
      };
      const result = await window.api.insertShpenzimi(data);
      if (result.success) {
        setLoading(false)
        toast.success('Shpenzimi u Regjistrua me Sukses!', {
          position: "top-center",  
          autoClose: 1500, 
          onClose: () => window.location.reload(), 
        });            
      } else {
        setLoading(false)
        toast.error('Gabim gjate regjistrimit: ' + result.error);
      }
      setButtonLoading(false)
    };
  
  return (
    <Container>
        <Row >
                <Col className='d-flex flex-column justify-content-start bg-light border rounded p-4 shadow-sm '>
                  <h3 className='text-center mb-4'>Shto nje Shpenzim</h3>
        
                  <Form className='d-flex flex-column align-items-center justify-content-center'>
                    
                    {/* Select Expense Type */}
                    <Form.Group className='mb-4 w-100'>
                      <Form.Label className='mb-2'>Lloji i Shpenzimit</Form.Label>
                      <Form.Select
                        onChange={handleSelectChange}
                        aria-label="Selekto nje Lloj Shpenzimi"
                        value={llojiShpenzimeveSelektuarID}
                      >
                        <option value="" >Selekto nje Lloj Shpenzimi</option>
                        {llojetShpenzimeve.map((item, index) => (
                          <option key={index} value={item.llojetShpenzimeveID}>
                            {item.emertimi}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
        
                    {/* Amount Input with Currency */}
                    <Form.Group className='mb-4 w-100'>
                      <Form.Label className='mb-2'>Shuma per Shpenzim</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type='number'
                          placeholder='P.sh 20,50,etj...'
                          value={selectedShumaStandarde}
                          onChange={(e) => setSelectedShumaStandarde(e.target.value)}
                          min="1"
                        />
                        <InputGroup.Text>€</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
        
                    {/* Comment Textarea */}
                    <Form.Group className='mb-4 w-100'>
                      <Form.Label className='mb-2'>Komenti i Shpenzimit</Form.Label>
                      <Form.Control
                        as='textarea'
                        rows={3}
                        placeholder='Opsionale nese deshironi te tregoni arsyen...'
                        onChange={(e) => setKomenti(e.target.value)}
                      />
                    </Form.Group>
        
                    {/* Submit Button */}
                    <Button
                      variant='success'
                      className='w-100 mt-3'
                      onClick={() => shtoShpenzimin()}
                      disabled={loading || selectedShumaStandarde < 1 || !llojiShpenzimeveSelektuarID || buttonLoading}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation='border' size='sm' role='status' aria-hidden={true} /> 
                          {`Duke Ruajtur...`}
                        </>
                      ) : (
                        'Regjistro'
                      )}
                    </Button>
                  </Form>
                </Col>
              </Row>
    </Container>
  )
}

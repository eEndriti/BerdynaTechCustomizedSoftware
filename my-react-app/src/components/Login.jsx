import  { useState,useEffect } from 'react'
import { Form,Button,Row} from 'react-bootstrap'

export default function Login() {
  localStorage.removeItem('aKaUser')
  localStorage.removeItem('perdoruesiID')

    const [perdoruesit,setPerdoruesit] = useState([])
    const [perdoruesiID,setPerdoruesiID] = useState('')
    const [fjalekalimi,setFjalekalimi] = useState('')
    useEffect(() => {
        window.api.fetchTablePerdoruesi().then(receivedData => {
          setPerdoruesit(receivedData);
          console.log(perdoruesit)
        });
      }, []);
      const kontrolloKredinencialet = () =>{
       perdoruesit.map(perdoruesi =>{
        if(perdoruesi.fjalekalimiHash == fjalekalimi && perdoruesi.perdoruesiID == perdoruesiID){
          if(perdoruesi.roli === 'admin'){
            localStorage.setItem('aKaUser','admin')
            localStorage.setItem('perdoruesiID',perdoruesiID)
            window.location.href = 'faqjaKryesore';
            
            return
          }else if(perdoruesi.roli === 'perdorues'){
            localStorage.setItem('aKaUser','perdorues')
            localStorage.setItem('perdoruesiID',perdoruesiID)
            window.location.href = 'faqjaKryesore';
            return
          }
          
        }else{
          return console.log('e pasakt')
        }
       })
      }
  return (
    <div className='container'>
        <Row >
          <Form className='col-xs-12 col-sm-12 col-md-10 col-lg-10 w-100 d-flex flex-column justify-content-center align-items-center'>
              <Form.Label style={{ color: '#2C3E50' }}>Perdoruesi:</Form.Label>
                  <Form.Control  className='w-25'
                      as="select" 
                      value={perdoruesiID} 
                      onChange={(e) => setPerdoruesiID(e.target.value)} 
                      style={{ borderColor: '#4CAF50' }}
                  >
                      <option value="" disabled>Selekto Perdoruesin</option>
                      {perdoruesit.map((perdoruesi) => (
                      <option key={perdoruesi.perdoruesiID} value={perdoruesi.perdoruesiID}>
                          {perdoruesi.emri}
                      </option>
                      ))}
                  </Form.Control>
                <Form.Label style={{ color: '#2C3E50' }}>Fjalekalimi</Form.Label>
                  <Form.Control className='w-25'
                    type="password"
                    value={fjalekalimi}
                    onChange={(e) => setFjalekalimi(e.target.value)}
                    style={{ borderColor: '#4CAF50' }}
                    placeholder="Sheno Fjalekalimin..."
                  />
                <Button
                  variant="success"
                  className="mt-4 w-25"
                  onClick={() => {kontrolloKredinencialet()}}
                  style={{ backgroundColor: '#4CAF50', borderColor: '#388E3C', width: '100%' }}
                  >
                  Kyqu
                </Button>
          </Form>
        </Row>
    </div>
  )
}


import {useState,useEffect} from 'react'
import { Container,Row,Col,Button,Table } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import AnimatedSpinner from './AnimatedSpinner';

export default function Perdoruesit() {
    const [loading,setLoading] = useState(true)
    const [perdoruesit,setPerdoruesit] = useState([])

    useEffect(() =>{
        const fetchData = async () => {
            try{
                await window.api.fetchTablePerdoruesi().then((receivedData) => {
                    setPerdoruesit(receivedData)
                })
            }catch(error){
                console.log(error)
            }finally{
                setLoading(false)
            }
        }
        fetchData()
    },[])
  return (
  <>
    {loading ? <AnimatedSpinner/> : <Container>
        <Row>    
            <Button variant="success" onClick={''}>Shto Perdorues të Ri</Button>
        </Row>
        <Row>
        <Table striped bordered hover className="mt-3">
            <thead>
            <tr>
                <th>Nr.</th>
                <th>Emri i Perdoruesit</th>
                <th>Fjalekalimi</th>
                <th>Roli</th>
                <th>Veprime</th>
            </tr>
            </thead>
            <tbody>
            {perdoruesit.slice().reverse().map((item, index) => (
            <tr key={index}>
                {item.punonjesit != 0 ? (
                <>
                    <th scope="row">{perdoruesit.length - index}</th>
                    <td>{item.emri}</td>
                    <td>{item.fjalekalimiHash}</td>
                    <td>{item.roli}</td>
                    <td>
                    <Button variant="outline-primary" className="me-2" onClick={'() => ndryshoTransaksionin(item.lloji, item.transaksioniID)'}>
                              <FontAwesomeIcon icon={faPen} /> Ndrysho
                            </Button>
                            
                            <Button variant="outline-danger" className="me-2" onClick={'() => handleDelete(item.transaksioniID)'}>
                              <FontAwesomeIcon icon={faTrashCan} /> Fshij
                            </Button>
                    </td>
                </>
                ) : 'Nuk ka te dhena!'}
            </tr>
            ))}

            </tbody>
        </Table>
        </Row>
    </Container>}
  </>
  )
}

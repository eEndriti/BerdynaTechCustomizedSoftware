import {useState,useEffect} from 'react'
import { Container,Row,Col,Button,Table } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import AnimatedSpinner from './AnimatedSpinner';

export default function MenyratPagesave() {
    const [loading,setLoading] = useState(true)
    const [menyratPagesave,setMenyratPagesave] = useState([])

    useEffect(() =>{
        const fetchData = async () => {
            try{
                await window.api.fetchTableQuery('select m.menyraPagesesID,m.emertimi,b.shuma from menyraPageses m join balanci b on b.menyraPagesesID = m.menyraPagesesID').then((receivedData) => {
                    setMenyratPagesave(receivedData)
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
            <Button variant="success" onClick={''}>Shto Opsion të Ri Pagese</Button>
        </Row>
        <Row>
        <Table striped bordered hover className="mt-3">
            <thead>
            <tr>
                <th>Nr.</th>
                <th>Emertimi</th>
                <th>Bilanci Aktual</th>
                <th>Veprime</th>
            </tr>
            </thead>
            <tbody>
            {menyratPagesave.slice().reverse().map((item, index) => (
            <tr key={index}>
                {item.punonjesit != 0 ? (
                <>
                    <th scope="row">{menyratPagesave.length - index}</th>
                    <td>{item.emertimi}</td>
                    <td>{item.shuma.toFixed(2)} €</td>
                    <td>
                    <Button className='btn btn-primary'  onClick={'() => ndryshoTransaksionin(item.lloji, item.transaksioniID)'}>
                        <FontAwesomeIcon icon={faPen}/>
                    </Button>
                    <Button className='btn bg-transparent border-0 text-danger' onClick={''}>
                        <FontAwesomeIcon className="fs-4 mt-1" icon={faTrashCan} />
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

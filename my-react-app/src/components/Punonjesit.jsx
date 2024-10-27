import {useState,useEffect} from 'react'
import { Container,Row,Col,Button,Table } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import AnimatedSpinner from './AnimatedSpinner';

export default function Punonjesit() {
    const [loading,setLoading] = useState(true)
    const [punonjesit,setPunonjesit] = useState([])

    useEffect(() =>{
        const fetchData = async () => {
            try{
                await window.api.fetchTablePunonjesit().then((receivedData) => {
                    setPunonjesit(receivedData)
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
        {loading ? <AnimatedSpinner/> : 
             <Container>
             <Row>    
                 <Button variant="success" onClick={''}>Shto Punonjës të Ri</Button>
             </Row>
             <Row>
             <Table striped bordered hover className="mt-3">
                 <thead>
                   <tr>
                     <th>Nr.</th>
                     <th>Emri</th>
                     <th>Mbiemri</th>
                     <th>Data e Punesimit</th>
                     <th>Paga Baze</th>
                     <th>Statusi</th>
                     <th>Nr.Telefonit</th>
                     <th>Veprime</th>
                   </tr>
                 </thead>
                 <tbody>
                 {punonjesit.slice().reverse().map((item, index) => (
                   <tr key={index}>
                     {item.punonjesit != 0 ? (
                       <>
                         <th scope="row">{punonjesit.length - index}</th>
                         <td>{item.emri}</td>
                         <td>{item.mbiemri}</td>
                         <td>{new Date(item.dataPunësimit)}</td>
                         <td>{item.pagaBaze}</td>
                         <td>{item.aktiv == 1 ? 'Aktiv' : 'Jo Aktiv'}</td>
                         <td>{item.nrTelefonit}</td>
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
        </Container>
        }
    </>
  )
}

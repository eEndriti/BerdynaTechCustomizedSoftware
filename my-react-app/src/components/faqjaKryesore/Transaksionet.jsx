import { useState,useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { Container,Button,Row,Col,Modal,Form, Spinner, InputGroup,Table,Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from '../ModalPerPyetje'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateServise from '../UpdateServise';
import AnimatedSpinner from '../AnimatedSpinner';
import AuthContext, { formatCurrency } from '../AuthContext';

export default function Transaksionet() {
    const navigate = useNavigate()
    const [loading,setLoading] = useState(true)
    const [transaksionet,setTransaksionet] = useState([])
    const [transaksionetENderrimit,setTransaksionetENderrimit] = useState([])
    const { authData } = useContext(AuthContext)
    const [buttonLoading,setButtonLoading] = useState(false)
    const [showModalPerPyetje,setShowModalPerPyetje] = useState(false)
    const [dataPerPerdorim,setDataPerPerdorim] = useState({})

    useEffect(() => {

        const fetchData = async () => {
          try{
            const [transaksionetData] = await Promise.all([
              window.api.fetchTableTransaksionet(),
            ]);

            setTransaksionet(transaksionetData);
          }catch(e){
            console.log(e)
          }finally{
            setLoading(false)
          }
        };
      
        fetchData();
    
      }, []);
      
      useEffect(() => {
        const filteredTransaksionet = transaksionet.filter(item => {
          const isMatchingShift = item.nderrimiID == Number(authData.nderrimiID);
          const isPublic = authData.aKaUser == "perdorues" ? item.eshtePublik : true;
          return isMatchingShift && isPublic;
        });
        setTransaksionetENderrimit(filteredTransaksionet);
        console.log(filteredTransaksionet)

      }, [transaksionet, authData.nderrimiID, authData.aKaUser]);
      
    const ndryshoTransaksionin = async (item) => {

        const data = {
            lloji:item.lloji,
            transaksioniID:item.transaksioniID
          }
        try{
            let result

            switch(item.lloji){
                case 'Shitje' : navigate(`/ndryshoShitjen/${item.llojiID}`)
                    break;
                case 'Blerje' :  navigate(`/ndryshoBlerjen/${item.llojiID}`)
                    break;
                case 'Shpenzim' : result = await window.api.anuloShpenzimin(data) // kur te rregullohet faqja shpenzimi e vazhdojm ktu
                    break;
                case 'Servisim' : console.log(item.lloji) // kur te rregullohet faqja servismi e vazhdojm ktu
                    break;
                default : console.log('Gabim')
            }

            if (result.success) {
                toast.success(`Transaksioni i llojit ${item.lloji} u Anulua me Sukses !`, {
                  position: "top-center",  
                  autoClose: 1500,
                  onClose: () =>       window.location.reload()
                });            ;
                
              } else {
                toast.error('Gabim gjate Anulimit: ' + result.error);
              }
        }catch(e){
            console.log(e)
        }finally{
            setButtonLoading(false)
        }
    }

    const thirreModalPerPyetje = (item) => {
        setDataPerPerdorim(item)
        setShowModalPerPyetje(true)
    }

    const confirmModalPerPyetje = async () => {
        const data = {
            lloji:dataPerPerdorim.lloji,
            transaksioniID:dataPerPerdorim.transaksioniID
          }
        try{
            let result

            switch(dataPerPerdorim.lloji){
                case 'Shitje' : result = await window.api.anuloShitjen(data)
                    break;
                case 'Blerje' : result = await window.api.anuloBlerjen(data)
                    break;
                case 'Shpenzim' : result = await window.api.anuloShpenzimin(data)
                    break;
                case 'Servisim' : console.log(dataPerPerdorim.lloji)
                    break;
                default : console.log('Gabim')
            }

            if (result.success) {
                toast.success(`Transaksioni i llojit ${dataPerPerdorim.lloji} u Anulua me Sukses !`, {
                  position: "top-center",  
                  autoClose: 1500,
                  onClose: () =>       window.location.reload()
                });            ;
                
              } else {
                toast.error('Gabim gjate Anulimit: ' + result.error);
              }
        }catch(e){
            console.log(e)
        }finally{
            setButtonLoading(false)
        }
    }

  return (
    <Container fluid className="pt-3 modern-container">
    {loading ? (
      <AnimatedSpinner />
    ) : (
        <Row className="section-container my-4">
        <h3 className="section-title">Transaksionet e Nderrimit</h3>
        <div className="table-container tableHeight50">
            <Table responsive="sm" striped bordered hover size="sm" className="custom-table">
            <thead className="table-header">
                <tr>
                <th>Nr</th>
                <th>Shifra</th>
                <th>Lloji</th>
                <th>Pershkrimi</th>
                <th>Totali Për Pagesë</th>
                <th>Totali Pagesës</th>
                <th>Mbetja Për Pagesë</th>
                <th>Komenti</th>
                <th>Koha</th>
                <th>Opsionet</th>
                </tr>
            </thead>
            <tbody>
                {transaksionetENderrimit.slice().reverse().map((item, index) => (
                item.transaksioniID !== 0 && (
                    <tr key={index}>
                    <td>{transaksionetENderrimit.length - index}</td>
                    <td>{item.shifra}</td>
                    <td>{item.lloji}</td>
                    <td className="text-wrap">{item.pershkrimi}</td>
                    <td>{formatCurrency(item.totaliperPagese)}</td>
                    <td>{formatCurrency(item.totaliIPageses)}</td>
                    <td
                        className={
                        item.mbetjaPerPagese > 0
                            ? "text-danger fw-bold"
                            : "text-success fw-bold"
                        }
                    >
                        {formatCurrency(item.mbetjaPerPagese)}
                    </td>
                    <td>{item.komenti}</td>
                    <td>{item.dataTransaksionit.toLocaleTimeString()}</td>
                    <td className="d-flex flex-row justify-content-around">
                        <Button
                        variant="outline-primary"
                        className="mx-1"
                        disabled
                        onClick={() => ndryshoTransaksionin(item)}
                        >
                        <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                        variant="outline-danger"
                        className="mx-1"
                        onClick={() =>
                            thirreModalPerPyetje(item)
                        }
                        >
                        <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                    </td>
                    </tr>
                )
                ))}
            </tbody>
            </Table>
        </div>
        </Row>
    )}
    <ModalPerPyetje show={showModalPerPyetje} handleClose={()=> setShowModalPerPyetje(false)} handleConfirm={confirmModalPerPyetje} />
    <ToastContainer/>
  </Container>
  )
}

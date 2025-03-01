import { useState,useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { Container,Button,Row,Col,Modal,Form, Spinner, InputGroup,Table,Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashCan,faCheck } from '@fortawesome/free-solid-svg-icons'; 
import ModalPerPyetje from '../ModalPerPyetje'
import {useToast} from '../ToastProvider'

import AnimatedSpinner from '../AnimatedSpinner';
import AuthContext, { formatCurrency, formatDate, formatLongDateToAlbanian, normalizoDaten } from '../AuthContext';
import Charts from './Charts';

export default function Transaksionet() {
    const navigate = useNavigate()
    const [loading,setLoading] = useState(true)
    const [transaksionet,setTransaksionet] = useState([])
    const [transaksionetENderrimit,setTransaksionetENderrimit] = useState([])
    const { authData } = useContext(AuthContext)
    const [buttonLoading,setButtonLoading] = useState(false)
    const [showModalPerPyetje,setShowModalPerPyetje] = useState(false)
    const [dataPerPerdorim,setDataPerPerdorim] = useState({})
    const [nderrimet,setNderrimet] = useState([])
    const [selectedNderrimi,setSelectedNderrimi] = useState()
    const [selectedNderrimiData,setSelectedNderrimiData] = useState()
    const [tregoGrafikun,setTregoGrafikun] = useState(false)
    const showToast = useToast();

    useEffect(() => {

        fetchData();
    
      }, []);
      
      const fetchData = async () => {
        try{
          const [transaksionetData,nderrimetData] = await Promise.all([
            window.api.fetchTableTransaksionet(),
            window.api.fetchTableNderrimi(),
          ]);

          setTransaksionet(transaksionetData);
          setNderrimet(nderrimetData)

        }catch(e){
          console.log(e)
        }finally{
          setLoading(false)
        }
      };
    
      useEffect(() => {
        if(selectedNderrimi){
          setTregoGrafikun(true)
          const filterResult = nderrimet.find(item => item.nderrimiID = selectedNderrimi )
        console.log(filterResult)
        const dataFormatuar = formatLongDateToAlbanian(filterResult.dataFillimit)
        setSelectedNderrimiData({
          nrPercjelles:filterResult.numriPercjelles,
          dataFillimit:dataFormatuar
        })
        }
      },[selectedNderrimi])

      useEffect(() => {
        const filteredTransaksionet = transaksionet.filter(item => {
          const isMatchingShift = item.nderrimiID == Number(authData.nderrimiID);
          const isPublic = authData.aKaUser == "perdorues" ? item.eshtePublik : true;
          return isMatchingShift && isPublic;
        });
        setTransaksionetENderrimit(filteredTransaksionet);

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
              showToast(`Transaksioni i llojit ${item.lloji} u Anulua me Sukses!`, "success");
               fetchData();
                
              } else {
                showToast("Gabim gjatë ndryshimit!", "error"); 
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
              showToast(`Transaksioni i llojit ${dataPerPerdorim.lloji} u Anulua me Sukses!`, "success");
               fetchData();
              } else {
                showToast("Gabim gjatë Anulimit!", "error"); 
 
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

    {authData.aKaUser == 'admin' && 
      <Row className='d-flex flex-column align-items-center '>
        <Col lg={3} className='mb-3 d-flex'>
          <Col className='mx-2'>
            <Form.Select 
              value={selectedNderrimi || ""} // Ensures default is selected
              onChange={(e) => setSelectedNderrimi(e.target.value)}
            >
              <option value="" disabled>
                Selekto Nderrimin
              </option>
              {nderrimet.slice(0, -1).reverse().map((item) => (
                <option key={item.nderrimiID} value={item.nderrimiID}>
                  {item.numriPercjelles} - {formatLongDateToAlbanian(item.dataFillimit)}
                </option>
              ))}
            </Form.Select>

          </Col>
          <Col>
              {selectedNderrimi &&               <Button variant='outline-primary' onClick={() => {setTregoGrafikun(false);setSelectedNderrimi('')}}>{tregoGrafikun ? 'Mbyll Grafikun' : 'Krahaso Nderrimet'}</Button>
            }
          </Col>
        </Col>
        <Col lg={10} className='mb-3'>
          {selectedNderrimiData && tregoGrafikun && <Charts transaksionet={transaksionet} nderrimiAktual={authData.nderrimiID} nderrimiSelektuar={selectedNderrimi} nrPercjelles={selectedNderrimiData.nrPercjelles} dataNderrimitSelektuar={selectedNderrimiData.dataFillimit}/>}
        </Col>
      </Row>}
    <ModalPerPyetje show={showModalPerPyetje} handleClose={()=> setShowModalPerPyetje(false)} handleConfirm={confirmModalPerPyetje} />
  </Container>
  )
}

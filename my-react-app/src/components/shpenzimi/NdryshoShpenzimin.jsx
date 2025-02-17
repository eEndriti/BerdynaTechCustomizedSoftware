import React, { useState, useEffect } from 'react'
import {Modal,Form,Button,Spinner} from 'react-bootstrap'
import AnimatedSpinner from '../AnimatedSpinner'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function NdryshoShpenzimin({show,handleClose,dataPerNdryshim = {}}) {
    
    const [buttonLoading,setButtonLoading] = useState(false)
    const [loading,setLoading] = useState(true)
    const [llojiShpenzimeveSelektuarID,setLlojiShpenzimeveSelektuarID] = useState()
    const [llojetShpenzimeve,setLlojetShpenzimeve] = useState({})
    const [selectedShumaStandarde,setSelectedShumaStandarde] = useState()
    const [data,setData] = useState()

    useEffect(() => {
        const fetchData = async() => {
            try{
                await window.api.fetchTableLlojetShpenzimeve().then(receivedData => {
                    setLlojetShpenzimeve(receivedData);
                    setData(dataPerNdryshim)
                  });
            }catch(e){
                console.log(e)
            }finally{
                setLoading(false)
                ndryshoSelektimin(dataPerNdryshim.llojetShpenzimeveID)
            }
        }

        fetchData()
    },[show])

    const ndryshoSelektimin = (vlera) => {
        setLlojiShpenzimeveSelektuarID(vlera);
        const selectedItem = llojetShpenzimeve.find(item => item.llojetShpenzimeveID == vlera);
        if (selectedItem) {
          setSelectedShumaStandarde(selectedItem.shumaStandarde);
        }
      };

      const handleSelectChange = (event) => {
        ndryshoSelektimin(event.target.value)
      }

     const handleRuajNdryshimet = async () =>{

        setButtonLoading(true)
        let result
        
        try{
            const data2 = {
                llojetShpenzimeveID:llojiShpenzimeveSelektuarID,
                shumaShpenzimit:data.shumaShpenzimit,
                komenti:data.komenti,
                transaksioniID:data.transaksioniID,
                shpenzimiID:data.shpenzimiID
              }
               result = await window.api.ndryshoShpenzimin(data2)
            
            setButtonLoading(false)
            if (result.success) {
              toast.success('Ndryshimet u ruajten me sukses!', {
                position: 'top-center',
                autoClose: 1500,
                onClose: () => window.location.reload(),
              });
            } else {
              setLoading(false)
              toast.error('Gabim gjate ndryshimit: ' + result.error);
            }
        }catch(e){
            console.log(e)
        }finally{
            setButtonLoading(false)
            handleClose()
        }
    }

    const handleInputChange = (target) => {
        const {name,value} = target

        setData({
            ...data,
            [name]:value
        })
        
    }

  return (
   <>
    {loading ? <AnimatedSpinner/> :
    <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
        <Modal.Title>Ndrysho Shpenzimin</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form.Group>
        <Form.Label>Shifra:</Form.Label>
        <Form.Control
            type="text"
            disabled
            value={dataPerNdryshim.shifra}
        />
        </Form.Group>
        <Form.Group className='m-3'>
                <Form.Select onChange={handleSelectChange}     value={llojiShpenzimeveSelektuarID || ""}
 aria-label="Selekto nje Lloj Shpenzimi">
                    <option value="" disabled selected >Selekto nje Lloj Shpenzimi</option>
                    {llojetShpenzimeve.map((item, index) => (
                    <option key={index} value={item.llojetShpenzimeveID}>
                        {item.emertimi}
                    </option>
                    ))}
                </Form.Select>
                </Form.Group>
        
        <Form.Group>
        <Form.Label>Shuma:</Form.Label>
        <Form.Control
            type="number"
            name = 'shumaShpenzimit'
            min={0}
            value={data.shumaShpenzimit}
            onChange={(e) => handleInputChange(e.target)}
        />
        </Form.Group>
        <Form.Group>
        <Form.Label>Komenti:</Form.Label>
        <Form.Control
            as="textarea"
            name = 'komenti'
            value={data.komenti}
            onChange={(e) => handleInputChange(e.target)}
        />
        </Form.Group>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Mbyll</Button>
        <Button variant="primary" onClick={handleRuajNdryshimet} disabled={buttonLoading || data.shumaShpenzimit < 1 || !data.shumaShpenzimit}>{buttonLoading ? <>
        <Spinner as="span" animation='border' size='sm' role='status' aria-hidden={true}/>{''}Duke Ruajtur...
        </> :'Ruaj Ndryshimet'}</Button>
    </Modal.Footer>
  </Modal>
  }        <ToastContainer />

      </>
  )
}

import React, { useEffect,useState } from 'react'
import {Modal,Form,Button,Spinner} from 'react-bootstrap'
export default function NdryshoLlojin({show,handleClose,dataPerNdryshim = {}}) {
    const [data,setData] = useState()
    const [buttonLoading,setButtonLoading] = useState(false)

    useEffect(() => {
        setData(dataPerNdryshim)
        
    },[show])

    const handleRuajNdryshimet = async () => {
        try {
            setButtonLoading(true)
            const result = await window.api.ndryshoLlojinShpenzimit(data)

        } catch (error) {
            console.log(error)
        }finally{
            setButtonLoading(false)
        }
    }
  return (
   <>
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Ndrysho Llojin e Shpenzimit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group>
            <Form.Label>Emertimi:</Form.Label>
            <Form.Control
                type="text"
                value={data?.emertimi || ''}
                onChange={(e) => setData({...data, emertimi: e.target.value})}
            />
            </Form.Group>
            
            <Form.Group>
            <Form.Label>Shuma:</Form.Label>
            <Form.Control
                type="number"
                min={0}
                value={data?.shumaStandarde || ''}
                onChange={(e) => setData({...data, shumaStandarde: e.target.value})}
            />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Mbyll</Button>
            <Button variant="primary" onClick={() => handleRuajNdryshimet()} disabled={buttonLoading || data?.shumaStandarde < 1 || !data?.shumaStandarde || data?.emertimi.length < 1}>{buttonLoading ? <>
            <Spinner as="span" animation='border' size='sm' role='status' aria-hidden={true}/>{''}Duke Ruajtur...
            </> :'Ruaj Ndryshimet'}</Button>
        </Modal.Footer>
      </Modal>
      </>
  )
}

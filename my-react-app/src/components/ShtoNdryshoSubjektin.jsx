import { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ShtoNdryshoSubjektin({show,handleClose,data}) {
    const [loading,setLoading] = useState(false)
    const [inputEmertimi,setInputEmertimi] = useState('')
    const [inputKontakti,setInputKontakti] = useState('')

    useEffect(() => {
      setInputEmertimi(data.inputEmertimi || ''); // Default to an empty string
      setInputKontakti(data.inputKontakti || ''); // Default to an empty string
  }, [data]);
  

    const handleSubmit = () =>{
        if(data.ndrysho){
            handleNdryshoSubjektin()
        }else 
            handleShtoSubjektin()
    }
    const handleNdryshoSubjektin = async () => {
        setLoading(true)
        if(inputEmertimi.length > 1 && inputKontakti.length > 1){
            const dataPerNdryshim={
                emertimi:inputEmertimi,
                kontakti:inputKontakti,
                subjektiID:data.idPerNdryshim
            }
            try {
                const result = await window.api.ndryshoSubjektin(dataPerNdryshim);
                if (result.success) {
                  toast.success(`${data.lloji == 'klient' ? 'Klienti' : 'Furnitori'} u Ndryshua me Sukses!`, {
                    position: "top-center",  
                    autoClose: 1500,
                    onClose:() => window.location.reload()
                  }); 
                } else {
                  toast.error('Gabim gjate Ndryshimit: ' + result.error);
                }
              } catch (error) {
                toast.error('Gabim gjate komunikimit me server: ' + error.message);
              } finally {
                setLoading(false);
              }
        }else{
            toast.warning('Plotesoni fushat me më shume karaktere!', {
                position:'top-center',
                autoClose:1500
            })
            setLoading(false)
        }
      };

    const handleShtoSubjektin = async () => {
        setLoading(true)
        if(inputEmertimi.length > 1 && inputKontakti > 1){
            const dataPerInsert={
                emertimi:inputEmertimi,
                kontakti:inputKontakti,
                lloji:data.lloji
            }
            try {
                const result = await window.api.insertSubjekti(dataPerInsert);
                if (result.success) {
                  toast.success('Klienti u Regjistrua me Sukses!', {
                    position: "top-center",  
                    autoClose: 1500
                  }); 
                } else {
                  toast.error('Gabim gjate regjistrimit: ' + result.error);
                }
              } catch (error) {
                toast.error('Gabim gjate komunikimit me server: ' + error.message);
              } finally {
                setLoading(false);
                window.location.reload()
              }
        }else{
            toast.warning('Plotesoni fushat me më shume karaktere!', {
                position:'top-center',
                autoClose:1500
            })
            setLoading(false)
        }
      };

      const kontrolloValidetin = () => {
        return (
            loading || 
            inputEmertimi.trim().length < 1 || 
            inputKontakti.trim().length < 1
        );
    };
    

  return (
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>{data.ndrysho ? 'Ndrysho': 'Shto'} nje {data.lloji == 'klient' ? 'Klient' : 'Furnitor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Emertimi:</Form.Label>
                    <Form.Control type='text' defaultValue={data.inputEmertimi} onChange={(e) => setInputEmertimi(e.target.value)} placeholder={data.lloji == 'klient' ? 'Emertimi i Klientit...':'Emertimi i Furnitorit...'} /> 
                </Form.Group>
                <Form.Group className='mb-3 fw-bold'>
                    <Form.Label>Kontakti:</Form.Label>
                    <Form.Control type='number' defaultValue={data.inputKontakti} onChange={(e) => setInputKontakti(e.target.value)} placeholder={data.lloji == 'klient' ? 'Kontakti i Klientit...':'Kontakti i Furnitorit...'} /> 
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='secondary' onClick={handleClose}>
                Anulo
            </Button>
            <Button variant='primary' onClick={handleSubmit} disabled={kontrolloValidetin()}>
            {loading ? (
                <>
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />{' '}
                Duke ruajtur...
                </>
            ) : <>
                {data.ndrysho ? 'Ruaj Ndryshimet...' : <>{data.lloji == 'klient' ? 'Shto Klientin' : 'Shto Furnitorin'}</>}
                </>}
                
            </Button>
        </Modal.Footer>
        <ToastContainer/>
    </Modal>
  )
}

import { useState, useEffect } from 'react';
import { Modal, Button, Form,Spinner, Toast,InputGroup } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthData from '../useAuthData';

function UpdateServise({ show, handleClose, updateType, data = {} }) {
    const [loading, setLoading] = useState(false);
    const [aKaData, setAKaData] = useState(false);
    const [aKaAdapter, setKaAdapter] = useState(false);
    const [aKaÇante, setAKaÇante] = useState(false);
    const [aKaGarancion, setAKaGarancion] = useState(false);
    const [shifraGarancionit, setShifraGarancionit] = useState();
    const [komenti, setKomenti] = useState();
    const [totaliPerPagese, setTotaliPerPagese] = useState(0);
    const [totaliIPageses, setTotaliIPageses] = useState(0);
    const [mbetjaPerPagese, setMbetjaPerPagese] = useState(0);
    const {nderrimiID} = useAuthData()

    
    
    useEffect(() => {

        if (data?.pajisjetPercjellese) {
            setKaAdapter(data.pajisjetPercjellese.includes('Adapter'));
            setAKaData(data.pajisjetPercjellese.includes('Data'));
            setAKaÇante(data.pajisjetPercjellese.includes('Çante'));
        }
        if (data?.shifraGarancionit) {
            setAKaGarancion(true);
        }else{setAKaGarancion(false)}
        setKomenti(data?.komenti)
        setShifraGarancionit(data?.shifraGarancionit)
    }, [data]);

    const handleCalcPagesen1 = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setTotaliPerPagese(value);
        setMbetjaPerPagese(value - totaliIPageses);
    };

    const handleCalcPagesen2 = (e) => {
        const value = parseFloat(e.target.value) || 0;
        if (value > totaliPerPagese) {
            setTotaliIPageses(totaliPerPagese);
            setMbetjaPerPagese(0);
        } else {
            setTotaliIPageses(value);
            setMbetjaPerPagese(totaliPerPagese - value);
        }
    };

    const handleConfirmClick = async () => {
        setLoading(true);
        let pajisjetPercjellese = ''

        {aKaData ? pajisjetPercjellese = 'Data/' : ''}
        {aKaAdapter ? pajisjetPercjellese += 'Adapter/' : ''}
        {aKaÇante ? pajisjetPercjellese += 'Çante' : ''}

        const dataPerNdryshim = {
            shifra:data.shifra,
            pajisjetPercjellese,
            shifraGarancionit,
            komenti,
            totaliPerPagese,
            totaliIPageses,
            mbetjaPerPagese,
            updateType,
            perdoruesiID:1,
            nderrimiID,
        }
        try {
            const result = await window.api.ndryshoServisin(dataPerNdryshim);
            if (result.success) {
              toast.success(`Servisi u ${updateType != 'perfundo' ? 'Ndryshua' : 'Perfundua'} me Sukses!`, {
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

    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{updateType === 'perfundo' ? 'Mbyll Servisimin' : 'Ndrysho te Dhenat'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Shifra:</Form.Label>
                    <Form.Control type="text" value={data?.shifra || ''} disabled />
                </Form.Group>
                {updateType === 'perfundo' ? (
                    <Form>
                        <Form.Group>
                            <Form.Label>Totali per Pagese:</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="number"
                                    value={totaliPerPagese}
                                    onChange={handleCalcPagesen1}
                                    min="0"
                                    onKeyDown={(e) => e.key === '0' && e.target.value.length === 0 && e.preventDefault()}
                                />
                                <InputGroup.Text>€</InputGroup.Text>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Totali i Pageses:</Form.Label>
                             <InputGroup>
                                <Form.Control
                                    type="number"
                                    value={totaliIPageses}
                                    onChange={handleCalcPagesen2}
                                    min="0"
                                    onKeyDown={(e) => e.key === '0' && e.target.value.length === 0 && e.preventDefault()}
                                />
                                <InputGroup.Text>€</InputGroup.Text>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Mbetja Per Pagese:</Form.Label>
                            <InputGroup>
                                <Form.Control type="number" value={mbetjaPerPagese} disabled />
                                <InputGroup.Text>€</InputGroup.Text>
                            </InputGroup>
                        </Form.Group>
                    </Form>
                ) : (
                    <Form>
                        <Form.Group style={{ flex: 1 }} className='my-2'>
                            <Form.Label className="fw-bold ">Klienti:</Form.Label>
                            <Form.Control type="text" value={data?.subjekti || ''} disabled />
                        </Form.Group>
                        <Form.Group style={{ flex: 1 }}>
                            <Form.Label className="fw-bold">Komenti:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                className="form-control-lg"
                                defaultValue={data?.komenti}
                                onChange={(e) => setKomenti(e.target.value)}
                            />
                        </Form.Group>
                        <Form className="d-flex flex-row m-2">
                            <Form.Group className="p-1 mx-3">
                                <Form.Label>Data:</Form.Label>
                                <Form.Check checked={aKaData} onChange={() => setAKaData(!aKaData)} />
                            </Form.Group>
                            <Form.Group className="p-1 mx-3">
                                <Form.Label>Adapter:</Form.Label>
                                <Form.Check checked={aKaAdapter} onChange={() => setKaAdapter(!aKaAdapter)} />
                            </Form.Group>
                            <Form.Group className="p-1 mx-3">
                                <Form.Label>Çantë:</Form.Label>
                                <Form.Check checked={aKaÇante} onChange={() => setAKaÇante(!aKaÇante)} />
                            </Form.Group>
                            <Form.Group className="p-1 mx-3">
                                <Form.Label>Garancion:</Form.Label>
                                <Form.Check checked={aKaGarancion} onChange={() => setAKaGarancion(!aKaGarancion)} />
                                {aKaGarancion && (
                                    <Form.Control
                                        type="text"
                                        defaultValue={data?.shifraGarancionit || ''}
                                        onChange={(e) => setShifraGarancionit(e.target.value)}
                                    />
                                )}
                            </Form.Group>
                        </Form>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Anulo
                </Button>
                <Button variant="primary" onClick={handleConfirmClick} disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner
                                variant="success"
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />{' '}
                            Duke ruajtur...
                        </>
                    ) : (
                        'Ruaj Ndryshimet...'
                    )}
                </Button>
            </Modal.Footer>
            <ToastContainer/>
        </Modal>
    );
}

export default UpdateServise;

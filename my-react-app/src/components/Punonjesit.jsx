import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Modal, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashCan, faGift, faCoins, faCheckCircle, faTimesCircle,faPencil,faCheck } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnimatedSpinner from './AnimatedSpinner';
import ModalPerPyetje from './ModalPerPyetje'
import DetajePunonjes from './DetajePunonjes';

export default function Punonjesit() {
    const [loading, setLoading] = useState(true);
    const [punonjesit, setPunonjesit] = useState([]);
    const [shtoPunonjesModal, setShtoPunonjesModal] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [dataPerPunonjes, setDataPerPunonjes] = useState({ emri: '', mbiemri: '', pagaBaze: '', nrTelefonit: '',aktiv:1 ,punonjesID:'' });
    const [showModalPerPyetje,setShowModalPerPyetje] = useState(false)
    const [idPerPerdorim,setIdPerPerdorim] = useState()
    const [perNdryshim,setPerNdryshim] = useState()
    const [loadingPerBonuse,setLoadingPerBonuse] = useState(true)
    const [modalPerBonuse,setModalPerBonuse] = useState(false)
    const [muaji,setMuaji] = useState()
    const [viti,setViti] = useState()
    const [bonuset,setBonuset] = useState()
    const [editingBonuset,setEditingBonuset] = useState(false)
    const [showDetaje,setShowDetaje] = useState(false)

    const monthNamesAlbanian = [
      "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
      "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"
    ];
    const [totalBonuset,setTotalBonuset] = useState()
    let t;
    useEffect(() => {
        const fetchData = async () => {
            try {
                await window.api.fetchTablePunonjesit().then((receivedData) => {
                    setPunonjesit(receivedData);
                });
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        if (localStorage.getItem('sukses') === 'true') {
            toast.success(localStorage.getItem('msg'));
            setTimeout(() => {
              setTimeout((localStorage.removeItem('sukses'),localStorage.removeItem('msg')) , 1500)
            }, 1000)
        }else if(localStorage.getItem('sukses') === 'false') {
            toast.error('Punonjesi u shtua me sukses!');
            setTimeout(() => {
              setTimeout((localStorage.removeItem('sukses'),localStorage.removeItem('msg')) , 1500)
            }, 1000)
        }
    }, []);

    const handleChangeShtoPunonjes = (event) => {
        const { name, value } = event.target;
        setDataPerPunonjes({
            ...dataPerPunonjes,
            [name]: value
        });
    };
    const emptyDataPerPunonjes = () => {
      setDataPerPunonjes({
        emri:'',
        mbiemri:'',
        pagaBaze:'',
        nrTelefonit:'',
        aktiv:1,
        punonjesID:''
      })
      setPerNdryshim(null)
    }

    const shtoPunonjes = async () => {
        setButtonLoading(true);
        try {
            await window.api.shtoPunonjes(dataPerPunonjes);
            localStorage.setItem('sukses', 'true');
            localStorage.setItem('msg', 'Punonjesi u Shtua me Sukses');
        } catch (error) {
            localStorage.setItem('sukses', 'false');
            localStorage.setItem('msg', error);
        } finally {
            setButtonLoading(false);
            window.location.reload();
        }
    };

    const modalPerPyetje = (id) => {
      setIdPerPerdorim(id)
      setShowModalPerPyetje(true)
    }
    const handleConfirmModal = async() => {
      if(idPerDelete){
        try{
          await window.api.fshijePunonjesin(idPerDelete)
          localStorage.setItem('sukses', 'true');
          localStorage.setItem('msg', 'Punonjesi u Fshie me Sukses');
      } catch (error) {
          localStorage.setItem('sukses', 'false');
          localStorage.setItem('msg', error);
      } finally {
          setButtonLoading(false);
          window.location.reload();
      }
      }
    }

    const ndryshoPunonjes = async () => {
      setButtonLoading(true);
      try {
          await window.api.ndryshoPunonjes(dataPerPunonjes);
          localStorage.setItem('sukses', 'true');
          localStorage.setItem('msg', 'Punonjesi u Ndryshua me Sukses');
      } catch (error) {
          localStorage.setItem('sukses', 'false');
          localStorage.setItem('msg', error);
      } finally {
          setButtonLoading(false);
          window.location.reload();
      }
  };

  const kalkuloBonuset = async (punonjesID) => {
    setModalPerBonuse(true)
    setIdPerPerdorim(punonjesID)
    const date = new Date();
    
     setMuaji(monthNamesAlbanian[date.getMonth()])
     setViti(date.getFullYear())
    try{
      await window.api.fetchTableQuery(`
              DECLARE @Year INT = 2024;
              DECLARE @Month INT = ${date.getMonth()+1};

              WITH DailyProfit AS (
                  SELECT 
                      CONVERT(DATE, t.dataTransaksionit) AS dataTransaksionit,
                      SUM(p.shuma) AS DailyShuma
                  FROM 
                      transaksioni AS t
                  JOIN 
                      profiti AS p ON t.transaksioniID = p.transaksioniID
                  WHERE 
                      YEAR(t.dataTransaksionit) = @Year AND MONTH(t.dataTransaksionit) = @Month
                  GROUP BY 
                      CONVERT(DATE, t.dataTransaksionit)
              ),
              DailyBonuses AS (
                  SELECT 
                      dataTransaksionit,
                      DailyShuma,
                      CASE 
                          WHEN DailyShuma >= 200 THEN FLOOR((DailyShuma - 200) / 100.0) * 5 + 10
                          ELSE 0 
                      END AS DailyBonus
                  FROM 
                      DailyProfit
              )
              SELECT 
                  dataTransaksionit,
                  SUM(DailyBonus) AS totaliBonuseve
              FROM 
                  DailyBonuses
              GROUP BY 
                  dataTransaksionit
              ORDER BY 
                  dataTransaksionit;`).then((receivedData) => {
                setBonuset(receivedData.filter((data) => data.totaliBonuseve > 0))
              })
    }catch(error){
      console.log(error)
    }finally{
      setLoadingPerBonuse(false)
    }
  }

  useEffect(()=>{
    if(bonuset && bonuset.length > 0){
      const total = bonuset.reduce((acc, item) => acc + item.totaliBonuseve, 0);
      setTotalBonuset(total)
    }
  },[bonuset])

  const paguajBonuset = async () => {

    setButtonLoading(true);
    const data = {
        punonjesID:idPerPerdorim,
        shuma:totalBonuset,
        muajiViti: muaji+viti
    }

      try {
         if(data){
            await window.api.paguajBonuset(data);
            localStorage.setItem('sukses', 'true');
            localStorage.setItem('msg', 'Pagesa e Bonuseve Perfundoi me Sukses');
         }
      } catch (error) {
          localStorage.setItem('sukses', 'false');
          localStorage.setItem('msg', error);
      } finally {
          setButtonLoading(false);
          window.location.reload();
      }
  }

    return (
        <>
            <ToastContainer position="top-center" autoClose={3000} />
            {loading ? (
                <AnimatedSpinner />
            ) : (
                <Container>
                    <Row>
                        <Button variant="success" className="w-25" onClick={() => {emptyDataPerPunonjes(); setShtoPunonjesModal(true)}}>
                            Shto Punonjës të Ri
                        </Button>
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
                                                <td>{new Date(item.dataPunësimit).toLocaleDateString('al-AL')}</td>
                                                <td>{item.pagaBaze.toFixed(2)} €</td>
                                                <td>{item.aktiv == 1 ? 'Aktiv' : 'Jo Aktiv'}</td>
                                                <td>{item.nrTelefonit}</td>
                                                <td>
                                                    <Button variant="outline-primary" className="me-2" onClick={() => {setPerNdryshim(item); setShtoPunonjesModal(true);setDataPerPunonjes(item)}}>
                                                        <FontAwesomeIcon icon={faPen} /> Ndrysho
                                                    </Button>
                                                    <Button variant="outline-danger" className="me-2" onClick={() => modalPerPyetje(item.punonjesID)}>
                                                        <FontAwesomeIcon icon={faTrashCan} /> Fshij
                                                    </Button>

                                                    <Button variant="outline-secondary"  onClick={() => setShowDetaje(!showDetaje)}>
                                                        Detaje...
                                                    </Button>

                                                   {item.aktiv ? <> <Button variant="outline-success" className="me-2" onClick={() => kalkuloBonuset(item.punonjesID)}>
                                                        <FontAwesomeIcon icon={faGift} /> Bonuse
                                                    </Button>
                                                    <Button variant="outline-secondary">
                                                        <FontAwesomeIcon icon={faCoins} className="text-warning" /> Rroga
                                                    </Button></>: null}
                                                </td>
                                            </>
                                        ) : (
                                            'Nuk ka te dhena!'
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Row>

                    {showDetaje && 
                        <Row>
                            <DetajePunonjes/>
                        </Row>
                    }
                    <Modal
                        show={shtoPunonjesModal}
                        onHide={() => {
                            buttonLoading ? null : setShtoPunonjesModal(false);
                        }}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title className="text-dark">{!perNdryshim ? <>Forma për Regjistrim të Punonjësit</> : <>Forma për Ndryshim të Punonjësit</>}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group controlId="formFirstName">
                                            <Form.Label>Emri</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="emri"
                                                value={dataPerPunonjes.emri}
                                                onChange={handleChangeShtoPunonjes}
                                                placeholder="Shkruaj Emrin..."
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formLastName">
                                            <Form.Label>Mbiemri</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="mbiemri"
                                                value={dataPerPunonjes.mbiemri}
                                                onChange={handleChangeShtoPunonjes}
                                                placeholder="Shkruaj Mbiemrin..."
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-3 align-items-center">
                                    <Col >
                                        <Form.Group controlId="formBaseSalary">
                                            <Form.Label>Paga Bazë</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="number"
                                                    name="pagaBaze"
                                                    value={dataPerPunonjes.pagaBaze}
                                                    onChange={handleChangeShtoPunonjes}
                                                    placeholder="Shkruaj Pagen Bazë..."
                                                />
                                                <InputGroup.Text>€</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="formBaseSalary">
                                            <Form.Label>Nr Telefonit</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="nrTelefonit"
                                                    value={dataPerPunonjes.nrTelefonit}
                                                    onChange={handleChangeShtoPunonjes}
                                                    placeholder="Shkruaj Nr. Telefonit..."
                                                />                                 
                                        </Form.Group>
                                    </Col>
                                    {perNdryshim ? <Col>
                                    <Form.Group controlId="employeeStatus" className="d-flex flex-column align-items-center">
                                      <Form.Label>Statusi i Punonjësit</Form.Label>
                                      <div
                                         onClick={() => setDataPerPunonjes(prevData => ({
                                          ...prevData,
                                          aktiv: !prevData.aktiv
                                      }))}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          cursor: 'pointer',
                                          backgroundColor: dataPerPunonjes.aktiv ? '#24AD5D' : '#d9534f',
                                          color: '#fff',
                                          padding: '8px 20px',
                                          borderRadius: '25px',
                                          fontWeight: '500',
                                          fontSize: '0.9rem',
                                          transition: 'background-color 0.3s',
                                          gap: '10px',
                                        }}
                                      >
                                        <FontAwesomeIcon icon={dataPerPunonjes.aktiv ? faCheckCircle : faTimesCircle} />
                                        <span>{dataPerPunonjes.aktiv ? 'Aktiv' : 'Jo Aktiv'}</span>
                                      </div>
                                    </Form.Group>
                                    </Col>:null}
                                </Row>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" disabled={buttonLoading} onClick={() => setShtoPunonjesModal(false)}>
                                Mbyll
                            </Button>
                            <Button variant="primary" disabled={buttonLoading} onClick={() => {perNdryshim ? ndryshoPunonjes() :shtoPunonjes()}}>
                                {buttonLoading ? (
                                    <>
                                        <Spinner size="sm" /> {'Duke ruajtur'}
                                    </>
                                ) : (
                                    <>{perNdryshim ? 'Ruaj Ndryshimet' : 'Regjistro'}</>
                                )}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                     {/** Modal per Bonuse */}

                     <Modal size='lg'
                        show={modalPerBonuse}
                        onHide={() => {
                            buttonLoading || editingBonuset ? null : setModalPerBonuse(false);
                        }}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title className="text-dark">Forma Per Kalkulim dhe Pagese te Bonuseve</Modal.Title>
                        </Modal.Header>
                          {loadingPerBonuse ? <AnimatedSpinner /> : 
                          <Modal.Body>
                            <Form>
                                <Row className="mb-3 d-flex justify-content-start">
                                    <Col md={3}>
                                        <Form.Group controlId="formFirstName">
                                            <Form.Label>Muaji</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="muaji"
                                                value={muaji}
                                                disabled={true}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                      <Form.Group controlId="formFirstName">
                                              <Form.Label>Viti</Form.Label>
                                              <Form.Control
                                                  type="text"
                                                  name="viti"
                                                  value={viti}
                                                  disabled={true}
                                              />
                                          </Form.Group>
                                    </Col>
                                </Row>
                                {bonuset && bonuset.length > 0 ? (
                                  <Row className="mb-3 align-items-center">
                                     <Table striped bordered hover responsive className="text-center">
                                          <thead className="table-light">
                                            <tr>
                                              <th>Nr.</th>
                                              <th>Data</th>
                                              <th>Shuma (€)</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {bonuset.map((item, index) => {
                                               t = t+item.totaliBonuseve
                                               console.log('t',t)
                                              const transactionDate = new Date(item.dataTransaksionit);
                                              const formattedDate = `${transactionDate.getDate()} ${monthNamesAlbanian[transactionDate.getMonth()]} ${transactionDate.getFullYear()}`;
                                              return (
                                                <tr key={index}>
                                                  <td>{index + 1}</td>
                                                  <td>{formattedDate}</td>
                                                  <td>{item.totaliBonuseve} €</td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </Table>
                                  </Row>
                                ) : (
                                  <AnimatedSpinner />
                                )}
                            </Form>
                             <Row className="d-flex justify-content-center">
                                <Form className="w-75 p-3  rounded shadow-sm">
                                    <Col className="w-100 d-flex align-items-center justify-content-end">
                                        <Form.Label className="me-2 mb-0">Totali: </Form.Label>
                                        <Form.Control
                                            className="d-inline fs-5 fw-bold  border-bottom  w-25"
                                            value={totalBonuset}
                                            onChange={(e) => setTotalBonuset(e.target.value)}
                                            disabled={!editingBonuset}
                                        />
                                        <Button
                                            variant={editingBonuset ?"outline-success" :"outline-primary"}
                                            className="ms-2"
                                            onClick={() => setEditingBonuset(!editingBonuset)}
                                        >
                                            {editingBonuset ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faPencil} />}
                                        </Button>
                                    </Col>
                                </Form>
                            </Row>
                        </Modal.Body>
                        }
                        <Modal.Footer>
                            <Button variant="outline-secondary" disabled={buttonLoading} onClick={() => {
                            buttonLoading || editingBonuset ? null : setModalPerBonuse(false);
                        }}>
                                Mbyll
                            </Button>
                            <Button variant="primary" disabled={buttonLoading || editingBonuset} onClick={() => paguajBonuset()}>
                                {buttonLoading ? (
                                    <>
                                        <Spinner size="sm" /> {'Duke ruajtur'}
                                    </>
                                ) : (
                                     'Paguaj Bonuset' 
                                )}
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <ModalPerPyetje show={showModalPerPyetje} handleClose={() => {setShowModalPerPyetje(false)}} handleConfirm={handleConfirmModal} />
                </Container>
            )}
        </>
    );
}

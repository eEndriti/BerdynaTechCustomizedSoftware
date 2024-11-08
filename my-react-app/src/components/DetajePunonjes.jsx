import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Modal, Form, Spinner, Card, Toast,InputGroup,Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck,faPencil, faPen, faTrashCan,faUmbrellaBeach,faGift, faCoins,faTriangleExclamation,faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import AnimatedSpinner from './AnimatedSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from './ModalPerPyetje'
import MenyratPagesesExport from './MenyratPagesesExport';

export default function DetajePunonjes({punonjesID,emri,defaultPaga}) {
    const [loading, setLoading] = useState(true);
    const [showData,setShowData] = useState()
    const [pushimet, setPushimet] = useState([]);
    const [bonuset, setBonuset] = useState([]);
    const [bonusetNeDetaje, setBonusetNeDetaje] = useState([]);
    const [bonusetPerPunonjes, setBonusetPerPunonjes] = useState([]);
    const [pagat, setPagat] = useState([]);
    const [buttonLoading,setButtonLoading] = useState(false)
    const [modalPerBonuset,setModalPerBonuse] = useState(false)
    const [totalBonuset,setTotalBonuset] = useState()
    const [IDPerPerdorim,setIDPerPerdorim]= useState()
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);
    const [muaji,setMuaji] = useState(new Date().getMonth()+1)
    const [muajiEmertim,setMuajiEmertim] = useState()
    const [viti,setViti] = useState(currentYear)
    const [editingBonuset,setEditingBonuset] = useState(false)
    const [activeSalary,setActiveSalary] = useState([])
    const [ndryshoModal,setNdryshoModal] = useState(false)
    const [showModalPerPyetje,setShowModalPerPyetje] = useState(false)
    const [pageseRroge,setPageseRroge] = useState(false)
    const [selectedMenyraPageses,setSelectedMenyraPageses] = useState(null)

    const albanianMonths = [
        "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
        "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"
      ];

    useEffect(() => {
        const fetchData = async () => {
            const fetchedPushimet = await window.api.fetchTablePushimet();
            const fetchedBonuset = await window.api.fetchTableBonuset();
            const fetchedPaga = await window.api.fetchTablePagat();
            const fetchedBonusetNeDetaje = await window.api.fetchTableQuery(`
                SELECT b.bonusetID,  b.dataBonuseve,  b.shuma,  bp.dataPageses,  bp.menyraPagesesID,  bp.punonjesiID,  bp.statusi,  m.emertimi 
            FROM bonuset b
            JOIN bonusetPunonjesit bp ON bp.bonusetID = b.bonusetID
            LEFT JOIN menyraPageses m ON m.menyraPagesesID = bp.menyraPagesesID
            `)
                        setPushimet(fetchedPushimet.filter(item => punonjesID == item.punonjesID));
            setBonuset(fetchedBonuset);
            setPagat(fetchedPaga.filter(item => punonjesID == item.punonjesID));
            setBonusetNeDetaje(fetchedBonusetNeDetaje)
            setLoading(false);
            
        };
        fetchData();

        if (localStorage.getItem('sukses') === 'true') {
            toast.success(localStorage.getItem('msg'));
            setTimeout(() => {
              setTimeout((localStorage.removeItem('sukses'),localStorage.removeItem('msg')) , 1500)
            }, 1000)
        }else if(localStorage.getItem('sukses') === 'false') {
            toast.success(localStorage.getItem('msg'));
            setTimeout(() => {
              setTimeout((localStorage.removeItem('sukses'),localStorage.removeItem('msg')) , 1500)
            }, 1000)
        }
    }, []);

      const updateMenyraPageses = (menyraPageses) => {
        setSelectedMenyraPageses(menyraPageses);
      };

      const emptyActiveSalary = () => {
        setActiveSalary(null)
      }

      const handleActiveSalaryChange = (event) => {
        const { name, value } = event.target;
        setActiveSalary({
            ...activeSalary,
            [name]: value
        });
        console.log(activeSalary)
      }

     const setDataPerPageseRroge = () => {
        setActiveSalary({
            dataPageses: new Date().toISOString().split('T')[0],
            paga:defaultPaga,
            bonusi : 0,
            zbritje : 0
        })
        setPageseRroge(true)
        setNdryshoModal(true)
        setSelectedMenyraPageses(null)
      }

    const handleShowData = (element) => {
        setShowData((prevData) => (prevData === element ? null : element));
      };

    const formatDateToAlbanian = (dateString) => {
        const date = new Date(dateString);      
        const month = albanianMonths[date.getMonth()];
        const year = date.getFullYear();
        
        return `${month}-${year}`;
      };

      const formatLongDateToAlbanian = (dateString) => {
        const date = new Date(dateString);  
        const day = date.getDate()    
        const month = albanianMonths[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
      };
    

      const ndryshoRrogen = async () => {
        setButtonLoading(true);
        console.log(selectedMenyraPageses,'sl')
        const data = {
            ...activeSalary,
            menyraPagesesID:selectedMenyraPageses.menyraPagesesID
        }   

          try {
                await window.api.ndryshoPagen(data);
                localStorage.setItem('sukses', 'true');
                localStorage.setItem('msg', 'Ndryshimet u Ruajten!');
          } catch (error) {
              localStorage.setItem('sukses', 'false');
              localStorage.setItem('msg', error);
          } finally {
              setButtonLoading(false);
              window.location.reload()
            }
      }

      const handleConfirm = async () => {
            try{
              await window.api.fshijePagen(activeSalary.pagaID)
              localStorage.setItem('sukses', 'true');
              localStorage.setItem('msg', 'Paga u Fshie me Sukses');
          } catch (error) {
              localStorage.setItem('sukses', 'false');
              localStorage.setItem('msg', error);
          } finally {
              setButtonLoading(false);
              window.location.reload();
          }
          
      }

      const paguajRrogen = async () => {
        try{
            const data = {
                ...activeSalary,
                punonjesID,
                menyraPagesesID:selectedMenyraPageses.menyraPagesesID
            }  

          await window.api.paguajPagen(data)
          localStorage.setItem('sukses', 'true');
          localStorage.setItem('msg', 'Paga u Regjistrua me Sukses');
      } catch (error) {
          localStorage.setItem('sukses', 'false');
          localStorage.setItem('msg', error);
      } finally {
          setButtonLoading(false);
          window.location.reload()
      }
      
  }

    function isWithin45Days(mssqlDate) {
        const inputDate = new Date(mssqlDate); 
        const currentDate = new Date();
    
        const diffInMs = currentDate - inputDate;
        
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
        return diffInDays <= 45;
    }

    useEffect(() => {
        if (modalPerBonuset) {
            kalkuloBonusetPerPunonjes();
        }
    }, [muaji, viti, modalPerBonuset]); 
    
    const kalkuloBonusetPerPunonjes = () => {

        setMuajiEmertim(albanianMonths[muaji - 1]); 
        
        const bonusetPerPunonjes = [];
      
    
        bonuset.forEach(bonusi => {
            const matchingBonusInPunonjesit = bonusetNeDetaje.find(bonusDetaj => 
                bonusDetaj.bonusetID === bonusi.bonusetID && bonusDetaj.punonjesiID === punonjesID && bonusDetaj.statusi === 1
            );
    
            if (!matchingBonusInPunonjesit) {
                const bonusDate = new Date(bonusi.dataBonuseve);
                const bonusMonth = bonusDate.getMonth() + 1; 
                const bonusYear = bonusDate.getFullYear();
    
                if (bonusMonth === muaji && bonusYear === viti) {
                    bonusetPerPunonjes.push({
                        ...bonusi, 
                    });
                }
            }
        });
    
        setBonusetPerPunonjes(bonusetPerPunonjes);
        setModalPerBonuse(true);
    };
    
    
    
    
    
    return (
        <Container className="py-5">
            <h4 className="text-center mb-4">Menaxho Punonjësin: <span className='d-inline fw-bold fs-5 border-bottom border-1 border-dark '>{emri} / ID:{punonjesID}</span></h4>
            {loading ? (
                <AnimatedSpinner/>
            ) : (
                <>
                    <Row className="mb-4">
                        <Col className="text-center">        
                            <Button variant="primary" className="mx-2" onClick={() => handleShowData('r')} >
                                <FontAwesomeIcon icon={faCoins} className='text-warning'/> Menaxho Pagen
                            </Button>
                            <Button variant="primary" className="mx-2" onClick={() => handleShowData('b')} >
                                <FontAwesomeIcon icon={faGift} className='text-info'/> Menaxho Bonuset   
                            </Button>
                            <Button variant="primary" className="mx-2" onClick={() => handleShowData('p')}>
                                <FontAwesomeIcon icon={faUmbrellaBeach} /> Menaxho Pushimet
                            </Button>
                        </Col>
                    </Row>

                    {showData == 'r' ? <Row>
                        <Col>
                            <Card className="mb-4 shadow">
                                <Card.Body>
                                    <Card.Title className='fs-3 pb-2'>Menaxho Pagen:</Card.Title>
                                    <Table striped bordered hover variant="light">
                                        <thead>
                                            <tr>
                                                <th>Nr.</th>
                                                <th>Data Pageses</th>
                                                <th>Paga</th>
                                                <th>Bonusi</th>
                                                <th>Zbritje</th>
                                                <th>Menyra e Pageses</th>
                                                <th>Veprime</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pagat.slice().reverse().map((paga, index) => (
                                                <tr key={index}>
                                                    <td>{pagat.length -index}</td>
                                                    <td>{formatLongDateToAlbanian(paga.dataPageses)}</td>
                                                    <td>{paga.paga} €</td>
                                                    <td>{paga.bonusi} €</td>
                                                    <td>{paga.zbritje} €</td>
                                                    <td>{paga.menyraPageses}</td>
                                                    <td>
                                                        <Button variant="outline-primary" className='mx-1' disabled = {!isWithin45Days(paga.dataPageses)} onClick={() => {setSelectedMenyraPageses(null);setPageseRroge(false);emptyActiveSalary();setActiveSalary(paga);setNdryshoModal(true)}}>
                                                            <FontAwesomeIcon icon={faPen} /> Ndrysho
                                                        </Button>
                                                        <Button variant="outline-danger" className='mx-1' onClick={() => {emptyActiveSalary();setActiveSalary(paga);setShowModalPerPyetje(true)}}>
                                                            <FontAwesomeIcon icon={faTrashCan} /> Fshij
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <Alert variant="warning" className="d-flex align-items-center mt-3">
                                        <FontAwesomeIcon icon={faTriangleExclamation} size={20} className="me-2" />
                                        <span>
                                            <strong>Kujdes!</strong> Pagat me te vjetra se 45 Dite nuk mund te ndryshohen!
                                        </span>
                                    </Alert>
                                </Card.Body>
                                <Card.Footer>
                                    <Button variant="outline-success" className='float-end' onClick={() => setDataPerPageseRroge()}>
                                        <FontAwesomeIcon icon={faCoins} className="text-warning" /> Paguaj Rrogen
                                    </Button>
                                </Card.Footer>
                            </Card>

                        </Col>
                    </Row>:null}

                   {showData == 'p' ?  <Row>
                        <Col>
                            <Card className="mb-4 shadow">
                                <Card.Body>
                                <Card.Title className='fs-3 pb-2'>Menaxho Pushimet:</Card.Title>
                                <Table striped bordered hover variant="light">
                                        <thead>
                                            <tr>
                                                <th>Nr.</th>
                                                <th>Data Fillimit</th>
                                                <th>Nr. Diteve</th>
                                                <th>Data Mbarimit</th>
                                                <th>Lloji</th>
                                                <th>Arsyeja</th>
                                                <th>Veprime</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pushimet.map((pushimi, index) => (
                                                <tr key={index}>
                                                    <td>{index+1}</td>
                                                    <td>{formatLongDateToAlbanian(pushimi.dataFillimit)}</td>
                                                    <td>{pushimi.nrDiteve}</td>
                                                    <td>{formatLongDateToAlbanian(pushimi.dataMbarimit)}</td>
                                                    <td>{pushimi.lloji}</td>
                                                    <td>{pushimi.arsyeja}</td>
                                                    <td>
                                                        <Button variant="outline-primary" className='mx-1' onClick={() => handleDelete(pushimi.pushimID)}>
                                                            <FontAwesomeIcon icon={faPen} /> Ndrysho
                                                        </Button>
                                                        <Button variant="outline-danger" className='mx-1' onClick={() => handleDelete(pushimi.pushimID)}>
                                                            <FontAwesomeIcon icon={faTrashCan} /> Fshij
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    
                                </Card.Body>
                                <Card.Footer>
                                    <Button variant='outline-success' className='float-end'><FontAwesomeIcon icon={faUmbrellaBeach} /> Shto Nje Pushim</Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>:null}

                   {showData == 'b'?  <Row>
                        <Col>
                            <Card className="mb-4 shadow">
                                <Card.Body>
                                <Card.Title className='fs-3 pb-2'>Menaxho Bonuset:</Card.Title>
                                {bonusetNeDetaje && <Table striped bordered hover variant="light">
                                        <thead>
                                            <tr>
                                                <th>Nr.</th>
                                                <th>Shuma e Paguar</th>
                                                <th>Data e Pageses</th>
                                                <th>Menyra e Pageses</th>
                                                <th>Veprime</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bonusetNeDetaje.slice().reverse().map((bonus, index) => (
                                                <tr key={index}>
                                                    <td>{index+1}</td>
                                                    <td>{bonus.shuma} €</td>
                                                    <td>{formatLongDateToAlbanian(bonus.dataPageses)}</td>
                                                    <td>{bonus.emertimi}</td>
                                                    <td>                                                       
                                                        <Button variant="outline-primary" className='mx-1' disabled = {!isWithin45Days(bonus.dataPageses)} onClick={() => handleNdrysho(bonus.bonusID)}>
                                                            <FontAwesomeIcon icon={faPen} /> Ndrysho
                                                        </Button>
                                                        <Button variant="outline-danger" className='mx-1' onClick={() => handleDelete(bonus.bonusID)}>
                                                            <FontAwesomeIcon icon={faTrashCan} /> Fshij
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>}
                                    <Alert variant="warning" className="d-flex align-items-center mt-3">
                                        <FontAwesomeIcon icon={faTriangleExclamation} size={20} className="me-2" />
                                        <span>
                                            <strong>Kujdes!</strong> Bonuset me te vjetra se 45 Dite nuk mund te ndryshohen!
                                        </span>
                                    </Alert>
                                </Card.Body>                                
                                <Card.Footer>
                                    <Button variant="outline-success" className="me-2 float-end" onClick={() => kalkuloBonusetPerPunonjes() }>
                                        <FontAwesomeIcon icon={faGift} /> Paguaj Bonuset
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>:null}

                    
                </>
            )}


            {/** Modal per Bonuse */}
            <Modal size="lg" show={modalPerBonuset} onHide={() => setModalPerBonuse(false)} centered>
    <Modal.Header closeButton>
        <Modal.Title className="text-dark">Forma Per Kalkulim dhe Pagese te Bonuseve</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
            <Row className="mb-3 d-flex justify-content-start">
                <Col md={3}>
                    <Form.Group controlId="formFirstName">
                        <Form.Label>Muaji</Form.Label>
                        <Form.Select
                            name="muaji"
                            value={muaji}
                            onChange={(e) => {
                                const selectedMonth = parseInt(e.target.value, 10);
                                setMuaji(selectedMonth);
                                setMuajiEmertim(albanianMonths[selectedMonth - 1]); // Update Albanian month name
                            }} 
                        >
                            <option value="">Zgjidhni muajin</option>
                            {albanianMonths.map((month, index) => (
                                <option key={index} value={index + 1}>
                                    {month}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group controlId="formFirstName">
                        <Form.Label>Viti</Form.Label>
                        <Form.Select
                            name="viti"
                            value={viti}
                            onChange={(e) => setViti(e.target.value)} 
                        >
                            <option value="">Zgjidhni Vitin</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            {bonusetPerPunonjes.length > 0 ? (
                    <Row className='d-flex flex-column'>
                        <Col className="mb-3 align-items-center">
                            <Table striped bordered hover responsive className="text-center">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nr.</th>
                                        <th>Data</th>
                                        <th>Shuma (€)</th>
                                        <th>Veprime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bonusetPerPunonjes.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{formatLongDateToAlbanian(item.dataBonuseve)}</td>
                                            <td>{item.shuma} €</td>
                                            <td>
                                                <Button variant='outline-success'>
                                                    Paguaj
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Col>
                    <Col className="d-flex justify-content-center">
                    <Form className="w-75 p-3 d-flex flex-row flex-wrap justify-content-between rounded ">
                        <Col className="w-100 d-flex align-items-center justify-content-start">
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
                        <Col>  
                            <MenyratPagesesExport updateMenyraPageses={updateMenyraPageses} />
                        </Col>
                    </Form>
                    
                </Col>
                                    </Row>

                    ) : (
                        <Alert variant="warning" className="d-flex align-items-center justify-content-center">
                            <FontAwesomeIcon icon={faExclamationCircle} size="lg" className="me-3" />
                            <p className="mb-0 fw-bold">Nuk Egzistojne Bonuse per kete Date!</p>
                        </Alert>
                    )}
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="outline-secondary" disabled={buttonLoading} onClick={() => setModalPerBonuse(false)}>
            Mbyll
        </Button>
        <Button variant="primary" disabled={buttonLoading || editingBonuset || !selectedMenyraPageses} onClick={() => paguajBonuset()}>
            {buttonLoading ? (
                <><Spinner size="sm" /> {'Duke ruajtur'}</>
            ) : (
                'Paguaj Totalin'
            )}
        </Button>
    </Modal.Footer>
</Modal>

            {/**Modal per ndryshim ose pagese rroge */}
            <Modal size='md'
                        show={ndryshoModal}
                        onHide={() => {
                            buttonLoading ? null : setNdryshoModal(false);
                        }}
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title className="text-dark">{pageseRroge ? 'Paguaj Rrogen:' : 'Ndrysho Rrogen e Paguar:'}</Modal.Title>
                        </Modal.Header>
                          <Modal.Body>
                            <Form>
                                <Row className="mb-3 d-flex justify-content-center">
                                    <Col md={6}>
                                        <Form.Group controlId="formFirstName">
                                            <Form.Label>Data:</Form.Label>
                                            {pageseRroge ? 
                                             <Form.Control
                                             type="date"
                                             name="data"
                                             defaultValue={new Date().toISOString().split('T')[0]}
                                             onChange={(e) => handleActiveSalaryChange(e)}
                                             readOnly={!pageseRroge}  
                                             />:
                                            <Form.Control
                                                type="text"
                                                name="data"
                                                value={formatLongDateToAlbanian(activeSalary.dataPageses)}
                                                onChange={(e) => handleActiveSalaryChange(e)}
                                                readOnly={!pageseRroge}  
                                                />
                                            }

                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                      <Form.Group controlId="formFirstName">
                                              <Form.Label>Paga</Form.Label>
                                              <InputGroup>
                                              <Form.Control
                                                  type="number"
                                                  name="paga"
                                                  min={1}
                                                  value={activeSalary.paga}
                                                  onChange={(e) => handleActiveSalaryChange(e)}

                                              />
                                              <InputGroup.Text>€</InputGroup.Text>
                                              </InputGroup>
                                          </Form.Group>
                                    </Col>
                                </Row>
                                  <Row className="mb-3 align-items-center">
                                     <Col md={6}>
                                        <Form.Group controlId="formFirstName">
                                            <Form.Label>Bonusi i Pages:</Form.Label>
                                            <InputGroup>
                                            <Form.Control
                                                type="number"
                                                name="bonusi"
                                                min={0}
                                                value={activeSalary.bonusi}
                                                onChange={(e) => handleActiveSalaryChange(e)}

                                            />
                                            <InputGroup.Text>€</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                      <Form.Group controlId="formFirstName">
                                              <Form.Label>Zbritja:</Form.Label>
                                              <InputGroup>
                                              <Form.Control
                                                  type="number"
                                                  name="zbritje"
                                                  min={0}
                                                  value={activeSalary.zbritje}
                                                  onChange={(e) => handleActiveSalaryChange(e)}
                                              />
                                              <InputGroup.Text>€</InputGroup.Text>
                                              </InputGroup>
                                          </Form.Group>
                                    </Col>
                                  </Row>
                            </Form>
                            <Row>
                                <MenyratPagesesExport updateMenyraPageses={updateMenyraPageses} />
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" disabled={buttonLoading} onClick={() => {
                            buttonLoading ? null : setNdryshoModal(false);
                        }}>
                                Mbyll
                            </Button>
                            <Button variant="primary" disabled={buttonLoading || !selectedMenyraPageses} onClick={() => {pageseRroge ? paguajRrogen() : ndryshoRrogen()}}>
                                {buttonLoading  ? (
                                    <>
                                        <Spinner size="sm" /> {'Duke ruajtur'}
                                    </>
                                ) : (
                                    <> { pageseRroge ? 'Paguaj Rrogen' : 'Ruaj Ndryshimet' }</>
                                )}
                            </Button>
                        </Modal.Footer>
            </Modal>

            <ModalPerPyetje show={showModalPerPyetje} handleClose={() => {setShowModalPerPyetje(false)}} handleConfirm={handleConfirm} />

            <ToastContainer/>
        </Container>
    );
}

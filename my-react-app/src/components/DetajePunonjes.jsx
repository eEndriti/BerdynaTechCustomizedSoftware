import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table, Modal, Form, Spinner, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DetajePunonjes() {
    const [loading, setLoading] = useState(true);
    const [vacations, setVacations] = useState([]);
    const [bonuses, setBonuses] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [showVacationModal, setShowVacationModal] = useState(false);
    const [showBonusModal, setShowBonusModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [vacationData, setVacationData] = useState({ dataFillimit: '', dataMbarimit: '', lloji: '', arsyeja: '' });
    const [bonusData, setBonusData] = useState({ shuma: '', viti: '' });
    const [salaryData, setSalaryData] = useState({ dataPageses: '', paga: '', bonusi: '', zbritje: '', pershkrimi: '' });

    useEffect(() => {
        const fetchData = async () => {
            const fetchedVacations = await fetchVacations();
            const fetchedBonuses = await fetchBonuses();
            const fetchedSalaries = await fetchSalaries();
            setVacations(fetchedVacations);
            setBonuses(fetchedBonuses);
            setSalaries(fetchedSalaries);
            setLoading(false);
        };
        fetchData();
    }, []);

    const fetchVacations = async () => {
        return [];
    };

    const fetchBonuses = async () => {
        return [];
    };

    const fetchSalaries = async () => {
        return [];
    };

    const handleVacationSubmit = async () => {
        setShowVacationModal(false);
    };

    const handleBonusSubmit = async () => {
        setShowBonusModal(false);
    };

    const handleSalarySubmit = async () => {
        setShowSalaryModal(false);
    };

    const handleDelete = async (id) => {
    };

    return (
        <Container className="py-5">
            <h2 className="text-center mb-4">Menaxho Punonjësin</h2>
            {loading ? (
                <Spinner animation="border" className="mx-auto d-block" />
            ) : (
                <>
                    <Row className="mb-4">
                        <Col className="text-center">
                            <Button variant="success" onClick={() => setShowVacationModal(true)}>
                                <FontAwesomeIcon icon={faPlus} /> Shto Pushim
                            </Button>
                            <Button variant="success" onClick={() => setShowBonusModal(true)} className="ms-2">
                                <FontAwesomeIcon icon={faPlus} /> Shto Bonus
                            </Button>
                            <Button variant="success" onClick={() => setShowSalaryModal(true)} className="ms-2">
                                <FontAwesomeIcon icon={faPlus} /> Shto Paga
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card className="mb-4 shadow">
                                <Card.Body>
                                    <Card.Title>Pushimet</Card.Title>
                                    <Table striped bordered hover variant="light">
                                        <thead>
                                            <tr>
                                                <th>Data Fillimit</th>
                                                <th>Data Mbarimit</th>
                                                <th>Lloji</th>
                                                <th>Arsyeja</th>
                                                <th>Veprime</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vacations.map((vacation, index) => (
                                                <tr key={index}>
                                                    <td>{vacation.dataFillimit}</td>
                                                    <td>{vacation.dataMbarimit}</td>
                                                    <td>{vacation.lloji}</td>
                                                    <td>{vacation.arsyeja}</td>
                                                    <td>
                                                        <Button variant="outline-danger" onClick={() => handleDelete(vacation.pushimID)}>
                                                            <FontAwesomeIcon icon={faTrashCan} /> Fshij
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card className="mb-4 shadow">
                                <Card.Body>
                                    <Card.Title>Bonuset</Card.Title>
                                    <Table striped bordered hover variant="light">
                                        <thead>
                                            <tr>
                                                <th>Shuma</th>
                                                <th>Viti</th>
                                                <th>Veprime</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bonuses.map((bonus, index) => (
                                                <tr key={index}>
                                                    <td>{bonus.shuma}</td>
                                                    <td>{bonus.viti}</td>
                                                    <td>
                                                        <Button variant="outline-danger" onClick={() => handleDelete(bonus.bonusID)}>
                                                            <FontAwesomeIcon icon={faTrashCan} /> Fshij
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card className="mb-4 shadow">
                                <Card.Body>
                                    <Card.Title>Pagat</Card.Title>
                                    <Table striped bordered hover variant="light">
                                        <thead>
                                            <tr>
                                                <th>Data Pageses</th>
                                                <th>Paga</th>
                                                <th>Bonusi</th>
                                                <th>Zbritje</th>
                                                <th>Përshkrimi</th>
                                                <th>Veprime</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salaries.map((salary, index) => (
                                                <tr key={index}>
                                                    <td>{salary.dataPageses}</td>
                                                    <td>{salary.paga}</td>
                                                    <td>{salary.bonusi}</td>
                                                    <td>{salary.zbritje}</td>
                                                    <td>{salary.pershkrimi}</td>
                                                    <td>
                                                        <Button variant="outline-danger" onClick={() => handleDelete(salary.pagaID)}>
                                                            <FontAwesomeIcon icon={faTrashCan} /> Fshij
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
            <Modal show={showVacationModal} onHide={() => setShowVacationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Shto Pushim</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formDataFillimit">
                            <Form.Label>Data Fillimit</Form.Label>
                            <Form.Control type="date" value={vacationData.dataFillimit} onChange={(e) => setVacationData({ ...vacationData, dataFillimit: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="formDataMbarimit">
                            <Form.Label>Data Mbarimit</Form.Label>
                            <Form.Control type="date" value={vacationData.dataMbarimit} onChange={(e) => setVacationData({ ...vacationData, dataMbarimit: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="formLloji">
                            <Form.Label>Lloji</Form.Label>
                            <Form.Control type="text" value={vacationData.lloji} onChange={(e) => setVacationData({ ...vacationData, lloji: e.target.value })} placeholder="Shkruaj llojin..." />
                        </Form.Group>
                        <Form.Group controlId="formArsyeja">
                            <Form.Label>Arsyeja</Form.Label>
                            <Form.Control type="text" value={vacationData.arsyeja} onChange={(e) => setVacationData({ ...vacationData, arsyeja: e.target.value })} placeholder="Shkruaj arsyen..." />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowVacationModal(false)}>Mbyll</Button>
                    <Button variant="success" onClick={handleVacationSubmit}>Ruaj</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showBonusModal} onHide={() => setShowBonusModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Shto Bonus</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formShuma">
                            <Form.Label>Shuma</Form.Label>
                            <Form.Control type="number" value={bonusData.shuma} onChange={(e) => setBonusData({ ...bonusData, shuma: e.target.value })} placeholder="Shkruaj shumën..." />
                        </Form.Group>
                        <Form.Group controlId="formViti">
                            <Form.Label>Viti</Form.Label>
                            <Form.Control type="number" value={bonusData.viti} onChange={(e) => setBonusData({ ...bonusData, viti: e.target.value })} placeholder="Shkruaj vitin..." />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBonusModal(false)}>Mbyll</Button>
                    <Button variant="success" onClick={handleBonusSubmit}>Ruaj</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showSalaryModal} onHide={() => setShowSalaryModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Shto Paga</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formDataPageses">
                            <Form.Label>Data Pageses</Form.Label>
                            <Form.Control type="date" value={salaryData.dataPageses} onChange={(e) => setSalaryData({ ...salaryData, dataPageses: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="formPaga">
                            <Form.Label>Paga</Form.Label>
                            <Form.Control type="number" value={salaryData.paga} onChange={(e) => setSalaryData({ ...salaryData, paga: e.target.value })} placeholder="Shkruaj pagën..." />
                        </Form.Group>
                        <Form.Group controlId="formBonusi">
                            <Form.Label>Bonusi</Form.Label>
                            <Form.Control type="number" value={salaryData.bonusi} onChange={(e) => setSalaryData({ ...salaryData, bonusi: e.target.value })} placeholder="Shkruaj bonusin..." />
                        </Form.Group>
                        <Form.Group controlId="formZbritje">
                            <Form.Label>Zbritje</Form.Label>
                            <Form.Control type="number" value={salaryData.zbritje} onChange={(e) => setSalaryData({ ...salaryData, zbritje: e.target.value })} placeholder="Shkruaj zbritjen..." />
                        </Form.Group>
                        <Form.Group controlId="formPershkrimi">
                            <Form.Label>Përshkrimi</Form.Label>
                            <Form.Control type="text" value={salaryData.pershkrimi} onChange={(e) => setSalaryData({ ...salaryData, pershkrimi: e.target.value })} placeholder="Shkruaj përshkrimin..." />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSalaryModal(false)}>Mbyll</Button>
                    <Button variant="success" onClick={handleSalarySubmit}>Ruaj</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

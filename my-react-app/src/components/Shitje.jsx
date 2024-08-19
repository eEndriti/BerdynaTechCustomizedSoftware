import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Table, Form } from "react-bootstrap";
import SearchInput from "./SearchInput";
import KerkoProduktin from "./KerkoProduktin";
import { MdOutlineChangeCircle,MdDeleteForever  } from "react-icons/md";

export default function Shitje() {
  const navigate = useNavigate();  
  const [llojiShitjes, setLlojiShitjes] = useState("dyqan");
  const [menyraPageses, setMenyraPageses] = useState("");
  const [selectedSubjekti, setSelectedSubjekti] = useState({ emertimi: "", kontakti: "", subjektiID: null });
  const [products, setProducts] = useState([{}]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [totaliPerPagese, setTotaliPerPagese] = useState(0);
  const [totaliPageses, setTotaliPageses] = useState(0);

  useEffect(() => {
    // Update the total per pagese whenever products change
    const total = products.reduce((acc, product) => {
      const cmimiPerCope = parseFloat(product.cmimiPerCope) || 0;
      const sasiaShitjes = parseFloat(product.sasiaShitjes) || 0;
      return acc + (cmimiPerCope * sasiaShitjes);
    }, 0);
    setTotaliPerPagese(total);
  }, [products]);

  const handleProductSelect = (product) => {
    const updatedProducts = [...products];
    updatedProducts[selectedRow] = product;

    if (selectedRow === products.length - 1) {
      updatedProducts.push({});
    }

    setProducts(updatedProducts);
    setShowModal(false);
  };

  const openModalForRow = (index) => {
    setSelectedRow(index);
    setShowModal(true);
  };

  const handleButtonClick = (lloji) => {
    setLlojiShitjes(lloji);
    setTotaliPageses(0);
  };

  const handleSelectSubjekti = (result) => {
    setSelectedSubjekti({
      emertimi: result.emertimi,
      kontakti: result.kontakti,
      subjektiID: result.subjektiID,
    });
  };

  const handleTotaliPagesesChange = (e) => {
    setTotaliPageses(parseFloat(e.target.value) || 0);
  };

  const mbetjaPerPagese = (totaliPerPagese - totaliPageses).toFixed(2);

  const handleAnulo = () => {
    navigate('/faqjaKryesore')
  }
  return (
    <Container fluid className="mt-2 d-flex flex-column" style={{ minHeight: "95vh" }}>
      <Row className="d-flex flex-row justify-content-between">
        <Col>
          <Form.Group as={Row} controlId="subjekti" className="mb-2">
            <Form.Label column xs={6} className="text-start w-auto">Subjekti:</Form.Label>
            <Col xs={6}>
              <SearchInput value={selectedSubjekti.emertimi} onSelect={handleSelectSubjekti} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="kontakti" className="mb-2">
            <Form.Label column xs={6} className="text-start w-auto">Kontakti:</Form.Label>
            <Col xs={6}>
              <Form.Control disabled type="number" value={selectedSubjekti.kontakti} />
            </Col>
          </Form.Group>
        </Col>
        <Col className="d-flex flex-row justify-content-center">
          <Button
            variant={llojiShitjes === "dyqan" ? "primary" : "outline-primary"}
            size="lg"
            className="mx-1 w-25"
            onClick={() => handleButtonClick("dyqan")}
          >
            Shitje ne Dyqan
          </Button>
          <Button
            variant={llojiShitjes === "online" ? "primary" : "outline-primary"}
            size="lg"
            className="mx-1 w-25"
            onClick={() => handleButtonClick("online")}
          >
            Shitje Online
          </Button>
        </Col>
      </Row>

      <Row className="mt-4"></Row>

      <Row className="mt-5">
        <Col xs={12}>
          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead>
                <tr className="fs-5">
                  <th scope="col">Nr</th>
                  <th scope="col">Shifra</th>
                  <th scope="col">Emertimi</th>
                  <th scope="col">Pershkrimi</th>
                  <th scope="col">Cmimi Per Cope</th>
                  <th scope="col">Sasia e Disponueshme</th>
                  <th scope="col">Sasia e Shitjes</th>
                  <th scope="col">Totali</th>
                  <th scope="col">Komenti</th>
                  <th scope="col">Opsionet</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const cmimiPerCope = parseFloat(product.cmimiPerCope) || 0;
                  const sasiaShitjes = parseFloat(product.sasiaShitjes) || 0;
                  const totali = (cmimiPerCope * sasiaShitjes).toFixed(2);

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {product.shifra || (
                          <Button onClick={() => openModalForRow(index)}>Kerko</Button>
                        )}
                      </td>
                      <td>{product.emertimi}</td>
                      <td>{product.pershkrimi}</td>
                      <td>
                        <Form.Control className="bg-light border-0"
                          type="number"
                          value={product.cmimiPerCope || ''}
                          onChange={(e) => {
                            const updatedProducts = [...products];
                            updatedProducts[index].cmimiPerCope = e.target.value;
                            setProducts(updatedProducts);
                          }}
                        />
                      </td>
                      <td>{product.sasia}</td>
                      <td>
                        <Form.Control className="bg-light border-0"
                          type="number"
                          min={0}
                          max={product.sasia}
                          value={product.sasiaShitjes || ''}
                          onChange={(e) => {
                            const newValue = Math.min(Number(e.target.value), product.sasia);
                            const updatedProducts = [...products];
                            updatedProducts[index] = {
                              ...updatedProducts[index],
                              sasiaShitjes: newValue
                            };
                            setProducts(updatedProducts);
                          }}
                        />
                      </td>
                      <td>{totali}</td>
                      <td>
                        <Form.Control className="bg-light border-0"
                          type="text"
                          value={product.komenti || ''}
                          onChange={(e) => {
                            const updatedProducts = [...products];
                            updatedProducts[index].komenti = e.target.value;
                            setProducts(updatedProducts);
                          }}
                        />
                      </td>
                      <td >
                        <span><MdDeleteForever /></span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {showModal && (
              <KerkoProduktin
                show={showModal}
                onHide={() => setShowModal(false)}
                onSelect={handleProductSelect}
              />
            )}
          </div>
        </Col>
      </Row>

      <Row className="mt-auto section2 d-flex justify-content-around bg-light">
        <Col xs={12} md={6} className="d-flex flex-column align-items-center">
          <h5 className="p-3">
            Shtype Garancionin <Form.Check inline />
          </h5>
          <Button variant="primary" size="lg">Apliko Kestet</Button>
        </Col>
        <Col xs={12} md={6} className="d-flex justify-content-center">
          <Form.Control as="textarea" rows={3} className="p-3" placeholder="Shkruaj komentin..." />
        </Col>
      </Row>

      <Row className="section3 my-5 d-flex justify-content-end">
        <Col xs={12} md={6} className="d-flex justify-content-center align-items-end">
          <Button variant="danger" size="lg" className="mx-2 fs-1" onClick={handleAnulo}>Anulo</Button>
          <Button variant="success" size="lg" className="mx-2 fs-1" disabled={!selectedSubjekti.subjektiID} >Regjistro</Button>
        </Col>

        <Col xs={12} md={6} className="d-flex flex-column align-items-end">
          <div className="d-flex w-100 justify-content-end">
            <div className="d-flex flex-column w-100">
              <Form.Group as={Row} controlId="totaliPerPageseShuma" className="mb-2">
                <Form.Label column xs={6} className="text-end">Totali Per Pagese:</Form.Label>
                <Col xs={6}>
                  <Form.Control
                    type="number"
                    value={totaliPerPagese.toFixed(2)}
                    readOnly
                  />
                </Col>
              </Form.Group>
              {llojiShitjes == 'dyqan'? <>
                <Form.Group as={Row} controlId="totaliPageses" className="mb-2">
                <Form.Label column xs={6} className="text-end">Totali Pageses:</Form.Label>
                <Col xs={6}>
                  <Form.Control
                    type="number"
                    value={totaliPageses}
                    onChange={handleTotaliPagesesChange}
                    min={0}
                  />
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="mbetjaPerPagese" className="mb-2">
                <Form.Label column xs={6} className="text-end">Mbetja Per Pagese:</Form.Label>
                <Col xs={6}>
                  <Form.Control
                    type="number"
                    value={mbetjaPerPagese}
                    readOnly
                  />
                </Col>
              </Form.Group>
              </>:
              <Form.Group as={Row} controlId="nrPorosiseShuma" className="mb-2">
              <Form.Label column xs={6} className="text-end">Nr. Porosise:</Form.Label>
              <Col xs={6}>
                <Form.Control type="number" />
              </Col>
            </Form.Group>
            }
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

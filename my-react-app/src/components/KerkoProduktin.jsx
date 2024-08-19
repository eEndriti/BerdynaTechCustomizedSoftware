import React, { useState, useEffect } from "react";
import { Modal, Form, Table, Button } from "react-bootstrap";

export default function KerkoProduktin({ show, onHide, onSelect }) {
  const [queryShifra, setQueryShifra] = useState("");
  const [queryEmertimi, setQueryEmertimi] = useState("");
  const [queryPershkrimi, setQueryPershkrimi] = useState("");
  const [results, setResults] = useState([]);
  const [produktet, setProduktet] = useState([]);

  // Fetch data and filter results
  useEffect(() => {
    const fetchAndFilterData = async () => {
      const receivedData = await window.api.fetchTableProdukti();
      setProduktet(receivedData);
      
      // Perform filtering
      const filteredResults = receivedData.filter(
        (item) =>
          item.shifra.toLowerCase().includes(queryShifra.toLowerCase()) &&
          item.emertimi.toLowerCase().includes(queryEmertimi.toLowerCase()) &&
          item.pershkrimi.toLowerCase().includes(queryPershkrimi.toLowerCase())
      );
      setResults(filteredResults);
    };

    fetchAndFilterData();
  }, [queryShifra, queryEmertimi, queryPershkrimi]); // Re-fetch data and filter results when filters change

  const handleSelect = (item) => {
    item.cmimiPerCope = item.cmimiShitjes
    item.sasiaShitjes = 1;
    onSelect(item);  // Ensure the selected item is passed back to the parent
    onHide();        // Close the modal after selection
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Kërko Produktin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-row justify-content-between">
          <Form.Group className="mb-3">
            <Form.Label>Shifra</Form.Label>
            <Form.Control
              type="text"
              value={queryShifra}
              onChange={(e) => setQueryShifra(e.target.value)}
              placeholder="Kërko Shifra..."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Emertimi</Form.Label>
            <Form.Control
              type="text"
              value={queryEmertimi}
              onChange={(e) => setQueryEmertimi(e.target.value)}
              placeholder="Kërko Emertimi..."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Pershkrimi</Form.Label>
            <Form.Control
              type="text"
              value={queryPershkrimi}
              onChange={(e) => setQueryPershkrimi(e.target.value)}
              placeholder="Kërko Pershkrimi..."
            />
          </Form.Group>
        </div>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Shifra</th>
              <th>Emertimi</th>
              <th>Pershkrimi</th>
              <th>Sasia e Disponueshme</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => (
              <tr key={index} onClick={() => handleSelect(item)}>
                <td>{item.shifra}</td>
                <td>{item.emertimi}</td>
                <td>{item.pershkrimi}</td>
                <td>{item.sasia}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Mbyll
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

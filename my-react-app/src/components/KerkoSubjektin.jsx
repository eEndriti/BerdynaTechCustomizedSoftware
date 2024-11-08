import React, { useState, useEffect } from "react";
import { Form, Button, InputGroup, ListGroup } from "react-bootstrap";
import { IoSearchSharp,IoAddSharp } from "react-icons/io5";
import ShtoNdryshoSubjektin from "./ShtoNdryshoSubjektin";

export default function SearchInput({ filter,value, onSelect,lloji }) {
  const [query, setQuery] = useState("");
  const [subjekti, setSubjekti] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal,setShowModal] = useState(false)
  const [data,setData] = useState({ndrysho:false,refresh:false,lloji:filter})

  useEffect(() => {
    window.api.fetchTableSubjekti(filter).then(receivedData => {
      const  filteredData = receivedData.filter(item => item.lloji == filter);
      setSubjekti(filteredData);
      setFilteredResults(filteredData);
    });
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setQuery(searchTerm);

    const newFilteredResults = subjekti.filter((item) =>
      item.emertimi.toLowerCase().includes(searchTerm)
    );

    setFilteredResults(newFilteredResults);
    setShowDropdown(true);
  };

  const handleSelect = (result) => {
    onSelect(result); // Notify parent component
    setQuery(result.emertimi); // Update the input field
    setShowDropdown(false); // Hide the dropdown
  };
  const handleAddSubject = () => setShowModal(true)
  const handleCloseModal = () => setShowModal(false)
  return (
    <div className="position-relative">
      <InputGroup className="">
        <Form.Control
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Subjekti..."
        />
        <Button variant="outline-secondary border" disabled>
          <IoSearchSharp />
        </Button>
        <Button variant="success border" onClick={handleAddSubject}>
          <IoAddSharp />
        </Button>
      </InputGroup>

      {showDropdown && filteredResults.length > 0 && (
        <ListGroup className="position-absolute w-100 mt-2">
          {filteredResults.map((result) => (
            <ListGroup.Item
              key={result.subjektiID}
              action
              onClick={() => handleSelect(result)}
            >
              <div><strong>{result.emertimi}</strong></div>
              <div>{result.kontakti}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <ShtoNdryshoSubjektin show={showModal} handleClose={handleCloseModal} data={data} />
    </div>
  );
}

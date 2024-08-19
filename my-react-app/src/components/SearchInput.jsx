import React, { useState, useEffect } from "react";
import { Form, Button, InputGroup, ListGroup } from "react-bootstrap";
import { IoSearchSharp } from "react-icons/io5";

export default function SearchInput({ value, onSelect }) {
  const [query, setQuery] = useState("");
  const [subjekti, setSubjekti] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    window.api.fetchTableSubjekti().then(receivedData => {
      setSubjekti(receivedData);
      setFilteredResults(receivedData);
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

  return (
    <div className="position-relative">
      <InputGroup>
        <Form.Control
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Subjekti..."
        />
        <Button variant="outline-secondary border" disabled>
        <IoSearchSharp />
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
    </div>
  );
}

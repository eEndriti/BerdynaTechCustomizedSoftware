import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Shpenzim() {
  const [shpenzimet, setShpenzimet] = useState([]);
  const [filteredShpenzimet, setFilteredShpenzimet] = useState([]);
  const [llojetShpenzimeve, setLlojetShpenzimeve] = useState([]);
  const [llojiShpenzimeveSelektuarID, setLlojiShpenzimeveSelektuarID] = useState();
  const [selectedShumaStandarde, setSelectedShumaStandarde] = useState();
  const [selectedLlojShpenzimi, setSelectedLlojShpenzimi] = useState({});
  const [komenti, setKomenti] = useState('');
  const [shpenzimiRi, setShpenzimiRi] = useState('');
  const [shumaStandardeERe, setShumaStandardeERe] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));

  useEffect(() => {2
    // Fetch all shpenzimet data
    window.api.fetchTableShpenzimet().then(receivedData => {
      setShpenzimet(receivedData);
      setFilteredShpenzimet(receivedData); // Initialize filtered data
    });
  }, []);

  useEffect(() => {
    // Fetch llojetShpenzimeve data
    window.api.fetchTableLlojetShpenzimeve().then(receivedData => {
      setLlojetShpenzimeve(receivedData);
    });
  }, []);

  useEffect(() => {
    // Filter shpenzimet based on the selected date range
    const filtered = shpenzimet.filter(shpenzim => {
      const shpenzimDate = new Date(shpenzim.dataShpenzimit);
      return shpenzimDate >= new Date(startDate) && shpenzimDate <= new Date(endDate);
    });
    setFilteredShpenzimet(filtered);
  }, [startDate, endDate, shpenzimet]);

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setLlojiShpenzimeveSelektuarID(selectedValue);
    console.log(llojetShpenzimeve)
    const selectedItem = llojetShpenzimeve.find(item => item.llojetShpenzimeveID == selectedValue);
    if (selectedItem) {
      setSelectedShumaStandarde(selectedItem.shumaStandarde);
      setSelectedLlojShpenzimi(selectedItem);
    }
  };

  const handleShumaStandardeOnChange = (e) => {
    setSelectedShumaStandarde(e.target.value);
  };

  const handleKomentiChange = (e) => {
    setKomenti(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const shtoShpenzimin = async () => {
    const perdoruesiID = localStorage.getItem('perdoruesiID');
    const data = {
      shumaShpenzimit: selectedShumaStandarde,
      komenti: komenti,
      llojetShpenzimeveID: llojiShpenzimeveSelektuarID,
      perdoruesiID: perdoruesiID,
      nderrimiID: 1
    };
    const result = await window.api.insertShpenzimi(data);
    if (result.success) {
      toast.success('Shpenzimi u Regjistrua me Sukses!', {
        position: "top-center",  // Use string directly instead of toast.POSITION.TOP_CENTER
        autoClose: 1500, // Optional: Delay before auto-close
        onClose: () => window.location.reload(), // Reload the page after the toast closes
      });            
    } else {
      toast.error('Gabim gjate regjistrimit: ' + result.error);
    }
  };

  const handleShpenzimiRiChange = (e) => {
    setShpenzimiRi(e.target.value);
  };

  const handleShumaStandardeEReChange = (e) => {
    setShumaStandardeERe(e.target.value);
  };

  const shtoLlojinShpenzimit = async () => {
    const data = {
      emertimi: shpenzimiRi,
      shumaStandarde: shumaStandardeERe
    };
    const result = await window.api.insertLlojiShpenzimit(data);
    if (result.success) {
      toast.success('Lloji i Shpenzimit u Regjistrua me Sukses!', {
        position: "top-center",  // Use string directly instead of toast.POSITION.TOP_CENTER
        autoClose: 1500, // Optional: Delay before auto-close
        onClose: () => window.location.reload(), // Reload the page after the toast closes
      });            ;
    } else {
      toast.error('Gabim gjate regjistrimit: ');
    }
  };

  return (
    <div>
      <Row className='d-flex flex-row justify-content-start m-5'>
        <Col lg={3} className='d-flex flex-column justify-content-start bg-light border py-3'>          
          <h3 className='text-center'>Shto nje Shpenzim</h3>
          <div className='d-flex flex-column align-items-center justify-content-center'>
            <Form.Group className='m-3'>
              <Form.Select onChange={handleSelectChange} aria-label="Selekto nje Lloj Shpenzimi">
                <option value="" disabled selected>Selekto nje Lloj Shpenzimi</option>
                {llojetShpenzimeve.map((item, index) => (
                  <option key={index} value={item.llojetShpenzimeveID}>
                    {item.emertimi}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className='mx-2 mb-3'>
            <Form.Control 
                type='number' 
                placeholder='Shuma per Shpenzim' 
                value={selectedShumaStandarde} 
                onChange={(e) => setSelectedShumaStandarde(e.target.value)}
                />

            </Form.Group>
            <Form.Group>
              <Form.Control as='textarea' cols={25} rows={3} onChange={handleKomentiChange} placeholder='Sheno Komentin e Shpenzimit...'/>
            </Form.Group>
          </div>
          <div className=''>
            <Button variant='success w-100 mt-3' onClick={shtoShpenzimin}>Regjistro</Button>
          </div>
        </Col>
        <Col className='d-flex flex-column mx-5'>
          <div className='d-flex flex-row justify-content-center'>
            <h4 className='px-3 '>Shpenzimet brenda Periudhes :</h4>
            <Form.Group className='mx-1'>
              <Form.Control
                type='date'
                value={startDate}
                onChange={handleStartDateChange}
              />
            </Form.Group>
            <Form.Group className='mx-1'>
              <Form.Control
                type='date'
                value={endDate}
                onChange={handleEndDateChange}
              />
            </Form.Group>
          </div>
          {filteredShpenzimet.length > 0 ? (
            <div className='tabelaShpenzimeve'>
            <div className="table-responsive tabeleMeMaxHeight">
              <table className="table table-sm table-striped text-center">
                <thead className="table-light">
                  <tr className='fs-5'>
                    <th scope="col">Nr</th>
                    <th scope="col">Shifra</th>
                    <th scope="col">Emertimi</th>
                    <th scope="col">Shuma</th>
                    <th scope="col">Komenti</th>
                    <th scope="col">Perdoruesi</th>
                    <th scope="col">Opsionet</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShpenzimet.map((item, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{item.shifra}</td>
                      <td>{item.emertimi}</td>
                      <td>{item.shumaShpenzimit.toFixed(2)} €</td>
                      <td>{item.komenti}</td>
                      <td>{item.perdoruesi}</td>
                      <td>
                        Edit/Delete
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          ): (
            <h5 className='text-center mt-5 text-danger'>
                 Nuk Egzistojne te Dhena ne kete Interval Kohor !
            </h5>
          )}
        </Col>
      </Row>
      <hr/>
      <Row className='d-flex flex-row justify-content-start m-5 '>
        <Col lg={5} className='d-flex flex-column justify-content-start bg-light border py-3'>
          <h3>Shto nje Lloj Shpenzimi te Ri</h3>
          <Form.Group>
            <Form.Label>Emertimi:</Form.Label>
            <Form.Control
              type='text'
              placeholder='Emertimi i Shpenzimit te Ri...'
              onChange={handleShpenzimiRiChange}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Shuma Standarde:</Form.Label>
            <Form.Control
              type='number'
              placeholder='Shuma Standarde...'
              onChange={handleShumaStandardeEReChange}
            />
          </Form.Group>
          <Button variant='success' className='my-4' onClick={shtoLlojinShpenzimit}>Regjistro Llojin e Ri te Shpenzimeve</Button>
        </Col>
        <Col className='tabelaLlojeveShpenzimeve col-xs-12 col-sm-12 col-md-6 col-lg-6 px-5'>
          <h2>Llojet e Shpenzimeve:</h2>
          <div className="table-responsive tabeleMeMaxHeight">
            <table className="table table-sm table-striped text-center">
              <thead className="table-light">
                <tr className='fs-5'>
                  <th scope="col">Nr</th>
                  <th scope="col">Emertimi</th>
                  <th scope="col">Shuma Standarde</th>
                  <th scope="col">Opsionet</th>
                </tr>
              </thead>
              <tbody>
                {llojetShpenzimeve.map((item, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{item.emertimi}</td>
                    <td>{item.shumaStandarde.toFixed(2)} €</td>
                    <td>
                      Edit/Delete
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
      <hr/>
      <div className='d-flex flex-row justify-content-center mt-5 m-5'>
        <Button className='fs-5'>Kalo nga Stoki ne Shpenzim</Button>
      </div>
      <ToastContainer/>
    </div>
  );
}

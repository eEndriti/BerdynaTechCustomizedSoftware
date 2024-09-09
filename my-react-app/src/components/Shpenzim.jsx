import  { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan,faPen } from '@fortawesome/free-solid-svg-icons'; 
import { Row, Col, Button, Form,Spinner,Modal} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPerPyetje from './ModalPerPyetje'

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
  const [loading,setLoading] = useState(false)
  const [shfaqLlojetEShpenzimeve,setShfaqLlojetEShpenzimeve] = useState(false)
  const [showModal,setShowModal] = useState(false)
  const [selectedRowData,setSelectedRowData] = useState({})
  const [idPerAnulim,setIdPerAnulim] = useState()
  const [ShowModalPerPyetje,setShowModalPerPyetje] = useState(false)
  const [burimiThirrjes,setBurimiThirrjes] = useState()
  const [transaksioniIDPerDelete,setTransaksioniIDPerDelete] = useState()
  
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
    const selectedItem = llojetShpenzimeve.find(item => item.llojetShpenzimeveID == selectedValue);
    if (selectedItem) {
      setSelectedShumaStandarde(selectedItem.shumaStandarde);
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
    setLoading(true)
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
      setLoading(false)
      toast.success('Shpenzimi u Regjistrua me Sukses!', {
        position: "top-center",  // Use string directly instead of toast.POSITION.TOP_CENTER
        autoClose: 1500, // Optional: Delay before auto-close
        onClose: () => window.location.reload(), // Reload the page after the toast closes
      });            
    } else {
      setLoading(false)
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
    setLoading(true)
    const data = {
      emertimi: shpenzimiRi,
      shumaStandarde: shumaStandardeERe
    };
    const result = await window.api.insertLlojiShpenzimit(data);
    if (result.success) {
      setLoading(false)
      toast.success('Lloji i Shpenzimit u Regjistrua me Sukses!', {
        position: "top-center",  // Use string directly instead of toast.POSITION.TOP_CENTER
        autoClose: 1500, // Optional: Delay before auto-close
        onClose: () => window.location.reload(), // Reload the page after the toast closes
      });            ;
    } else {
      setLoading(false)
      toast.error('Gabim gjate regjistrimit: ');
    }
  };
  const handleEditShpenzimiClick = (item) =>{
    setSelectedRowData({
      ...item,
      lloji:true // 1 nenkupton shpenzim per me bo conditional rendering ma tleht
    })
    setShowModal(true)
    console.log(selectedRowData)
  }
  const handleEditLlojiShpenzimitClick = (item) =>{
    setSelectedRowData({
      ...item,
      lloji:false // 0 nenkupton shpenzim per me bo conditional rendering ma tleht
    })
    setShowModal(true)
  }
  const handleRuajNdryshimet = async () =>{
    setLoading(true)
    let result
    
    if(selectedRowData.lloji){
      const data = {
        llojetShpenzimeveID:llojiShpenzimeveSelektuarID,
        shumaShpenzimit:selectedRowData.shumaShpenzimit,
        komenti:selectedRowData.komenti,
        transaksioniID:selectedRowData.transaksioniID,
        shpenzimiID:selectedRowData.shpenzimiID
      }
       result = await window.api.ndryshoShpenzimin(data)
    }else{
      const data = {
        emertimi:selectedRowData.emertimi,
        shumaStandarde:selectedRowData.shumaShpenzimit,
        transaksioniID:selectedRowData.transaksioniID,
        llojetShpenzimeveID:selectedRowData.llojetShpenzimeveID
      }
       result = await window.api.ndryshoLlojinShpenzimit(data)
    }

    if (result.success) {
      toast.success('Ndryshimet u ruajten me sukses!', {
        position: 'top-center',
        autoClose: 1500,
        onClose: () => window.location.reload(),
      });
    } else {
      setLoading(false)
      toast.error('Gabim gjate ndryshimit: ' + result.error);
    }
    setShowModal(false);
  }

  const thirreModalPerPyetje = (idPerAnulim,transaksioniID,burimiThirrjes) =>{
    setTransaksioniIDPerDelete(transaksioniID)
    setIdPerAnulim(idPerAnulim)
    setShowModalPerPyetje(true)
    setBurimiThirrjes(burimiThirrjes)
  }
  const handleCloseModalPerPyetje = () =>{
    setShowModalPerPyetje(false)
  }
  const handleConfirmModal = () =>{
    handleDelete()
  }
  const handleDelete = async () =>{
    let result

    if(burimiThirrjes == 'Shpenzimi'){
      const data ={
        lloji:'Shpenzim',
        transaksioniID:transaksioniIDPerDelete
      }
      console.log(data)
      result = await window.api.anuloTransaksionin(data)
    }else{
      result =await window.api.deleteLlojiShpenzimit(idPerAnulim)
    }
    console.log(result)
    if (result.success) {
      toast.success(` u fshi me sukses!`, {
        position: 'top-center',
        autoClose: 1500,
        onClose: () => window.location.reload(),
      });
    } else {
      setLoading(false)
      toast.error('Gabim gjate fshirjes: ' + result.error);
    }
  }
  
  return (
    <div>
      <Row>
        <Col>
          <Button variant={!shfaqLlojetEShpenzimeve ? 'info' : 'secondary'} className='fs-5 ' onClick={() => setShfaqLlojetEShpenzimeve(!shfaqLlojetEShpenzimeve)}>Llojet e Shpenzimeve</Button>
        </Col>
        <Col className=''>
          <Button className='fs-5'>Kalo nga Stoki ne Shpenzim</Button>
        </Col>
      </Row>
      {shfaqLlojetEShpenzimeve ? <>
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
          <Button variant='success' className='my-4' onClick={shtoLlojinShpenzimit} disabled={loading}>{loading ? <>
            <Spinner as="span" animation='border' size='sm' role='status' aria-hidden={true}/>{''}Duke Ruajtur...
          </>:'Regjistro Llojin e Shpenzimit'}</Button>
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
                     <Button onClick={() => handleEditLlojiShpenzimitClick(item)}><FontAwesomeIcon icon={faPen}/></Button>
                     {item.total_shpenzime < 1 ? <>
                      <Button variant='danger' className='m-1' onClick={() => thirreModalPerPyetje(item.llojetShpenzimeveID,'Lloji i Shpenzimit')}><FontAwesomeIcon icon={faTrashCan}/></Button></>:null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
      </> : <>
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
            <Button variant='success w-100 mt-3' onClick={shtoShpenzimin} disabled = {loading}>{loading ? <>
            <Spinner as="span" animation='border' size='sm' role='status' aria-hidden={true}/>{''}Duke Ruajtur...
          </>:'Regjistro'}</Button>
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
                        <Button onClick={() => handleEditShpenzimiClick(item)}><FontAwesomeIcon icon={faPen}/></Button>
                        <Button variant='danger' className='m-1' onClick={() => thirreModalPerPyetje(item.shpenzimiID,item.transaksioniID,'Shpenzimi')}><FontAwesomeIcon icon={faTrashCan}/></Button>
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
      </>}
      <ToastContainer/>
      <ModalPerPyetje show={ShowModalPerPyetje} handleClose={handleCloseModalPerPyetje} handleConfirm={handleConfirmModal} />
      <Modal show={showModal} onHide={() => setShowModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>{selectedRowData.lloji ? 'Ndrysho Shpenzimin' : 'Ndrysho Llojin e Shpenzimit'}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form.Group>
      {selectedRowData.lloji && <><Form.Label>Shifra:</Form.Label>
      <Form.Control
        type="text"
        disabled
        value={selectedRowData.shifra}
        onChange={(e) => setSelectedRowData({...selectedRowData, shifra: e.target.value})}
      /></>}
    </Form.Group>
    {selectedRowData.lloji ? <>
      <Form.Group className='m-3'>
              <Form.Select onChange={handleSelectChange} aria-label="Selekto nje Lloj Shpenzimi">
                <option value="" disabled selected defaultValue={2}>Selekto nje Lloj Shpenzimi</option>
                {llojetShpenzimeve.map((item, index) => (
                  <option key={index} value={item.llojetShpenzimeveID}>
                    {item.emertimi}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
    </> : <>
    <Form.Group>
      <Form.Label>Emertimi:</Form.Label>
      <Form.Control
        type="text"
        value={selectedRowData.emertimi}
        onChange={(e) => setSelectedRowData({...selectedRowData, emertimi: e.target.value})}
      />
    </Form.Group>
    </>}

    
    <Form.Group>
      <Form.Label>Shuma:</Form.Label>
      <Form.Control
        type="number"
        min={0}
        defaultValue={selectedRowData.shumaStandarde}
        value={selectedRowData.shumaShpenzimit}
        onChange={(e) => setSelectedRowData({...selectedRowData, shumaShpenzimit: e.target.value})}
      />
    </Form.Group>
    {selectedRowData.lloji && <>
      <Form.Group>
      <Form.Label>Komenti:</Form.Label>
      <Form.Control
        as="textarea"
        value={selectedRowData.komenti}
        onChange={(e) => setSelectedRowData({...selectedRowData, komenti: e.target.value})}
      />
      </Form.Group>
    </>}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>Mbyll</Button>
    <Button variant="primary" onClick={handleRuajNdryshimet} disabled={loading}>{loading ? <>
      <Spinner as="span" animation='border' size='sm' role='status' aria-hidden={true}/>{''}Duke Ruajtur...
      </> :'Ruaj Ndryshimet'}</Button>
  </Modal.Footer>
</Modal>

    </div>
  );
}

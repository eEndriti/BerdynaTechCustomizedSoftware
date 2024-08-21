import { useState,useEffect } from 'react'

function FaqjaKryesoreAdmin() {
  const [transaksionet,setTransaksionet] = useState([])
  const [shitjet,setShitjet] = useState([])
  const [serviset,setServiset] = useState([])
  const [transaksionetENderrimit,setTransaksionetENderrimit] = useState([])
  const [porositeNePritje,setPorositeNePritje] = useState([])
  const [servisetAktive,setServisetAktive] = useState([])


  
  useEffect(() => {
    window.api.fetchTableTransaksionet().then(receivedData => {
      setTransaksionet(receivedData);
    });
  }, []);

  useEffect(() => {
    window.api.fetchTableShitje().then(receivedData => {
      setShitjet(receivedData);
    });
  }, []);

  useEffect(() => {
    window.api.fetchTableServisi().then(receivedData => {
      setServiset(receivedData);
    });
  }, []);

  useEffect(() => {
    const filteredTransaksionet = transaksionet.filter(item => item.nderrimiID === 1);
    setTransaksionetENderrimit(filteredTransaksionet);
  }, [transaksionet]);

  useEffect(() => {
    const shitjetEFiltruara = shitjet.filter(item => item.lloji == 'online');
    setPorositeNePritje(shitjetEFiltruara);
  }, [shitjet]);

  useEffect(() => {
    const servisetAktive = serviset.filter(item => item.statusi == 'Aktiv');
    setServisetAktive(servisetAktive);
  }, [shitjet]);
  

    const [comment, setComment] = useState(() => {
      return localStorage.getItem('userComment') || '';
    });
  
    useEffect(() => {
      localStorage.setItem('userComment', comment);
    }, [comment]);
  
    const handleChange = (event) => {
      setComment(event.target.value);
    };
  
  return (
    <div>
      <div className="container mt-5 tabelaTransaksioneve ">
        <h3>Transaksionet e Nderrimit:</h3>
        <div className="table-responsive tabeleMeMaxHeight">
          <table className="table table-sm table-striped ">
            <thead className="table-light">
              <tr className='fs-5'>
                <th scope="col">Nr</th>
                <th scope="col">Shifra</th>
                <th scope="col">Lloji</th>
                <th scope="col">Totali Per Pagese</th>
                <th scope="col">Totali Pageses</th>
                <th scope="col">Mbetja Per Pagese</th>
                <th scope="col">Komenti</th>
                <th scope="col">Opsionet</th>
              </tr>
            </thead>
            <tbody>
            {transaksionetENderrimit.map((item,index) => (
              <tr key={index}>
                <th scope="row">{index+1}</th>
                <td>{item.shifra}</td>
                <td>{item.lloji}</td>
                <td>{item.totaliperPagese}</td>
                <td>{item.totaliIPageses}</td>
                <td>{item.mbetjaPerPagese}</td>
                <td>{item.komenti}</td>
                <td>
                  Edit/Delete
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="container mt-5 d-flex flex-row justify-content-between">

        <div className='tabelaPorosive col-xs-12 col-sm-12 col-md-6 col-lg-6 px-5'>
          <h3>Porosite ne Pritje:</h3>
          <div className="table-responsive tabeleMeMaxHeight">
            <table className="table table-sm table-striped">
              <thead className="table-light">
                <tr className='fs-5'>
                  <th scope="col">Nr</th>
                  <th scope="col">Shifra</th>
                  <th scope="col">NrPorosise</th>
                  <th scope="col">Data</th>
                  <th scope="col">Subjekti</th>
                  <th scope="col">Totali</th>
                  <th scope="col">Komenti</th>
                  <th scope="col">Opsionet</th>
                </tr>
              </thead>
              <tbody>
              {porositeNePritje.map((item,index) => (
                <tr key={index}>
                  <th scope="row">{index+1}</th>
                  <td>{item.shifra}</td>
                  <td>{item.nrPorosise}</td>
                  <td>{item.dataShitjes ? new Date(item.dataShitjes).toLocaleDateString() : ''}</td>
                  <td>{item.subjekti}</td>
                  <td>{item.totaliPerPagese}</td>
                  <td>{item.komenti}</td>
                  <td>
                    Edit/Delete
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='tabelaServiseve  col-xs-12 col-sm-12 col-md-6 col-lg-6 px-5'>
          <h3>Serviset Aktive:</h3>
          <div className="table-responsive tabeleMeMaxHeight">
            <table className="table table-sm table-striped">
              <thead className="table-light">
                <tr className='fs-5'>
                  <th scope="col">Nr</th>
                  <th scope="col">Klienti</th>
                  <th scope="col">Kontakti</th>
                  <th scope="col">Komenti</th>
                  <th scope="col">Pajisjet Percjellese</th>
                  <th scope="col">Opsionet</th>
                </tr>
              </thead>
              <tbody>
              {servisetAktive.map((item,index) => (
                <tr key={index}>
                  <th scope="row">{index+1}</th>
                  <td>{item.subjekti}</td>
                  <td>{item.kontakti}</td>
                  <td>{item.komenti}</td>
                  <td>{item.pajisjetPercjellese}</td>
                  <td>
                    Edit/Delete
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
              <br></br>
      <div className='komentIPerkohshem d-flex flex-row justify-content-center m-4 fixed-bottom'>
        <textarea className=''
          value={comment}
          cols={100}
          rows={4}
          onChange={handleChange}
          placeholder="Type your comment here..."
        />
      </div>
    </div>
  )
}

export default FaqjaKryesoreAdmin
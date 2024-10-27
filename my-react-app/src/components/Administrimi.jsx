import React, { useState } from 'react';
import { Button, Modal, Form, Tabs, Tab, Table } from 'react-bootstrap';
import Punonjesit from './Punonjesit';
import Perdoruesit from './Perdoruesit';
import MenyratPagesave from './MenyratPagesave';

export default function Administrimi() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('userManagement');
  
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="administrimi-container p-4" style={{ backgroundColor: '#f5f5f5' }}>
      <h2 className="mb-4 text-center" style={{ color: '#2A3D4E' }}>Administrimi dhe Menaxhimi Financiar</h2>
      
      <Tabs
        id="administrimi-tabs"
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
        className="mb-4"
      >
       
        
        <Tab eventKey="punonjesit" title="Menaxhimi i Punonjësve">
          <Punonjesit/>
        </Tab>

        <Tab eventKey="perdoruesit" title="Menaxhimi i Perdoruesve">
            <Perdoruesit />
        </Tab>

        <Tab eventKey="menyratPagesave" title="Menaxhimi i Menyrave te Pagesave">
          <MenyratPagesave />
        </Tab>
      </Tabs>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Forma për Regjistrim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formItem">
              <Form.Label>Emri</Form.Label>
              <Form.Control type="text" placeholder="Shkruaj Emrin" />
            </Form.Group>
            <Form.Group controlId="formRole">
              <Form.Label>Roli/Pozita</Form.Label>
              <Form.Control type="text" placeholder="Shkruaj Rolin ose Pozitën" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Mbyll</Button>
          <Button variant="primary">Ruaj</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

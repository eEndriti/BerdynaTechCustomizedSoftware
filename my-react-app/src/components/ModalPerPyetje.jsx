// CustomModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function CustomModal({ show, handleClose, handleConfirm }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Konfirmimi</Modal.Title>
      </Modal.Header>
      <Modal.Body>A jeni i sigurt?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Anulo
        </Button>
        <Button variant="primary" onClick={() => { handleConfirm(); handleClose(); }}>
          Po, Vazhdo
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomModal;

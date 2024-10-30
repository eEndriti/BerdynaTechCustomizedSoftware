import React, { useState } from 'react';
import { Button, Modal, Form, Tabs, Tab, Table } from 'react-bootstrap';
import Punonjesit from './Punonjesit';
import Perdoruesit from './Perdoruesit';
import MenyratPagesave from './MenyratPagesave';

export default function Administrimi() {

  const [activeTab, setActiveTab] = useState('perdoruesit');
  

  return (
    <div className="administrimi-container p-4" style={{ backgroundColor: '#f5f5f5' }}>
      <h2 className="mb-4 text-center" style={{ color: '#2A3D4E' }}>Administrimi dhe Menaxhimi</h2>
      
      <Tabs
        id="administrimi-tabs"
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
        className="mb-4"
      >
       
        
        <Tab eventKey="punonjesit" title="Menaxhimi i Punonjësve" >
          <Punonjesit />
        </Tab>

        <Tab eventKey="perdoruesit" title="Menaxhimi i Perdoruesve">
            <Perdoruesit />
        </Tab>

        <Tab eventKey="menyratPagesave" title="Menaxhimi i Menyrave te Pagesave">
          <MenyratPagesave />
        </Tab>
      </Tabs>
    </div>
  );
}

import React, {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Layout from './components/Layout';
import Login from './pages/Login';
import Generar from './certificados/generar';
import Consultar from './certificados/consultar';

const App = () => {
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);
  
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard pageTitle="Dashboard"/>} />
          <Route path="/chat" element={<Chat pageTitle="Chat"/>} />
          <Route path="/certificados/generar" element={<Generar pageTitle="Generar Certificado"/>} />
          <Route path="/certificados/consultar" element={<Consultar pageTitle="Consultar Certificados"/>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
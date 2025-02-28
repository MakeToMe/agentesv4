import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import WhatsApp from './pages/WhatsApp';
import Projetos from './pages/Projetos';
import Treinamentos from './pages/Treinamentos';
import Laboratorio from './pages/Laboratorio';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import { ProjectProvider } from './contexts/ProjectContext';
import { KnowledgeBaseProvider } from './contexts/KnowledgeBaseContext';
import './config/chartConfig';
import Produtos from './pages/Produtos';
import Bases from './pages/Bases';
import Leads from './pages/Leads';

const App: React.FC = () => {
  return (
    <ProjectProvider>
      <KnowledgeBaseProvider>
        <Routes>
          {/* Rota pública - Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Rotas protegidas - Requer autenticação */}
          <Route element={<ProtectedRoute><AppLayout><Outlet /></AppLayout></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/whatsapp" element={<WhatsApp />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/bases" element={<Bases />} />
            <Route path="/treinamentos" element={<Treinamentos />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/laboratorio" element={<Laboratorio />} />
          </Route>

          {/* Redireciona qualquer rota não encontrada para o dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </KnowledgeBaseProvider>
    </ProjectProvider>
  );
};

export default App;
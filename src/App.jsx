import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AtendenteDashboard from './pages/AtendenteDashboard';
import GestorDashboard from './pages/GestorDashboard';
import ClienteDashboard from './pages/ClienteDashboard';
import PratosPage from './pages/PratosPage';
import IngredientesPage from './pages/IngredientesPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />

        {/* Rota Protegida do Cliente */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />

        {/* Rotas Protegidas do Atendente */}
        <Route
          path="/atendente"
          element={
            <ProtectedRoute allowedRoles={['atendente', 'gestor_caixa']}>
              <AtendenteDashboard />
            </ProtectedRoute>
          }
        />

        {/* Rotas Protegidas do Gestor de Caixa */}
        <Route
          path="/gestor"
          element={
            <ProtectedRoute allowedRoles={['gestor_caixa']}>
              <GestorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pratos"
          element={
            <ProtectedRoute allowedRoles={['gestor_caixa']}>
              <PratosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ingredientes"
          element={
            <ProtectedRoute allowedRoles={['gestor_caixa']}>
              <IngredientesPage />
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento Padrão */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

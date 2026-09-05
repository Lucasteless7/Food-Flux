import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.1rem' }}>
          Carregando Food Flux...
        </div>
      </div>
    );
  }

  // 1. Verificar se existe sessão
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verificar se o usuário está ativo
  if (!user.ativo) {
    return <Navigate to="/login" state={{ error: 'Sua conta está desativada. Contate a administração.' }} replace />;
  }

  // 3. Verificar permissões por tipo de usuário (RBAC)
  if (allowedRoles && !allowedRoles.includes(user.tipo)) {
    if (user.tipo === 'gestor_caixa') {
      return <Navigate to="/gestor" replace />;
    } else {
      return <Navigate to="/atendente" replace />;
    }
  }

  return children;
}

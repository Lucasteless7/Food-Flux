import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar sessão salva no localStorage ao iniciar
  useEffect(() => {
    async function loadSession() {
      const saved = localStorage.getItem('foodflux_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          // Validar com o servidor se o usuário continua ativo
          const res = await authApi.getMe();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('foodflux_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('[AUTH SESSION EXPIRED OR INACTIVE]:', err.message);
          localStorage.removeItem('foodflux_user');
          setUser(null);
        }
      }
      setLoading(false);
    }

    loadSession();
  }, []);

  const login = async (email, senha, tipo) => {
    const data = await authApi.login({ email, senha, tipo });
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('foodflux_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodflux_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

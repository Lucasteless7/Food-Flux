import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import { UtensilsCrossed, Lock, Mail, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('atendente'); // 'atendente' ou 'gestor_caixa'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Se já estiver logado, redirecionar automaticamente
  useEffect(() => {
    if (user && user.ativo) {
      if (user.tipo === 'gestor_caixa') {
        navigate('/gestor', { replace: true });
      } else {
        navigate('/atendente', { replace: true });
      }
    }
  }, [user, navigate]);

  // Mensagem vinda de redirecionamento (ex: conta inativa)
  useEffect(() => {
    if (location.state && location.state.error) {
      setError(location.state.error);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (!senha) {
      setError('Por favor, informe sua senha.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, senha, tipo);
      
      const loggedUser = res.user;
      if (loggedUser.tipo === 'gestor_caixa') {
        navigate('/gestor');
      } else {
        navigate('/atendente');
      }
    } catch (err) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(circle at 50% 30%, rgba(249, 115, 22, 0.08) 0%, rgba(11, 14, 20, 1) 70%)',
      }}
    >
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #EA580C 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(249, 115, 22, 0.35)',
              marginBottom: '14px',
            }}
          >
            <UtensilsCrossed size={30} color="#FFF" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '4px' }}>
            FOOD <span style={{ color: 'var(--primary)' }}>FLUX</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Acesse sua conta para gerenciar o restaurante
          </p>
        </div>

        {/* Notificação de Erro */}
        <Notification message={error} type="error" onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          {/* Seletor de Tipo de Perfil */}
          <div className="input-group">
            <label className="input-label">Tipo de Acesso</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-pill ${tipo === 'atendente' ? 'active' : ''}`}
                onClick={() => setTipo('atendente')}
              >
                <UserCheck size={16} />
                Atendente
              </button>
              <button
                type="button"
                className={`role-pill ${tipo === 'gestor_caixa' ? 'active' : ''}`}
                onClick={() => setTipo('gestor_caixa')}
              >
                <ShieldCheck size={16} />
                Gestor de Caixa
              </button>
            </div>
          </div>

          {/* Campo Email */}
          <div className="input-group">
            <label className="input-label" htmlFor="email">E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-subtle)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="email"
                type="email"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="seu.email@foodflux.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="input-group">
            <label className="input-label" htmlFor="senha">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-subtle)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="senha"
                type="password"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Autenticando...' : (
              <>
                Entrar no Sistema
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Link para Cadastro */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Não tem conta?{' '}
          <Link
            to="/cadastro"
            style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
          >
            Cadastre-se
          </Link>
        </div>

        {/* Credenciais de teste de demonstração */}
        <div
          style={{
            marginTop: '24px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed var(--border-color)',
            fontSize: '0.78rem',
            color: 'var(--text-subtle)',
          }}
        >
          <div style={{ fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>
            💡 Contas de Demonstração Iniciais:
          </div>
          <div>• <strong>Gestor:</strong> gestor@foodflux.com | <strong>Senha:</strong> senha123</div>
          <div>• <strong>Atendente:</strong> atendente@foodflux.com | <strong>Senha:</strong> senha123</div>
        </div>

      </div>
    </div>
  );
}

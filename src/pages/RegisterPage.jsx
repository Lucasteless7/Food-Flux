import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import { UtensilsCrossed, Lock, Mail, User, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [tipo, setTipo] = useState('atendente'); // 'atendente' ou 'gestor_caixa'

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar nome
    if (!nome.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    // Validar email
    if (!email.trim()) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    // Validar tamanho mínimo da senha (mínimo 6 caracteres)
    if (senha.length < 6) {
      setError('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    // Validar confirmação de senha
    if (senha !== confirmSenha) {
      setError('As senhas informadas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      await register({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        confirmSenha,
        tipo,
      });

      setSuccess('Conta criada com sucesso! Redirecionando para a tela de login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Erro ao criar conta. Verifique os dados informados.');
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
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '36px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
              marginBottom: '12px',
            }}
          >
            <UtensilsCrossed size={30} color="#FFF" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '4px' }}>
            Criar Conta no <span style={{ color: 'var(--primary)' }}>Food Flux</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Preencha seus dados para cadastrar seu perfil
          </p>
        </div>

        {/* Notificações */}
        <Notification message={error} type="error" onClose={() => setError('')} />
        <Notification message={success} type="success" />

        <form onSubmit={handleSubmit}>
          {/* Seletor de Tipo de Usuário */}
          <div className="input-group">
            <label className="input-label">Perfil de Usuário</label>
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

          {/* Nome Completo */}
          <div className="input-group">
            <label className="input-label" htmlFor="nome">Nome Completo</label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                color="var(--text-subtle)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="nome"
                type="text"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="Ex: João da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          </div>

          {/* E-mail */}
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
                placeholder="seu.email@restaurante.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div className="input-group">
            <label className="input-label" htmlFor="senha">Senha (Mínimo 6 caracteres)</label>
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
                minLength={6}
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="input-group">
            <label className="input-label" htmlFor="confirmSenha">Confirmar Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-subtle)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="confirmSenha"
                type="password"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="••••••••"
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Botão Criar Conta */}
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? 'Criando Conta...' : (
              <>
                <CheckCircle2 size={18} />
                Criar Conta
              </>
            )}
          </button>
        </form>

        {/* Link para Login */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Já tem uma conta?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
          >
            Faça login
          </Link>
        </div>

      </div>
    </div>
  );
}

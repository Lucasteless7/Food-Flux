import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, LogOut, User, LayoutDashboard, Package, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isGestor = user.tipo === 'gestor_caixa';

  return (
    <nav
      style={{
        background: 'rgba(15, 20, 30, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to={isGestor ? '/gestor' : '/atendente'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'var(--text-main)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            <UtensilsCrossed size={22} color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
              FOOD <span style={{ color: 'var(--primary)' }}>FLUX</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em' }}>
              RESTAURANT MANAGEMENT
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isGestor ? (
            <>
              <Link
                to="/gestor"
                className={`btn-secondary ${location.pathname === '/gestor' ? 'active' : ''}`}
                style={{
                  background: location.pathname === '/gestor' ? 'rgba(249, 115, 22, 0.15)' : undefined,
                  borderColor: location.pathname === '/gestor' ? 'var(--primary)' : undefined,
                }}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link
                to="/pratos"
                className="btn-secondary"
                style={{
                  background: location.pathname === '/pratos' ? 'rgba(249, 115, 22, 0.15)' : undefined,
                  borderColor: location.pathname === '/pratos' ? 'var(--primary)' : undefined,
                }}
              >
                <ShoppingBag size={16} />
                Pratos
              </Link>
              <Link
                to="/ingredientes"
                className="btn-secondary"
                style={{
                  background: location.pathname === '/ingredientes' ? 'rgba(249, 115, 22, 0.15)' : undefined,
                  borderColor: location.pathname === '/ingredientes' ? 'var(--primary)' : undefined,
                }}
              >
                <Package size={16} />
                Estoque
              </Link>
            </>
          ) : (
            <Link
              to="/atendente"
              className="btn-secondary"
              style={{
                background: location.pathname === '/atendente' ? 'rgba(59, 130, 246, 0.15)' : undefined,
                borderColor: location.pathname === '/atendente' ? 'var(--secondary)' : undefined,
              }}
            >
              <ShoppingBag size={16} />
              Atendimento & Vendas
            </Link>
          )}
        </div>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', display: 'none', smDisplay: 'block' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{user.nome}</div>
            <span className={`badge ${isGestor ? 'badge-gestor' : 'badge-atendente'}`}>
              {isGestor ? 'Gestor de Caixa' : 'Atendente'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn-secondary"
            title="Sair do sistema"
            style={{ color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Notification from '../components/Notification';
import { clienteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Star, Calendar, CreditCard, DollarSign, CheckCircle2, MessageSquare, Utensils } from 'lucide-react';

export default function ClienteDashboard() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  // Estado local para controle das avaliações em edição { [key]: { nota, comentario, submitting } }
  const [ratingState, setRatingState] = useState({});

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const data = await clienteApi.getMeusPedidos();
      const list = data.pedidos || [];
      setPedidos(list);

      // Inicializar estado das avaliações existentes
      const initialRating = {};
      list.forEach((pedido) => {
        (pedido.itens || []).forEach((item) => {
          const itemKey = `${pedido.id}_${item.prato_id}`;
          if (item.avaliacao) {
            initialRating[itemKey] = {
              nota: item.avaliacao.nota,
              comentario: item.avaliacao.comentario || '',
              submitting: false,
              saved: true
            };
          } else {
            initialRating[itemKey] = {
              nota: 5,
              comentario: '',
              submitting: false,
              saved: false
            };
          }
        });
      });
      setRatingState(initialRating);

    } catch (err) {
      setNotification({ message: err.message || 'Erro ao carregar seu histórico de pedidos.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const handleRatingChange = (itemKey, field, value) => {
    setRatingState((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [field]: value
      }
    }));
  };

  const handleSubmeterAvaliacao = async (pedidoId, pratoId, pratoNome) => {
    const itemKey = `${pedidoId}_${pratoId}`;
    const itemRating = ratingState[itemKey];

    if (!itemRating || !itemRating.nota) {
      setNotification({ message: 'Por favor, escolha uma nota de 1 a 5 estrelas.', type: 'warning' });
      return;
    }

    try {
      setRatingState((prev) => ({
        ...prev,
        [itemKey]: { ...prev[itemKey], submitting: true }
      }));

      const res = await clienteApi.avaliarPrato({
        venda_id: pedidoId,
        prato_id: pratoId,
        nota: itemRating.nota,
        comentario: itemRating.comentario
      });

      setNotification({
        message: `Avaliação do prato "${pratoNome}" enviada com sucesso! ⭐`,
        type: 'success'
      });

      setRatingState((prev) => ({
        ...prev,
        [itemKey]: { ...prev[itemKey], submitting: false, saved: true }
      }));

      // Atualizar lista
      carregarPedidos();

    } catch (err) {
      setNotification({ message: err.message || 'Erro ao enviar avaliação.', type: 'error' });
      setRatingState((prev) => ({
        ...prev,
        [itemKey]: { ...prev[itemKey], submitting: false }
      }));
    }
  };

  // Cálculos de métricas do cliente
  const totalPedidos = pedidos.length;
  const totalGasto = pedidos.reduce((acc, p) => acc + parseFloat(p.valor_total || 0), 0);
  
  let pratosAvaliadosCount = 0;
  pedidos.forEach((p) => {
    (p.itens || []).forEach((i) => {
      if (i.avaliacao) pratosAvaliadosCount++;
    });
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        
        {/* Banner de Boas-Vindas */}
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '28px',
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <Star size={16} fill="var(--primary)" /> Perfil do Cliente
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '4px' }}>
              Olá, {user?.nome || 'Cliente'}! 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Veja seus pedidos recentes no Food Flux e avalie os pratos para nos ajudar a melhorar.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>PEDIDOS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFF' }}>{totalPedidos}</div>
            </div>
            <div style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL GASTO</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>R$ {totalGasto.toFixed(2)}</div>
            </div>
            <div style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>AVALIAÇÕES</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#F59E0B' }}>{pratosAvaliadosCount} ⭐</div>
            </div>
          </div>
        </div>

        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info' })}
        />

        {/* Título Seção Histórico */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="var(--primary)" />
            Histórico de Pedidos
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            E-mail cadastrado: <strong>{user?.email}</strong>
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Carregando seu histórico de pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div
            className="glass-card"
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: 'var(--text-muted)',
              borderRadius: '16px'
            }}
          >
            <Utensils size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
              Nenhum pedido encontrado ainda
            </h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto', color: 'var(--text-subtle)' }}>
              Quando você realizar um pedido no restaurante, peça ao atendente para informar seu e-mail (<strong>{user?.email}</strong>) no fechamento para acompanhar aqui.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)'
                }}
              >
                {/* Cabeçalho do Pedido */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingBottom: '16px',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(249, 115, 22, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)'
                      }}
                    >
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>
                        Pedido #{pedido.id.substring(0, 8)}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Calendar size={13} />
                        {new Date(pedido.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        {pedido.atendente_nome && ` • Atendente: ${pedido.atendente_nome}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '0.78rem' }}>
                      {pedido.status}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      {pedido.forma_pagamento}
                    </span>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                      R$ {parseFloat(pedido.valor_total).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Lista de Pratos no Pedido */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Pratos deste Pedido:
                  </div>

                  {(pedido.itens || []).map((item) => {
                    const itemKey = `${pedido.id}_${item.prato_id}`;
                    const currentRating = ratingState[itemKey] || { nota: 5, comentario: '', submitting: false, saved: false };

                    return (
                      <div
                        key={itemKey}
                        style={{
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {item.imagem_url && (
                              <img
                                src={item.imagem_url}
                                alt={item.prato_nome}
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <div>
                              <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>
                                {item.quantidade}x {item.prato_nome}
                              </span>
                              {item.descricao && (
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                                  {item.descricao}
                                </p>
                              )}
                            </div>
                          </div>

                          <div style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            R$ {parseFloat(item.valor_total).toFixed(2)}
                          </div>
                        </div>

                        {/* Bloco de Avaliação por Estrelas (1 a 5 ⭐) */}
                        <div
                          style={{
                            marginTop: '4px',
                            padding: '12px 14px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            borderRadius: '10px',
                            border: '1px dashed var(--border-color)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Star size={15} fill="#F59E0B" />
                              Avalie este prato (1 a 5 estrelas):
                            </span>

                            {currentRating.saved && (
                              <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={14} /> Avaliação registrada
                              </span>
                            )}
                          </div>

                          {/* Estrelas Selecionáveis (1 a 5) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            {[1, 2, 3, 4, 5].map((starNum) => (
                              <button
                                key={starNum}
                                type="button"
                                onClick={() => handleRatingChange(itemKey, 'nota', starNum)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  transition: 'transform 0.15s ease'
                                }}
                                title={`${starNum} Estrela${starNum > 1 ? 's' : ''}`}
                              >
                                <Star
                                  size={24}
                                  color={starNum <= currentRating.nota ? '#F59E0B' : 'var(--text-subtle)'}
                                  fill={starNum <= currentRating.nota ? '#F59E0B' : 'none'}
                                />
                              </button>
                            ))}
                            <span style={{ marginLeft: '8px', fontWeight: '800', color: '#F59E0B', fontSize: '0.9rem' }}>
                              {currentRating.nota} / 5
                            </span>
                          </div>

                          {/* Campo de Comentário Opcional */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="input-field"
                              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                              placeholder="Escreva um comentário sobre o sabor, porção... (opcional)"
                              value={currentRating.comentario}
                              onChange={(e) => handleRatingChange(itemKey, 'comentario', e.target.value)}
                            />

                            <button
                              type="button"
                              onClick={() => handleSubmeterAvaliacao(pedido.id, item.prato_id, item.prato_nome)}
                              className="btn-primary"
                              disabled={currentRating.submitting}
                              style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                            >
                              {currentRating.submitting ? 'Enviando...' : (currentRating.saved ? 'Atualizar Avaliação' : 'Enviar Avaliação')}
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

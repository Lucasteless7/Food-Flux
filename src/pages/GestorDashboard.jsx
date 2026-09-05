import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Notification from '../components/Notification';
import { dashboardApi } from '../services/api';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Ticket,
  AlertTriangle,
  Calendar,
  Users,
  Star,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export default function GestorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getGestorDashboard();
      setData(res);
    } catch (err) {
      setNotification({ message: 'Erro ao carregar métricas administrativas.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Banner do Gestor */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Painel do Gestor de Caixa</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Visão geral financeira, fluxo de estoque e vendas em tempo real
            </p>
          </div>
          <span className="badge badge-gestor" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Acesso Gestão & Controle
          </span>
        </div>

        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info' })}
        />

        {loading || !data ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Carregando inteligência financeira do Food Flux...
          </div>
        ) : (
          <>
            {/* 1. MÉTRICAS FINANCEIRAS E DE DESEMPENHO */}
            <div className="dashboard-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#F97316' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="metric-title">Faturamento Hoje</div>
                  <div className="metric-value">R$ {data.resumo.faturamento_hoje.toFixed(2)}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {data.resumo.vendas_hoje} vendas efetuadas
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div className="metric-title">Faturamento no Mês</div>
                  <div className="metric-value">R$ {data.resumo.faturamento_mes.toFixed(2)}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {data.resumo.vendas_mes} vendas este mês
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div className="metric-title">Pratos Vendidos Hoje</div>
                  <div className="metric-value">{data.resumo.pratos_hoje} un.</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {data.resumo.pratos_mes} unidades no mês
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                  <Ticket size={24} />
                </div>
                <div>
                  <div className="metric-title">Ticket Médio</div>
                  <div className="metric-value">R$ {data.resumo.ticket_medio.toFixed(2)}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Média por atendimento
                  </div>
                </div>
              </div>
            </div>

            {/* 2. GRID PRINCIPAL COM TABELAS E ALERTAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
              
              {/* Esquerda: Pratos Mais Vendidos + Vendas por Atendente */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Pratos mais vendidos */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} color="var(--primary)" />
                    Pratos Mais Vendidos
                  </h3>

                  {data.pratosMaisVendidos.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhuma venda registrada ainda.</p>
                  ) : (
                    <div className="custom-table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Prato</th>
                            <th>Qtd Vendida</th>
                            <th>Faturamento Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.pratosMaisVendidos.map((item, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: '700' }}>{item.prato_nome}</td>
                              <td><span className="badge badge-atendente">{item.total_qtd} unidades</span></td>
                              <td style={{ color: 'var(--primary)', fontWeight: '700' }}>
                                R$ {parseFloat(item.total_faturado).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Desempenho de Vendas por Atendente */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} color="var(--secondary)" />
                    Vendas por Atendente
                  </h3>

                  {data.vendasPorAtendente.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum atendente cadastrado.</p>
                  ) : (
                    <div className="custom-table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Atendente</th>
                            <th>Total Vendas</th>
                            <th>Total Faturado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.vendasPorAtendente.map((u, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '700' }}>{u.atendente_nome}</td>
                              <td>{u.total_vendas} vendas</td>
                              <td style={{ color: 'var(--primary)', fontWeight: '700' }}>
                                R$ {parseFloat(u.total_faturado).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

              {/* Direita: Alertas de Estoque Baixo e Vencimentos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Ingredientes Estoque Baixo */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FCA5A5' }}>
                    <AlertTriangle size={18} color="var(--danger)" />
                    Estoque Baixo
                  </h3>

                  {data.estoqueBaixo.length === 0 ? (
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#34D399', fontSize: '0.85rem' }}>
                      ✓ Todos os ingredientes estão acima do nível mínimo de estoque.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {data.estoqueBaixo.map((ing) => (
                        <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{ing.nome}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Mínimo: {ing.estoque_minimo} {ing.unidade_medida}
                            </div>
                          </div>
                          <span className="badge badge-danger">
                            {ing.quantidade_estoque} {ing.unidade_medida}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Próximos do Vencimento */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#FBBF24' }}>
                    <AlertTriangle size={18} color="var(--warning)" />
                    Próximos do Vencimento
                  </h3>

                  {data.lotesVencimento.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum lote vence nos próximos 15 dias.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {data.lotesVencimento.map((lote) => (
                        <div key={lote.id} style={{ padding: '10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{lote.ingrediente}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span>Validade: {new Date(lote.data_validade).toLocaleDateString('pt-BR')}</span>
                            <span style={{ color: 'var(--warning)', fontWeight: '700' }}>
                              {lote.dias_para_vencer <= 0 ? 'Venceu hoje!' : `${lote.dias_para_vencer} dias`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resumo de Avaliações */}
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <Star size={32} color="#FBBF24" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                    {data.avaliacoesResumo ? data.avaliacoesResumo.media_geral : '0.0'} / 5.0
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Média de Satisfação dos Clientes ({data.avaliacoesResumo ? data.avaliacoesResumo.total_avaliacoes : 0} avaliações)
                  </div>
                </div>

              </div>

            </div>

            {/* 3. ÚLTIMAS VENDAS DO RESTAURANTE */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="var(--primary)" />
                Histórico das Últimas Vendas do Restaurante
              </h3>

              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Atendente</th>
                      <th>Forma de Pagamento</th>
                      <th>Valor Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ultimasVendas.map((v) => (
                      <tr key={v.id}>
                        <td>{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                        <td style={{ fontWeight: '600' }}>{v.atendente_nome}</td>
                        <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700' }}>{v.forma_pagamento}</td>
                        <td style={{ fontWeight: '800', color: 'var(--primary)' }}>R$ {parseFloat(v.valor_total).toFixed(2)}</td>
                        <td><span className="badge badge-success">{v.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </main>
    </div>
  );
}

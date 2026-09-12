import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Notification from '../components/Notification';
import { dashboardApi, salesApi } from '../services/api';
import { ShoppingCart, Plus, Minus, Check, Utensils, History, CreditCard, DollarSign, QrCode, Layers } from 'lucide-react';

export default function AtendenteDashboard() {
  const [pratos, setPratos] = useState([]);
  const [minhasVendas, setMinhasVendas] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [clienteEmail, setClienteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Armazena a variante de tamanho selecionada no card de cada prato do cardápio
  const [varianteSelecionada, setVarianteSelecionada] = useState({});

  const [notification, setNotification] = useState({ message: '', type: 'info' });
  const [pratoIngredientesModal, setPratoIngredientesModal] = useState(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getAtendenteDashboard();
      const pratosList = data.pratos || [];
      setPratos(pratosList);
      setMinhasVendas(data.minhasVendas || []);

      // Inicializar seleção das variantes padrão por grupo
      const inicialVariantes = {};
      pratosList.forEach((p) => {
        if (p.nome.endsWith(' padrão') || p.nome.endsWith(' 8 peças')) {
          const baseName = p.nome.replace(' padrão', '').replace(' 8 peças', '');
          inicialVariantes[baseName] = p;
        }
      });
      setVarianteSelecionada((prev) => ({ ...inicialVariantes, ...prev }));

    } catch (err) {
      setNotification({ message: 'Erro ao carregar cardápio e vendas.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Agrupar pratos por variantes (Padrão vs Grande) e pratos individuais
  const agruparPratos = (pratosList) => {
    const grupos = {};
    const individuais = [];

    pratosList.forEach((p) => {
      let baseNome = p.nome;
      let varianteLabel = null;

      if (p.nome.endsWith(' padrão')) {
        baseNome = p.nome.replace(' padrão', '');
        varianteLabel = 'Padrão';
      } else if (p.nome.endsWith(' grande')) {
        baseNome = p.nome.replace(' grande', '');
        varianteLabel = 'Grande';
      } else if (p.nome.endsWith(' 8 peças')) {
        baseNome = p.nome.replace(' 8 peças', '');
        varianteLabel = '8 Peças';
      } else if (p.nome.endsWith(' 16 peças')) {
        baseNome = p.nome.replace(' 16 peças', '');
        varianteLabel = '16 Peças';
      }

      if (varianteLabel) {
        if (!grupos[baseNome]) {
          grupos[baseNome] = {
            baseNome,
            descricao: p.descricao,
            variantes: [],
          };
        }
        grupos[baseNome].variantes.push({
          ...p,
          label: varianteLabel,
        });
      } else {
        individuais.push(p);
      }
    });

    return { grupos: Object.values(grupos), individuais };
  };

  const { grupos, individuais } = agruparPratos(pratos);

  const adicionarAoCarrinho = (pratoItem, baseNome = null, label = null) => {
    const pratoId = pratoItem.id;
    const existe = carrinho.find((item) => item.prato_id === pratoId);

    if (existe) {
      setCarrinho(
        carrinho.map((item) =>
          item.prato_id === pratoId ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        {
          prato_id: pratoId,
          nome: pratoItem.nome,
          baseNome: baseNome || pratoItem.nome,
          tamanhoLabel: label,
          valor_unitario: parseFloat(pratoItem.valor),
          quantidade: 1,
          objetoPratoOriginal: pratoItem
        },
      ]);
    }
  };

  const trocarTamanhoNoCarrinho = (itemCarrinho, novaVariante) => {
    setCarrinho(
      carrinho.map((item) => {
        if (item.prato_id === itemCarrinho.prato_id) {
          return {
            ...item,
            prato_id: novaVariante.id,
            nome: novaVariante.nome,
            tamanhoLabel: novaVariante.label,
            valor_unitario: parseFloat(novaVariante.valor),
            objetoPratoOriginal: novaVariante
          };
        }
        return item;
      })
    );
  };

  const alterarQuantidade = (pratoId, delta) => {
    setCarrinho(
      carrinho
        .map((item) => {
          if (item.prato_id === pratoId) {
            const novaQtd = item.quantidade + delta;
            return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const valorTotalCarrinho = carrinho.reduce(
    (acc, item) => acc + item.quantidade * item.valor_unitario,
    0
  );

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      setNotification({ message: 'Adicione pelo menos um prato ao pedido.', type: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await salesApi.createSale({
        forma_pagamento: formaPagamento,
        cliente_email: clienteEmail,
        itens: carrinho.map((i) => ({
          prato_id: i.prato_id,
          quantidade: i.quantidade,
          valor_unitario: i.valor_unitario,
        })),
      });

      setNotification({ message: res.message || 'Venda registrada com sucesso! Estoque atualizado.', type: 'success' });
      setCarrinho([]);
      setClienteEmail('');
      carregarDados();
    } catch (err) {
      setNotification({ message: err.message || 'Erro ao registrar venda.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {/* Banner Atendimento */}
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
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Painel do Atendente</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Terminal de pedidos e finalização de vendas com escolha de porções (Padrão / Grande)
            </p>
          </div>
          <span className="badge badge-atendente" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Terminal de Vendas Ativo
          </span>
        </div>

        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info' })}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Carregando pratos e opções de porções do Food Flux...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            
            {/* ESQUERDA: Cardápio de Pratos (Grupos com Seleção de Tamanhos Padrão/Grande) */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Utensils size={20} color="var(--primary)" />
                Cardápio do Restaurante
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                
                {/* 1. PRATOS COM OPÇÕES DE TAMANHO (Padrão vs Grande / 8 vs 16 Peças) */}
                {grupos.map((grupo) => {
                  const varianteAtual = varianteSelecionada[grupo.baseNome] || grupo.variantes[0];
                  
                  return (
                    <div key={grupo.baseNome} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                      <div>
                        {varianteAtual.imagem_url && (
                          <img
                            src={varianteAtual.imagem_url}
                            alt={grupo.baseNome}
                            style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{grupo.baseNome}</h3>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                            R$ {parseFloat(varianteAtual.valor).toFixed(2)}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          {grupo.descricao || 'Prato especial de frutos do mar.'}
                        </p>

                        {/* SELETOR DE TAMANHO / PORÇÃO (PADRÃO OU GRANDE) */}
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                            Escolha a porção:
                          </label>
                          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            {grupo.variantes.map((v) => {
                              const isSelected = varianteAtual.id === v.id;
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => setVarianteSelecionada({ ...varianteSelecionada, [grupo.baseNome]: v })}
                                  style={{
                                    flex: 1,
                                    padding: '8px 4px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: isSelected ? 'linear-gradient(135deg, var(--primary) 0%, #EA580C 100%)' : 'transparent',
                                    color: isSelected ? '#FFF' : 'var(--text-muted)',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {v.label} (R$ {parseFloat(v.valor).toFixed(0)})
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Botão de ver ingredientes */}
                        {varianteAtual.ingredientes && varianteAtual.ingredientes.length > 0 && (
                          <button
                            onClick={() => setPratoIngredientesModal(varianteAtual)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--secondary)',
                              fontSize: '0.78rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              padding: 0,
                              marginBottom: '14px',
                              textDecoration: 'underline',
                            }}
                          >
                            Ver {varianteAtual.ingredientes.length} ingredientes
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => adicionarAoCarrinho(varianteAtual, grupo.baseNome, varianteAtual.label)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
                      >
                        <Plus size={16} />
                        Adicionar ({varianteAtual.label})
                      </button>
                    </div>
                  );
                })}

                {/* 2. PRATOS INDIVIDUAIS (SEM VARIANTES DE TAMANHO) */}
                {individuais.map((prato) => (
                  <div key={prato.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {prato.imagem_url && (
                        <img
                          src={prato.imagem_url}
                          alt={prato.nome}
                          style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{prato.nome}</h3>
                        <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                          R$ {parseFloat(prato.valor).toFixed(2)}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        {prato.descricao || 'Sem descrição.'}
                      </p>

                      {prato.ingredientes && prato.ingredientes.length > 0 && (
                        <button
                          onClick={() => setPratoIngredientesModal(prato)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--secondary)',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: 0,
                            marginBottom: '14px',
                            textDecoration: 'underline',
                          }}
                        >
                          Ver {prato.ingredientes.length} ingredientes
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => adicionarAoCarrinho(prato)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
                    >
                      <Plus size={16} />
                      Adicionar ao Pedido
                    </button>
                  </div>
                ))}

              </div>

              {/* Minhas Últimas Vendas */}
              <div style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} color="var(--secondary)" />
                  Minhas Últimas Vendas Registradas
                </h2>

                <div className="glass-card" style={{ padding: '16px' }}>
                  {minhasVendas.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                      Nenhuma venda registrada por você hoje ainda.
                    </p>
                  ) : (
                    <div className="custom-table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Data/Hora</th>
                            <th>Forma Pagamento</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {minhasVendas.map((v) => (
                            <tr key={v.id}>
                              <td>{new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                              <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700' }}>{v.forma_pagamento}</td>
                              <td style={{ fontWeight: '700', color: 'var(--primary)' }}>R$ {parseFloat(v.valor_total).toFixed(2)}</td>
                              <td><span className="badge badge-success">{v.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DIREITA: DASHBOARD DE FINALIZAÇÃO E CHECKOUT (PEDIDO ATUAL COM SELEÇÃO DE PORÇÃO) */}
            <div>
              <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={20} color="var(--primary)" />
                  Dashboard de Finalização
                </h2>

                {carrinho.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-subtle)' }}>
                    <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <p style={{ fontSize: '0.9rem' }}>Seu carrinho está vazio.</p>
                    <p style={{ fontSize: '0.78rem' }}>Selecione o prato e o tamanho para incluir no pedido.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
                      {carrinho.map((item) => {
                        // Encontrar grupo correspondente se tiver variantes
                        const grupoRelacionado = grupos.find(g => g.baseNome === item.baseNome);

                        return (
                          <div key={item.prato_id} style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <div>
                                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{item.baseNome || item.nome}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '700' }}>
                                  R$ {item.valor_unitario.toFixed(2)} cada
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button onClick={() => alterarQuantidade(item.prato_id, -1)} style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: '#FFF', cursor: 'pointer' }}>
                                  -
                                </button>
                                <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center' }}>{item.quantidade}</span>
                                <button onClick={() => alterarQuantidade(item.prato_id, 1)} style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: '#FFF', cursor: 'pointer' }}>
                                  +
                                </button>
                              </div>
                            </div>

                            {/* SELETOR DE SELEÇÃO/ALTERAÇÃO DE TAMANHO DENTRO DO PAINEL DE FINALIZAÇÃO */}
                            {grupoRelacionado && grupoRelacionado.variantes.length > 1 && (
                              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Layers size={12} /> Porção:
                                </span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {grupoRelacionado.variantes.map((v) => (
                                    <button
                                      key={v.id}
                                      type="button"
                                      onClick={() => trocarTamanhoNoCarrinho(item, v)}
                                      style={{
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid ' + (v.id === item.prato_id ? 'var(--primary)' : 'var(--border-color)'),
                                        background: v.id === item.prato_id ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                                        color: v.id === item.prato_id ? '#FB923C' : 'var(--text-muted)',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {v.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                    {/* E-mail do Cliente (Opcional) */}
                    <div className="input-group">
                      <label className="input-label" htmlFor="clienteEmailInput">
                        E-mail do Cliente (Opcional - Histórico & Avaliação)
                      </label>
                      <input
                        id="clienteEmailInput"
                        type="email"
                        className="input-field"
                        placeholder="cliente@email.com"
                        value={clienteEmail}
                        onChange={(e) => setClienteEmail(e.target.value)}
                      />
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="input-group">
                      <label className="input-label">Forma de Pagamento</label>
                      <select
                        className="input-field"
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                      >
                        <option value="pix">PIX</option>
                        <option value="cartao_credito">Cartão de Crédito</option>
                        <option value="cartao_debito">Cartão de Débito</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>

                    {/* Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border-color)', marginBottom: '16px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Valor Total:</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                        R$ {valorTotalCarrinho.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={finalizarVenda}
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Finalizando Venda...' : 'Finalizar Pedido e Baixar Estoque'}
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Modal de Ingredientes do Prato */}
        {pratoIngredientesModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px' }}>
                Ingredientes — {pratoIngredientesModal.nome}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Quantidade de cada ingrediente por unidade do prato:
              </p>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
                {pratoIngredientesModal.ingredientes.map((ing, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <span>{ing.ingrediente}</span>
                    <strong style={{ color: 'var(--primary)' }}>{ing.quantidade} {ing.unidade}</strong>
                  </li>
                ))}
              </ul>

              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setPratoIngredientesModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

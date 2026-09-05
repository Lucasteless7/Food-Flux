import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Notification from '../components/Notification';
import { pratosApi } from '../services/api';
import { Plus, Utensils, DollarSign, PieChart, CheckCircle2 } from 'lucide-react';

export default function PratosPage() {
  const [pratos, setPratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  // Form para novo prato
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const carregarPratos = async () => {
    try {
      setLoading(true);
      const res = await pratosApi.getPratos();
      setPratos(res.pratos || []);
    } catch (err) {
      setNotification({ message: 'Erro ao carregar pratos.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPratos();
  }, []);

  const handleCreatePrato = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setNotification({ message: 'Informe o nome do prato.', type: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await pratosApi.createPrato({
        nome: nome.trim(),
        descricao: descricao.trim(),
        valor: parseFloat(valor) || 0,
      });

      setNotification({ message: res.message || 'Prato cadastrado! Se houver receita padrão, os ingredientes foram aplicados.', type: 'success' });
      setModalOpen(false);
      setNome('');
      setDescricao('');
      setValor('');
      carregarPratos();
    } catch (err) {
      setNotification({ message: err.message || 'Erro ao cadastrar prato.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Gestão de Pratos</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Cadastre novos pratos e acompanhe custos, margens e receitas
            </p>
          </div>

          <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ width: 'auto' }}>
            <Plus size={18} />
            Novo Prato
          </button>
        </div>

        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info' })}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Carregando pratos do Food Flux...
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Nome do Prato</th>
                    <th>Valor de Venda</th>
                    <th>Custo Estimado</th>
                    <th>Lucro Estimado</th>
                    <th>Margem (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {pratos.map((p) => (
                    <tr key={p.prato_id}>
                      <td style={{ fontWeight: '700' }}>{p.prato_nome}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: '800' }}>
                        R$ {parseFloat(p.valor_venda).toFixed(2)}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        R$ {parseFloat(p.custo_estimado).toFixed(2)}
                      </td>
                      <td style={{ color: '#34D399', fontWeight: '700' }}>
                        R$ {parseFloat(p.lucro_estimado).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {p.margem_percentual}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Cadastro de Prato */}
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>Cadastrar Novo Prato</h2>
              
              <form onSubmit={handleCreatePrato}>
                <div className="input-group">
                  <label className="input-label">Nome do Prato</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: X-Burger"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    💡 Dica: Se existir uma receita padrão com este nome (ex: X-Burger, X-Salada), os ingredientes serão associados automaticamente!
                  </span>
                </div>

                <div className="input-group">
                  <label className="input-label">Descrição</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Descrição dos ingredientes ou modo de preparo"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Valor de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="25.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
                    {submitting ? 'Salvando...' : 'Salvar Prato'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

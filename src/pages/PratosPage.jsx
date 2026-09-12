import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Notification from '../components/Notification';
import { pratosApi } from '../services/api';
import { Plus, Utensils, Edit, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export default function PratosPage() {
  const [pratos, setPratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  // Form para novo prato ou edição
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editPrato, setEditPrato] = useState(null); // Objeto do prato em edição se houver
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

  const abrirModalNovo = () => {
    setEditPrato(null);
    setNome('');
    setDescricao('');
    setValor('');
    setImagemUrl('');
    setModalOpen(true);
  };

  const abrirModalEditar = (p) => {
    setEditPrato(p);
    setNome(p.prato_nome || '');
    setDescricao(p.descricao || '');
    setValor(p.valor_venda || p.valor || '');
    setImagemUrl(p.imagem_url || '');
    setModalOpen(true);
  };

  const handleSubmitPrato = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setNotification({ message: 'Informe o nome do prato.', type: 'warning' });
      return;
    }

    try {
      setSubmitting(true);

      if (editPrato) {
        // Atualizar Prato Existente
        const res = await pratosApi.updatePrato(editPrato.prato_id || editPrato.id, {
          nome: nome.trim(),
          descricao: descricao.trim(),
          valor: parseFloat(valor) || 0,
          imagem_url: imagemUrl.trim() || null,
        });
        setNotification({ message: res.message || 'Prato e imagem atualizados com sucesso! 🖼️', type: 'success' });
      } else {
        // Criar Novo Prato
        const res = await pratosApi.createPrato({
          nome: nome.trim(),
          descricao: descricao.trim(),
          valor: parseFloat(valor) || 0,
          imagem_url: imagemUrl.trim() || null,
        });
        setNotification({ message: res.message || 'Prato cadastrado com sucesso!', type: 'success' });
      }

      setModalOpen(false);
      setNome('');
      setDescricao('');
      setValor('');
      setImagemUrl('');
      carregarPratos();
    } catch (err) {
      setNotification({ message: err.message || 'Erro ao salvar prato.', type: 'error' });
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
              Cadastre novos pratos, adicione fotos/links de imagens e gerencie custos e receitas
            </p>
          </div>

          <button onClick={abrirModalNovo} className="btn-primary" style={{ width: 'auto' }}>
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
                    <th>Imagem</th>
                    <th>Nome do Prato</th>
                    <th>Valor de Venda</th>
                    <th>Custo Estimado</th>
                    <th>Lucro Estimado</th>
                    <th>Margem (%)</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pratos.map((p) => (
                    <tr key={p.prato_id}>
                      <td>
                        {p.imagem_url ? (
                          <img
                            src={p.imagem_url}
                            alt={p.prato_nome}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid var(--border-color)'
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px dashed var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-subtle)'
                            }}
                          >
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: '700' }}>
                        <div>{p.prato_nome}</div>
                        {p.descricao && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 'normal' }}>
                            {p.descricao}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--primary)', fontWeight: '800' }}>
                        R$ {parseFloat(p.valor_venda).toFixed(2)}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        R$ {parseFloat(p.custo_producao || p.custo_estimado || 0).toFixed(2)}
                      </td>
                      <td style={{ color: '#34D399', fontWeight: '700' }}>
                        R$ {parseFloat(p.lucro_bruto || p.lucro_estimado || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {p.margem_lucro_percentual || p.margem_percentual || 0}%
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => abrirModalEditar(p)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <Edit size={14} />
                          Editar / Foto
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Cadastro/Edição de Prato */}
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div className="glass-card animate-fade-in" style={{ maxWidth: '460px', width: '100%', padding: '28px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>
                {editPrato ? 'Editar Prato e Imagem' : 'Cadastrar Novo Prato'}
              </h2>
              
              <form onSubmit={handleSubmitPrato}>
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

                {/* Campo da URL/Caminho da Imagem do Prato */}
                <div className="input-group">
                  <label className="input-label">URL ou Caminho da Imagem do Prato</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="https://exemplo.com/imagem-prato.jpg"
                    value={imagemUrl}
                    onChange={(e) => setImagemUrl(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    💡 Cole o link da imagem (ou caminho da imagem enviada).
                  </span>
                </div>

                {/* Preview de imagem se preenchido */}
                {imagemUrl && (
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Pré-visualização:
                    </span>
                    <img
                      src={imagemUrl}
                      alt="Preview do Prato"
                      style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

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

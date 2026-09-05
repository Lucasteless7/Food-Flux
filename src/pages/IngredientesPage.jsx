import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Notification from '../components/Notification';
import { ingredientesApi } from '../services/api';
import { Package, AlertTriangle, Scale, DollarSign } from 'lucide-react';

export default function IngredientesPage() {
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  const carregarIngredientes = async () => {
    try {
      setLoading(true);
      const res = await ingredientesApi.getIngredientes();
      setIngredientes(res.ingredientes || []);
    } catch (err) {
      setNotification({ message: 'Erro ao carregar ingredientes.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarIngredientes();
  }, []);

  const formatarQtd = (valor, unidade) => {
    const num = parseFloat(valor);
    if (isNaN(num)) return `0 ${unidade}`;
    if (Number.isInteger(num)) {
      return `${num} ${unidade}`;
    }
    return `${num.toFixed(2)} ${unidade}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Controle de Estoque de Ingredientes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Acompanhe o estoque registrado em gramas (abaixo de 1kg) ou quilos (1kg ou mais)
          </p>
        </div>

        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: 'info' })}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            Carregando ingredientes...
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ingrediente</th>
                    <th>Unidade</th>
                    <th>Estoque Atual</th>
                    <th>Estoque Mínimo</th>
                    <th>Custo Unitário</th>
                    <th>Status Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredientes.map((ing) => {
                    const baixo = parseFloat(ing.quantidade_estoque) <= parseFloat(ing.estoque_minimo);
                    return (
                      <tr key={ing.id}>
                        <td style={{ fontWeight: '700' }}>{ing.nome}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          <span className="badge badge-atendente" style={{ textTransform: 'none' }}>
                            {ing.unidade_medida}
                          </span>
                        </td>
                        <td style={{ fontWeight: '800', color: baixo ? '#FCA5A5' : 'var(--text-main)' }}>
                          {formatarQtd(ing.quantidade_estoque, ing.unidade_medida)}
                        </td>
                        <td>{formatarQtd(ing.estoque_minimo, ing.unidade_medida)}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: '700' }}>
                          R$ {parseFloat(ing.custo_unitario).toFixed(2)} / {ing.unidade_medida}
                        </td>
                        <td>
                          {baixo ? (
                            <span className="badge badge-danger">
                              <AlertTriangle size={12} /> Estoque Baixo
                            </span>
                          ) : (
                            <span className="badge badge-success">Em Estoque</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

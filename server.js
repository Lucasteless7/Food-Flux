import express from 'express';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config();

const app = express();

// Middleware de CORS e JSON
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-user-id');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Log de requisições recebidas
app.use((req, res, next) => {
  console.log(`[SERVER LOG ${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

const dbUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL não foi configurada no .env');
}

const sql = neon(dbUrl);

// --- ROTAS DE AUTENTICAÇÃO ---

// 1. Cadastro de Usuário (Atendente ou Gestor de Caixa)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha, confirmSenha, tipo } = req.body;

    if (!nome || !email || !senha || !tipo) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Por favor, informe um e-mail válido.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve possuir no mínimo 6 caracteres.' });
    }

    if (confirmSenha && senha !== confirmSenha) {
      return res.status(400).json({ error: 'As senhas informadas não coincidem.' });
    }

    if (!['atendente', 'gestor_caixa'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido.' });
    }

    // Verificar se o e-mail já existe
    const existing = await sql`SELECT id FROM usuarios WHERE email = ${cleanEmail}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe uma conta cadastrada com este e-mail.' });
    }

    // Inserir usuário com hash pgcrypto
    const result = await sql`
      INSERT INTO usuarios (nome, email, senha, tipo, ativo)
      VALUES (${nome.trim()}, ${cleanEmail}, crypt(${senha}, gen_salt('bf')), ${tipo}, true)
      RETURNING id, nome, email, tipo, ativo, created_at;
    `;

    const user = result[0];
    return res.status(201).json({
      message: 'Conta criada com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        ativo: user.ativo,
        created_at: user.created_at
      }
    });

  } catch (err) {
    console.error('[AUTH REGISTER ERROR]:', err);
    if (err.message && err.message.includes('23505')) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }
    return res.status(500).json({ error: 'Erro interno ao realizar cadastro: ' + err.message });
  }
});

// 2. Login de Usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha, tipo } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Informe o e-mail e a senha.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1º Verificar se existe o usuário e se a senha confere via crypt()
    const result = await sql`
      SELECT id, nome, email, tipo, ativo, created_at
      FROM usuarios
      WHERE email = ${cleanEmail} AND senha = crypt(${senha}, senha);
    `;

    if (result.length === 0) {
      const userCheck = await sql`SELECT id, ativo, tipo FROM usuarios WHERE email = ${cleanEmail}`;
      if (userCheck.length > 0) {
        if (!userCheck[0].ativo) {
          return res.status(403).json({ error: 'Sua conta está desativada. Entre em contato com o gestor.' });
        }
        return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      }
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const user = result[0];

    if (!user.ativo) {
      return res.status(403).json({ error: 'Sua conta está desativada. Entre em contato com o gestor.' });
    }

    if (tipo && user.tipo !== tipo) {
      return res.status(403).json({ 
        error: `Este e-mail está cadastrado como ${user.tipo === 'gestor_caixa' ? 'Gestor de Caixa' : 'Atendente'}. Por favor, selecione o perfil correto.` 
      });
    }

    return res.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        ativo: user.ativo,
        created_at: user.created_at
      }
    });

  } catch (err) {
    console.error('[AUTH LOGIN ERROR]:', err);
    return res.status(500).json({ error: 'Erro no servidor de autenticação: ' + err.message });
  }
});

// 3. Verificação de Sessão (/api/auth/me)
app.get('/api/auth/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const result = await sql`
      SELECT id, nome, email, tipo, ativo, created_at
      FROM usuarios
      WHERE id = ${userId};
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const user = result[0];
    if (!user.ativo) {
      return res.status(403).json({ error: 'Conta desativada.' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('[AUTH ME ERROR]:', err);
    return res.status(500).json({ error: 'Erro ao verificar sessão.' });
  }
});

// --- ROTAS DO DASHBOARD DO GESTOR DE CAIXA ---

app.get('/api/dashboard/gestor', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (userId) {
      const userCheck = await sql`SELECT tipo, ativo FROM usuarios WHERE id = ${userId}`;
      if (userCheck.length === 0 || !userCheck[0].ativo) {
        return res.status(403).json({ error: 'Acesso negado.' });
      }
      if (userCheck[0].tipo !== 'gestor_caixa') {
        return res.status(403).json({ error: 'Acesso restrito ao Gestor de Caixa.' });
      }
    }

    const resumoVendas = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN valor_total ELSE 0 END), 0) AS faturamento_hoje,
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN valor_total ELSE 0 END), 0) AS faturamento_mes,
        COALESCE(COUNT(CASE WHEN created_at >= CURRENT_DATE THEN id END), 0) AS vendas_hoje,
        COALESCE(COUNT(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN id END), 0) AS vendas_mes,
        COALESCE(AVG(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN valor_total END), 0) AS ticket_medio
      FROM vendas
      WHERE status = 'concluida';
    `;

    const pratosVendidos = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN v.created_at >= CURRENT_DATE THEN iv.quantidade ELSE 0 END), 0) AS pratos_hoje,
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', v.created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN iv.quantidade ELSE 0 END), 0) AS pratos_mes
      FROM itens_venda iv
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.status = 'concluida';
    `;

    const pratosMaisVendidos = await sql`
      SELECT 
        p.nome AS prato_nome,
        SUM(iv.quantidade) AS total_qtd,
        SUM(iv.valor_total) AS total_faturado
      FROM itens_venda iv
      JOIN pratos p ON iv.prato_id = p.id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.status = 'concluida'
      GROUP BY p.id, p.nome
      ORDER BY total_qtd DESC
      LIMIT 5;
    `;

    const estoqueBaixo = await sql`
      SELECT id, nome, quantidade_estoque, estoque_minimo, unidade_medida, custo_unitario
      FROM ingredientes
      WHERE quantidade_estoque <= estoque_minimo AND ativo = true
      ORDER BY (quantidade_estoque / NULLIF(estoque_minimo, 0)) ASC;
    `;

    const lotesVencimento = await sql`
      SELECT l.id, i.nome AS ingrediente, l.quantidade, i.unidade_medida, l.data_validade, l.numero_lote,
             (l.data_validade - CURRENT_DATE) AS dias_para_vencer
      FROM lotes_ingredientes l
      JOIN ingredientes i ON l.ingrediente_id = i.id
      WHERE l.data_validade <= CURRENT_DATE + INTERVAL '15 days'
      ORDER BY l.data_validade ASC;
    `;

    const ultimasVendas = await sql`
      SELECT v.id, v.valor_total, v.forma_pagamento, v.status, v.created_at, u.nome AS atendente_nome
      FROM vendas v
      JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY v.created_at DESC
      LIMIT 10;
    `;

    const vendasPorAtendente = await sql`
      SELECT u.nome AS atendente_nome, COUNT(v.id) AS total_vendas, COALESCE(SUM(v.valor_total), 0) AS total_faturado
      FROM usuarios u
      LEFT JOIN vendas v ON v.usuario_id = u.id AND v.status = 'concluida'
      WHERE u.tipo = 'atendente'
      GROUP BY u.id, u.nome
      ORDER BY total_faturado DESC;
    `;

    const avaliacoesResumo = await sql`
      SELECT 
        COALESCE(ROUND(AVG(a.nota), 2), 0) AS media_geral,
        COUNT(a.id) AS total_avaliacoes
      FROM avaliacoes a;
    `;

    return res.json({
      resumo: {
        faturamento_hoje: parseFloat(resumoVendas[0].faturamento_hoje),
        faturamento_mes: parseFloat(resumoVendas[0].faturamento_mes),
        vendas_hoje: parseInt(resumoVendas[0].vendas_hoje),
        vendas_mes: parseInt(resumoVendas[0].vendas_mes),
        pratos_hoje: parseInt(pratosVendidos[0].pratos_hoje),
        pratos_mes: parseInt(pratosVendidos[0].pratos_mes),
        ticket_medio: parseFloat(resumoVendas[0].ticket_medio)
      },
      pratosMaisVendidos,
      estoqueBaixo,
      lotesVencimento,
      ultimasVendas,
      vendasPorAtendente,
      avaliacoesResumo: avaliacoesResumo[0]
    });

  } catch (err) {
    console.error('[DASHBOARD GESTOR ERROR]:', err);
    return res.status(500).json({ error: 'Erro ao carregar dados do dashboard de gestor.' });
  }
});

// --- ROTAS DO ATENDENTE ---

app.get('/api/dashboard/atendente', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    const pratos = await sql`
      SELECT p.id, p.nome, p.descricao, p.valor,
             COALESCE(
               json_agg(
                 json_build_object(
                   'ingrediente', i.nome,
                   'quantidade', pi.quantidade,
                   'unidade', i.unidade_medida
                 )
               ) FILTER (WHERE i.id IS NOT NULL), '[]'
             ) AS ingredientes
      FROM pratos p
      LEFT JOIN prato_ingredientes pi ON p.id = pi.prato_id
      LEFT JOIN ingredientes i ON pi.ingrediente_id = i.id
      WHERE p.ativo = true
      GROUP BY p.id, p.nome, p.descricao, p.valor
      ORDER BY p.nome;
    `;

    let minhasVendas = [];
    if (userId) {
      minhasVendas = await sql`
        SELECT v.id, v.valor_total, v.forma_pagamento, v.status, v.created_at,
               json_agg(
                 json_build_object(
                   'prato', p.nome,
                   'quantidade', iv.quantidade,
                   'valor_unitario', iv.valor_unitario,
                   'valor_total', iv.valor_total
                 )
               ) AS itens
        FROM vendas v
        JOIN itens_venda iv ON v.id = iv.venda_id
        JOIN pratos p ON iv.prato_id = p.id
        WHERE v.usuario_id = ${userId}
        GROUP BY v.id, v.valor_total, v.forma_pagamento, v.status, v.created_at
        ORDER BY v.created_at DESC
        LIMIT 15;
      `;
    }

    return res.json({ pratos, minhasVendas });

  } catch (err) {
    console.error('[DASHBOARD ATENDENTE ERROR]:', err);
    return res.status(500).json({ error: 'Erro ao carregar catálogo para atendimento.' });
  }
});

// Registrar Venda
app.post('/api/vendas', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { usuario_id, forma_pagamento, itens } = req.body;

    const actualUserId = userId || usuario_id;
    if (!actualUserId) {
      return res.status(401).json({ error: 'Usuário não autenticado para realizar venda.' });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'A venda deve possuir ao menos um prato.' });
    }

    if (!['dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'outro'].includes(forma_pagamento)) {
      return res.status(400).json({ error: 'Forma de pagamento inválida.' });
    }

    let valorTotalVenda = 0;
    for (const item of itens) {
      valorTotalVenda += (item.quantidade * item.valor_unitario);
    }

    const resultVenda = await sql`
      INSERT INTO vendas (usuario_id, valor_total, forma_pagamento, status)
      VALUES (${actualUserId}, ${valorTotalVenda}, ${forma_pagamento}, 'concluida')
      RETURNING id, valor_total, created_at;
    `;

    const vendaId = resultVenda[0].id;

    for (const item of itens) {
      await sql`
        INSERT INTO itens_venda (venda_id, prato_id, quantidade, valor_unitario, valor_total)
        VALUES (${vendaId}, ${item.prato_id}, ${item.quantidade}, ${item.valor_unitario}, ${item.quantidade * item.valor_unitario});
      `;
    }

    return res.status(201).json({
      message: 'Venda registrada com sucesso! Estoque atualizado automaticamente.',
      venda: {
        id: vendaId,
        valor_total: valorTotalVenda,
        created_at: resultVenda[0].created_at
      }
    });

  } catch (err) {
    console.error('[REGISTRAR VENDA ERROR]:', err);
    return res.status(500).json({ error: 'Erro ao processar venda: ' + err.message });
  }
});

// --- ROTAS GERAIS ---

app.get('/api/pratos', async (req, res) => {
  try {
    const pratos = await sql`SELECT * FROM vw_custo_pratos ORDER BY prato_nome;`;
    return res.json({ pratos });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/pratos', async (req, res) => {
  try {
    const { nome, descricao, valor } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome do prato é obrigatório.' });

    const result = await sql`
      INSERT INTO pratos (nome, descricao, valor)
      VALUES (${nome.trim()}, ${descricao || null}, ${valor || 0})
      RETURNING *;
    `;

    return res.status(201).json({ prato: result[0], message: 'Prato criado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/ingredientes', async (req, res) => {
  try {
    const ingredientes = await sql`SELECT * FROM ingredientes ORDER BY nome;`;
    return res.json({ ingredientes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de API do Food Flux rodando em http://0.0.0.0:${PORT}`);
});

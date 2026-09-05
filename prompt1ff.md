
# Prompt 1 — Base do projeto + Neon completo

Você vai criar o banco de dados para um sistema de gestão financeira e operacional para restaurantes chamado **Food Flux**. Você tem acesso ao Neon via MCP e o projeto já foi criado com o nome de **"Food Flux"**. Então pode e deve criar toda a estrutura diretamente via MCP, sem necessidade de copiar SQL manualmente.

O banco de dados deve ser preparado para controlar pratos, ingredientes, receitas, estoque, vendas, usuários, avaliações e informações financeiras do restaurante.

Crie as seguintes tabelas com todos os campos abaixo:

## Tabela `usuarios`

- id (uuid, primary key, gerado automaticamente)

- nome (text, not null)

- email (text, not null, unique)

- senha (text, not null)

- tipo (text, not null, podendo ser `atendente` ou `gestor_caixa`)

- ativo (boolean, not null, default true)

- created_at (timestamp, gerado automaticamente)

O campo senha deve ser armazenado de forma segura utilizando hash, nunca em texto puro.

Essa tabela será utilizada para o login dos atendentes e também para o login do gestor de caixa.

---

## Tabela `pratos`

- id (uuid, primary key, gerado automaticamente)

- nome (text, not null, unique)

- descricao (text)

- valor (numeric(10,2), not null)

- ativo (boolean, not null, default true)

- created_at (timestamp, gerado automaticamente)

- updated_at (timestamp, gerado automaticamente)

Essa tabela deve armazenar todos os pratos disponíveis no restaurante, seus nomes e valores de venda.

---

## Tabela `ingredientes`

- id (uuid, primary key, gerado automaticamente)

- nome (text, not null, unique)

- unidade_medida (text, not null)

- quantidade_estoque (numeric(12,3), not null, default 0)

- estoque_minimo (numeric(12,3), not null, default 0)

- custo_unitario (numeric(10,2), not null, default 0)

- ativo (boolean, not null, default true)

- created_at (timestamp, gerado automaticamente)

- updated_at (timestamp, gerado automaticamente)

Essa tabela deve armazenar os ingredientes disponíveis no restaurante e a quantidade atual de cada ingrediente em estoque.

A unidade de medida pode ser, por exemplo:

- kg

- g

- litro

- ml

- unidade

---

## Tabela `prato_ingredientes`

Essa tabela será responsável por relacionar os pratos aos ingredientes utilizados em cada prato.

- id (uuid, primary key, gerado automaticamente)

- prato_id (uuid, foreign key para `pratos.id`, not null)

- ingrediente_id (uuid, foreign key para `ingredientes.id`, not null)

- quantidade (numeric(12,3), not null)

- created_at (timestamp, gerado automaticamente)

A quantidade representa quanto daquele ingrediente é utilizado para produzir **1 unidade do prato**.

Exemplo:

Prato: X-Burger

- 1 pão

- 150g de carne

- 30g de queijo

- 20g de alface

- 30g de tomate

Criar uma regra para impedir que o mesmo ingrediente seja cadastrado duas vezes no mesmo prato.

---

## Tabela `receitas_padrao`

Essa tabela será utilizada para que o Food Flux consiga identificar automaticamente os ingredientes de determinados pratos quando o sistema estiver sendo utilizado pela primeira vez.

- id (uuid, primary key, gerado automaticamente)

- nome_prato (text, not null, unique)

- descricao (text)

- valor_padrao (numeric(10,2))

- ativo (boolean, not null, default true)

- created_at (timestamp, gerado automaticamente)

Essa tabela deverá armazenar as receitas padrões dos pratos.

---

## Tabela `receita_padrao_ingredientes`

- id (uuid, primary key, gerado automaticamente)

- receita_padrao_id (uuid, foreign key para `receitas_padrao.id`, not null)

- ingrediente_id (uuid, foreign key para `ingredientes.id`, not null)

- quantidade (numeric(12,3), not null)

Essa tabela deverá informar quais ingredientes fazem parte de cada receita padrão e qual a quantidade utilizada de cada ingrediente.

---

## Funcionamento automático das receitas padrão

Quando o sistema for iniciado pela primeira vez e o atendente ou gestor cadastrar um prato pelo nome, o sistema deverá verificar se existe uma receita padrão cadastrada para aquele nome.

Exemplo:

O usuário cadastra:

`X-Burger`

Se existir uma receita padrão chamada `X-Burger`, o sistema deverá automaticamente:

- Criar o prato na tabela `pratos`

- Utilizar o valor padrão da receita, caso nenhum valor seja informado

- Buscar os ingredientes da receita padrão

- Criar os relacionamentos dos ingredientes na tabela `prato_ingredientes`

- Informar automaticamente a quantidade de cada ingrediente utilizada no prato

Dessa forma, não será necessário cadastrar manualmente todos os ingredientes novamente para pratos que já possuam uma receita padrão.

Essa automação poderá ser realizada pela aplicação ou através de função, procedure ou trigger do PostgreSQL, desde que funcione corretamente e mantenha a integridade do banco.

---

## Tabela `vendas`

- id (uuid, primary key, gerado automaticamente)

- usuario_id (uuid, foreign key para `usuarios.id`, not null)

- valor_total (numeric(10,2), not null)

- forma_pagamento (text, not null)

- status (text, not null, default `concluida`)

- created_at (timestamp, gerado automaticamente)

A forma de pagamento poderá ser:

- dinheiro

- pix

- cartao_credito

- cartao_debito

- outro

O status poderá ser:

- concluida

- cancelada

Essa tabela deverá registrar cada venda realizada no restaurante.

---

## Tabela `itens_venda`

Uma venda poderá possuir vários pratos.

- id (uuid, primary key, gerado automaticamente)

- venda_id (uuid, foreign key para `vendas.id`, not null)

- prato_id (uuid, foreign key para `pratos.id`, not null)

- quantidade (integer, not null)

- valor_unitario (numeric(10,2), not null)

- valor_total (numeric(10,2), not null)

O valor unitário deverá ser salvo no momento da venda para que alterações futuras no preço do prato não alterem o histórico das vendas antigas.

Exemplo:

O prato custa R$ 25,00.

Foram vendidos 3 pratos.

Quantidade: 3

Valor unitário: R$ 25,00

Valor total: R$ 75,00

---

## Tabela `movimentacoes_estoque`

- id (uuid, primary key, gerado automaticamente)

- ingrediente_id (uuid, foreign key para `ingredientes.id`, not null)

- venda_id (uuid, foreign key para `vendas.id`, opcional)

- usuario_id (uuid, foreign key para `usuarios.id`, opcional)

- tipo (text, not null)

- quantidade (numeric(12,3), not null)

- motivo (text)

- created_at (timestamp, gerado automaticamente)

O tipo de movimentação poderá ser:

- entrada

- saida

- ajuste

- perda

- vencimento

Essa tabela deverá registrar todas as alterações importantes no estoque.

---

## Baixa automática dos ingredientes após uma venda

Quando uma venda for registrada como `concluida`, o sistema deverá identificar os pratos vendidos e consultar os ingredientes relacionados a eles na tabela `prato_ingredientes`.

A quantidade de cada ingrediente deverá ser calculada de acordo com a quantidade de pratos vendidos.

Exemplo:

O X-Burger utiliza:

- 150g de carne

- 1 pão

- 30g de queijo

Se forem vendidos 10 X-Burgers, o sistema deverá retirar automaticamente:

- 1.500g de carne

- 10 pães

- 300g de queijo

A quantidade deverá ser retirada da tabela `ingredientes` e uma movimentação do tipo `saida` deverá ser registrada em `movimentacoes_estoque`.

A baixa do estoque e o registro da venda devem ocorrer de forma segura e consistente, evitando que a venda seja registrada sem a baixa correspondente dos ingredientes.

---

## Tabela `lotes_ingredientes`

Um mesmo ingrediente poderá possuir diferentes lotes e diferentes datas de vencimento.

- id (uuid, primary key, gerado automaticamente)

- ingrediente_id (uuid, foreign key para `ingredientes.id`, not null)

- quantidade (numeric(12,3), not null)

- data_entrada (date, default current_date)

- data_validade (date, not null)

- numero_lote (text)

- created_at (timestamp, gerado automaticamente)

Essa tabela deverá permitir que o sistema controle os ingredientes próximos do vencimento.

---

## Tabela `avaliacoes`

- id (uuid, primary key, gerado automaticamente)

- nome_cliente (text, not null)

- email_cliente (text)

- prato_id (uuid, foreign key para `pratos.id`, not null)

- nota (integer, not null)

- comentario (text)

- created_at (timestamp, gerado automaticamente)

A nota deverá aceitar somente valores entre 1 e 5.

O prato deverá ser relacionado através do `prato_id`, e não através do nome do prato.

Isso permitirá calcular a média de avaliação de cada prato.

---

## Relatórios de vendas

Não criar uma tabela separada apenas para armazenar o total de vendas do dia ou do mês.

Os valores deverão ser calculados diretamente através das tabelas `vendas` e `itens_venda`.

O banco deverá permitir calcular:

- total de pratos vendidos

- total de vendas do dia

- total de vendas do mês

- total de vendas de cada dia

- total de pratos vendidos em cada dia

- total de pratos vendidos no mês

- faturamento diário

- faturamento mensal

- prato mais vendido

- prato menos vendido

- média de vendas por dia

- ticket médio

- vendas por forma de pagamento

- vendas realizadas por cada atendente

---

## Dashboard do Food Flux

O banco deverá permitir que o sistema apresente no dashboard:

- faturamento do dia

- faturamento do mês

- quantidade de pratos vendidos hoje

- quantidade de pratos vendidos no mês

- quantidade de vendas realizadas

- ticket médio

- prato mais vendido

- pratos mais vendidos

- ingredientes com estoque baixo

- ingredientes próximos do vencimento

- últimas vendas realizadas

- média das avaliações dos clientes

- pratos com melhores avaliações

- vendas por forma de pagamento

- vendas realizadas por atendente

---

## Cálculo do custo dos pratos

O banco deverá permitir calcular automaticamente o custo estimado de cada prato utilizando:

`quantidade do ingrediente utilizada × custo_unitario do ingrediente`

Exemplo:

Carne:

150g × R$ 0,04 = R$ 6,00

Queijo:

30g × R$ 0,05 = R$ 1,50

Pão:

1 unidade × R$ 1,50 = R$ 1,50

Custo estimado do prato:

R$ 9,00

Isso deverá permitir futuramente calcular:

- custo do prato

- lucro estimado

- margem de lucro

- margem percentual

---

## Relacionamentos

Criar corretamente os relacionamentos entre as tabelas:

`usuarios`

→ `vendas`

`vendas`

→ `itens_venda`

`pratos`

→ `itens_venda`

`pratos`

→ `prato_ingredientes`

`ingredientes`

→ `prato_ingredientes`

`ingredientes`

→ `movimentacoes_estoque`

`ingredientes`

→ `lotes_ingredientes`

`usuarios`

→ `movimentacoes_estoque`

`receitas_padrao`

→ `receita_padrao_ingredientes`

`ingredientes`

→ `receita_padrao_ingredientes`

`pratos`

→ `avaliacoes`

`vendas`

→ `movimentacoes_estoque`

---

## Regras importantes do banco

Criar:

- Primary Keys em todas as tabelas

- Foreign Keys nos relacionamentos

- UNIQUE para nomes de pratos

- UNIQUE para nomes de ingredientes

- UNIQUE para emails dos usuários

- UNIQUE para evitar ingredientes duplicados em uma receita

- CHECK para notas de avaliação entre 1 e 5

- CHECK para impedir quantidades negativas quando não forem permitidas

- CHECK para impedir valores de venda negativos

- índices nos campos utilizados frequentemente nas consultas

---

## Índices

Criar índices para:

- `vendas.created_at`

- `vendas.usuario_id`

- `vendas.status`

- `itens_venda.venda_id`

- `itens_venda.prato_id`

- `prato_ingredientes.prato_id`

- `prato_ingredientes.ingrediente_id`

- `movimentacoes_estoque.ingrediente_id`

- `movimentacoes_estoque.created_at`

- `lotes_ingredientes.data_validade`

- `avaliacoes.prato_id`

---

## Dados iniciais

Como o Food Flux está sendo iniciado pela primeira vez, criar alguns ingredientes e receitas padrão para teste, caso ainda não existam dados no banco.

Exemplo de ingredientes:

- Pão

- Carne

- Queijo

- Alface

- Tomate

- Molho

As receitas padrão poderão conter exemplos como:

### X-Burger

- Pão: 1 unidade

- Carne: 150g

- Queijo: 30g

- Alface: 20g

- Tomate: 30g

### X-Salada

- Pão: 1 unidade

- Carne: 150g

- Queijo: 30g

- Alface: 20g

- Tomate: 30g

Os dados iniciais devem ser criados somente se ainda não existirem, evitando duplicação.

---

## Funcionamento geral esperado

O funcionamento do banco deverá seguir esta lógica:

**Ingrediente cadastrado**

→ entra no estoque

**Receita padrão cadastrada**

→ ingredientes são associados ao prato

**Prato cadastrado pelo nome**

→ sistema procura uma receita padrão

→ ingredientes são adicionados automaticamente ao prato

**Prato vendido**

→ venda é registrada

→ quantidade vendida é registrada

→ valor da venda é registrado

→ ingredientes utilizados são identificados

→ estoque é reduzido automaticamente

→ movimentação de estoque é registrada

**Vendas registradas**

→ total diário pode ser calculado

→ total mensal pode ser calculado

→ total de pratos vendidos pode ser calculado

→ faturamento pode ser calculado

→ pratos mais vendidos podem ser identificados

**Cliente realiza avaliação**

→ avaliação é vinculada ao prato

→ média de avaliação pode ser calculada

**Estoque**

→ quantidade disponível pode ser consultada

→ estoque mínimo pode ser identificado

→ produtos próximos do vencimento podem ser identificados

---

## Por fim

Confirme que tudo foi criado corretamente no banco Neon do Food Flux.

Após finalizar, liste:

- todas as tabelas criadas

- todos os campos de cada tabela

- Primary Keys

- Foreign Keys

- relacionamentos

- constraints

- índices

- receitas padrão criadas

- ingredientes iniciais criados

- dados de teste inseridos, caso tenham sido inseridos

Faça também uma verificação final para garantir que não existem tabelas duplicadas e que todos os relacionamentos estão funcionando corretamente.

**Não apenas descreva o que deve ser feito. Execute a criação e configuração diretamente no Neon via MCP e depois valide o resultado.**




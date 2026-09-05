
# Prompt 2 — Autenticação

Agora vamos criar a autenticação do sistema **Food Flux**.

O sistema deve permitir que **atendentes** e o **gestor de caixa** criem suas contas e façam login.

O projeto utiliza o banco **Neon**, criado anteriormente no Prompt 1, e a autenticação deve estar integrada à tabela `usuarios`.

A tabela `usuarios` possui os seguintes tipos:

- `atendente`

- `gestor_caixa`

Cada usuário deverá possuir:

- nome

- email

- senha protegida por hash

- tipo de usuário

- status ativo/inativo

---

## Tela de Login

Criar uma tela de login para acesso ao sistema.

- Campo de email

- Campo de senha

- Botão "Entrar"

- Link "Não tem conta? Cadastre-se"

- Opção para selecionar o tipo de acesso, caso necessário

Os tipos de acesso disponíveis são:

- Atendente

- Gestor de Caixa

O sistema deverá identificar o usuário através do email, senha e tipo de usuário cadastrado.

---

## Tela de Cadastro

Criar uma tela para criação de uma nova conta.

- Campo de nome completo

- Campo de email

- Campo de senha

- Campo de confirmar senha

- Seleção do tipo de usuário

- Botão "Criar conta"

- Link "Já tem conta? Faça login"

Os tipos disponíveis deverão ser:

- Atendente

- Gestor de Caixa

---

## Cadastro de Atendente

Quando o usuário selecionar `Atendente` durante o cadastro:

- Criar o usuário no sistema de autenticação

- Salvar o nome na tabela `usuarios`

- Salvar o email na tabela `usuarios`

- Salvar a senha de forma segura utilizando hash

- Salvar o tipo como `atendente`

- Salvar `ativo` como `true`

- Registrar automaticamente o `created_at`

O atendente deverá possuir acesso somente às funcionalidades permitidas para esse tipo de usuário.

---

## Cadastro do Gestor de Caixa

Quando o usuário selecionar `Gestor de Caixa` durante o cadastro:

- Criar o usuário no sistema de autenticação

- Salvar o nome na tabela `usuarios`

- Salvar o email na tabela `usuarios`

- Salvar a senha de forma segura utilizando hash

- Salvar o tipo como `gestor_caixa`

- Salvar `ativo` como `true`

- Registrar automaticamente o `created_at`

O gestor de caixa deverá possuir acesso às funcionalidades administrativas e financeiras do sistema.

---

## Regras de autenticação

- O email deve ser único

- A senha deve possuir no mínimo 6 caracteres

- A senha nunca deve ser armazenada em texto puro

- Utilizar hash seguro para armazenamento das senhas

- O sistema deve verificar se o usuário está com `ativo = true` antes de permitir o acesso

- Usuários com `ativo = false` não poderão realizar login

- Após o login bem sucedido, redirecionar o usuário para o dashboard

- Se o login falhar, exibir uma mensagem de erro clara e amigável

- Se o email já estiver cadastrado, informar que já existe uma conta utilizando aquele email

- Se as senhas informadas no cadastro forem diferentes, impedir a criação da conta

- Não permitir campos obrigatórios vazios

- Validar o formato do email

---

## Controle de acesso por tipo de usuário

O sistema deverá verificar o campo `tipo` da tabela `usuarios` após o login.

### Atendente

O atendente deverá ter acesso às funcionalidades relacionadas ao atendimento e registro de vendas.

O atendente poderá:

- Visualizar os pratos disponíveis

- Visualizar os valores dos pratos

- Registrar vendas

- Visualizar os ingredientes necessários dos pratos, quando permitido

- Consultar informações necessárias para realizar uma venda

- Visualizar suas próprias vendas, quando permitido

O atendente não deverá possuir acesso às funcionalidades administrativas exclusivas do gestor.

---

### Gestor de Caixa

O gestor de caixa deverá possuir acesso às funcionalidades financeiras e administrativas do Food Flux.

O gestor poderá:

- Visualizar o dashboard completo

- Visualizar todas as vendas

- Visualizar faturamento diário

- Visualizar faturamento mensal

- Visualizar quantidade de pratos vendidos

- Visualizar pratos mais vendidos

- Gerenciar pratos

- Gerenciar ingredientes

- Gerenciar estoque

- Visualizar movimentações de estoque

- Visualizar ingredientes próximos do vencimento

- Visualizar avaliações dos clientes

- Visualizar vendas realizadas pelos atendentes

- Consultar informações financeiras

- Gerenciar usuários quando essa funcionalidade estiver disponível

---

## Dashboard

Após o login, o usuário deverá ser redirecionado para o dashboard correspondente ao seu tipo de acesso.

### Dashboard do Atendente

Exibir as informações necessárias para o atendimento e registro de vendas.

### Dashboard do Gestor de Caixa

Exibir:

- Total de vendas do dia

- Total de vendas do mês

- Total de pratos vendidos

- Quantidade de vendas realizadas

- Ticket médio

- Pratos mais vendidos

- Faturamento diário

- Faturamento mensal

- Estoque baixo

- Ingredientes próximos do vencimento

- Avaliações dos clientes

- Últimas vendas

---

## Sessão do usuário

- Manter a sessão ativa para que o usuário não precise fazer login toda vez que abrir o sistema

- Armazenar a sessão de forma segura

- Se o usuário já estiver autenticado e tentar acessar a tela de login, redirecionar automaticamente para o dashboard

- Se o usuário não estiver autenticado e tentar acessar uma página protegida, redirecionar para a tela de login

- Ao clicar em "Sair", encerrar a sessão corretamente

- Após sair, impedir o acesso às páginas protegidas até que um novo login seja realizado

---

## Proteção das páginas

Todas as páginas internas do Food Flux deverão verificar se existe um usuário autenticado.

Antes de permitir o acesso:

1. Verificar se existe uma sessão válida

2. Identificar o usuário

3. Buscar o usuário na tabela `usuarios`

4. Verificar se `ativo = true`

5. Identificar o campo `tipo`

6. Liberar somente as funcionalidades correspondentes ao tipo de usuário

Caso não exista uma sessão válida:

→ redirecionar para o login.

Caso o usuário esteja inativo:

→ impedir o acesso e informar que a conta está desativada.

---

## Integração com o banco de dados

Utilizar a tabela `usuarios` criada no Prompt 1.

Não criar novas tabelas separadas chamadas:

- `atendentes`

- `gestor_caixa`

Todos os usuários deverão ser armazenados na tabela:

`usuarios`

Utilizar o campo:

`tipo`

para diferenciar:

`atendente`

e

`gestor_caixa`

Dessa forma, a autenticação deverá permanecer alinhada com a estrutura do banco de dados criada anteriormente.

---

## Relação entre usuário e vendas

Toda venda realizada deverá possuir o `usuario_id` do usuário que realizou o registro da venda.

Dessa forma, será possível identificar:

- qual atendente realizou cada venda

- quantidade de vendas realizadas por cada atendente

- valor total vendido por cada atendente

- histórico de vendas de cada atendente

O `usuario_id` da venda deverá ser relacionado à tabela:

`usuarios`

através da Foreign Key correspondente.

---

## Segurança

- Nunca armazenar senhas em texto puro

- Utilizar hash seguro para as senhas

- Não permitir acesso às páginas internas sem autenticação

- Validar os dados enviados pelo usuário

- Impedir que um atendente consiga acessar funcionalidades exclusivas do gestor apenas alterando informações no frontend

- As permissões deverão ser verificadas também no backend

- Não confiar somente no campo `tipo` enviado pelo navegador

- Verificar o usuário autenticado diretamente no servidor/banco

- Evitar exposição de dados sensíveis

---

## Design

O design da autenticação deverá seguir a identidade visual do **Food Flux**.

Criar uma interface:

- moderna

- limpa

- profissional

- responsiva

- simples de utilizar

- adequada para um sistema de gestão de restaurante

A tela deverá possuir destaque para o nome/logo **Food Flux**.

Utilizar uma identidade visual consistente com o restante da aplicação.

Os campos de email e senha devem possuir boa visualização e mensagens de erro claras.

O botão de login deve possuir destaque visual.

O sistema deve funcionar corretamente em:

- computador

- tablet

- celular

---

## Por fim

Depois de implementar a autenticação:

- Testar criação de conta de atendente

- Testar criação de conta de gestor de caixa

- Testar login de atendente

- Testar login de gestor de caixa

- Testar senha incorreta

- Testar email inexistente

- Testar email duplicado

- Testar senha com menos de 6 caracteres

- Testar confirmação de senha diferente

- Testar usuário inativo

- Testar manutenção da sessão

- Testar logout

- Testar proteção das páginas

- Testar redirecionamento para o dashboard

- Testar as permissões diferentes entre atendente e gestor de caixa

Confirme ao final que a autenticação foi implementada corretamente e que está integrada à tabela `usuarios` criada no Prompt 1 do Food Flux.

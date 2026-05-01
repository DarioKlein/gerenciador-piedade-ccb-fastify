# Gerenciador da Piedade

Este é um projeto de API backend desenvolvido em Node.js usando o framework [Fastify](https://www.fastify.io/) e o banco de dados [SQLite](https://sqlite.org/) (via `better-sqlite3`). A aplicação tem como objetivo gerenciar dados de responsáveis, setores, bairros e famílias.

## 🛠️ Tecnologias Utilizadas

- **Node.js** com **TypeScript**
- **Fastify** (Framework web rápido e de baixo overhead)
- **SQLite3** (Banco de dados relacional embarcado utilizando `better-sqlite3`)
- **tsx** para execução de TypeScript em ambiente de desenvolvimento

## 📦 Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute o projeto em ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

O servidor será iniciado em `http://localhost:3000` (ou na porta especificada na variável de ambiente `PORT`).

---

## 🗄️ Estrutura do Banco de Dados

O banco de dados possui as seguintes tabelas principais:

- **responsaveis**: Diáconos ou Irmãos de Obras de Piedade (IOP).
- **setores**: Setores ou Distritos.
- **setores_responsaveis**: Tabela associativa (N:N) entre setores e responsáveis.
- **bairros**: Bairros associados a um setor.
- **familias**: Famílias associadas a um bairro, contendo informações detalhadas (moradores, situação, residência, observações).

---

## 🚀 Endpoints da API (Rotas)

Todas as rotas estão prefixadas com `/api`.

### 👥 Responsáveis (`/api/responsaveis`)
Gerencia os responsáveis (diáconos e irmãos de obras de piedade).

- `GET /api/responsaveis` - Lista todos os responsáveis (ordenados por nome).
- `GET /api/responsaveis/:id` - Retorna os dados de um responsável específico.
- `POST /api/responsaveis` - Cria um novo responsável.
  - Body: `{ "nome": "String", "tipo": "diacono" | "iop", "contato": "String" }`
- `PUT /api/responsaveis/:id` - Atualiza um responsável existente.
- `DELETE /api/responsaveis/:id` - Remove um responsável pelo ID.

### 🗺️ Setores (`/api/setores`)
Gerencia os setores e distritos, bem como a associação com responsáveis.

- `GET /api/setores` - Lista todos os setores (inclui os responsáveis vinculados).
- `GET /api/setores/:id` - Retorna os dados de um setor específico e seus responsáveis.
- `POST /api/setores` - Cria um novo setor.
  - Body: `{ "nome": "String", "tipo": "setor" | "distrito" }`
- `PUT /api/setores/:id` - Atualiza um setor existente.
- `DELETE /api/setores/:id` - Remove um setor pelo ID.
- `POST /api/setores/:id/responsaveis` - Vincula um responsável a um setor.
  - Body: `{ "responsavel_id": 1 }`
- `DELETE /api/setores/:id/responsaveis/:responsavel_id` - Desvincula um responsável de um setor.

### 🏘️ Bairros (`/api/bairros`)
Gerencia os bairros e sua subordinação aos setores.

- `GET /api/bairros` - Lista todos os bairros (com dados do setor vinculado).
- `GET /api/bairros/:id` - Retorna os dados de um bairro específico.
- `GET /api/bairros/setor/:setor_id` - Lista todos os bairros de um setor específico.
- `POST /api/bairros` - Cria um novo bairro.
  - Body: `{ "nome": "String", "setor_id": 1 }`
- `PUT /api/bairros/:id` - Atualiza um bairro existente.
- `DELETE /api/bairros/:id` - Remove um bairro pelo ID.

### 👨‍👩‍👧‍👦 Famílias (`/api/familias`)
Gerencia o cadastro detalhado de famílias vinculadas a um bairro.

- `GET /api/familias` - Lista as famílias. Aceita os seguintes `query params` para filtragem:
  - `bairro_id`: Filtrar por bairro.
  - `situacao`: Filtrar por situação (`aposentado`, `registrado`, `autonomo`, `desempregado`, etc).
  - `residencia`: Filtrar por tipo de residência (`propria`, `alugada`, `cedida`, `financiada`).
  - `obs`: Filtrar por observação (`congrega`, `parado`, `afastado`).
  - `search`: Busca textual por nome ou endereço.
- `GET /api/familias/:id` - Retorna os dados de uma família específica, juntamente com o bairro e setor.
- `POST /api/familias` - Cria uma nova família.
  - Body inclui: `nome`, `endereco`, `num_moradores`, `num_criancas`, `num_idosos`, `num_enfermos`, `num_batizados`, `situacao`, `residencia`, `obs` e `bairro_id`.
- `PUT /api/familias/:id` - Atualiza os dados de uma família existente.
- `DELETE /api/familias/:id` - Remove uma família pelo ID.

# JobApplication API

REST API para gerenciamento e acompanhamento de candidaturas de emprego. Permite registrar vagas, controlar etapas do processo seletivo, anexar currículos personalizados e gerenciar perfis LinkedIn de empresas e contatos.

## Tecnologias

- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de dados**: MongoDB + Mongoose
- **Autenticação**: JWT (JSON Web Tokens)
- **Documentação**: Swagger / OpenAPI 3.0
- **Validação**: express-validator
- **Upload**: Multer (PDF)

## Pré-requisitos

- Node.js >= 18.x
- MongoDB (local ou Atlas)
- npm >= 9.x

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/eldinaldolustosa/jobapplication.git
cd jobapplication

# Instalar dependências
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `BASE_URL` | URL base da API | `http://localhost:3000` |
| `MONGODB_URI` | URI de conexão MongoDB | `mongodb://localhost:27017/jobapplication` |
| `JWT_SECRET` | Chave secreta para assinar tokens | — |
| `JWT_EXPIRES_IN` | Expiração do access token | `24h` |
| `JWT_REFRESH_SECRET` | Chave secreta para refresh tokens | — |
| `JWT_REFRESH_EXPIRES_IN` | Expiração do refresh token | `7d` |
| `UPLOAD_MAX_SIZE_MB` | Tamanho máximo de upload (MB) | `5` |

## Scripts

```bash
# Iniciar servidor em modo estático
npm start

# Iniciar servidor em modo desenvolvimento (hot reload com nodemon)
npm run dev
```

## Documentação da API (Swagger)

Após iniciar o servidor, acesse:

```
http://localhost:3000/api-docs
```

## Arquitetura

```
src/
├── config/
│   ├── database.js       # Conexão com MongoDB
│   └── swagger.js        # Configuração do Swagger
├── controllers/          # Handlers das requisições HTTP
│   ├── authController.js
│   ├── userController.js
│   ├── jobApplicationController.js
│   ├── stageController.js
│   ├── resumeController.js
│   └── linkedinController.js
├── middleware/
│   ├── auth.js           # Validação do token JWT
│   ├── errorHandler.js   # Tratamento global de erros
│   └── validate.js       # Helper para express-validator
├── models/               # Schemas Mongoose
│   ├── User.js
│   ├── JobApplication.js
│   ├── Stage.js
│   ├── LinkedinCompany.js
│   └── LinkedinContact.js
├── routes/               # Definição de endpoints + Swagger JSDoc
│   ├── index.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── jobApplicationRoutes.js
│   └── linkedinRoutes.js
├── services/             # Lógica de negócio
│   ├── authService.js
│   ├── userService.js
│   ├── jobApplicationService.js
│   ├── stageService.js
│   ├── resumeService.js
│   └── linkedinService.js
└── app.js                # Configuração do Express
server.js                 # Entry point
```

## Endpoints

### Auth
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/auth/login` | Login e geração de tokens JWT | Público |
| POST | `/api/v1/auth/refresh` | Renovar access token | Público |

### Users
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/users/register` | Registrar novo usuário | Público |
| GET | `/api/v1/users/me` | Dados do usuário autenticado | JWT |

### Job Applications
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/job-applications` | Cadastrar candidatura | JWT |
| GET | `/api/v1/job-applications` | Listar candidaturas | JWT |
| GET | `/api/v1/job-applications/:id` | Obter candidatura por ID | JWT |
| PUT | `/api/v1/job-applications/:id` | Atualizar candidatura | JWT |
| DELETE | `/api/v1/job-applications/:id` | Remover candidatura | JWT |
| POST | `/api/v1/job-applications/:id/resume` | Enviar currículo PDF | JWT |
| GET | `/api/v1/job-applications/:id/resume` | Consultar currículo | JWT |
| POST | `/api/v1/job-applications/:id/stages` | Registrar etapa | JWT |
| GET | `/api/v1/job-applications/:id/stages` | Histórico de etapas | JWT |

### LinkedIn
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/linkedin/companies` | Cadastrar empresa | JWT |
| GET | `/api/v1/linkedin/companies` | Listar empresas | JWT |
| GET | `/api/v1/linkedin/companies/:id` | Obter empresa | JWT |
| PUT | `/api/v1/linkedin/companies/:id` | Atualizar empresa | JWT |
| DELETE | `/api/v1/linkedin/companies/:id` | Remover empresa | JWT |
| POST | `/api/v1/linkedin/contacts` | Cadastrar recrutador/colaborador | JWT |
| GET | `/api/v1/linkedin/contacts` | Listar contatos | JWT |
| GET | `/api/v1/linkedin/contacts/:id` | Obter contato | JWT |
| PUT | `/api/v1/linkedin/contacts/:id` | Atualizar contato | JWT |
| DELETE | `/api/v1/linkedin/contacts/:id` | Remover contato | JWT |

## Etapas do Processo Seletivo

As etapas seguem a seguinte ordem:

```
Enviado → Feedback → Entrevista → Entrevista Técnica → Negociação → Contrato
```

## Autenticação JWT

Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <access_token>
```

O access token é obtido no endpoint `POST /api/v1/auth/login` e tem validade de **24 horas**.
O refresh token tem validade de **7 dias** e pode ser usado em `POST /api/v1/auth/refresh`.

## User Stories (Jira - JOBAPP)

| Story | Funcionalidade |
|-------|---------------|
| JOBAPP-6 | Registrar novo usuário |
| JOBAPP-7 | Autenticar usuário com JWT |
| JOBAPP-8 | Cadastrar oferta de emprego |
| JOBAPP-9 | Enviar currículo personalizado |
| JOBAPP-10 | Registrar etapa do processo seletivo |
| JOBAPP-11 | Cadastrar perfil LinkedIn de empresa |
| JOBAPP-12 | Cadastrar perfil LinkedIn de recrutador/colaborador |

## Health Check

```
GET /health
```

## Licença

MIT

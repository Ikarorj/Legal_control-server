# LegalControl Server — Backend do Sistema de Gestão de Processos Jurídicos

Este repositório contém o backend do LegalControl, um sistema web moderno para gerenciamento de processos jurídicos.

O backend é responsável por:

- Implementar regras de negócio e autenticação segura
- Gerenciar a persistência de dados criptografados no banco PostgreSQL
- Expor uma API REST para o frontend consumir
- Garantir a segurança e integridade das informações usando Google Cloud KMS para criptografia

O frontend do sistema está disponível neste repositório: [client-process-portal](https://github.com/igordev23/client-process-portal).

## 🎯 Objetivo do Backend

Fornecer uma base sólida e segura para que advogados, funcionários e clientes possam gerenciar informações jurídicas de forma confiável, eliminando o uso de planilhas manuais e riscos associados.

## 📋 Contexto do Projeto

Atualmente, a gestão de processos jurídicos é feita manualmente em planilhas, com riscos de erros, falta de segurança e dificuldades de acesso remoto. O backend do LegalControl oferece:

- API centralizada para controle de clientes, processos e usuários
- Criptografia avançada para proteger dados sensíveis
- Estrutura modular em Node.js + TypeScript para escalabilidade
- Integração com frontend moderno hospedado no Render

## 🚀 Tecnologias e Ferramentas

- **Node.js 18+** com **TypeScript**
- **Express 5**
- **PostgreSQL** (via `pg`)
- **Google Cloud KMS** para criptografia (`@google-cloud/kms` + `crypto-js`)
- **Bcrypt** para hash de senhas (`bcrypt` e `bcryptjs`)
- **Dotenv** para variáveis de ambiente
- **CORS** para controle de acesso

## 📁 Organização do Projeto

```
legal_control-server-main/
├── dist/               # Código compilado JavaScript (build)
├── node_modules/       # Dependências instaladas
├── src/                # Código-fonte TypeScript
│   ├── controllers/    # Lógica dos endpoints (ex: clients.controller.ts)
│   ├── routes/         # Definição das rotas (ex: clients.routes.ts)
│   ├── services/       # Serviços auxiliares (ex: kmsService.ts, db.ts)
│   ├── db.ts           # Configuração da conexão com o banco
│   ├── kms.ts          # Configuração Google Cloud KMS
│   ├── seedUsers.ts    # Script para popular usuários iniciais
│   └── server.ts       # Ponto de entrada do servidor
├── .env                # Variáveis de ambiente (não versionado)
├── .gitignore          # Arquivos ignorados pelo Git
├── kms.json            # Credenciais Google Cloud KMS (não versionado)
├── package.json        # Configuração do npm
├── package-lock.json   # Lockfile do npm
├── README.md           # Documentação do projeto
├── tsconfig.json       # Configuração do TypeScript

```

## 🛠️ Rodando localmente

### Passos

```bash
# Clonar repo
git clone https://github.com/seu-usuario/legal_control-server.git
cd legal_control_server

# Instalar dependências
npm install

# Criar arquivo .env (exemplo abaixo)
cp .env.example .env

# Rodar em desenvolvimento (ts-node)
npm run dev

# Compilar para JavaScript (dist/)
npm run build

# Rodar em produção
npm start
```

### Variáveis de Ambiente (`.env`)

```env
PORT=5000
NODE_ENV=development

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=legalcontrol
PG_USER=postgres
PG_PASSWORD=senha_segura

# Google Cloud KMS
GOOGLE_APPLICATION_CREDENTIALS=./kms.json
KMS_KEY_NAME=projects/seu-projeto/locations/global/keyRings/seu-keyring/cryptoKeys/sua-chave
```

## ⚙️ Funcionalidades Principais

- CRUD completo para clientes, com criptografia de campos sensíveis
- Hash seguro de senhas para usuários (via bcrypt)
- Endpoints para gerenciamento de processos, usuários e configurações
- Tratamento de erros e respostas JSON padronizadas

## 🔗 Integração com Frontend

O backend serve dados e regras para o frontend hospedado no Render. As URLs da API devem ser configuradas no frontend conforme a URL do backend em produção.

## 🤝 Contribuindo

1. Faça um fork deste repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Commit suas alterações (`git commit -m "feat: descrição da feature"`)
4. Push para sua branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

## 📄 Licença

Projeto licenciado sob ISC License.

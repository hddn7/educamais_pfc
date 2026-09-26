O educa+ é uma plataforma web onde o usuário escolhe uma matéria e um assunto, responde questões dissertativas e recebe, em vez de um simples "certo ou errado", uma correção explicada gerada por IA.

A proposta central é a adaptatividade: o sistema acompanha o desempenho do usuário e ajusta o conteúdo apresentado, oferecendo retorno claro, objetivo e previsível — características importantes para o público com Transtorno do Espectro Autista (TEA), que muitas vezes é prejudicado por interfaces sobrecarregadas e feedbacks vagos.

Objetivos
Permitir que o usuário aperfeiçoe conhecimentos de forma autônoma.
Fornecer correção textual explicativa, e não apenas uma nota.
Manter uma interface limpa, de baixa carga cognitiva e navegação consistente.
Registrar histórico de respostas para acompanhamento da evolução.
Tecnologias utilizadas
Front end
Tecnologia	Uso
HTML5	Estrutura das páginas
CSS3	Estilização e responsividade
JavaScript (ES6+)	Lógica de interface e consumo da API
Bootstrap 5	Navbar, carousel, grid e componentes responsivos
React.js	Previsto caso a interface exija maior componentização
Back end
Tecnologia	Uso
Node.js	Ambiente de execução do servidor
Express	Framework para as rotas da API REST
mysql2	Driver de conexão com o banco de dados
JWT (jsonwebtoken)	Autenticação por token
bcrypt	Hash das senhas
dotenv	Variáveis de ambiente e chaves sensíveis
Banco de dados
Tecnologia	Uso
MySQL	Banco relacional (pfc_aprendizagem)
SQL	Scripts de criação e carga (PFC.sql)
Inteligência Artificial
Tecnologia	Uso
API de IA externa	Análise das respostas e geração das explicações
API REST própria	Camada que integra front end, back end, banco e serviço de IA
Ferramentas e gestão
Ferramenta	Uso
Git / GitHub	Versionamento do código
GitHub Project	Gestão das tarefas
GitHub Pages	Publicação das entregas de front end
Scrum	Metodologia de desenvolvimento
Postman / Insomnia	Testes dos endpoints
Arquitetura
┌──────────────────────────────┐
│  Front end                   │
│  HTML5 / CSS3 / JS / Bootstrap│
└──────────────┬───────────────┘
               │ HTTP (JSON)
               ▼
┌──────────────────────────────┐
│  API REST — Node.js / Express│
│  Autenticação JWT + bcrypt   │
│  Regras de negócio           │
└──────┬──────────────┬────────┘
       │              │
       ▼              ▼
┌──────────────┐  ┌────────────────────┐
│  MySQL       │  │  API de IA externa │
│  pfc_aprendi-│  │  correção +        │
│  zagem       │  │  explicação        │
└──────────────┘  └────────────────────┘

O front end nunca conversa diretamente com a IA nem com o banco: toda comunicação passa pela API REST própria, que centraliza autenticação, validação e persistência.

Modelo de dados

Banco: pfc_aprendizagem

Tabela	Descrição
usuarios	Dados de cadastro, senha em hash e campo papel (ALUNO / PROFESSOR / ADMIN)
materias	Áreas de conhecimento disponíveis
assuntos	Subdivisões de cada matéria
questoes	Enunciados, vínculo com professor_id e resposta_esperada

A resposta_esperada é o parâmetro enviado à IA junto com a resposta do usuário, servindo de referência para a correção.

Estrutura de pastas
pfc-projeto/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/
│   └── .env
├── frontend/
│   ├── index_bootstrap.html
│   ├── front_end.html
│   ├── script.js
│   └── css/
└── database/
    └── PFC.sql
Como executar
Pré-requisitos
Node.js 18 ou superior
MySQL 8 ou superior
Chave de acesso à API de IA
Passo a passo
bash
# 1. Clonar o repositório
git clone https://github.com/<usuario>/educa-mais.git
cd educa-mais

# 2. Criar o banco de dados
mysql -u root -p < database/PFC.sql

# 3. Instalar as dependências do back end
cd backend
npm install

# 4. Configurar as variáveis de ambiente
cp .env.example .env

# 5. Subir o servidor
npm start
Variáveis de ambiente
env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pfc_aprendizagem
JWT_SECRET=
IA_API_KEY=
IA_API_URL=
PORT=3000

O front end pode ser aberto diretamente pelo navegador ou servido por Live Server.

Endpoints principais
Método	Rota	Descrição
POST	/api/usuarios/cadastro	Cria um novo usuário
POST	/api/usuarios/login	Autentica e devolve o token JWT
GET	/api/materias	Lista as matérias
GET	/api/assuntos/:materiaId	Lista os assuntos de uma matéria
GET	/api/questoes/:assuntoId	Retorna as questões do assunto
POST	/api/respostas	Envia a resposta e devolve a correção da IA
GET	/api/historico	Histórico de respostas do usuário autenticado

Rotas protegidas exigem o cabeçalho Authorization: Bearer <token>.

Segurança
Senhas armazenadas apenas em hash, nunca em texto puro.
Autenticação por token JWT com expiração.
Controle de acesso aos dados conforme o papel do usuário.
Chaves e credenciais isoladas em variáveis de ambiente, fora do versionamento.
Validação e sanitização das entradas para evitar SQL Injection.
Testes
Testes manuais dos endpoints via Postman/Insomnia.
Testes de integração entre API e serviço de IA.
Testes de usabilidade com foco em acessibilidade e baixa carga cognitiva.
Documentação

A documentação técnica completa do projeto contempla:

Levantamento de requisitos funcionais e não funcionais
Casos de uso
Diagrama de arquitetura
MER e modelo lógico
Diagrama de classes
Especificação das APIs
Tecnologias empregadas
Plano de segurança e de testes
Equipe
Integrante	Curso	Período
Henry Dyoji Nomura	Sistemas de Informação — UMC	8º (turma B)

Metodologia: Scrum, com gestão de tarefas no GitHub Project.

Status

🚧 Em desenvolvimento.

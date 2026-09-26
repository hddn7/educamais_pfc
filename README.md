# Questio PFC

Protótipo acadêmico de aprendizagem adaptativa com interface acessível, cadastro e login, registro de auditoria e consulta de CEP pelo ViaCEP.

## Requisitos

- Node.js 20 ou superior
- npm

## Executar localmente

```powershell
npm install
Copy-Item .env.example .env
```

Edite `.env` e substitua `SESSION_SECRET` por um valor aleatório com pelo menos 32 caracteres. Depois, inicie a aplicação:

```powershell
npm run dev
```

Abra `http://localhost:3000`. O banco SQLite é criado automaticamente em `data/questio.sqlite`.

## Recursos

- Cadastro com nome, e-mail, senha de no mínimo 10 caracteres e aceite registrado de termos e privacidade.
- Entrada e saída de conta com senha protegida por bcrypt, cookie de sessão HTTP-only e sessão persistida em SQLite.
- Limite de tentativas de autenticação e trilha de auditoria com eventos de conta, data/hora, IP e navegador.
- Consulta de CEP via servidor, sem armazenar CEP ou endereço no Questio PFC.
- Páginas de termos e privacidade identificadas como minutas acadêmicas.

## Antes de uso real

Os textos legais são minutas e precisam de revisão jurídica, identificação do controlador e canal de contato. A hospedagem deve usar HTTPS, segredo de sessão próprio e controles operacionais adequados. Como o público pode incluir crianças e adolescentes e envolver dados de saúde, valide os requisitos da LGPD e do melhor interesse com a instituição responsável. Este protótipo não coleta dados clínicos.

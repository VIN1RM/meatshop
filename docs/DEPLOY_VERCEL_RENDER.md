# Deploy de testes na Vercel e Render

Este guia registra o ambiente gratuito usado para homologação do MeatShop. Ele não contém senhas, tokens, URLs de conexão do PostgreSQL nem credenciais de terceiros.

## Ambiente atual

| Componente | Serviço | Endereço público |
| --- | --- | --- |
| Painel web 3.5.0 | Vercel | <https://meatshop-five.vercel.app> |
| API 3.5.0 | Render Web Service | <https://meatshop-api-qvt6.onrender.com> |
| PostgreSQL 18 | Render Postgres Free | Sem endereço público documentado |

O ambiente é exclusivamente de testes. O Web Service gratuito da Render pode dormir após um período sem tráfego, portanto a primeira requisição pode demorar aproximadamente um minuto. O PostgreSQL gratuito expira 30 dias após a criação e não deve armazenar dados que precisem ser preservados.

## Vercel

Importe `VIN1RM/meatshop` com estas opções:

| Opção | Valor |
| --- | --- |
| Branch de produção | `main` |
| Framework | Next.js |
| Root Directory | `meatshop-main` |
| Build Command | `npm run build` |
| Node.js | 22 |

Cadastre as variáveis abaixo como **Config** e somente no ambiente **Production**:

```dotenv
API_PROXY_TARGET=https://meatshop-api-qvt6.onrender.com
NEXT_PUBLIC_API_URL=https://meatshop-five.vercel.app/api
CYPRESS_INSTALL_BINARY=0
```

`CYPRESS_INSTALL_BINARY=0` impede que o build de produção baixe o binário do Cypress. O pacote permanece disponível para os testes E2E executados no GitHub Actions.

O painel usa o proxy `/api` para que cookies de autenticação e CSRF sejam emitidos no domínio da Vercel. As variáveis opcionais de mapas podem permanecer ausentes; nesse caso, o frontend usa os tiles públicos do OpenStreetMap:

```dotenv
NEXT_PUBLIC_MAP_STYLE_URL=
NEXT_PUBLIC_MAP_TILE_URL=
NEXT_PUBLIC_MAP_ATTRIBUTION=© OpenStreetMap contributors
```

## Render Web Service

O backend usa o Dockerfile `meatshop-backend/Dockerfile`. O comando definido no `render.yaml` é:

```text
npm run start:render
```

Esse comando executa todas as migrations pendentes antes de iniciar a API. A API deve usar estas configurações públicas:

```dotenv
NODE_ENV=production
DB_TYPE=postgres
DB_SSL=true
DB_SYNCHRONIZE=false
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
TRUST_PROXY=true
SWAGGER_ENABLED=false
FRONTEND_URL=https://meatshop-five.vercel.app
CORS_ORIGINS=https://meatshop-five.vercel.app
BACKEND_PUBLIC_URL=https://meatshop-api-qvt6.onrender.com
```

As credenciais do PostgreSQL devem vir dos campos da conexão **Internal** do banco Render localizado no mesmo workspace e na mesma região da API:

```dotenv
DB_HOST=<internal-hostname>
DB_PORT=5432
DB_USERNAME=<database-user>
DB_PASSWORD=<database-password>
DB_DATABASE=<database-name>
```

Nunca registre esses cinco valores reais no Git, em issues, capturas públicas ou documentação.

## Segredos e integrações da API

O `render.yaml` e `meatshop-backend/.env.example` são a referência completa de nomes. Os valores abaixo devem ser gerados ou cadastrados diretamente na Render:

- autenticação e criptografia: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DELIVERY_CODE_SECRET`, `DELIVERY_CODE_ENCRYPTION_KEY`, `DATA_ENCRYPTION_KEY`, `DATA_HASH_KEY` e `METRICS_TOKEN`;
- autenticação externa: `FIREBASE_SERVICE_ACCOUNT` e `FIREBASE_WEB_API_KEY`;
- arquivos: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET`;
- e-mail: `RESEND_API_KEY` e `RESEND_FROM`, ou as variáveis SMTP descritas no `.env.example`;
- pagamentos, quando habilitados: variáveis `MP_*` e `PAYMENTS_ENABLED`;
- chatbot, quando habilitado: `AI_CHATBOT_URL` e `AI_CHATBOT_SERVICE_KEY`.

Segredos devem ter valores diferentes entre ambientes e nunca devem ser copiados para o frontend.

## Renovação mensal do PostgreSQL gratuito

O banco gratuito é descartável. Para substituí-lo:

1. Crie um novo Render Postgres Free na mesma região da API.
2. Aguarde o status `Available`.
3. Copie os cinco campos da conexão Internal para `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` e `DB_DATABASE` do Web Service.
4. Confirme `DB_SSL=true` e salve as variáveis.
5. Aguarde o deploy. `start:render` aplicará as migrations no banco vazio.
6. Valide health check, criação de unidade, logout e login.
7. Exclua o banco expirado somente depois da validação.

O `render.yaml` usa `meatshop-db` como nome baseline para uma instalação nova. Um banco substituto criado manualmente pode aparecer como `meatshop-db-v2`, `meatshop-db-v3` ou outro nome; nesse caso, a conexão efetiva é determinada pelas variáveis `DB_*` do Web Service.

## Verificações

Execute os seguintes checks após qualquer alteração de infraestrutura:

```text
GET https://meatshop-api-qvt6.onrender.com/health
GET https://meatshop-five.vercel.app/api/health
GET https://meatshop-five.vercel.app/api/auth/csrf
```

Resultados esperados:

- os dois health checks retornam HTTP `200`;
- o endpoint CSRF retorna HTTP `200` e um cookie `csrf_token` com `HttpOnly`, `Secure` e `SameSite=Lax`;
- criação de unidade, logout e novo login funcionam pelo painel;
- um push na `main` dispara GitHub Actions e apenas o projeto Vercel pertencente a `VIN1RM`.

## Diagnóstico rápido

- Frontend abre, mas `/api/health` não responde: confira o status da API e do PostgreSQL na Render.
- API retorna `502` ou falha ao iniciar: confira os logs, os cinco `DB_*` e a disponibilidade do banco.
- Build da Vercel falha baixando Cypress: confirme `CYPRESS_INSTALL_BINARY=0` em Production.
- Login não mantém sessão: confirme o uso de `NEXT_PUBLIC_API_URL` com `/api`, as opções de cookie e o redeploy após alterar variáveis `NEXT_PUBLIC_*`.
- Primeiro acesso demora: aguarde o cold start do Web Service gratuito e tente novamente.

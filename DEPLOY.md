# Titans Tech - Guia de Deploy com SST + ECS/Fargate

Este documento descreve como fazer o deploy da aplicação Titans Tech usando SST v3 com AWS ECS/Fargate.

## Arquitetura

- **Frontend (Next.js)**: Roda em ECS/Fargate com containers Docker
- **Backend (NestJS)**: Roda em ECS/Fargate com containers Docker
- **Banco de Dados**: PostgreSQL RDS
- **Cache**: Redis ElastiCache
- **Armazenamento**: S3 para uploads
- **CDN**: CloudFront para distribuição de conteúdo

## Ambientes

- **Development**: Desenvolvimento local
- **Staging**: Ambiente de homologação
- **Production**: Ambiente de produção

## Pré-requisitos

1. **AWS CLI** configurado:

```bash
aws configure
```

2. **SST CLI** instalado:

```bash
npm install -g sst
```

3. **Docker** instalado e rodando

4. **Node.js** v18+ instalado

## Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.sst.example .env.sst
```

Edite `.env.sst` com suas configurações:

- Credenciais do banco de dados
- JWT Secret
- SMTP configurações
- API Keys (Google Maps, Stripe, etc.)

### 3. Configurar Secrets no SST

Para cada ambiente, configure os secrets necessários:

```bash
# Staging
sst secret set DATABASE_USERNAME postgres --stage staging
sst secret set DATABASE_PASSWORD your_password --stage staging
sst secret set JWT_SECRET your_jwt_secret --stage staging
# ... adicione outros secrets

# Production
sst secret set DATABASE_USERNAME postgres --stage production
sst secret set DATABASE_PASSWORD your_password --stage production
sst secret set JWT_SECRET your_jwt_secret --stage production
# ... adicione outros secrets
```

## Deploy

### Deploy para Staging (Homologação)

```bash
# Build da aplicação
npm run build

# Deploy para staging
npm run deploy:staging
```

ou diretamente:

```bash
sst deploy --stage staging
```

### Deploy para Production

```bash
# Build da aplicação
npm run build

# Deploy para produção
npm run deploy:prod
```

ou diretamente:

```bash
sst deploy --stage production
```

## Desenvolvimento Local

### Com Docker Compose

Para rodar toda a stack localmente com Docker:

```bash
# Subir os containers
docker compose -f docker-compose.ecs.yml up -d

# Ver logs
docker compose -f docker-compose.ecs.yml logs -f

# Parar os containers
docker compose -f docker-compose.ecs.yml down
```

Isso irá rodar:

- Frontend em http://localhost:3000
- Backend em http://localhost:3001
- PostgreSQL em localhost:5432
- Redis em localhost:6379
- LocalStack para simular AWS em localhost:4566

### Com SST Dev

Para desenvolvimento com hot-reload e integração com AWS:

```bash
npm run sst:dev
```

## URLs e Subdomínios

### Development

- Frontend: http://localhost:3000
- Admin: http://admin.localhost:3000
- API: http://localhost:3001

### Staging

- Frontend: https://staging.titans-tech.com
- API: https://api-staging.titans-tech.com

### Production

- Frontend: https://app.titans-tech.com
- Admin: https://admin.titans-tech.com
- Website: https://www.titans-tech.com
- API: https://api.titans-tech.com

## Configurar Domínios (Production)

1. Configure o Route53 com seus domínios
2. Crie certificados SSL no ACM (us-east-1)
3. Atualize as configurações de domínio em `stacks/frontend.ts` e `stacks/backend.ts`

## Monitoramento

### Logs

Ver logs das aplicações:

```bash
# Staging
sst console --stage staging

# Production
sst console --stage production
```

### Health Checks

- Backend: `GET /health`

## Comandos Úteis

### SST

```bash
# Listar todos os secrets
npm run sst:secrets:list

# Definir um secret
npm run sst:secrets:set

# Remover stack de staging
npm run sst:remove:staging

# Remover stack de produção (CUIDADO!)
npm run sst:remove:prod

# Abrir console SST
npm run sst:console
```

### Docker

```bash
# Build das imagens localmente
docker build -t titans-backend -f apps/backend/Dockerfile .
docker build -t titans-frontend -f apps/dashboard/Dockerfile .

# Rodar containers individualmente
docker run -p 3001:3001 titans-backend
docker run -p 3000:3000 titans-frontend
```

## Troubleshooting

### Problema: Deploy falha com erro de permissões

**Solução**: Verifique se seu usuário AWS tem as permissões necessárias para ECS, RDS, VPC, etc.

### Problema: Health check falhando

**Solução**:

1. Verifique se os endpoints `/health` estão funcionando
2. Aumente o `startPeriod` no health check
3. Verifique os logs do container

### Problema: Erro de conexão com banco de dados

**Solução**:

1. Verifique as configurações de VPC e Security Groups
2. Confirme que o DATABASE_URL está correto
3. Verifique se o RDS está acessível

### Problema: Frontend não consegue conectar ao backend

**Solução**:

1. Verifique se NEXT_PUBLIC_API_URL está configurado corretamente
2. Verifique CORS no backend
3. Confirme que o backend está rodando e acessível

## Rollback

Para fazer rollback de um deploy:

```bash
# Listar todas as versões
sst list --stage production

# Deploy de uma versão específica
sst deploy --stage production --version <version-id>
```

## Custos Estimados (AWS)

### Staging

- ECS Fargate: ~$20/mês
- RDS (db.t3.micro): ~$15/mês
- Redis (cache.t3.micro): ~$13/mês
- Total: ~$50/mês

### Production

- ECS Fargate: ~$100/mês (com auto-scaling)
- RDS (db.t3.small): ~$30/mês
- Redis (cache.t3.micro): ~$13/mês
- CloudFront: ~$10/mês
- Total: ~$150-200/mês

## Suporte

Para problemas ou dúvidas:

1. Verifique os logs no CloudWatch
2. Use `sst console` para debug
3. Consulte a documentação do SST: https://sst.dev

## Segurança

- **Nunca** commite arquivos `.env` ou `.env.sst`
- Use sempre secrets do SST para informações sensíveis
- Mantenha as dependências atualizadas
- Configure backup automático do RDS
- Use MFA na conta AWS de produção

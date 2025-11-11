# Análise Técnica: AWS Amplify vs EC2 para Deploy do Next.js

**Autor**: Time de Engenharia Titans Tech
**Data**: 2025-11-11
**Propósito**: Análise técnica para escolha da plataforma de deploy do frontend Next.js

---

## Sumário Executivo

Este documento apresenta uma análise técnica comparando **AWS Amplify Hosting** e **AWS EC2** para o deploy da aplicação Next.js do projeto Titans Tech.

**Conclusão**: Devido à arquitetura **multi-tenant com subdomínios dinâmicos** (`*.dominio.com`), o AWS Amplify não atende os requisitos técnicos do sistema. A solução recomendada é **EC2 com Docker e Nginx**.

---

## 1. Contexto do Sistema

### 1.1 Arquitetura Multi-Tenant

O sistema Titans Tech utiliza **subdomínios dinâmicos** para segregar clientes:

- **Domínio raiz** (`titanstech.com`): Painel administrativo do sistema
- **Subdomínios de empresas** (`empresa1.titanstech.com`, `empresa2.titanstech.com`): Dashboards específicos de cada cliente
- **API Backend** (`api.titanstech.com`): Servidor NestJS

### 1.2 Requisito Crítico: Wildcard Subdomains

```javascript
// apps/dashboard/src/proxy.ts
// Sistema de roteamento baseado em subdomínios

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = extractSubdomain(hostname);

  if (subdomain && subdomain !== 'www') {
    // Redireciona empresa1.titanstech.com → /s/empresa1/*
    const url = request.nextUrl.clone();
    url.pathname = `/s/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Domínio raiz → painel admin
  return NextResponse.next();
}
```

**Por que isso importa?**
- Novos clientes criam novos subdomínios **dinamicamente** via aplicação
- Não é possível pré-configurar cada subdomínio manualmente
- Requer DNS **wildcard** (`*.titanstech.com`) apontando para a mesma infraestrutura

---

## 2. Análise do AWS Amplify

### 2.1 O que é AWS Amplify Hosting?

AWS Amplify Hosting é um serviço **gerenciado** para deploy de aplicações frontend, similar à Vercel ou Netlify:

- **Build automático**: Git push → Deploy
- **CDN global**: CloudFront incluído
- **SSL automático**: Certificados gerenciados
- **Suporte SSR**: Next.js 12-15 com Server-Side Rendering
- **Zero configuração**: Sem gerenciamento de servidores

### 2.2 Recursos Suportados

✅ **Funcionam perfeitamente:**
- Next.js SSR (Server-Side Rendering)
- Next.js SSG (Static Site Generation)
- API Routes do Next.js
- Build automático via Git
- SSL/HTTPS automático
- Preview deployments (PR previews)

### 2.3 Limitação Crítica: Wildcard Subdomains

❌ **Problema identificado:**

**AWS Amplify NÃO suporta wildcard subdomains (`*.dominio.com`) nativamente.**

**Como o Amplify gerencia domínios:**
1. Cada domínio/subdomínio deve ser **adicionado manualmente** no console:
   ```
   Amplify Console → App Settings → Domain management
   → Add domain: empresa1.titanstech.com
   → Add domain: empresa2.titanstech.com
   → Add domain: empresa3.titanstech.com
   ...
   ```

2. Para cada domínio, você precisa:
   - Configurar DNS manualmente
   - Validar propriedade
   - Aguardar provisionamento de certificado SSL

**Por que isso não funciona para nosso sistema?**
- ❌ Clientes criam empresas **dinamicamente** via aplicação
- ❌ Cada nova empresa = novo subdomínio
- ❌ Impossível adicionar subdomínios manualmente toda vez
- ❌ Amplify não suporta wildcard DNS resolution

### 2.4 Soluções Alternativas Avaliadas

#### Opção A: CloudFront + Lambda@Edge

**Ideia**: Usar CloudFront na frente do Amplify + Lambda@Edge para rotear subdomínios.

```
Route53 (*.titanstech.com)
    ↓
CloudFront (wildcard SSL)
    ↓
Lambda@Edge (reescreve Host header)
    ↓
Amplify (recebe requisições)
```

**Problemas:**
- ❌ **Complexidade**: Requer configuração avançada de Lambda@Edge
- ❌ **Custo**: Lambda@Edge é caro ($0.60 por milhão de requests vs $0.20 no Lambda normal)
- ❌ **Latência**: Adiciona processamento extra em cada request
- ❌ **Debugging**: Difícil debugar problemas em produção
- ❌ **Over-engineering**: Solução muito complexa para o problema

**Estimativa de custo adicional**: +$20-50/mês (Lambda@Edge + CloudFront)

#### Opção B: Application Load Balancer + Amplify

**Ideia**: ALB na frente do Amplify para rotear subdomínios.

```
Route53 (*.titanstech.com)
    ↓
Application Load Balancer (wildcard routing)
    ↓
Amplify (target group)
```

**Problemas:**
- ❌ **Custo**: ALB custa ~$16-20/mês + $0.008 por LCU-hora
- ❌ **Complexidade**: Configuração não trivial
- ❌ **Não ideal**: Amplify não foi projetado para funcionar assim
- ❌ **Perda de benefícios**: Perde deploy automático, preview PRs, etc.

**Custo total estimado**: ~$45-60/mês (Amplify + ALB)

#### Opção C: Subpath Routing (sem subdomínios)

**Ideia**: Usar paths ao invés de subdomínios.

```
titanstech.com/empresa1/*  → Dashboard empresa 1
titanstech.com/empresa2/*  → Dashboard empresa 2
```

**Problemas:**
- ❌ **Refatoração massiva**: Requer reescrever todo o sistema de roteamento
- ❌ **UX inferior**: URLs feias, menos profissional
- ❌ **Cookies/autenticação**: Mais complexo de gerenciar
- ❌ **Branding**: Clientes esperam seus próprios subdomínios

**Impacto**: 2-3 semanas de refatoração

---

## 3. Análise da Solução EC2

### 3.1 Arquitetura Proposta

```
Route53 (*.titanstech.com)
    ↓
EC2 t3.small
    ├── Nginx (Port 80/443)
    │   ├── SSL termination (Let's Encrypt)
    │   └── Subdomain routing
    ├── Frontend (Docker :3000)
    └── Backend (Docker :4000)
```

### 3.2 Vantagens

✅ **Funciona perfeitamente com wildcard subdomains:**
```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name *.titanstech.com titanstech.com;

    # Nginx preserva o Host header automaticamente
    proxy_set_header Host $host;
    proxy_pass http://frontend:3000;
}
```

✅ **Controle total:**
- Configuração de DNS
- Certificados SSL (Let's Encrypt gratuito)
- Logs e monitoramento
- Debugging via SSH

✅ **Custo previsível:**
- EC2 t3.small: $15.18/mês (fixo)
- Sem surpresas com tráfego
- Escalável (upgrade para t3.medium: $30/mês)

✅ **Backend + Frontend na mesma máquina:**
- Reduz custos (1 instância para tudo)
- Latência zero entre frontend/backend
- Simplifica networking

✅ **CI/CD simples:**
- GitHub Actions → SSH → Docker restart
- Rollback automático em caso de falha
- Logs claros no GitHub Actions

✅ **Aprendizado:**
- Entendimento profundo da infraestrutura
- Experiência com Docker, Nginx, SSL
- Preparação para escalar depois

### 3.3 Desvantagens

❌ **Gerenciamento manual:**
- Você gerencia a instância EC2
- Updates de segurança (automatizável)
- Monitoramento (CloudWatch resolve)

❌ **Sem CDN global:**
- Latência maior para usuários distantes
- Mitigação: CloudFront pode ser adicionado depois

❌ **Escalabilidade manual:**
- Para escalar: Load Balancer + múltiplas EC2s
- Não é problema agora (tráfego baixo)

❌ **Responsabilidade por uptime:**
- Você gerencia backups, monitoring, alertas
- Mitigação: CloudWatch Alarms + SNS

### 3.4 Quando Migrar?

**Amplify pode fazer sentido no futuro se:**
1. Sistema for refatorado para **remover multi-tenancy por subdomínios**
2. Adotar subpath routing: `titanstech.com/empresas/[slug]/*`
3. Volume de tráfego justificar CDN global (>10k req/dia)
4. Time não quiser gerenciar infraestrutura

**Estimativa de esforço para migrar depois:**
- Dockerfiles já prontos (portabilidade)
- 1-2 dias para setup no Amplify
- 2-3 semanas para refatorar roteamento (se remover subdomínios)

---

## 4. Comparação de Custos

### 4.1 Custos Mensais (Tráfego Baixo - 2 meses de testes)

| Item | AWS Amplify | EC2 t3.small |
|------|-------------|--------------|
| Computação | $0 (build free tier) | $15.18 |
| Tráfego (5GB) | $0 (free tier) | $0.45 |
| SSL | Incluído | Grátis (Let's Encrypt) |
| DNS | $0.50 (Route53) | $0.50 (Route53) |
| Logs | $2-3 (CloudWatch) | $2-3 (CloudWatch) |
| **Subtotal** | **$2.50-3.50** | **$18-20** |
| **Wildcard support** | ❌ Não funciona | ✅ Funciona |
| **Lambda@Edge (se necessário)** | +$20-30 | - |
| **ALB (se necessário)** | +$16-20 | - |
| **TOTAL REAL** | **$40-55/mês** ⚠️ | **$18-20/mês** ✅ |

### 4.2 Custos Mensais (Tráfego Médio - Produção)

| Item | AWS Amplify | EC2 t3.small |
|------|-------------|--------------|
| Computação | $10-15 (builds) | $15.18 |
| Tráfego (50GB) | $7.50 | $4.50 |
| SSL | Incluído | Grátis |
| DNS | $0.50 | $0.50 |
| Logs | $5-10 | $5-10 |
| **Sem workarounds** | **$23-30** ❌ Não funciona | **$25-30** ✅ |
| **Com Lambda@Edge** | **$50-70** ⚠️ | **$25-30** ✅ |

### 4.3 Análise de Custo-Benefício

**Para tráfego baixo (agora):**
- ✅ EC2 é mais barato e funciona
- ❌ Amplify não funciona sem workarounds caros

**Para tráfego alto (futuro):**
- ⚖️ Custos similares (~$30-40/mês)
- ⚖️ EC2 requer mais gerenciamento
- ⚖️ Amplify requer workarounds complexos

**Conclusão**: EC2 é mais vantajoso em ambos os cenários.

---

## 5. Comparação Funcional

| Característica | AWS Amplify | EC2 + Docker |
|----------------|-------------|--------------|
| **Wildcard subdomains** | ❌ Não suportado | ✅ Suportado |
| **Setup inicial** | 1-2 horas | 4-6 horas |
| **CI/CD** | Nativo | GitHub Actions |
| **SSL/HTTPS** | Automático | Let's Encrypt (5 min) |
| **Monitoramento** | Automático | CloudWatch (manual) |
| **Escalabilidade** | Automática | Manual (ALB) |
| **Debugging** | Console only | SSH + Logs |
| **Controle** | Limitado | Total |
| **Vendor lock-in** | Alto | Médio |
| **Portabilidade** | Baixa | Alta (Docker) |
| **Custo (low traffic)** | $40-55* | $18-20 |
| **Custo (high traffic)** | $50-70* | $30-40 |

\* Com workarounds para wildcard subdomains

---

## 6. Recomendação Final

### 6.1 Decisão Técnica

**Recomendamos deploy em EC2 com Docker + Nginx** pelos seguintes motivos:

1. ✅ **Requisito funcional crítico atendido**: Wildcard subdomains funcionam nativamente
2. ✅ **Custo-benefício**: Mais barato que Amplify + workarounds
3. ✅ **Simplicidade arquitetural**: Menos componentes = menos pontos de falha
4. ✅ **Portabilidade**: Docker facilita migração futura (ECS, EKS, outro cloud)
5. ✅ **Aprendizado**: Time ganha experiência com infraestrutura real

### 6.2 Trade-offs Aceitáveis

**O que perdemos vs Amplify ideal:**
- ❌ Preview deployments automáticos (PRs)
- ❌ CDN global (pode adicionar CloudFront depois)
- ❌ Zero-config deploys

**Por que são aceitáveis:**
- Preview PRs: Não crítico para fase inicial
- CDN global: Tráfego será brasileiro (baixa latência)
- Zero-config: CI/CD com GitHub Actions compensa

### 6.3 Caminho de Evolução

**Curto prazo (0-6 meses):**
- ✅ Deploy EC2 + Docker
- ✅ Monitoramento com CloudWatch
- ✅ CI/CD com GitHub Actions

**Médio prazo (6-12 meses):**
- ⚖️ Avaliar migração para ECS Fargate (se escalar)
- ⚖️ Adicionar CloudFront para CDN (se necessário)
- ⚖️ Separar frontend e backend em instâncias diferentes

**Longo prazo (12+ meses):**
- ⚖️ Refatorar para remover multi-tenancy por subdomínios (se fizer sentido)
- ⚖️ Migrar para Amplify/Vercel (se arquitetura mudar)
- ⚖️ Kubernetes (EKS) se complexidade justificar

---

## 7. Considerações de Segurança

### 7.1 Amplify (Gerenciado)

✅ **Vantagens:**
- AWS gerencia patches de segurança
- WAF integrado (opcional, +$5/mês)
- DDoS protection automático (CloudFront)

❌ **Limitações:**
- Menos controle sobre security groups
- Difícil customizar firewall

### 7.2 EC2 (Autogerenciado)

✅ **Vantagens:**
- Controle total sobre security groups
- Firewall customizável (UFW)
- Logs detalhados de acesso

❌ **Responsabilidades:**
- Aplicar patches de segurança (automatizável)
- Configurar rate limiting (Nginx)
- Monitorar tentativas de intrusão

**Mitigações implementadas:**
- Security groups restritivos (SSH apenas do nosso IP)
- Nginx rate limiting configurado
- SSL/TLS 1.2+ apenas
- Security headers (HSTS, X-Frame-Options, etc.)
- Automatic security updates (unattended-upgrades)

---

## 8. Perguntas Frequentes

### Q1: "Por que não usamos Vercel? É mais fácil que Amplify."

**R**: Vercel tem a **mesma limitação** de wildcard subdomains. Você precisa adicionar cada domínio manualmente no dashboard, o que não escala para multi-tenancy dinâmico.

### Q2: "E se usarmos Amplify só para o frontend e EC2 para o backend?"

**R**: Ainda assim o frontend não conseguirá rotear subdomínios dinamicamente. O problema persiste.

### Q3: "Não dá para fazer wildcard no CloudFlare na frente do Amplify?"

**R**: CloudFlare pode fazer wildcard DNS, mas o Amplify ainda rejeita requisições de subdomínios não configurados. O problema é na camada do Amplify, não do DNS.

### Q4: "Mas o Amplify é mais 'serverless' e moderno, não é?"

**R**: "Serverless" é uma ferramenta, não uma solução universal. Para nosso caso de uso específico (wildcard subdomains), uma abordagem tradicional (EC2 + Nginx) é mais adequada.

### Q5: "E se um dia quisermos escalar muito?"

**R**: Migrar para ECS Fargate ou Kubernetes (EKS) é mais fácil partindo de Docker do que de Amplify. Nossos Dockerfiles são portáveis.

---

## 9. Referências

### Documentação AWS

- [Amplify Hosting - Custom domains](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)
- [CloudFront - Wildcard certificates](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-alternate-domain-names.html)
- [Lambda@Edge - Use cases](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [EC2 - Instance types](https://aws.amazon.com/ec2/instance-types/)

### Artigos e Discussões

- [Amplify doesn't support wildcard subdomains](https://github.com/aws-amplify/amplify-hosting/issues/1234) (GitHub issue)
- [Multi-tenancy with Next.js](https://vercel.com/guides/nextjs-multi-tenant-application)
- [Docker deployment best practices](https://docs.docker.com/develop/dev-best-practices/)

### Ferramentas Utilizadas

- [Let's Encrypt](https://letsencrypt.org/) - Certificados SSL gratuitos
- [Nginx](https://nginx.org/) - Reverse proxy e load balancer
- [Docker Compose](https://docs.docker.com/compose/) - Orquestração de containers
- [GitHub Actions](https://github.com/features/actions) - CI/CD

---

## 10. Conclusão

A decisão de usar **EC2 ao invés de Amplify** não é por preferência pessoal ou falta de conhecimento das ferramentas modernas, mas sim uma **escolha técnica fundamentada** baseada nos requisitos da aplicação.

**Wildcard subdomains dinâmicos** são um requisito arquitetural do sistema Titans Tech que **não pode ser comprometido**. AWS Amplify, apesar de ser uma excelente plataforma para muitos casos de uso, **não atende este requisito específico** sem workarounds complexos e caros.

A solução EC2 + Docker + Nginx é:
- ✅ **Tecnicamente sólida**
- ✅ **Economicamente viável**
- ✅ **Escalável para o futuro**
- ✅ **Educativa para o time**

**Esta decisão pode e deve ser revisitada** conforme o sistema evolui, mas para a fase atual de desenvolvimento e os próximos 6-12 meses, é a escolha correta.

---

**Documento elaborado por**: Time de Engenharia Titans Tech
**Revisado por**: [Seu nome]
**Data de revisão**: 2025-11-11
**Próxima revisão**: 2025-17-11 (6 meses)

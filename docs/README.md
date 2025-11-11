# Titans Tech Documentation

Welcome to the Titans Tech deployment documentation.

## 📚 Documentation Index

### Deployment Guides

1. **[Quick Deploy Guide](./DEPLOY_GUIDE.md)** - Start here!
   - Fast-track guide to get your application deployed
   - Step-by-step instructions
   - Estimated time: 4-6 hours

2. **[AWS Deployment Guide](./AWS_DEPLOYMENT.md)** - Complete reference
   - Detailed architecture overview
   - Comprehensive AWS setup instructions
   - Cost estimation and optimization
   - Monitoring and observability setup

3. **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - When things go wrong
   - Common issues and solutions
   - Diagnostic commands
   - Quick fixes for frequent problems

### Technical Documentation

4. **[Amplify vs EC2 Analysis](./AMPLIFY_VS_EC2.md)** - Architecture decision
   - Why we chose EC2 over AWS Amplify
   - Technical analysis of wildcard subdomain requirements
   - Cost comparison
   - Trade-offs and future migration path

## 🚀 Quick Start

If this is your first deployment:

1. Read [AMPLIFY_VS_EC2.md](./AMPLIFY_VS_EC2.md) to understand the architecture decision
2. Follow [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) for step-by-step deployment
3. Keep [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) handy for any issues

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────┐
│              Route53 DNS                         │
│   yourdomain.com + *.yourdomain.com (wildcard)   │
└─────────────────┬────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────┐
│          EC2 t3.small Instance                   │
│  ┌────────────────────────────────────────────┐  │
│  │   Nginx Reverse Proxy (Port 80/443)       │  │
│  │   - SSL Termination (Let's Encrypt)       │  │
│  │   - Subdomain routing for multi-tenancy   │  │
│  └──────────┬───────────────┬─────────────────┘  │
│             │               │                     │
│  ┌──────────▼──────┐  ┌────▼──────────────────┐  │
│  │  Frontend       │  │  Backend              │  │
│  │  (Next.js)      │  │  (NestJS)             │  │
│  │  Docker :3000   │  │  Docker :4000         │  │
│  └─────────────────┘  └───────────────────────┘  │
└───────────────────────────────────────────────────┘
                  │                    │
                  ▼                    ▼
       ┌──────────────────┐   ┌──────────────┐
       │ Supabase         │   │  AWS S3      │
       │ PostgreSQL       │   │  (Images)    │
       └──────────────────┘   └──────────────┘
```

## 📋 Prerequisites

Before starting deployment, ensure you have:

- [ ] AWS account with billing enabled
- [ ] Domain name purchased
- [ ] Supabase database URL
- [ ] AWS S3 bucket for images (configured: `titechjf-bucket`)
- [ ] GitHub repository access
- [ ] SSH client installed

## 💰 Cost Estimate

**Monthly AWS costs (approximate):**
- EC2 t3.small: $15.18
- EBS Storage: $1.60
- Route53: $0.50
- CloudWatch: $2-5
- Data Transfer: $1-2
- **Total: ~$20-25/month**

With $100 AWS credits: **~5 months free**

## 🛠️ Key Technologies

- **Infrastructure**: AWS EC2, Route53, CloudWatch
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **CI/CD**: GitHub Actions
- **Frontend**: Next.js 16 (App Router), React 19
- **Backend**: NestJS, Prisma
- **Database**: PostgreSQL (Supabase)
- **Storage**: AWS S3

## 📁 Repository Structure

```
titans-tech/
├── apps/
│   ├── dashboard/              # Next.js frontend
│   │   ├── Dockerfile          # ✅ Production ready
│   │   └── src/
│   └── backend/                # NestJS backend
│       ├── Dockerfile          # ✅ Production ready
│       └── src/
├── nginx/
│   ├── nginx.conf              # ✅ Reverse proxy config
│   ├── Dockerfile              # ✅ Nginx container
│   └── ssl/                    # SSL certificates (gitignored)
├── scripts/
│   ├── deploy.sh               # ✅ Automated deployment
│   └── setup-ec2.sh            # ✅ EC2 initialization
├── docs/                       # 📚 You are here
├── docker-compose.prod.yml     # ✅ Production orchestration
├── .env.production.example     # ✅ Environment template
└── .github/workflows/
    └── deploy.yml              # ✅ CI/CD pipeline
```

## 🎯 Multi-Tenant Subdomain Routing

The system uses **dynamic wildcard subdomains** for multi-tenancy:

- **Root domain** (`titanstech.com`): Admin panel
- **Subdomains** (`company1.titanstech.com`): Company dashboards
- **API** (`api.titanstech.com`): Backend API

**How it works:**
1. Route53 wildcard DNS: `*.titanstech.com` → EC2 IP
2. Nginx preserves `Host` header
3. Next.js middleware extracts subdomain
4. Application routes to company-specific pages

**Why this matters:** This architecture requirement is why we chose EC2 over AWS Amplify (see [AMPLIFY_VS_EC2.md](./AMPLIFY_VS_EC2.md)).

## 🔐 Security Features

- **SSL/TLS**: HTTPS enforced with Let's Encrypt certificates
- **Firewall**: UFW configured on EC2
- **Security Groups**: Restricted SSH access
- **Secrets Management**: Environment variables secured
- **Security Headers**: HSTS, X-Frame-Options, CSP
- **Rate Limiting**: Nginx configured
- **Auto-updates**: Unattended-upgrades enabled

## 📈 Monitoring

- **Health Checks**: Built into Docker Compose
- **CloudWatch**: Logs and metrics collection
- **Alarms**: SNS notifications for:
  - High CPU (>80%)
  - High Disk (>85%)
  - Service failures
- **Logging**: Centralized Docker logs

## 🔄 CI/CD Pipeline

**GitHub Actions workflow:**
1. Trigger: Push to `main` branch
2. Run tests: Lint, format, build
3. Deploy to EC2: SSH + Docker Compose
4. Health checks: Automatic rollback on failure
5. Notifications: (Optional) Slack/Discord

## 🆘 Support

- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **GitHub Issues**: Report bugs and feature requests
- **Team**: Contact engineering team

## 📖 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Last updated**: 2025-11-11
**Maintained by**: Titans Tech Engineering Team

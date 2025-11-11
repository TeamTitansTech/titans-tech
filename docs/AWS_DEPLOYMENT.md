# AWS Deployment Guide

Complete guide for deploying the Titans Tech monorepo to AWS EC2 with Docker, Nginx, SSL, and CI/CD.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step 1: AWS EC2 Setup](#step-1-aws-ec2-setup)
- [Step 2: Domain and DNS Configuration](#step-2-domain-and-dns-configuration)
- [Step 3: EC2 Instance Setup](#step-3-ec2-instance-setup)
- [Step 4: SSL Certificates](#step-4-ssl-certificates)
- [Step 5: First Deployment](#step-5-first-deployment)
- [Step 6: GitHub Actions CI/CD](#step-6-github-actions-cicd)
- [Step 7: Monitoring with CloudWatch](#step-7-monitoring-with-cloudwatch)
- [Troubleshooting](#troubleshooting)
- [Cost Estimation](#cost-estimation)

---

## Architecture Overview

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
│                                                   │
│  Docker Compose orchestrates all services        │
└───────────────────────────────────────────────────┘
                  │                    │
                  ▼                    ▼
       ┌──────────────────┐   ┌──────────────┐
       │ Supabase         │   │  AWS S3      │
       │ PostgreSQL       │   │  (Images)    │
       └──────────────────┘   └──────────────┘
```

**Key Features:**
- **Multi-tenant subdomain routing**: `company1.yourdomain.com`, `company2.yourdomain.com`
- **SSL/HTTPS**: Automatic certificates from Let's Encrypt
- **CI/CD**: GitHub Actions → Auto-deploy on push to `main`
- **Health checks**: Automatic rollback on failed deployments
- **Logging**: Centralized logs via Docker + CloudWatch (optional)

---

## Prerequisites

Before starting, ensure you have:

- [ ] AWS account with billing enabled
- [ ] Domain name (purchased from any registrar)
- [ ] GitHub repository with code
- [ ] Supabase database URL
- [ ] AWS S3 bucket for images (already configured: `titechjf-bucket`)
- [ ] SSH key pair for EC2 access
- [ ] $100 AWS credits (or budget for ~$20-25/month)

---

## Step 1: AWS EC2 Setup

### 1.1 Create EC2 Instance

1. **Login to AWS Console** → Navigate to EC2

2. **Launch Instance**:
   - **Name**: `titans-tech-production`
   - **AMI**: Ubuntu Server 24.04 LTS (64-bit x86)
   - **Instance type**: `t3.small` (2 vCPU, 2 GB RAM)
   - **Key pair**: Create new or use existing SSH key pair

3. **Network Settings**:
   - **Auto-assign public IP**: Enable
   - **Firewall (Security Group)**: Create new with:
     - SSH (22) - Your IP only (for security)
     - HTTP (80) - 0.0.0.0/0
     - HTTPS (443) - 0.0.0.0/0

4. **Storage**:
   - **Size**: 20 GB gp3 SSD
   - **IOPS**: 3000 (default)

5. **Advanced Details** (optional):
   - **IAM Instance Profile**: Attach role with `CloudWatchAgentServerPolicy` if using CloudWatch

6. **Launch Instance**

### 1.2 Allocate Elastic IP

1. Go to **EC2 → Elastic IPs**
2. Click **Allocate Elastic IP address**
3. Click **Allocate**
4. Select the new IP → **Actions → Associate Elastic IP address**
5. Select your EC2 instance → **Associate**

**Why Elastic IP?**
- Fixed public IP that doesn't change when you stop/start the instance
- Required for DNS configuration

**Note the Elastic IP** - you'll need it for DNS configuration.

---

## Step 2: Domain and DNS Configuration

### 2.1 Create Route53 Hosted Zone

1. Go to **Route53 → Hosted zones**
2. Click **Create hosted zone**
3. **Domain name**: `yourdomain.com` (your actual domain)
4. **Type**: Public hosted zone
5. Click **Create hosted zone**

### 2.2 Update Nameservers at Domain Registrar

1. Copy the 4 nameservers from Route53 (e.g., `ns-123.awsdns-12.com`)
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Update DNS settings to use Route53 nameservers
4. **Wait 24-48 hours** for propagation (usually faster, ~1-2 hours)

### 2.3 Create DNS Records

In Route53 Hosted Zone, create these records:

| Record Type | Name | Value | TTL |
|-------------|------|-------|-----|
| A | `yourdomain.com` | `<Elastic IP>` | 300 |
| A | `*.yourdomain.com` | `<Elastic IP>` | 300 |
| A | `api.yourdomain.com` | `<Elastic IP>` | 300 |

**Example:**
- `A` record: `example.com` → `54.123.45.67`
- `A` record: `*.example.com` → `54.123.45.67` (wildcard for subdomains)
- `A` record: `api.example.com` → `54.123.45.67`

### 2.4 Verify DNS Propagation

```bash
# Check if DNS is propagated
dig yourdomain.com
dig api.yourdomain.com
dig test.yourdomain.com

# All should return your Elastic IP
```

---

## Step 3: EC2 Instance Setup

### 3.1 Connect to EC2

```bash
# SSH into your EC2 instance
ssh -i /path/to/your-key.pem ubuntu@<ELASTIC_IP>

# Example:
# ssh -i ~/.ssh/titans-tech.pem ubuntu@54.123.45.67
```

### 3.2 Run Setup Script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/titans-tech/main/scripts/setup-ec2.sh -o setup-ec2.sh

# Or if already cloned:
sudo bash setup-ec2.sh
```

**What this script does:**
- Installs Docker & Docker Compose
- Installs Node.js, AWS CLI, Certbot
- Configures firewall (UFW)
- Creates project directories
- Generates SSH key for GitHub
- Sets up systemd service for auto-start

### 3.3 Add SSH Key to GitHub

1. Copy the SSH public key shown by the script:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Go to **GitHub → Repository → Settings → Deploy keys**
3. Click **Add deploy key**
4. **Title**: `EC2 Production Server`
5. **Key**: Paste the public key
6. **Allow write access**: ❌ (read-only is safer)
7. Click **Add key**

### 3.4 Clone Repository

```bash
cd /home/ubuntu
git clone git@github.com:YOUR_ORG/titans-tech.git titans-tech
cd titans-tech
```

### 3.5 Configure Environment Variables

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Required values:**
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=<generate with: openssl rand -base64 32>
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=titechjf-bucket
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com
```

**Secure the file:**
```bash
chmod 600 .env.production
```

### 3.6 Update Nginx Configuration

```bash
# Replace DOMAIN_PLACEHOLDER with your actual domain
sed -i 's/DOMAIN_PLACEHOLDER/yourdomain.com/g' nginx/nginx.conf

# Example: sed -i 's/DOMAIN_PLACEHOLDER/example.com/g' nginx/nginx.conf
```

---

## Step 4: SSL Certificates

### 4.1 Obtain Let's Encrypt Certificates

```bash
# Stop Nginx if running (to free ports 80/443)
docker compose -f docker-compose.prod.yml down nginx 2>/dev/null || true

# Request wildcard certificate (requires DNS validation)
sudo certbot certonly --manual --preferred-challenges dns \
  -d yourdomain.com \
  -d *.yourdomain.com \
  --email your-email@example.com \
  --agree-tos

# Follow prompts to add TXT records to Route53
```

**DNS Challenge Steps:**
1. Certbot will ask you to create TXT records in Route53:
   - Name: `_acme-challenge.yourdomain.com`
   - Type: TXT
   - Value: (provided by Certbot)

2. Create the TXT record in Route53

3. Wait 1-2 minutes for propagation

4. Verify with:
   ```bash
   dig -t txt _acme-challenge.yourdomain.com
   ```

5. Press Enter in Certbot to continue

### 4.2 Copy Certificates to Nginx Directory

```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo chown ubuntu:ubuntu nginx/ssl/*.pem
```

### 4.3 Configure Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e

# Add this line (runs daily at 3 AM):
0 3 * * * certbot renew --quiet --deploy-hook "cd /home/ubuntu/titans-tech && docker compose -f docker-compose.prod.yml restart nginx"
```

---

## Step 5: First Deployment

### 5.1 Build and Start Services

```bash
cd /home/ubuntu/titans-tech

# Build Docker images
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 5.2 Verify Services

```bash
# Check running containers
docker compose -f docker-compose.prod.yml ps

# Should show:
# - titans-frontend (healthy)
# - titans-backend (healthy)
# - titans-nginx (healthy)

# Test health endpoints
curl http://localhost:4000/health  # Backend
curl http://localhost:3000/api/health  # Frontend

# Test external access
curl https://api.yourdomain.com/health
curl https://yourdomain.com/api/health
```

### 5.3 Test Multi-Tenancy

1. **Access admin panel**: `https://yourdomain.com/admin`
2. **Create a company** with slug `testeco`
3. **Access subdomain**: `https://testeco.yourdomain.com`
4. Should route to the company-specific dashboard

---

## Step 6: GitHub Actions CI/CD

### 6.1 Configure GitHub Secrets

Go to **GitHub → Repository → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `EC2_HOST` | Elastic IP | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private key content | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DOMAIN` | Your domain | `example.com` |

**To get EC2_SSH_KEY:**
```bash
# On your local machine (NOT on EC2)
cat ~/.ssh/your-ec2-key.pem
```

Copy the **entire content** including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### 6.2 Test Automated Deployment

```bash
# On your local machine
git checkout main
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: trigger automated deployment"
git push origin main
```

Go to **GitHub → Actions** and watch the deployment workflow.

### 6.3 Verify Deployment

After workflow completes:
1. Check that changes are deployed
2. Verify services are healthy
3. Check application is accessible

---

## Step 7: Monitoring with CloudWatch

### 7.1 Install CloudWatch Agent (Optional)

```bash
# Already installed if you ran setup-ec2.sh with CloudWatch option
# If not:
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### 7.2 Configure CloudWatch Agent

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

Follow prompts to configure:
- Collect system metrics (CPU, RAM, Disk)
- Collect Docker logs
- Set collection interval (60 seconds recommended)

### 7.3 Start CloudWatch Agent

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```

### 7.4 Create CloudWatch Alarms

1. Go to **CloudWatch → Alarms → Create alarm**

2. **CPU Utilization Alarm**:
   - Metric: `CPUUtilization` (from EC2)
   - Condition: Greater than 80%
   - Period: 5 minutes
   - Action: SNS topic → Email notification

3. **Disk Space Alarm**:
   - Metric: `disk_used_percent`
   - Condition: Greater than 85%
   - Action: SNS topic → Email

4. **Status Check Alarm**:
   - Metric: `StatusCheckFailed`
   - Condition: Greater than 0
   - Action: SNS topic → Email

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed debugging steps.

**Common issues:**

### Services won't start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Rebuild
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### SSL certificate errors
```bash
# Verify certificates exist
ls -la nginx/ssl/

# Check Nginx config
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Restart Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Subdomain routing not working
```bash
# Verify DNS wildcard record
dig random-test.yourdomain.com

# Check Nginx config
grep "server_name" nginx/nginx.conf

# Verify Host header is preserved
docker compose -f docker-compose.prod.yml logs nginx | grep "Host:"
```

### Database connection errors
```bash
# Test connection from EC2
psql "postgresql://user:password@host:5432/dbname"

# Check DATABASE_URL in .env.production
cat .env.production | grep DATABASE_URL
```

---

## Cost Estimation

### Monthly Costs (USD)

| Service | Configuration | Cost |
|---------|---------------|------|
| EC2 t3.small | 730 hours | $15.18 |
| EBS gp3 | 20 GB | $1.60 |
| Elastic IP | Attached | $0.00 |
| Route53 Hosted Zone | 1 zone | $0.50 |
| Route53 Queries | ~1M queries | $0.40 |
| CloudWatch Logs | 5 GB ingestion | $2.50 |
| CloudWatch Alarms | 3 alarms | $0.30 |
| Data Transfer Out | 5 GB | $0.45 |
| **TOTAL** | | **~$20.93/month** |

### With $100 AWS Credits
- **Duration**: ~4.8 months (almost 5 months free)
- After credits expire: $21/month ongoing

### Cost Optimization Tips
- Use `t3.small` instead of `t3.medium` (saves $15/month)
- Stop instance during non-business hours (saves ~60%)
- Monitor CloudWatch costs (can add up with high log volume)
- Use S3 lifecycle policies for old logs

---

## Next Steps

After successful deployment:

1. ✅ **Set up monitoring dashboards** in CloudWatch
2. ✅ **Configure backup strategy** for database
3. ✅ **Set up error tracking** (Sentry, Datadog, etc.)
4. ✅ **Document runbooks** for common operations
5. ✅ **Plan for scaling** (load balancer, multiple instances)
6. ✅ **Security audit** (penetration testing, vulnerability scanning)

---

## Additional Resources

- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Route53 Documentation](https://docs.aws.amazon.com/route53/)

---

**Questions or issues?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or contact the team.

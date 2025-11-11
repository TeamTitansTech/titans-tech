# Quick Deploy Guide

Fast-track guide to deploy Titans Tech to AWS EC2 in production.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] AWS account with billing enabled
- [ ] Domain purchased (any registrar)
- [ ] GitHub repository access
- [ ] Supabase PostgreSQL database URL
- [ ] AWS S3 bucket credentials (already configured: `titechjf-bucket`)
- [ ] SSH client installed locally

**Estimated time**: 4-6 hours (first deployment)

---

## Part 1: AWS Setup (1-2 hours)

### Step 1: Create EC2 Instance

1. **AWS Console → EC2 → Launch Instance**

2. **Configuration**:
   ```
   Name: titans-tech-production
   AMI: Ubuntu Server 24.04 LTS
   Instance type: t3.small
   Key pair: Create new (download .pem file)

   Security Group:
   - SSH (22): Your IP only
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0

   Storage: 20 GB gp3
   ```

3. **Launch** and wait for instance to run

### Step 2: Allocate Elastic IP

1. **EC2 → Elastic IPs → Allocate**
2. **Associate with your instance**
3. **Note the IP** (e.g., `54.123.45.67`)

### Step 3: Configure Route53

1. **Route53 → Hosted zones → Create**
   - Domain: `yourdomain.com`
   - Type: Public

2. **Update nameservers** at your domain registrar
   - Copy 4 NS records from Route53
   - Paste into registrar DNS settings
   - **Wait 1-2 hours** for propagation

3. **Create DNS records** in Route53:
   | Type | Name | Value |
   |------|------|-------|
   | A | `yourdomain.com` | `<Elastic IP>` |
   | A | `*.yourdomain.com` | `<Elastic IP>` |
   | A | `api.yourdomain.com` | `<Elastic IP>` |

4. **Verify DNS**:
   ```bash
   dig yourdomain.com  # Should return your Elastic IP
   ```

---

## Part 2: EC2 Setup (1-2 hours)

### Step 4: Connect to EC2

```bash
# Make key readable
chmod 400 ~/Downloads/your-key.pem

# SSH into EC2
ssh -i ~/Downloads/your-key.pem ubuntu@<ELASTIC_IP>
```

### Step 5: Run Setup Script

```bash
# Download setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/titans-tech/main/scripts/setup-ec2.sh -o setup.sh

# Run as root
sudo bash setup.sh
```

**What it does:**
- Installs Docker, Docker Compose, Node.js, AWS CLI, Certbot
- Configures firewall
- Generates SSH key for GitHub

**When asked about CloudWatch:** Type `n` for now (can add later)

### Step 6: Add Deploy Key to GitHub

1. **Copy SSH public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. **GitHub → Your Repo → Settings → Deploy keys → Add**
   - Title: `EC2 Production`
   - Key: Paste the public key
   - Write access: ❌ (unchecked)

### Step 7: Clone Repository

```bash
cd /home/ubuntu
git clone git@github.com:YOUR_ORG/titans-tech.git titans-tech
cd titans-tech
```

### Step 8: Configure Environment

```bash
# Copy template
cp .env.production.example .env.production

# Edit with real values
nano .env.production
```

**Required values:**
```bash
# Backend
DATABASE_URL=postgresql://user:pass@host.supabase.co:5432/postgres?schema=public
JWT_SECRET=$(openssl rand -base64 32)  # Generate random
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=titechjf-bucket

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ROOT_DOMAIN=yourdomain.com
```

**Save and secure:**
```bash
chmod 600 .env.production
```

### Step 9: Update Nginx Config

```bash
# Replace placeholder with your domain
sed -i 's/DOMAIN_PLACEHOLDER/yourdomain.com/g' nginx/nginx.conf

# Verify
grep "server_name" nginx/nginx.conf
```

---

## Part 3: SSL Certificates (30 minutes)

### Step 10: Obtain SSL Certificates

```bash
# Request wildcard certificate
sudo certbot certonly --manual --preferred-challenges dns \
  -d yourdomain.com \
  -d *.yourdomain.com \
  --email your-email@example.com \
  --agree-tos
```

**Follow prompts:**
1. Certbot will give you a TXT record to create
2. **Go to Route53 → Hosted Zone → Create record**:
   ```
   Name: _acme-challenge.yourdomain.com
   Type: TXT
   Value: (from Certbot)
   TTL: 300
   ```
3. **Wait 2 minutes** for DNS propagation
4. **Verify**: `dig -t txt _acme-challenge.yourdomain.com`
5. **Press Enter** in Certbot to continue

### Step 11: Copy Certificates

```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo chown ubuntu:ubuntu nginx/ssl/*.pem
```

### Step 12: Setup Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job
sudo crontab -e

# Add this line:
0 3 * * * certbot renew --quiet --deploy-hook "cd /home/ubuntu/titans-tech && docker compose -f docker-compose.prod.yml restart nginx"
```

---

## Part 4: First Deployment (30 minutes)

### Step 13: Build and Start

```bash
cd /home/ubuntu/titans-tech

# Build images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Watch logs
docker compose -f docker-compose.prod.yml logs -f
```

**Wait for:** All containers showing "healthy"

### Step 14: Verify Services

```bash
# Check containers
docker compose -f docker-compose.prod.yml ps

# Test health endpoints
curl http://localhost:4000/health
curl http://localhost:3000/api/health

# Test external access
curl https://api.yourdomain.com/health
curl https://yourdomain.com/api/health
```

**All should return:** `{"status":"ok",...}`

### Step 15: Test Multi-Tenancy

1. **Open browser:** `https://yourdomain.com/admin`
2. **Create a test company** with slug `testeco`
3. **Access subdomain:** `https://testeco.yourdomain.com`
4. Should show company-specific dashboard ✅

---

## Part 5: CI/CD Setup (30 minutes)

### Step 16: Configure GitHub Secrets

**GitHub → Repo → Settings → Secrets and variables → Actions**

Add these secrets:

```bash
# On your LOCAL machine (not EC2):

# 1. EC2_HOST
# Value: Your Elastic IP (e.g., 54.123.45.67)

# 2. EC2_USER
# Value: ubuntu

# 3. EC2_SSH_KEY
# Value: Content of your .pem file
cat ~/Downloads/your-key.pem
# Copy ENTIRE output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...
# -----END OPENSSH PRIVATE KEY-----

# 4. DOMAIN
# Value: yourdomain.com (without https://)
```

### Step 17: Test Automated Deployment

```bash
# On your LOCAL machine
git checkout main
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: trigger automated deployment"
git push origin main
```

**Go to GitHub → Actions** and watch the workflow run.

**Expected result:**
- ✅ Test & Build passes
- ✅ Deploy to EC2 succeeds
- ✅ Health checks pass

---

## Part 6: Monitoring (Optional, 30 minutes)

### Step 18: Setup Basic Monitoring

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@<ELASTIC_IP>

# Install CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

### Step 19: Create CloudWatch Alarms

**AWS Console → CloudWatch → Alarms → Create**

1. **CPU Alarm**:
   - Metric: `CPUUtilization`
   - Threshold: > 80%
   - Period: 5 minutes
   - Action: Email notification

2. **Disk Alarm**:
   - Metric: `disk_used_percent`
   - Threshold: > 85%
   - Action: Email notification

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Frontend accessible: `https://yourdomain.com`
- [ ] Backend API working: `https://api.yourdomain.com/health`
- [ ] Admin panel accessible: `https://yourdomain.com/admin`
- [ ] Multi-tenancy working: `https://testcompany.yourdomain.com`
- [ ] SSL certificate valid (green padlock in browser)
- [ ] GitHub Actions workflow passing
- [ ] CloudWatch alarms configured (optional)

---

## Daily Operations

### Viewing Logs

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@<ELASTIC_IP>

cd /home/ubuntu/titans-tech

# View all logs
docker compose -f docker-compose.prod.yml logs

# Follow logs in real-time
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

### Restarting Services

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend

# Full restart with rebuild
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### Manual Deployment

```bash
# SSH into EC2
cd /home/ubuntu/titans-tech

# Run deploy script
./scripts/deploy.sh

# Script will:
# - Pull latest code
# - Build new images
# - Restart containers
# - Verify health checks
# - Rollback if failed
```

### Checking System Resources

```bash
# Disk usage
df -h

# Memory usage
free -h

# Docker usage
docker stats

# Container status
docker compose -f docker-compose.prod.yml ps
```

---

## Troubleshooting Quick Reference

### Service won't start
```bash
docker compose -f docker-compose.prod.yml logs <service>
docker compose -f docker-compose.prod.yml restart <service>
```

### DNS not working
```bash
dig yourdomain.com  # Should return Elastic IP
```

### SSL errors
```bash
ls -la nginx/ssl/  # Verify cert files exist
sudo certbot renew  # Renew if expired
```

### Changes not deploying
```bash
git pull origin main  # Ensure latest code
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

**For detailed troubleshooting:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Cost Monitoring

### Check current AWS costs

**AWS Console → Billing → Cost Explorer**

**Expected monthly costs:**
- EC2 t3.small: ~$15
- EBS 20GB: ~$2
- Route53: ~$1
- Data transfer: ~$1-2
- **Total: ~$20/month**

**With $100 credits:** Lasts ~5 months

### Cost optimization tips

1. **Stop EC2 during off-hours** (if applicable):
   ```bash
   # Stop instance (data persists)
   aws ec2 stop-instances --instance-ids i-xxxxx

   # Start when needed
   aws ec2 start-instances --instance-ids i-xxxxx
   ```

2. **Monitor disk usage:**
   ```bash
   df -h
   docker system prune -a --volumes  # Clean unused Docker data
   ```

3. **Review CloudWatch logs** (can add up):
   - Adjust log retention: 7 days instead of indefinite

---

## Next Steps

After successful deployment:

1. ✅ **Set up monitoring dashboards** (CloudWatch)
2. ✅ **Configure backup strategy** (database snapshots)
3. ✅ **Document team access** (who has EC2 key, GitHub access)
4. ✅ **Plan for scaling** (when to add more resources)
5. ✅ **Security audit** (review security groups, update policies)

---

## Support

- **Documentation**: [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Technical analysis**: [AMPLIFY_VS_EC2.md](./AMPLIFY_VS_EC2.md)

---

**Deployment completed successfully!** 🎉

Your application is now live at:
- **Frontend**: `https://yourdomain.com`
- **API**: `https://api.yourdomain.com`
- **Admin**: `https://yourdomain.com/admin`

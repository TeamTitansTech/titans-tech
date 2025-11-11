# Troubleshooting Guide

Common issues and solutions for Titans Tech AWS deployment.

## Table of Contents

- [Docker Issues](#docker-issues)
- [Network and Connectivity](#network-and-connectivity)
- [SSL/HTTPS Issues](#sslhttps-issues)
- [Subdomain Routing Issues](#subdomain-routing-issues)
- [Database Connection Issues](#database-connection-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)
- [Performance Issues](#performance-issues)
- [GitHub Actions CI/CD Issues](#github-actions-cicd-issues)

---

## Docker Issues

### Containers won't start

**Symptoms:**
```bash
docker compose ps
# Shows: Status: Exited (1)
```

**Diagnosis:**
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend

# Check container status
docker ps -a
```

**Common causes and solutions:**

#### 1. Environment variables missing

```bash
# Verify .env.production exists
ls -la .env.production

# Check if all required vars are set
cat .env.production

# Ensure no placeholder values remain
grep PLACEHOLDER .env.production
```

**Solution:**
```bash
cp .env.production.example .env.production
nano .env.production  # Fill in actual values
```

#### 2. Port conflicts

```bash
# Check if ports are already in use
sudo netstat -tlnp | grep ':3000\|:4000\|:80\|:443'
```

**Solution:**
```bash
# Stop conflicting services
docker compose -f docker-compose.prod.yml down
# Or kill specific processes
sudo kill <PID>
```

#### 3. Out of disk space

```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df
```

**Solution:**
```bash
# Clean up Docker
docker system prune -a --volumes
docker image prune -a

# Clean up old logs
sudo journalctl --vacuum-time=7d
```

---

### Container crashes immediately after start

**Diagnosis:**
```bash
# Follow logs in real-time
docker compose -f docker-compose.prod.yml logs -f backend

# Check for specific errors
docker compose -f docker-compose.prod.yml logs backend | grep -i error
```

**Common errors:**

#### Prisma Client not generated

```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
# Rebuild with no cache
docker compose -f docker-compose.prod.yml build --no-cache backend
docker compose -f docker-compose.prod.yml up -d
```

#### Database connection failed

```
Error: Can't reach database server at `host:5432`
```

**Solution:** See [Database Connection Issues](#database-connection-issues)

---

### Health checks failing

**Symptoms:**
```bash
docker compose ps
# Shows: Status: unhealthy
```

**Diagnosis:**
```bash
# Check health endpoint manually
docker compose exec backend curl http://localhost:4000/health
docker compose exec frontend curl http://localhost:3000/api/health

# Check if services are listening on correct ports
docker compose exec backend netstat -tlnp
```

**Solution:**
```bash
# Restart specific service
docker compose -f docker-compose.prod.yml restart backend

# If persists, rebuild
docker compose -f docker-compose.prod.yml up -d --force-recreate backend
```

---

## Network and Connectivity

### Can't access application from browser

**Symptoms:**
- `https://yourdomain.com` times out
- "Site can't be reached"

**Diagnosis checklist:**

#### 1. Check EC2 Security Group

```bash
# Via AWS CLI
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Should have rules:
# - Port 22 (SSH): Your IP
# - Port 80 (HTTP): 0.0.0.0/0
# - Port 443 (HTTPS): 0.0.0.0/0
```

**Solution:**
1. Go to EC2 Console → Security Groups
2. Select your security group
3. Inbound rules → Edit inbound rules
4. Add:
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0

#### 2. Check firewall (UFW)

```bash
sudo ufw status

# Should show:
# 22/tcp   ALLOW   Anywhere
# 80/tcp   ALLOW   Anywhere
# 443/tcp  ALLOW   Anywhere
```

**Solution:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

#### 3. Check if Nginx is running

```bash
docker compose ps nginx

# Should show: State: Up, Status: healthy
```

**Solution:**
```bash
docker compose -f docker-compose.prod.yml restart nginx
docker compose -f docker-compose.prod.yml logs nginx
```

#### 4. Check DNS resolution

```bash
# From your local machine
dig yourdomain.com
dig api.yourdomain.com

# Should return your Elastic IP
```

**Solution:** See [DNS Issues](#dns-issues)

---

### DNS Issues

#### DNS not resolving

**Symptoms:**
```bash
dig yourdomain.com
# Returns: NXDOMAIN or no answer
```

**Diagnosis:**
```bash
# Check Route53 hosted zone
aws route53 list-hosted-zones

# Check records in hosted zone
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC
```

**Solutions:**

1. **Verify nameservers at registrar:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Check DNS/Nameservers section
   - Should match Route53 nameservers (4 NS records)

2. **Wait for propagation:**
   ```bash
   # Check propagation globally
   # Visit: https://dnschecker.org
   ```

3. **Verify A records:**
   ```bash
   # Should exist:
   # yourdomain.com       A  <Elastic IP>
   # *.yourdomain.com     A  <Elastic IP>
   # api.yourdomain.com   A  <Elastic IP>
   ```

#### Wildcard subdomain not working

**Symptoms:**
- `yourdomain.com` works
- `api.yourdomain.com` works
- `empresa1.yourdomain.com` doesn't work

**Diagnosis:**
```bash
# Test wildcard resolution
dig random-subdomain.yourdomain.com

# Should return your Elastic IP
```

**Solution:**
```bash
# Verify wildcard A record exists in Route53
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC | grep "\\*."

# If missing, create:
# Name: *.yourdomain.com
# Type: A
# Value: <Elastic IP>
```

---

## SSL/HTTPS Issues

### SSL certificate errors

**Symptoms:**
- "Your connection is not private" (ERR_CERT_AUTHORITY_INVALID)
- Certificate expired

**Diagnosis:**
```bash
# Check certificate validity
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate files
ls -la nginx/ssl/
# Should have: fullchain.pem, privkey.pem

# Check certificate expiry
openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep "Not After"
```

**Solutions:**

#### 1. Certificate files missing

```bash
# Copy from Let's Encrypt
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo chown ubuntu:ubuntu nginx/ssl/*.pem

# Restart Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

#### 2. Certificate expired

```bash
# Renew certificate
sudo certbot renew

# Copy new certificate
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Restart Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

#### 3. Wrong certificate for subdomain

```bash
# Verify certificate covers wildcard
openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep "DNS:"

# Should show:
# DNS:yourdomain.com, DNS:*.yourdomain.com
```

**Solution:**
```bash
# Request new wildcard certificate
sudo certbot certonly --manual --preferred-challenges dns \
  -d yourdomain.com -d *.yourdomain.com
```

---

### HTTP not redirecting to HTTPS

**Symptoms:**
- `http://yourdomain.com` works but doesn't redirect to HTTPS

**Diagnosis:**
```bash
# Test redirect
curl -I http://yourdomain.com

# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com/
```

**Solution:**
```bash
# Check Nginx config
cat nginx/nginx.conf | grep "return 301"

# Should have in HTTP server block:
# return 301 https://$host$request_uri;

# If missing, add and restart
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Subdomain Routing Issues

### Subdomains not routing correctly

**Symptoms:**
- `empresa1.yourdomain.com` shows same page as root domain
- 404 errors on subdomain routes

**Diagnosis:**
```bash
# Check if Host header is preserved
docker compose logs nginx | grep "Host:"

# Test from EC2
curl -H "Host: empresa1.yourdomain.com" http://localhost/

# Check frontend logs
docker compose logs frontend | grep "hostname"
```

**Solutions:**

#### 1. Nginx not preserving Host header

```bash
# Check nginx.conf
grep "proxy_set_header Host" nginx/nginx.conf

# Should have:
# proxy_set_header Host $host;
```

**Fix:**
```nginx
# In nginx.conf, location / block:
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Host $host;
```

```bash
# Restart Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

#### 2. Next.js middleware not working

```bash
# Check if middleware is being called
docker compose logs frontend | grep "middleware"

# Check next.config.ts
docker compose exec frontend cat apps/dashboard/next.config.ts | grep "output"

# Should have: output: 'standalone'
```

**Fix:**
```bash
# Rebuild frontend
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

---

## Database Connection Issues

### Can't connect to database

**Symptoms:**
```
Error: Can't reach database server at `host:5432`
```

**Diagnosis:**
```bash
# Test connection from EC2
psql "$DATABASE_URL"

# Or test with curl
curl -v telnet://supabase-host:5432

# Check if DATABASE_URL is correct
echo $DATABASE_URL  # From .env.production
```

**Solutions:**

#### 1. Wrong DATABASE_URL format

**Correct format:**
```bash
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
```

**Common mistakes:**
- Missing `?schema=public`
- Wrong port (should be 5432)
- Special characters in password not URL-encoded

#### 2. Supabase firewall blocking EC2

**Solution:**
1. Go to Supabase Dashboard → Settings → Database
2. Connection pooling → Add allowed IP
3. Add your EC2 Elastic IP

#### 3. SSL required but not configured

**Supabase requires SSL:**
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&sslmode=require"
```

---

## Build and Deployment Issues

### Build fails in GitHub Actions

**Diagnosis:**
```bash
# Check workflow logs in GitHub
# Common errors:

# 1. Prisma client not generated
# 2. TypeScript errors
# 3. Out of memory
```

**Solutions:**

#### TypeScript errors

```bash
# Run locally first
npm run lint
npm run build

# Fix errors, then push
```

#### Out of memory during build

**In `.github/workflows/deploy.yml`:**
```yaml
- name: Build all packages
  run: npm run build
  env:
    NODE_OPTIONS: --max-old-space-size=4096
```

---

### Deploy script fails

**Symptoms:**
```bash
./scripts/deploy.sh
# Error: Health check failed
```

**Diagnosis:**
```bash
# Check what failed
docker compose -f docker-compose.prod.yml logs

# Test health endpoints
curl http://localhost:4000/health
curl http://localhost:3000/api/health
```

**Solution:**
```bash
# Manual rollback if needed
git log  # Note the last working commit
git reset --hard <commit-sha>
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Performance Issues

### High CPU usage

**Diagnosis:**
```bash
# Check container CPU
docker stats

# Check system CPU
top
htop
```

**Solutions:**

#### 1. Upgrade instance type

```bash
# Stop instance
# Change type: t3.small → t3.medium
# Start instance
```

#### 2. Optimize Docker images

```bash
# Reduce image size
# Already optimized with multi-stage builds
```

#### 3. Enable production mode

```bash
# Verify NODE_ENV=production
grep NODE_ENV .env.production

# Should be: NODE_ENV=production
```

---

### High memory usage

**Diagnosis:**
```bash
# Check container memory
docker stats

# Check system memory
free -h
```

**Solutions:**

#### 1. Add swap space

```bash
# Create 2GB swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### 2. Restart containers regularly

```bash
# Add cron job for weekly restart
crontab -e

# Add:
0 3 * * 0 cd /home/ubuntu/titans-tech && docker compose -f docker-compose.prod.yml restart
```

---

## GitHub Actions CI/CD Issues

### SSH connection failed

**Error:**
```
Permission denied (publickey)
```

**Solutions:**

1. **Verify EC2_SSH_KEY secret:**
   ```bash
   # On local machine, cat your .pem file
   cat ~/.ssh/titans-tech.pem

   # Copy ENTIRE content including:
   # -----BEGIN OPENSSH PRIVATE KEY-----
   # ...
   # -----END OPENSSH PRIVATE KEY-----

   # Paste into GitHub Secret
   ```

2. **Verify EC2_HOST is correct:**
   - Should be Elastic IP (not public DNS)
   - Format: `54.123.45.67` (no http://, no port)

3. **Test SSH manually:**
   ```bash
   ssh -i ~/.ssh/titans-tech.pem ubuntu@<EC2_HOST>
   ```

---

### Deployment succeeds but changes not visible

**Diagnosis:**
```bash
# SSH into EC2
ssh -i ~/.ssh/titans-tech.pem ubuntu@<EC2_HOST>

# Check current commit
cd /home/ubuntu/titans-tech
git log -1

# Should match your latest push
```

**Solutions:**

#### Git pull failed silently

```bash
# Manual git pull
cd /home/ubuntu/titans-tech
git fetch origin
git status
git pull origin main

# Check for conflicts
git status
```

#### Docker cached old layers

```bash
# Force rebuild
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## Quick Diagnostic Commands

### Full system check

```bash
#!/bin/bash
echo "=== System Status ==="
df -h | grep -v tmpfs
echo ""

echo "=== Docker Containers ==="
docker compose -f docker-compose.prod.yml ps
echo ""

echo "=== Health Checks ==="
curl -f http://localhost:4000/health && echo "Backend: OK" || echo "Backend: FAIL"
curl -f http://localhost:3000/api/health && echo "Frontend: OK" || echo "Frontend: FAIL"
echo ""

echo "=== Recent Logs (last 20 lines) ==="
docker compose -f docker-compose.prod.yml logs --tail=20
echo ""

echo "=== Listening Ports ==="
sudo netstat -tlnp | grep -E ':80|:443|:3000|:4000'
```

Save as `diagnose.sh`, chmod +x, and run when issues occur.

---

## Getting Help

If issues persist:

1. **Collect logs:**
   ```bash
   docker compose -f docker-compose.prod.yml logs > /tmp/logs.txt
   ```

2. **Check system resources:**
   ```bash
   df -h > /tmp/disk.txt
   free -h > /tmp/memory.txt
   docker stats --no-stream > /tmp/docker-stats.txt
   ```

3. **Create GitHub Issue** with:
   - Description of the problem
   - Steps to reproduce
   - Log files
   - System info

---

## Additional Resources

- [Docker Troubleshooting](https://docs.docker.com/config/containers/logging/)
- [Nginx Debugging](https://nginx.org/en/docs/debugging_log.html)
- [Let's Encrypt Troubleshooting](https://letsencrypt.org/docs/faq/)
- [Next.js Deployment Issues](https://nextjs.org/docs/deployment)

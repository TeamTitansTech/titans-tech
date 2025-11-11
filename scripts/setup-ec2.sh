#!/bin/bash
set -e

echo "🔧 Setting up EC2 instance for Titans Tech deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root or with sudo"
    exit 1
fi

print_message "Updating system packages..."
apt-get update
apt-get upgrade -y

print_message "Installing essential packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    unzip

# Install Docker
print_message "Installing Docker Engine..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Add ubuntu user to docker group
usermod -aG docker ubuntu

print_message "Installing Docker Compose V2..."
DOCKER_COMPOSE_VERSION="v2.24.5"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify Docker installation
print_message "Verifying Docker installation..."
docker --version
docker compose version

# Install Node.js (for potential local builds)
print_message "Installing Node.js 24.x..."
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install AWS CLI v2
print_message "Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Verify AWS CLI installation
aws --version

# Install Certbot for Let's Encrypt
print_message "Installing Certbot..."
snap install core
snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# Configure firewall
print_message "Configuring firewall (UFW)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

print_message "Firewall status:"
ufw status

# Create project directory
print_message "Creating project directory..."
mkdir -p /home/ubuntu/titans-tech
mkdir -p /home/ubuntu/backups
chown -R ubuntu:ubuntu /home/ubuntu/titans-tech
chown -R ubuntu:ubuntu /home/ubuntu/backups

# Configure Git (for the ubuntu user)
print_message "Configuring Git..."
su - ubuntu -c "git config --global user.email 'deploy@titans-tech.com'"
su - ubuntu -c "git config --global user.name 'Titans Tech Deploy'"

# Generate SSH key for GitHub (if not exists)
if [ ! -f /home/ubuntu/.ssh/id_ed25519 ]; then
    print_message "Generating SSH key for GitHub..."
    su - ubuntu -c "ssh-keygen -t ed25519 -C 'deploy@titans-tech.com' -f ~/.ssh/id_ed25519 -N ''"
    print_warning "Add this SSH public key to GitHub as a Deploy Key:"
    cat /home/ubuntu/.ssh/id_ed25519.pub
else
    print_warning "SSH key already exists. Public key:"
    cat /home/ubuntu/.ssh/id_ed25519.pub
fi

# Configure Docker logging
print_message "Configuring Docker daemon..."
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker

# Install CloudWatch Agent (optional - for AWS monitoring)
print_message "Do you want to install CloudWatch Agent? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    print_message "Installing CloudWatch Agent..."
    wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
    dpkg -i amazon-cloudwatch-agent.deb
    rm amazon-cloudwatch-agent.deb
    print_message "CloudWatch Agent installed. Configure it later with: sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard"
else
    print_warning "Skipping CloudWatch Agent installation"
fi

# Create systemd service for auto-restart on reboot (optional)
print_message "Creating systemd service for auto-start on reboot..."
cat > /etc/systemd/system/titans-tech.service <<EOF
[Unit]
Description=Titans Tech Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/titans-tech
ExecStart=/usr/local/lib/docker/cli-plugins/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/lib/docker/cli-plugins/docker-compose -f docker-compose.prod.yml down
User=ubuntu
Group=ubuntu

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable titans-tech.service

echo ""
print_message "EC2 setup completed successfully! 🎉"
echo ""
print_warning "Next steps:"
echo "1. Add the SSH public key (shown above) to GitHub as a Deploy Key"
echo "2. Clone the repository: cd /home/ubuntu/titans-tech && git clone git@github.com:YOUR_ORG/titans-tech.git ."
echo "3. Create .env.production file with your environment variables"
echo "4. Configure SSL certificates with Let's Encrypt (see docs/AWS_DEPLOYMENT.md)"
echo "5. Update nginx.conf with your domain name"
echo "6. Run the first deployment: ./scripts/deploy.sh"
echo ""
print_message "Reboot recommended to ensure all changes take effect"
echo ""

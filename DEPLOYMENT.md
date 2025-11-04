# Deployment Guide - Why Designers Backend

This guide covers deploying the Why Designers backend application to AWS EC2 using Docker.

## Table of Contents
- [Prerequisites](#prerequisites)
- [EC2 Setup](#ec2-setup)
- [Docker Installation](#docker-installation)
- [Application Deployment](#application-deployment)
- [SSL Configuration](#ssl-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- AWS Account with EC2 access
- Domain name: `whydesigners.com` (with subdomain `api.whydesigners.com`)
- AWS credentials (Access Key, Secret Key)
- DynamoDB tables created
- S3 bucket created
- SES configured for email sending

> **Note:** The application will be accessible at `https://api.whydesigners.com`. See [DNS-SETUP.md](DNS-SETUP.md) for detailed DNS configuration instructions.

## EC2 Setup

### 1. Launch EC2 Instance

**Recommended Configuration:**
- **Instance Type:** t3.medium or higher (2 vCPU, 4GB RAM minimum)
- **AMI:** Ubuntu Server 22.04 LTS
- **Storage:** 30GB+ GP3 SSD
- **Security Group:** Configure ports:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
  - Custom (5000) - Optional, for direct API access

### 2. Connect to EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 3. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

## Docker Installation

### 1. Install Docker

```bash
# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

### 2. Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 3. Configure Docker (Optional - for production)

```bash
# Create daemon configuration
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# Restart Docker
sudo systemctl restart docker
```

## Application Deployment

### 1. Clone Repository

```bash
# Install git
sudo apt install -y git

# Clone your repository
cd /home/ubuntu
git clone https://github.com/yourusername/why-designers-backend.git
cd why-designers-backend
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit environment file
nano .env.production
```

**Important:** Update the following in `.env.production`:
- `JWT_SECRET` - Generate a secure random string
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `CORS_ORIGIN` - Your frontend domain(s)
- `AWS_SES_FROM_EMAIL` - Your verified SES email
- `FRONTEND_URL` - Your frontend URL

### 3. Build and Deploy

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run deployment script
./scripts/deploy.sh
```

### 4. Verify Deployment

```bash
# Check if containers are running
docker-compose ps

# Check application health
curl http://localhost:5000/health

# View logs
./scripts/logs.sh
```

## DNS Configuration

Before configuring SSL, you need to set up DNS for your subdomain `api.whydesigners.com`.

**See detailed DNS setup instructions:** [DNS-SETUP.md](DNS-SETUP.md)

Quick steps:
1. Get your EC2 public IP or Elastic IP
2. Add an A record in your DNS provider:
   - **Type:** A
   - **Name:** api
   - **Value:** Your EC2 IP address
3. Wait 5-15 minutes for DNS propagation
4. Test: `nslookup api.whydesigners.com`

## SSL Configuration

### Option 1: Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot

# Stop nginx temporarily
docker-compose stop nginx

# Generate SSL certificate for api.whydesigners.com
sudo certbot certonly --standalone -d api.whydesigners.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/api.whydesigners.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.whydesigners.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/

# Update nginx configuration
# Uncomment HTTPS server block in nginx/conf.d/app.conf
nano nginx/conf.d/app.conf

# Restart nginx
docker-compose up -d nginx

# Test HTTPS
curl https://api.whydesigners.com/health
```

### Option 2: Using AWS Certificate Manager with ALB

1. Create Application Load Balancer (ALB) in AWS
2. Request certificate in ACM for `api.whydesigners.com`
3. Configure target group pointing to EC2 instance port 80
4. Update DNS to point to ALB instead of EC2 IP
5. Update security groups

**See detailed SSL setup:** [DNS-SETUP.md](DNS-SETUP.md#ssl-certificate-setup-https)

## Monitoring & Maintenance

### View Logs

```bash
# All logs
docker-compose logs -f

# Application logs only
./scripts/logs.sh

# Last 50 lines
./scripts/logs.sh 50
```

### Health Check

```bash
# Run health check script
./scripts/health-check.sh

# Manual health check
curl http://localhost:5000/health
```

### Backup

```bash
# Create backup
./scripts/backup.sh

# Backups are stored in ./backups directory
# Only last 7 backups are kept
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Redeploy
./scripts/deploy.sh
```

### Restart Application

```bash
# Restart all services
docker-compose restart

# Restart only app
docker-compose restart app
```

### Stop Application

```bash
docker-compose down
```

## Auto-restart on Server Reboot

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Containers will auto-restart due to "restart: unless-stopped" in docker-compose.yml
```

## Monitoring with CloudWatch (Optional)

### 1. Install CloudWatch Agent

```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

### 2. Configure CloudWatch

Create configuration file and start agent (see AWS documentation for details)

## Performance Optimization

### 1. Enable Swap (if needed)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Optimize Docker

```bash
# Clean up unused images
docker system prune -a

# Remove old logs
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check if port is already in use
sudo netstat -tulpn | grep 5000

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Out of Memory

```bash
# Check memory usage
free -h

# Check Docker stats
docker stats

# Consider upgrading instance type or adding swap
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/why-designers-backend

# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### Can't Access Application

```bash
# Check security group rules in AWS Console
# Ensure ports 80 and 443 are open

# Check if nginx is running
docker-compose ps nginx

# Check nginx logs
docker-compose logs nginx
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| PORT | Application port | 5000 |
| JWT_SECRET | Secret for JWT tokens | random-secure-string |
| AWS_ACCESS_KEY_ID | AWS access key | AKIA... |
| AWS_SECRET_ACCESS_KEY | AWS secret key | xxx |
| AWS_REGION | AWS region | ap-south-1 |
| DYNAMODB_TABLE_PREFIX | DynamoDB table prefix | why-designers-prod |
| CORS_ORIGIN | Allowed origins | https://yourdomain.com |

## Security Best Practices

1. ✅ Never commit `.env.production` to git
2. ✅ Use strong JWT secret (min 32 characters)
3. ✅ Enable HTTPS in production
4. ✅ Restrict SSH access to your IP only
5. ✅ Regularly update system packages
6. ✅ Monitor logs for suspicious activity
7. ✅ Use AWS IAM roles instead of hardcoded keys (recommended)
8. ✅ Enable CloudWatch monitoring
9. ✅ Regular backups of configuration

## Support

For issues or questions:
- Check logs: `./scripts/logs.sh`
- Run health check: `./scripts/health-check.sh`
- Review AWS CloudWatch metrics
- Check DynamoDB and S3 access

## Quick Commands Reference

```bash
# Deploy/Update
./scripts/deploy.sh

# View logs
./scripts/logs.sh

# Health check
./scripts/health-check.sh

# Backup
./scripts/backup.sh

# Restart
docker-compose restart

# Stop
docker-compose down

# Start
docker-compose up -d

# Rebuild
docker-compose build --no-cache && docker-compose up -d
```

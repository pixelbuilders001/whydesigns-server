# Quick Start: Setting up api.whydesigners.com

This is a quick reference guide for setting up your subdomain. For detailed instructions, see [DNS-SETUP.md](DNS-SETUP.md).

## Step 1: Configure DNS (5 minutes)

### If using Route 53:
1. Go to AWS Console → Route 53 → Hosted Zones
2. Select `whydesigners.com`
3. Create Record:
   - Record name: `api`
   - Record type: `A`
   - Value: Your EC2 public IP
   - TTL: `300`
4. Save

### If using other DNS providers (GoDaddy, Namecheap, etc.):
1. Log in to your DNS provider
2. Go to DNS settings for `whydesigners.com`
3. Add A Record:
   - Type: `A`
   - Name/Host: `api`
   - Value: Your EC2 public IP
   - TTL: `600` or Auto
4. Save

### Test DNS:
```bash
nslookup api.whydesigners.com
# Should return your EC2 IP
```

Wait 5-15 minutes if it doesn't resolve immediately.

---

## Step 2: Deploy Application (Already Configured!)

Your nginx and environment files are already updated for `api.whydesigners.com`. Just deploy:

```bash
# On your EC2 instance
cd /home/ubuntu/why-designers

# Copy environment file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production

# Deploy
./scripts/deploy.sh
```

---

## Step 3: Setup SSL with Let's Encrypt (10 minutes)

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot

# Stop nginx
docker-compose stop nginx

# Generate certificate
sudo certbot certonly --standalone -d api.whydesigners.com

# Copy certificates
sudo cp /etc/letsencrypt/live/api.whydesigners.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.whydesigners.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/

# Enable HTTPS in nginx
nano nginx/conf.d/app.conf
# 1. Uncomment lines 8-19 (HTTP to HTTPS redirect)
# 2. Uncomment lines 64-114 (HTTPS server block)
# 3. Comment lines 22-61 (HTTP server block) after testing

# Start nginx with HTTPS
docker-compose up -d nginx
```

---

## Step 4: Test Everything

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://api.whydesigners.com/health

# Test HTTPS
curl https://api.whydesigners.com/health
# Should return: {"status":"ok"}

# Test in browser
# https://api.whydesigners.com/health
```

---

## Step 5: Setup Auto-Renewal for SSL

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job
sudo crontab -e

# Add this line:
0 3 * * * certbot renew --quiet --deploy-hook "docker-compose -f /home/ubuntu/why-designers/docker-compose.yml restart nginx"
```

---

## Configuration Summary

### Files Updated:
- ✅ `nginx/conf.d/app.conf` - Server name: `api.whydesigners.com`
- ✅ `.env.production.example` - CORS and domains updated

### DNS Record:
```
Type: A
Name: api
Value: Your EC2 IP
TTL: 300-600
```

### Your API will be available at:
- **Development:** `http://api.whydesigners.com` (before SSL)
- **Production:** `https://api.whydesigners.com` (after SSL)

### Endpoints:
- Health: `https://api.whydesigners.com/health`
- API v1: `https://api.whydesigners.com/api/v1/*`

---

## Troubleshooting

### DNS not resolving?
```bash
# Wait 5-15 minutes, then try:
dig api.whydesigners.com +short
nslookup api.whydesigners.com 8.8.8.8
```

### Connection refused?
```bash
# Check if containers are running
docker-compose ps

# Check nginx logs
docker-compose logs nginx

# Check app logs
./scripts/logs.sh
```

### SSL certificate failed?
```bash
# Make sure DNS is working first!
# Check if port 80 is accessible
curl http://api.whydesigners.com

# Check security group allows port 80/443
# AWS Console → EC2 → Security Groups
```

---

## Need Help?

See detailed guides:
- [DNS-SETUP.md](DNS-SETUP.md) - Complete DNS and SSL setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- Run health check: `./scripts/health-check.sh`
- View logs: `./scripts/logs.sh`

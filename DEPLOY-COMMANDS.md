# Deployment Commands for EC2

Copy and paste these commands one by one on your EC2 instance.

## Step 1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone repository (replace with your repo URL)
git clone https://github.com/yourusername/why-designers-backend.git

# Or if using SSH
# git clone git@github.com:yourusername/why-designers-backend.git

# Navigate to project directory
cd why-designers-backend

# Checkout dynmodb branch
git checkout dynmodb
```

---

## Step 2: Configure Environment Variables

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit environment file
nano .env.production
```

**Update these values in `.env.production`:**

```bash
# Required: Change these!
JWT_SECRET=your-super-secure-random-string-min-32-chars
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Optional: Update if different
CORS_ORIGIN=https://whydesigners.com,https://www.whydesigners.com
FRONTEND_URL=https://whydesigners.com
AWS_SES_FROM_EMAIL=noreply@whydesigners.com
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

## Step 3: Make Scripts Executable

```bash
# Make deployment scripts executable
chmod +x scripts/*.sh
```

---

## Step 4: Deploy Application

```bash
# Run deployment script
./scripts/deploy.sh
```

This will:
- Build Docker images
- Start containers (app + nginx)
- Show container status
- Display recent logs

**Wait for deployment to complete** (~2-5 minutes)

---

## Step 5: Verify Deployment

```bash
# Check container status
docker-compose ps

# Should show:
# NAME                    STATUS
# why-designers-app       Up (healthy)
# why-designers-nginx     Up

# Check application health
curl http://localhost:5000/health

# Should return: {"status":"ok"}

# Check via nginx
curl http://localhost/health

# Should also return: {"status":"ok"}
```

---

## Step 6: Check Logs (Optional)

```bash
# View application logs
./scripts/logs.sh

# Or specific container logs
docker-compose logs app
docker-compose logs nginx

# Press Ctrl+C to exit
```

---

## Step 7: Test from Outside EC2

```bash
# Get your EC2 public IP
curl -4 icanhazip.com

# From your local machine, test:
# curl http://YOUR_EC2_IP/health
```

---

## Step 8: Setup DNS (Before SSL)

**On Your DNS Provider (Route 53, GoDaddy, etc.):**

Add A Record:
- **Type:** A
- **Name:** api
- **Value:** YOUR_EC2_PUBLIC_IP (from step 7)
- **TTL:** 300

**Test DNS (wait 5-15 minutes):**

```bash
# Test from your local machine
nslookup api.whydesigners.com

# Should return your EC2 IP
```

---

## Step 9: Setup SSL Certificate (After DNS Works)

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot

# Stop nginx container temporarily
docker-compose stop nginx

# Generate SSL certificate
sudo certbot certonly --standalone -d api.whydesigners.com --email your-email@example.com --agree-tos --no-eff-email

# Copy certificates to project
sudo cp /etc/letsencrypt/live/api.whydesigners.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.whydesigners.com/privkey.pem nginx/ssl/

# Fix permissions
sudo chown -R $USER:$USER nginx/ssl/
```

---

## Step 10: Enable HTTPS in Nginx

```bash
# Edit nginx configuration
nano nginx/conf.d/app.conf
```

**Make these changes:**

1. **Uncomment lines 8-19** (HTTP to HTTPS redirect):
   - Remove `#` from lines starting with `# server {` through `# }`

2. **Uncomment lines 64-114** (HTTPS server block):
   - Remove `#` from all lines in the HTTPS server section

3. **Comment lines 22-61** (HTTP server - optional, can keep for testing):
   - Add `#` at the start of each line in the HTTP server block
   - OR leave it as is for now and test HTTPS first

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 11: Restart Nginx with HTTPS

```bash
# Start nginx with new configuration
docker-compose up -d nginx

# Check nginx configuration is valid
docker-compose exec nginx nginx -t

# Should show: "syntax is ok" and "test is successful"

# Check logs for any errors
docker-compose logs nginx
```

---

## Step 12: Test HTTPS

```bash
# Test HTTPS locally
curl https://api.whydesigners.com/health

# Should return: {"status":"ok"}

# Test from browser
# Visit: https://api.whydesigners.com/health
```

---

## Step 13: Setup SSL Auto-Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# If successful, add cron job
sudo crontab -e

# Choose nano as editor (usually option 1)
# Add this line at the end:
0 3 * * * certbot renew --quiet --deploy-hook "docker-compose -f /home/ubuntu/why-designers-backend/docker-compose.yml restart nginx"

# Save and exit (Ctrl+X, Y, Enter)
```

---

## Monitoring Commands

### Check Health
```bash
./scripts/health-check.sh
```

### View Logs
```bash
# Last 100 lines, following
./scripts/logs.sh

# Last 50 lines
./scripts/logs.sh 50
```

### Create Backup
```bash
./scripts/backup.sh
```

### Restart Application
```bash
docker-compose restart
```

### Stop Application
```bash
docker-compose down
```

### Update Application (Future Deployments)
```bash
# Pull latest code
git pull origin dynmodb

# Redeploy
./scripts/deploy.sh
```

---

## Troubleshooting Commands

### Container not starting?
```bash
# Check logs
docker-compose logs app

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Nginx errors?
```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# Check nginx logs
docker-compose logs nginx
```

### Port already in use?
```bash
# Check what's using port 5000
sudo netstat -tulpn | grep 5000

# Check what's using port 80
sudo netstat -tulpn | grep 80
```

### Can't access from outside?
```bash
# Check if nginx is running
docker-compose ps nginx

# Check security group in AWS Console
# Must allow ports 80 and 443
```

### DNS not working?
```bash
# Check DNS resolution
dig api.whydesigners.com +short

# Should return your EC2 IP
# If not, wait 15 minutes and try again
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `./scripts/deploy.sh` | Deploy/update application |
| `./scripts/logs.sh` | View application logs |
| `./scripts/health-check.sh` | Check system health |
| `./scripts/backup.sh` | Backup configuration |
| `docker-compose ps` | Show container status |
| `docker-compose restart` | Restart all services |
| `docker-compose down` | Stop all services |
| `docker-compose up -d` | Start all services |

---

## Expected Result

After completing all steps, your API will be accessible at:

✅ **https://api.whydesigners.com/health**
✅ **https://api.whydesigners.com/api/v1/**

Example endpoints:
- `POST https://api.whydesigners.com/api/v1/auth/login`
- `GET https://api.whydesigners.com/api/v1/users`
- `GET https://api.whydesigners.com/api/v1/leads`

🎉 **Deployment Complete!**

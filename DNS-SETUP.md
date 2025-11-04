# DNS Setup Guide for api.whydesigners.com

This guide will help you configure your DNS to point the subdomain `api.whydesigners.com` to your EC2 instance.

## Prerequisites

- Domain: `whydesigners.com`
- Access to your domain registrar or DNS provider
- EC2 instance public IP address

## DNS Configuration Options

### Option 1: Using Route 53 (Recommended for AWS)

If your domain is managed by AWS Route 53, follow these steps:

#### 1. Get Your EC2 Public IP

```bash
# On your EC2 instance
curl -4 icanhazip.com
```

Or check in AWS Console:
- Go to EC2 Dashboard
- Select your instance
- Copy the "Public IPv4 address"

#### 2. Create A Record in Route 53

1. **Open Route 53 Console**
   - Go to AWS Console → Route 53 → Hosted Zones

2. **Select Your Domain**
   - Click on `whydesigners.com`

3. **Create Record**
   - Click "Create record"
   - **Record name:** `api`
   - **Record type:** `A - Routes traffic to an IPv4 address`
   - **Value:** Enter your EC2 public IP address (e.g., `3.109.123.45`)
   - **TTL:** `300` (5 minutes)
   - **Routing policy:** Simple routing
   - Click "Create records"

#### 3. Verify DNS Propagation

```bash
# Check DNS resolution
nslookup api.whydesigners.com

# Or use dig
dig api.whydesigners.com
```

Wait 5-15 minutes for DNS to propagate.

---

### Option 2: Using Other DNS Providers (GoDaddy, Namecheap, Cloudflare, etc.)

#### GoDaddy

1. Log in to your GoDaddy account
2. Go to "My Products" → "DNS"
3. Click on your domain `whydesigners.com`
4. Add a new record:
   - **Type:** A
   - **Name:** api
   - **Value:** Your EC2 public IP
   - **TTL:** 600 seconds
5. Save

#### Namecheap

1. Log in to Namecheap
2. Go to Domain List → Manage
3. Click on "Advanced DNS"
4. Add New Record:
   - **Type:** A Record
   - **Host:** api
   - **Value:** Your EC2 public IP
   - **TTL:** Automatic
5. Save

#### Cloudflare

1. Log in to Cloudflare
2. Select your domain
3. Go to DNS settings
4. Add record:
   - **Type:** A
   - **Name:** api
   - **IPv4 address:** Your EC2 public IP
   - **Proxy status:** DNS only (gray cloud) initially
   - **TTL:** Auto
5. Save

> **Note:** You can enable Cloudflare proxy (orange cloud) after SSL is working for additional security and CDN benefits.

---

## Option 3: Using Elastic IP (Recommended for Production)

If you're using AWS EC2, it's better to use an Elastic IP instead of the instance's public IP:

### Why Use Elastic IP?

- ✅ Static IP that doesn't change when you stop/start the instance
- ✅ Can be reassigned to another instance if needed
- ✅ Free while associated with a running instance

### Steps to Create Elastic IP

1. **Allocate Elastic IP**
   ```
   AWS Console → EC2 → Network & Security → Elastic IPs
   → Allocate Elastic IP address
   ```

2. **Associate with EC2 Instance**
   ```
   Select the Elastic IP → Actions → Associate Elastic IP address
   → Select your instance → Associate
   ```

3. **Update DNS Records**
   - Use the Elastic IP in your DNS A record instead of the public IP
   - Follow Option 1 or Option 2 above with the Elastic IP

---

## Testing DNS Configuration

### 1. Check DNS Resolution

```bash
# Method 1: nslookup
nslookup api.whydesigners.com

# Expected output:
# Server:         8.8.8.8
# Address:        8.8.8.8#53
#
# Non-authoritative answer:
# Name:   api.whydesigners.com
# Address: YOUR_EC2_IP

# Method 2: dig
dig api.whydesigners.com +short
# Should return: YOUR_EC2_IP

# Method 3: ping
ping api.whydesigners.com
```

### 2. Test HTTP Connection

```bash
# Once DNS is working, test HTTP
curl http://api.whydesigners.com/health

# Should return:
# {"status":"ok"}
```

### 3. Check from Multiple Locations

Use online tools:
- https://dnschecker.org/#A/api.whydesigners.com
- https://www.whatsmydns.net/#A/api.whydesigners.com

---

## SSL Certificate Setup (HTTPS)

After DNS is working, set up SSL for `https://api.whydesigners.com`

### Option 1: Using Let's Encrypt (Free)

```bash
# On your EC2 instance

# 1. Install Certbot
sudo apt update
sudo apt install -y certbot

# 2. Stop nginx (temporary)
docker-compose stop nginx

# 3. Generate certificate
sudo certbot certonly --standalone \
  -d api.whydesigners.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# 4. Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/api.whydesigners.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.whydesigners.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl/

# 5. Enable HTTPS in nginx configuration
nano nginx/conf.d/app.conf
# Uncomment the HTTPS server block (lines 64-114)
# Comment out or remove the HTTP server block (lines 22-61)

# 6. Restart nginx
docker-compose up -d nginx

# 7. Test HTTPS
curl https://api.whydesigners.com/health
```

### Auto-Renewal Setup

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e

# Add this line:
0 3 * * * certbot renew --quiet --deploy-hook "docker-compose -f /home/ubuntu/why-designers/docker-compose.yml restart nginx"
```

### Option 2: Using AWS Certificate Manager (ACM) with ALB

For production with high availability:

1. **Create Application Load Balancer (ALB)**
   - AWS Console → EC2 → Load Balancers → Create
   - Select "Application Load Balancer"
   - Configure:
     - Name: why-designers-alb
     - Scheme: Internet-facing
     - IP address type: IPv4
     - Listeners: HTTP (80) and HTTPS (443)

2. **Request SSL Certificate in ACM**
   - AWS Console → Certificate Manager
   - Request public certificate
   - Domain name: `api.whydesigners.com`
   - Validation: DNS validation
   - Add CNAME record to your DNS as instructed

3. **Configure ALB**
   - Add SSL certificate to HTTPS listener
   - Create target group pointing to EC2 instance port 80
   - Set health check path: `/health`

4. **Update DNS**
   - Change A record to CNAME or ALIAS record
   - Point to ALB DNS name

---

## Security Group Configuration

Make sure your EC2 security group allows traffic:

```
Inbound Rules:
- Type: HTTP, Port: 80, Source: 0.0.0.0/0
- Type: HTTPS, Port: 443, Source: 0.0.0.0/0
- Type: SSH, Port: 22, Source: YOUR_IP
```

---

## Final Checklist

After DNS and SSL setup:

- [ ] DNS resolves correctly: `nslookup api.whydesigners.com`
- [ ] HTTP works: `curl http://api.whydesigners.com/health`
- [ ] HTTPS works: `curl https://api.whydesigners.com/health`
- [ ] HTTP redirects to HTTPS (if configured)
- [ ] SSL certificate is valid (check with browser)
- [ ] CORS is configured for your frontend domain
- [ ] Update frontend to use `https://api.whydesigners.com`

---

## Common Issues & Solutions

### Issue 1: DNS not resolving

**Solution:**
- Wait 5-15 minutes for propagation
- Clear DNS cache: `sudo systemd-resolve --flush-caches` (Linux)
- Check with different DNS checker tools
- Verify A record is correct in DNS provider

### Issue 2: Connection refused

**Solution:**
- Check if nginx is running: `docker-compose ps nginx`
- Check security group allows port 80/443
- Verify EC2 instance is running
- Check nginx logs: `docker-compose logs nginx`

### Issue 3: SSL certificate errors

**Solution:**
- Ensure domain is pointing to correct IP
- Wait for Let's Encrypt verification
- Check certificate files exist: `ls -la nginx/ssl/`
- Verify nginx configuration syntax: `docker-compose exec nginx nginx -t`

### Issue 4: 502 Bad Gateway

**Solution:**
- Check if app container is running: `docker-compose ps app`
- Check app health: `docker-compose exec app curl http://localhost:5000/health`
- Check app logs: `docker-compose logs app`

---

## Environment Variables

Update your `.env.production`:

```bash
# CORS - Add your frontend domain
CORS_ORIGIN=https://whydesigners.com,https://www.whydesigners.com

# Frontend URL
FRONTEND_URL=https://whydesigners.com

# SES Email (optional - for sending emails)
AWS_SES_FROM_EMAIL=noreply@whydesigners.com
```

---

## API Endpoints

After setup, your API will be available at:

- **Base URL:** `https://api.whydesigners.com`
- **Health Check:** `https://api.whydesigners.com/health`
- **API v1:** `https://api.whydesigners.com/api/v1/*`

Example:
- Login: `POST https://api.whydesigners.com/api/v1/auth/login`
- Get Users: `GET https://api.whydesigners.com/api/v1/users`

---

## Support

For issues:
1. Check DNS: `nslookup api.whydesigners.com`
2. Check app health: `./scripts/health-check.sh`
3. Check logs: `./scripts/logs.sh`
4. Review nginx logs: `docker-compose logs nginx`

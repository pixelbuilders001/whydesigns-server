#!/bin/bash

# ==========================================
# Deployment Script for Why Designers Backend
# ==========================================

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}Please create .env.production from .env.production.example${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment file found${NC}"

# Pull latest code (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest code from git..."
    git pull origin main || git pull origin master
    echo -e "${GREEN}✓ Code updated${NC}"
fi

# Build and start containers
echo "🐳 Building Docker images..."
docker-compose build --no-cache

echo "🛑 Stopping old containers..."
docker-compose down

echo "🚀 Starting new containers..."
docker-compose up -d

# Wait for application to be healthy
echo "⏳ Waiting for application to be healthy..."
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo "📊 Container status:"
    docker-compose ps
else
    echo -e "${RED}❌ Deployment failed! Container is not running.${NC}"
    echo "📋 Logs:"
    docker-compose logs --tail=50
    exit 1
fi

# Show logs
echo -e "\n📋 Recent logs:"
docker-compose logs --tail=20

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "Application is running at: http://localhost:5000"

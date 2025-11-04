#!/bin/bash

# ==========================================
# Health Check Script
# ==========================================

echo "🏥 Checking application health..."

# Check if containers are running
echo "📦 Container status:"
docker-compose ps

# Check application health endpoint
echo -e "\n🔍 Testing health endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Application is healthy (HTTP $HTTP_CODE)"
else
    echo "❌ Application is unhealthy (HTTP $HTTP_CODE)"
    exit 1
fi

# Check disk space
echo -e "\n💾 Disk usage:"
df -h /

# Check memory usage
echo -e "\n🧠 Memory usage:"
free -h

# Check Docker stats
echo -e "\n🐳 Docker resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

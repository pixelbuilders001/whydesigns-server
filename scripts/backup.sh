#!/bin/bash

# ==========================================
# Backup Script for Why Designers Backend
# ==========================================

set -e

echo "💾 Starting backup process..."

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="why-designers-backup-$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📦 Creating backup: $BACKUP_NAME"

# Create backup archive
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='*.log' \
    .env.production \
    docker-compose.yml \
    nginx/

echo "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Keep only last 7 backups
echo "🧹 Cleaning old backups (keeping last 7)..."
ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup completed successfully!"
ls -lh $BACKUP_DIR/

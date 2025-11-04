#!/bin/bash

# ==========================================
# View Application Logs
# ==========================================

# Default to showing last 100 lines and following
LINES=${1:-100}

echo "📋 Showing last $LINES lines of application logs..."
echo "Press Ctrl+C to exit"
echo "----------------------------------------"

docker-compose logs -f --tail=$LINES app

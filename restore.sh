#!/bin/bash

# Birria Fusion Restore Script
echo "🔄 Starting restore process..."

# Pull latest from GitHub
git pull origin main

# Find latest database backup
LATEST_DB=$(ls -t backup/database_*.sql 2>/dev/null | head -n1)
if [ -n "$LATEST_DB" ]; then
    echo "📊 Restoring database from $LATEST_DB"
    sqlite3 foodtruck.db < "$LATEST_DB"
    echo "✅ Database restored"
else
    echo "⚠️ No database backup found"
fi

# Find latest uploads backup
LATEST_UPLOADS=$(ls -t backup/uploads_*.tar.gz 2>/dev/null | head -n1)
if [ -n "$LATEST_UPLOADS" ]; then
    echo "📁 Restoring uploads from $LATEST_UPLOADS"
    tar -xzf "$LATEST_UPLOADS"
    echo "✅ Uploads restored"
else
    echo "⚠️ No uploads backup found"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Restore completed successfully!"
echo "🚀 Run 'node server.js' to start the app"
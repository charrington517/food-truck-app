#!/bin/bash

# Birria Fusion Backup Script
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="backup"

echo "🔄 Starting backup at $DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Export database to SQL
if [ -f "foodtruck.db" ]; then
    echo "📊 Exporting database..."
    sqlite3 foodtruck.db .dump > $BACKUP_DIR/database_$DATE.sql
    echo "✅ Database exported"
fi

# Compress uploads folder
if [ -d "public/uploads" ]; then
    echo "📁 Compressing uploads..."
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz public/uploads/
    echo "✅ Uploads compressed"
fi

# Add all files to git
git add .

# Commit with timestamp
git commit -m "Backup: $DATE - Auto backup of Birria Fusion app"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed successfully!"
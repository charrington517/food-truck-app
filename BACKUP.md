# Birria Fusion - Backup System

## 🔄 Automated Backups
- **Daily backups** run automatically at 2:00 AM
- **Database** exported as SQL dump
- **Files** compressed and stored
- **GitHub** receives all code changes

## 📋 Manual Backup
```bash
./backup.sh
```

## 🔧 Restore from Backup
```bash
./restore.sh
```

## 📁 What's Backed Up
✅ Application code (server.js, package.json, etc.)  
✅ Database (exported as SQL)  
✅ Uploaded files (compressed)  
✅ Configuration files  

## 🚫 What's Excluded
❌ node_modules (reinstalled via npm)  
❌ Log files  
❌ Temporary files  
❌ .env secrets  

## 📊 Backup Status
Check backup log: `tail -f /home/chancesr/backup.log`

## 🔐 Security
- Uses SSH key authentication
- Database exported as SQL (not binary)
- Sensitive data excluded from Git
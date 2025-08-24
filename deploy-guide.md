# ERP Sistemi Deploy Rehberi

## 🚀 Full-Stack Deploy Seçenekleri

### 1. Replit Deploy (En Kolay)
```bash
# Replit'te zaten çalışıyorsan:
npm run build
npm start
# Sonra Replit'in "Deploy" butonunu kullan
```

### 2. Railway Deploy
```bash
# Railway CLI kurulum
npm install -g @railway/cli

# Railway'e login
railway login

# Proje oluştur ve deploy et
railway init
railway up
```

### 3. Vercel (Serverless)
```bash
# Vercel CLI kurulum
npm install -g vercel

# Deploy
vercel

# Environment variables eklemen lazım:
# - DATABASE_URL
# - SUPABASE_URL  
# - SUPABASE_ANON_KEY
```

### 4. Heroku Deploy
```bash
# Heroku CLI kurulum gerekli
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_supabase_url

# Git push
git push heroku main
```

## ⚙️ Environment Variables
Deploy ederken şu environment variable'ları eklemen lazım:
```
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Production Build Script
```bash
# Full build (frontend + backend)
npm run build

# Production start
npm start
```

## ⚠️ Önemli Notlar
1. Sadece `dist/public` klasörü static hosting'e yetmez
2. Backend server (`dist/index.js`) de çalışması lazım
3. Database bağlantısı olması lazım (Supabase)
4. Environment variables production değerleri ile set edilmeli

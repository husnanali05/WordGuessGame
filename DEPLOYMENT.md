# Deployment Guide

This guide will help you deploy your Word Guess Game to production.

## 🚀 Frontend Deployment (Netlify)

### Step 1: Prepare for Deployment
1. Make sure your code is pushed to GitHub
2. Update the backend URL in `wordguess-web/src/config.js`:
   ```javascript
   export const API_BASE = isDevelopment 
     ? 'http://localhost:5001'  // Development
     : 'https://your-backend-url.railway.app';  // Production - UPDATE THIS
   ```

### Step 2: Deploy to Netlify
1. Go to [Netlify.com](https://netlify.com) and sign in
2. Click **"New site from Git"**
3. **Connect to GitHub** and authorize Netlify
4. **Select your repository** (`word-guess-game`)
5. **Configure build settings**:
   - **Base directory**: `wordguess-web`
   - **Build command**: `npm run build`
   - **Publish directory**: `wordguess-web/dist`
6. **Click "Deploy site"**

### Step 3: Update Backend URL
After deploying the backend (see below), update the production URL in `config.js` and redeploy.

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Backend
1. Create a `Procfile` in the `wordguess-api` directory:
   ```
   web: python app.py
   ```

2. Create `requirements.txt` in `wordguess-api`:
   ```
   Flask==3.1.2
   Flask-CORS==6.0.1
   Flask-SQLAlchemy==3.1.1
   requests==2.31.0
   ```

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. **Connect to GitHub** and select your repository
4. **Configure the service**:
   - **Root Directory**: `wordguess-api`
   - **Start Command**: `python app.py`
5. **Set environment variables** (if needed)
6. **Deploy**

### Step 3: Get Backend URL
1. After deployment, Railway will provide a URL like: `https://your-app-name.railway.app`
2. Update this URL in your frontend `config.js`
3. Redeploy the frontend

## 🔄 Alternative Backend Hosting

### Heroku (Alternative)
1. Install Heroku CLI
2. Create `Procfile` in `wordguess-api`:
   ```
   web: python app.py
   ```
3. Deploy:
   ```bash
   cd wordguess-api
   heroku create your-app-name
   git subtree push --prefix=wordguess-api heroku main
   ```

### Render (Alternative)
1. Go to [Render.com](https://render.com)
2. Connect GitHub repository
3. Configure:
   - **Root Directory**: `wordguess-api`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

## 🎯 Final Steps

1. **Test the deployment**: Visit your Netlify URL
2. **Update CORS**: Make sure your backend allows your Netlify domain
3. **Monitor**: Check both services for any errors

## 🔧 Troubleshooting

### Common Issues:
- **CORS errors**: Update backend CORS settings
- **API not found**: Check backend URL in config.js
- **Build failures**: Check build logs in Netlify
- **Database issues**: Ensure SQLite file is included in deployment

### Environment Variables:
If you need to set environment variables:
- **Netlify**: Site Settings → Environment Variables
- **Railway**: Project Settings → Variables
- **Heroku**: `heroku config:set KEY=value`

## 📝 Notes

- The backend uses SQLite, which works well for small to medium applications
- For production with many users, consider PostgreSQL
- Monitor your API usage and costs
- Set up proper error logging and monitoring

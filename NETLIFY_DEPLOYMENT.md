# Netlify Deployment Guide

## Overview
This app is configured to deploy to Netlify. The frontend is built with React/Vite and hosted on Netlify's CDN. The backend can be hosted on Replit or another server, and the frontend connects to it via environment variables.

## Prerequisites
1. A Netlify account (netlify.com)
2. A GitHub repository with this code
3. A running backend server (or follow serverless setup below)

## Deployment Steps

### Option 1: Frontend on Netlify + Backend on Replit (Recommended for Fast Setup)

1. **Set up Replit backend**
   - Your Express server runs on Replit at a public URL
   - Get your Replit URL from the deployed project

2. **Connect GitHub to Netlify**
   - Go to netlify.com and click "Add new site"
   - Select "Connect to Git"
   - Choose GitHub and authorize
   - Select this repository

3. **Configure Netlify Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables (go to Site settings > Build & deploy > Environment):
     ```
     VITE_API_URL=https://your-replit-url.replit.dev
     ```

4. **Deploy**
   - Netlify will automatically deploy when you push to main
   - Customize domain in Site settings > Domain management

### Option 2: Full Deployment to Netlify (Serverless Backend)

⚠️ **Note:** This requires additional setup for session/auth handling in serverless environment.
- Currently, the `netlify/functions/file.ts` is set up to serve public files
- API routes (`netlify/functions/api.ts`) would need a database solution compatible with serverless (e.g., Supabase, Vercel KV)
- This approach requires more configuration

## Environment Variables

Create a `.env.production` or set in Netlify dashboard:

```env
DATABASE_URL=your_production_database_url
VITE_API_URL=https://your-replit-backend-url
```

## File Structure for Netlify

```
.
├── netlify.toml          # Netlify configuration
├── netlify/functions/    # Serverless functions (for file serving)
├── client/               # React frontend
├── server/               # Express backend (for Replit)
└── shared/               # Shared types and schemas
```

## Important Files

- **netlify.toml**: Main configuration for Netlify builds and redirects
- **netlify/functions/file.ts**: Serves public user files via URLs like `/username/file` and `/username/folder/file`
- **netlify/functions/api.ts**: API proxy (currently redirects to backend server)

## Troubleshooting

### "Site not found" errors
- Check that `VITE_API_URL` is set correctly in Netlify environment variables
- Ensure your backend server is running and accessible
- Check browser Network tab to see actual API requests

### CORS errors
- Your backend should include CORS headers for the Netlify domain
- For Replit backend, ensure it's configured to accept requests from your Netlify domain

### File serving issues
- Public files (index.html, uploaded HTML files) are served via Netlify Functions
- Ensure files are uploaded to the correct user account
- Check file permissions in the database

## Next Steps

After deploying:
1. Test the app on your Netlify domain
2. Update your repository to use the Netlify deployment
3. Configure custom domain (optional)
4. Set up automatic deployments for production branch

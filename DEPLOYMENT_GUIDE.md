# CombineCode Deployment Guide

This guide will walk you through deploying CombineCode using a hybrid approach:
- **Frontend**: Vercel (for optimal performance and CDN)
- **WebSocket Server**: Railway.app (for reliable Socket.io support)

## 🚀 Prerequisites

1. **GitHub Repository**: Your code is already pushed to https://github.com/Jeel-Vaishnav/Combine-Code
2. **Database**: You'll need a PostgreSQL database (free options available)
3. **Accounts**: 
   - [Vercel](https://vercel.com/signup) (free tier available)
   - [Railway](https://railway.app/) (free tier available)
   - Optional: [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) for free PostgreSQL

## 📋 Step 1: Set Up Your Database

### Option A: Neon.tech (Recommended - Free & Easy)
1. Go to [neon.tech](https://neon.tech/) and sign up
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/dbname?sslmode=require`)
4. Save this for later

### Option B: Vercel PostgreSQL (If using Vercel)
1. In Vercel dashboard, go to your project → Storage → Create PostgreSQL
2. Vercel will provide the connection string automatically

### Option C: Supabase
1. Go to [supabase.com](https://supabase.com/) and sign up
2. Create a new project
3. Go to Settings → Database → Connection string
4. Use the pooled connection string

## 🌐 Step 2: Deploy WebSocket Server to Railway

### 1. Prepare Railway
1. Go to [railway.app](https://railway.app/) and sign up (GitHub login works)
2. Click "New Project" → "Deploy from GitHub"
3. Select your `Combine-Code` repository
4. Railway will detect it's a Node.js project

### 2. Configure Railway Service
1. **Start Command**: Railway should auto-detect, but verify it's: `tsx server.ts`
2. **Environment Variables**: Add these in the Railway dashboard:
   ```
   DATABASE_URL=[Your Neon/Vercel/Supabase PostgreSQL URL]
   JWT_SECRET=[Same as in your .env]
   NODE_ENV=production
   PORT=[Leave blank - Railway provides this]
   ```
   **Do NOT set NEXT_PUBLIC_SOCKET_URL here** - this is for the frontend only

### 3. Deploy
1. Click "Deploy"
2. Railway will:
   - Install dependencies (`npm install`)
   - Start your server (`tsx server.ts`)
   - Provide you with a URL like: `https://combinesocket.up.railway.app`

### 4. Test Your WebSocket Server
1. Visit your Railway URL in a browser - you should see a "Cannot GET /" (this is normal - it means the server is running)
2. Check Railway logs for any errors
3. Ensure you see: `🚀 [Ready] HTTP & Next.js running on http://0.0.0.0:[PORT]` and `⚡ [Realtime] Socket.io gateway listening at /socket.io`

## 🎨 Step 3: Deploy Frontend to Vercel

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up (GitHub login works)
2. Click "New Project" → "Import Git Repository"
3. Select your `Combine-Code` repository
4. Vercel should auto-detect it's a Next.js project

### 2. Configure Vercel Project
1. **Framework Preset**: Next.js (should auto-detect)
2. **Build Command**: `next build` (should auto-detect)
3. **Output Directory**: `.next` (should auto-detect)
4. **Install Command**: `npm install` or `yarn` (should auto-detect)
5. **Environment Variables**: Add these in Vercel dashboard:
   ```
   DATABASE_URL=[Same PostgreSQL URL you used for Railway]
   JWT_SECRET=[Same secret as before]
   NEXT_PUBLIC_SOCKET_URL=[Your Railway WebSocket URL, e.g., https://combinesocket.up.railway.app]
   NODE_ENV=production
   ```
   **Important**: Do NOT add NEXT_PUBLIC_SOCKET_URL until after your Railway deployment is complete and you have the URL

### 3. Deploy
1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Build your Next.js app (`next build`)
   - Deploy the static files to their CDN
   - Provide you with a URL like: `https://combine-code.vercel.app`

## 🔗 Step 4: Connect Everything Together

### 1. Get Your Railway URL
After Railway deployment completes, note your WebSocket server URL (e.g., `https://combinesocket.up.railway.app`)

### 2. Update Vercel Environment Variable
1. Go to your Vercel project → Settings → Environment Variables
2. Set `NEXT_PUBLIC_SOCKET_URL` to your Railway URL
3. Click "Save"
4. Vercel will automatically trigger a redeploy

### 3. Verify Connection
1. Visit your Vercel URL
2. Open browser developer tools (F12) → Console tab
3. Look for Socket.io connection logs:
   - `⚡ Connected to real-time WebSocket server`
   - If you see connection errors, check:
     - Is your Railway server running? (check Railway logs)
     - Is NEXT_PUBLIC_SOCKET_URL set correctly in Vercel?
     - Are there any CORS issues? (check Socket.io CORS config in server.ts)

## 🧪 Step 5: Test Real-Time Features

1. **Create Test Data**:
   - Sign up for two different accounts (or use same account in two browsers)
   - Create a workspace and project

2. **Test Real-Time Updates**:
   - In Browser 1: Create a task
   - In Browser 2: Task should appear automatically
   - In Browser 1: Move task between columns
   - In Browser 2: Task should move in real-time
   - In Browser 1: Add a comment
   - In Browser 2: Comment should appear instantly

3. **Test Optimistic Concurrency Control**:
   - Have both users try to edit the same task simultaneously
   - Verify conflict resolution UI appears appropriately

## 🛠️ Troubleshooting Common Issues

### Socket.io Connection Problems
1. **Error: WebSocket connection failed**
   - Check that your Railway server is running
   - Verify NEXT_PUBLIC_SOCKET_URL is correct in Vercel
   - Check Railway logs for Socket.io initialization errors

2. **Error: CORS blocked**
   - Ensure your Socket.io CORS configuration in `src/server/socket.ts` allows your Vercel domain
   - Current config uses `origin: "*"` which should work for testing
   - For production, consider restricting to your Vercel domain

### Database Issues
1. **Error: PrismaClientKnownRequestError**
   - Verify your DATABASE_URL is correct
   - Ensure your database allows connections from your deployment IPs
   - Try running `npx prisma db push` manually to test connection

2. **Error: Missing tables**
   - Run `npx prisma db push` on your database to ensure schema is up-to-date
   - You can do this locally or via a one-off Railway/ Vercel shell

### Performance Issues
1. **Slow initial load**
   - Vercel provides excellent CDN caching - subsequent loads should be fast
   - Consider enabling Vercel's Image Optimization if you add images later

2. **WebSocket latency**
   - Choose Railway/Vercel regions close to your user base
   - Both platforms have multiple regions available

## 📈 Scaling Recommendations

### As Your App Grows:
1. **WebSocket Scaling** (if needed):
   - Add Redis adapter to Socket.io for multi-instance support
   - Railway makes this easy with their Redis addon
   - Modify `initializeSocketServer` to use Redis adapter

2. **Database Optimization**:
   - Add indexes to frequently queried fields in your Prisma schema
   - Consider connection pooling (Prisma does this automatically)

3. **Frontend Optimization**:
   - Vercel automatically optimizes Next.js apps
   - Use `next/image` for any images you add
   - Leverage Vercel's Edge Middleware for geolocation-based routing if needed

## 🔒 Security Considerations

1. **Environment Variables**:
   - Never commit `.env` to Git (you have `.gitignore` protecting this)
   - Use platform-specific secret management (Vercel/Railway env vars)

2. **CORS**:
   - For production, tighten Socket.io CORS to specific domains
   - Update `src/server/socket.ts` line 21: change `origin: "*"` to your Vercel domain

3. **Rate Limiting**:
   - Consider adding rate limiting to Socket.io connections
   - Especially important for public-facing apps

4. **Helmet/Security Headers**:
   - Your Next.js app gets security headers from Vercel by default
   - For custom server, consider adding helmet.js middleware

## 🔄 Development vs Production

### Local Development:
```bash
# Use SQLite database (default)
cp .env.example .env
# .env already has: DATABASE_URL="file:./dev.db"
npm run dev
# Runs both Next.js dev server and Socket.io on localhost:3005
```

### Production (Vercel + Railway):
- Frontend: Served from Vercel's global CDN
- WebSocket: Running on Railway (or your chosen platform)
- Database: External PostgreSQL (Neon, Vercel, Supabase, etc.)
- Environment managed separately on each platform

## 📞 Need Help?

1. **Railway Issues**: Check their [docs](https://docs.railway.app/) or contact support
2. **Vercel Issues**: Check their [docs](https://vercel.com/docs) or deployments tab for logs
3. **Database Issues**: Check your provider's documentation (Neon, Supabase, etc.)
4. **Application Errors**: Check logs on both platforms for detailed error messages

## 🎉 You're Done!

Your CombineCode application is now deployed with:
- ⚡ Blazing fast frontend from Vercel's edge network
- 🔌 Reliable real-time WebSocket server from Railway
- 🗄️ Scalable PostgreSQL database
- 🔒 Proper environment variable management
- 🔄 Seamless real-time collaboration with Optimistic Concurrency Control

Visit your Vercel URL to start using your deployed application!

**Pro Tip**: Consider setting up a custom domain in both Vercel and Railway for a more professional appearance.
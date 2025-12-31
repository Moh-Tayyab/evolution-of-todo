# Deployment Guide - Todo App

## Frontend (Vercel)

### 1. Deploy to Vercel
```bash
cd Phase-II-fullstack-web-app/frontend
vercel --prod
```

### 2. Environment Variables
Set these in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: Your backend URL
- `BETTER_AUTH_URL`: Your Vercel frontend URL
- `NEXT_PUBLIC_APP_URL`: Your Vercel frontend URL
- `BETTER_AUTH_SECRET`: Generate with `openssl rand -base64 32`

### 3. Custom Domain (Optional)
- Go to Vercel Dashboard > Settings > Domains
- Add your custom domain

---

## Backend (Railway/Render/Fly.io)

### Option 1: Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Set root directory to `Phase-II-fullstack-web-app/backend`
3. Add environment variables from `.env.production`
4. Deploy

### Option 2: Render
1. Create a new Web Service
2. Connect your GitHub repo
3. Build command: `pip install -e .`
4. Start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

### 3. Environment Variables
Set in your hosting platform:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Strong random secret
- `BETTER_AUTH_URL`: Your frontend URL

---

## Database (Neon)

### 1. Create Neon Project
1. Go to https://neon.tech
2. Create new project
3. Copy connection string

### 2. Update Environment Variables
Update `DATABASE_URL` in backend environment with your Neon URL

---

## Better Auth Setup

### Production Considerations
1. Use a proper database adapter (not memory adapter)
2. Set secure `BETTER_AUTH_SECRET`
3. Configure CORS for your frontend domain
4. Use HTTPS in production

### Recommended Adapters
- `@better-auth/drizzle` - For Drizzle ORM
- `@better-auth/sqlite-adapter` - For SQLite
- Custom adapter for other databases

---

## Quick Deploy Commands

### Frontend to Vercel
```bash
cd Phase-II-fullstack-web-app/frontend
vercel --prod
```

### Backend to Railway
```bash
cd Phase-II-fullstack-web-app/backend
railway deploy
```

---

## Verification Checklist
- [ ] Frontend loads without errors
- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard loads tasks
- [ ] Create task works
- [ ] Edit task works
- [ ] Delete task works
- [ ] Search/filter works
- [ ] Animations work smoothly
- [ ] Mobile responsive

# Render Deployment Guide for Zhi Systems Website

## Quick Setup Instructions

### Option 1: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically detect the `render.yaml` file
4. The database and web service will be created automatically

### Option 2: Manual Setup
1. Create a PostgreSQL database on Render:
   - Database Name: `zhi_systems`
   - User: `zhi_systems_user`
   - Plan: Free

2. Create a Web Service:
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Node Version: 20
   - Environment Variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: [Copy from your Render PostgreSQL database]

## Environment Variables Required

- `NODE_ENV`: Set to `production`
- `DATABASE_URL`: Your PostgreSQL connection string from Render
- `PORT`: Automatically set by Render (defaults to 5000)

## Build Process

The application builds in this order:
1. `npm ci` - Install dependencies
2. `npm run build` - Builds both client and server:
   - Vite builds the React client to `dist/public`
   - ESBuild compiles the TypeScript server to `dist/index.js`
3. `npm start` - Runs the production server

## Database Setup

After deployment, you'll need to push your database schema:
1. Connect to your deployed app
2. Set your `DATABASE_URL` environment variable locally
3. Run: `npm run db:push`

## Troubleshooting

### Common Issues:
1. **Build fails**: Make sure all dependencies are in `dependencies` not `devDependencies`
2. **Database connection errors**: Verify `DATABASE_URL` is correctly set
3. **Static files not serving**: The build process creates `dist/` folder with all assets

### Health Check
The app serves on the `/` route and includes both API endpoints and the React frontend.

## File Structure After Build
```
dist/
├── index.js          # Compiled server
├── index.html        # React app entry point
├── assets/           # CSS, JS, and other assets
└── ...              # Other static files
```

## Important Notes
- The server listens on `0.0.0.0:PORT` for Render compatibility
- All API routes are under `/api/`
- Frontend routes are handled by React Router (wouter)
- Database migrations use Drizzle ORM's push command
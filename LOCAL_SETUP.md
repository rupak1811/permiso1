# Local Development Setup

## Quick Start (Both Servers)

### Option 1: Run Both Servers Together (Recommended)
From the **root directory**:
```bash
npm run dev
```
This starts both backend (port 5000) and frontend (port 3000) automatically.

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd server
npm install  # if needed
node index.js
# or
npm run dev  # if using nodemon
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install  # if needed
npm start
```

## How It Works

### Local Development:
- **Frontend:** Runs on `http://localhost:3000`
- **Backend:** Runs on `http://localhost:5000`
- **Proxy:** The `"proxy": "http://localhost:5000"` in `client/package.json` automatically forwards `/api/*` requests to the backend
- **Axios:** Uses relative paths (`/api/...`) which work with the proxy

### Vercel Production:
- **Frontend:** Built as static files, served from `client/build`
- **Backend:** Runs as serverless functions via `api/[...path].js`
- **Proxy:** Ignored (only works in development)
- **Axios:** Uses relative paths (`/api/...`) which Vercel rewrites to serverless functions

## Important Notes

1. **The proxy in `package.json` is SAFE** - it only works in development mode (`npm start`)
2. **Production builds ignore the proxy** - Vercel builds use `npm run build` which doesn't use the proxy
3. **No environment variables needed locally** - the proxy handles everything
4. **Vercel doesn't need `REACT_APP_API_URL`** - leave it empty or unset

## Troubleshooting

### If you get 404 errors locally:

1. **Check backend is running:**
   ```bash
   # Test in browser or curl:
   http://localhost:5000/api/auth/login
   ```
   Should return a validation error (not 404)

2. **Restart React dev server:**
   - Stop it (Ctrl+C)
   - Start again: `npm start`
   - The proxy only activates when the dev server starts

3. **Check ports:**
   - Backend: Port 5000
   - Frontend: Port 3000
   - Make sure nothing else is using these ports

4. **Verify proxy is set:**
   - Check `client/package.json` has: `"proxy": "http://localhost:5000"`

## Both Environments Work Automatically

✅ **Local:** Proxy forwards requests to localhost:5000  
✅ **Vercel:** Rewrites forward requests to serverless functions  
✅ **No code changes needed** - same code works in both!


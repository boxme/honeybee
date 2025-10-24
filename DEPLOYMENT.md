# Honeybee Production Deployment Guide

This guide walks you through deploying Honeybee to DigitalOcean App Platform with a custom domain.

**Optimized for Asia:** This deployment is configured for the Singapore (SGP) region, providing the lowest latency for users across Asia including Southeast Asia, East Asia, and Oceania.

## Prerequisites

- DigitalOcean account
- GitHub account with this repository
- Credit card for domain registration and hosting (~$20-25/month total)

## Deployment Steps

### 1. Get a Domain Name

**Option A: Through DigitalOcean (Recommended for simplicity)**
1. Log in to your DigitalOcean account
2. Navigate to **Networking** → **Domains**
3. Click **Register Domain**
4. Search for your desired domain (e.g., `yourhoneybee.app`, `honeybee-events.com`)
5. Complete purchase (~$10-15/year)
6. Domain will be automatically configured with DigitalOcean DNS

**Option B: Through another registrar (Namecheap, Google Domains, etc.)**
1. Purchase domain through your preferred registrar
2. Point nameservers to DigitalOcean:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`
3. Add domain to DigitalOcean under **Networking** → **Domains**

### 2. Push Code to GitHub

Ensure your code is pushed to a GitHub repository:

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Initial commit for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/honeybee.git
git branch -M main
git push -u origin main
```

### 3. Create App on DigitalOcean App Platform

1. Log in to DigitalOcean
2. Navigate to **Apps** in the sidebar
3. Click **Create App**

#### Connect GitHub Repository

1. Click **GitHub** as your source
2. Authorize DigitalOcean to access your GitHub account
3. Select your `honeybee` repository
4. Choose the `main` branch
5. Check **Autodeploy** to deploy on every push
6. Click **Next**

#### Configure Using App Spec (Recommended)

1. Click **Edit Your App Spec**
2. Replace the entire content with the contents of `.do/app.yaml`
3. Update these values in the spec:
   - Replace `YOUR_GITHUB_USERNAME/honeybee` with your actual repo path
   - **Region is pre-configured to `sgp` (Singapore)** for optimal performance in Asia
     - Other Asia options: `blr` (Bangalore, India)
     - If you need a different region, update line 2 of the app.yaml
   - Generate a strong JWT secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - Replace `CHANGE_THIS_TO_RANDOM_STRING` with the generated secret

#### Manual Configuration Alternative

If you prefer to configure manually instead of using the app spec:

**Select Region:**
1. When prompted, choose **Singapore** region for optimal performance in Asia
   - Alternative: **Bangalore** if your users are primarily in South Asia
2. Click **Next**

**Add Database:**
1. Click **Add Resource** → **Database**
2. Choose **PostgreSQL**
3. Select version 16 (or latest)
4. Choose **Basic** plan ($15/month)
5. Name it `honeybee-db`
6. Ensure the database is in the same region (Singapore) as your app

**Configure Backend Service:**
1. Service name: `api`
2. Source directory: `/server`
3. Build command: `npm install`
4. Run command: `npm start`
5. HTTP port: `3001`
6. Instance size: Basic ($6/month)

**Add Environment Variables for Backend:**
- `NODE_ENV` = `production`
- `PORT` = `3001`
- `DATABASE_URL` = `${honeybee-db.DATABASE_URL}` (auto-filled)
- `CLIENT_URL` = `${web.PUBLIC_URL}` (auto-filled after frontend is set up)
- `JWT_SECRET` = `[your-generated-secret]` (mark as secret)

**Configure Frontend Static Site:**
1. Click **Add Component** → **Static Site**
2. Service name: `web`
3. Build command: `npm install && npm run build`
4. Output directory: `dist`

**Add Environment Variable for Frontend:**
- `VITE_API_URL` = `${api.PUBLIC_URL}/api` (auto-filled, build-time only)

### 4. Initialize Database Schema

After the app is deployed:

1. Go to **Apps** → **Your App** → **Console**
2. Select the `api` service
3. Open a console session
4. Run the database initialization:

```bash
# If you have a schema file
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const schema = fs.readFileSync('/app/db/schema.sql', 'utf8');
pool.query(schema).then(() => {
  console.log('Schema initialized');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
"
```

**Alternative: Run schema manually**
1. Navigate to **Databases** → **honeybee-db**
2. Click **Connection Details**
3. Use provided connection string with `psql` locally:
```bash
psql "your-connection-string-here" < server/db/schema.sql
```

### 5. Configure Custom Domain

#### Set up Domain for Frontend

1. Go to your app in DigitalOcean
2. Click **Settings** → **Domains**
3. Click **Add Domain** for the `web` component
4. Enter your domain (e.g., `honeybee.app`)
5. DigitalOcean will provide DNS records to add
6. If using DigitalOcean DNS, records are added automatically
7. Click **Add Domain**

#### Set up Subdomain for API

1. Add another domain for the `api` component
2. Use a subdomain like `api.honeybee.app`
3. Add the DNS records as instructed
4. Click **Add Domain**

#### Update Environment Variables

After domains are configured:

1. Go to **Settings** → **App-Level Environment Variables**
2. Update `CLIENT_URL` to your frontend domain (e.g., `https://honeybee.app`)
3. Update `VITE_API_URL` to your API domain (e.g., `https://api.honeybee.app/api`)
4. Click **Save** (this will trigger a redeployment)

### 6. Enable HTTPS (SSL)

DigitalOcean automatically provisions SSL certificates via Let's Encrypt:

1. Once DNS propagates (5-30 minutes), SSL is auto-enabled
2. Verify by visiting your domains - you should see the lock icon
3. HTTP requests are automatically redirected to HTTPS

### 7. Test Real-time Features

Socket.io should work automatically on App Platform, but verify:

1. Open your app in two different browsers (or incognito mode)
2. Log in with paired accounts
3. Create an event in one browser
4. Verify it appears in real-time in the other browser

**Troubleshooting Socket.io:**
- App Platform supports WebSockets by default on ports 80/443
- Check browser console for connection errors
- Verify `CLIENT_URL` environment variable is correct
- Ensure CORS is properly configured in server/index.js:16

### 8. Monitor and Scale

**View Logs:**
- Go to **Apps** → **Your App** → **Runtime Logs**
- Select `api` or `web` to view respective logs

**Monitor Performance:**
- Check **Metrics** tab for CPU, memory, and bandwidth usage
- Review **Activity** tab for deployment history

**Scale Up (if needed):**
- Go to **Settings** → **Components**
- Click on a component to upgrade instance size
- Adjust instance count for horizontal scaling

## Deployment Costs Breakdown

- **App Platform (Basic)**: ~$6/month per service × 2 = $12/month
- **PostgreSQL Database (Basic)**: ~$15/month
- **Domain Registration**: ~$10-15/year
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$27/month + ~$12/year

## Post-Deployment Tasks

### Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Verify JWT_SECRET is a strong random string
- [ ] Enable automatic backups for database (in database settings)
- [ ] Set up monitoring alerts
- [ ] Test account registration and password reset flows

### PWA Installation

Your app is now a full PWA:

**On Mobile (iOS/Android):**
1. Visit your domain in Safari/Chrome
2. Tap share icon
3. Select "Add to Home Screen"
4. App now works offline!

**On Desktop:**
1. Visit your domain in Chrome/Edge
2. Look for install icon in address bar
3. Click to install as standalone app

### Monitoring

Set up alerts:
1. Go to **Settings** → **Alerts**
2. Enable alerts for:
   - Deployment failures
   - High CPU usage
   - High memory usage
   - Database connection errors

## Updating Your App

Every push to your `main` branch automatically triggers deployment:

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push origin main

# DigitalOcean automatically builds and deploys
```

Monitor deployment progress:
- **Apps** → **Your App** → **Activity**

## Troubleshooting

### Build Failures

Check build logs in the Activity tab. Common issues:
- Missing dependencies: Ensure package.json is complete
- Build command errors: Verify commands work locally
- Environment variables: Check all required vars are set

### Database Connection Issues

1. Verify `DATABASE_URL` is correctly set
2. Check database is running: **Databases** → **honeybee-db**
3. Review API logs for connection errors
4. Ensure schema is initialized

### CORS Errors

If API calls fail with CORS errors:
1. Verify `CLIENT_URL` matches your frontend domain exactly (including https://)
2. Check server/index.js:15-18 for CORS configuration
3. Ensure no trailing slashes in URLs

### Socket.io Connection Failures

1. Check browser console for WebSocket errors
2. Verify API URL is correct (should use `wss://` protocol)
3. Check that Socket.io client is using the correct URL
4. Review API logs for Socket.io connection attempts

### Domain Not Resolving

1. Check DNS propagation: https://www.whatsmydns.net
2. Verify nameservers are correctly set (if using external registrar)
3. Wait up to 48 hours for full DNS propagation
4. Clear browser DNS cache

## Need Help?

- DigitalOcean Community: https://www.digitalocean.com/community
- DigitalOcean Support: https://cloud.digitalocean.com/support
- App Platform Docs: https://docs.digitalocean.com/products/app-platform/

## Rollback

If something goes wrong:

1. Go to **Apps** → **Your App** → **Activity**
2. Find a successful previous deployment
3. Click the three dots → **Redeploy**

This instantly reverts to the previous version.

# Deployment Checklist

Use this checklist when deploying to DigitalOcean App Platform.

## Pre-Deployment

- [ ] Code pushed to GitHub repository
- [ ] All tests passing locally
- [ ] Database schema file ready (server/db/schema.sql)
- [ ] Generated strong JWT secret (save it somewhere secure)

## Domain Setup

- [ ] Domain registered (DigitalOcean or external registrar)
- [ ] DNS configured (if external registrar, pointed to DigitalOcean nameservers)
- [ ] Domain added to DigitalOcean Networking section (if applicable)

## DigitalOcean Configuration

- [ ] App created on App Platform
- [ ] Region set to Singapore (SGP) for Asia-based users
- [ ] GitHub repository connected
- [ ] App spec configured (.do/app.yaml):
  - [ ] GitHub repo path updated
  - [ ] Region confirmed as 'sgp' (Singapore)
  - [ ] JWT_SECRET set
- [ ] Database created (PostgreSQL 16) in Singapore region
- [ ] Environment variables configured:
  - [ ] NODE_ENV=production
  - [ ] PORT=3001
  - [ ] DATABASE_URL (auto-configured)
  - [ ] PGSSLMODE=no-verify (for SSL connection to database)
  - [ ] CLIENT_URL (set after frontend domain configured)
  - [ ] JWT_SECRET (strong random string)
  - [ ] VITE_API_URL (auto-configured with ${api.PUBLIC_URL}/api)

## Post-Deployment

- [ ] Database schema initialized
- [ ] Custom domain configured (e.g., honeybee.app)
  - Note: Only add domain to 'web' component - API is automatically at yourdomain.com/api
- [ ] SSL certificates active (check for lock icon)
- [ ] Test account registration
- [ ] Test user pairing with 6-character code
- [ ] Test event creation
- [ ] Test real-time sync between paired accounts
- [ ] Test PWA installation on mobile device
- [ ] Test offline functionality
- [ ] Database backups enabled
- [ ] Monitoring alerts configured

## Verification Tests

1. **Authentication Flow**
   - [ ] Register new account
   - [ ] Login with credentials
   - [ ] Logout
   - [ ] Invalid login fails appropriately

2. **Partner Pairing**
   - [ ] 6-character code displayed after registration
   - [ ] Second user can enter code to pair
   - [ ] Pairing confirmation works

3. **Event Management**
   - [ ] Create new event
   - [ ] Edit existing event
   - [ ] Delete event
   - [ ] Events persist after page refresh

4. **Real-time Sync**
   - [ ] Open app in two browsers with paired accounts
   - [ ] Create event in browser A
   - [ ] Event appears immediately in browser B
   - [ ] Update event in browser B
   - [ ] Update appears in browser A
   - [ ] Delete event in browser A
   - [ ] Deletion syncs to browser B

5. **PWA Features**
   - [ ] App installable on mobile (iOS/Android)
   - [ ] App works offline after installation
   - [ ] Service worker caching works
   - [ ] App icon appears on home screen

6. **Performance**
   - [ ] Initial load time acceptable
   - [ ] API response times fast
   - [ ] WebSocket connections stable
   - [ ] No console errors in browser

## Troubleshooting

If issues occur, check:
- [ ] Runtime logs in App Platform
- [ ] Browser console for errors
- [ ] Network tab for failed requests
- [ ] Database connection status
- [ ] Environment variables set correctly
- [ ] DNS propagation completed

## Rollback Plan

If deployment fails:
1. Go to Apps → Your App → Activity
2. Find previous successful deployment
3. Click three dots → Redeploy

## Cost Monitoring

- [ ] Set budget alerts in DigitalOcean
- [ ] Review monthly billing
- [ ] Expected: ~$19/month for basic setup (dev database)
  - Upgrade to production database cluster if needed (~$8-15/month more)

## Notes

Record any important information here:
- Domain name: _______________
- Frontend URL: _______________
- API URL: _______________
- Database name: _______________
- JWT Secret stored in: _______________


# Honeybee

A Progressive Web App (PWA) designed for couples to share planned events and activities. The app works offline-first with local SQLite storage and syncs with a remote PostgreSQL database when online.

## Honeybee App Testing Plan

### Local Deployment Setup

#### Prerequisites
1. **Node.js** (v18+)
2. **PostgreSQL** (v14+ recommended)
3. **Git**

#### Environment Setup
1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd honeybee
   npm install
   cd server && npm install && cd ..
   ```

2. **Database setup**:
   ```bash
   # Create PostgreSQL database
   createdb honeybee
   
   # Run schema
   psql honeybee < server/db/schema.sql
   ```

3. **Environment configuration**:
   ```bash
   # Frontend environment
   cp .env.example .env
   
   # Backend environment  
   cp server/.env.example server/.env
   ```
   
   Configure `server/.env` with:
   - Database connection string
   - JWT_SECRET
   - PORT (default 3001)

#### Start Services
```bash
# Terminal 1: Backend server
npm run server:dev

# Terminal 2: Frontend dev server
npm run dev
```

### Testing Framework

#### 1. User Registration & Authentication
**Test Cases:**
- [ ] Register new user with valid data
- [ ] Verify unique user code generation (nanoid format)
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials
- [ ] Access protected routes with/without JWT
- [ ] Token expiration handling

**Steps:**
1. Open app in browser
2. Click "Register" and fill form
3. Verify successful registration and automatic login
4. Check that user code is generated (21-character nanoid string)
5. Logout and login again
6. Test invalid credentials

#### 2. Partner Pairing System
**Test Cases:**
- [ ] Pair with valid partner code
- [ ] Attempt self-pairing (should fail)
- [ ] Pair with invalid code (should fail)
- [ ] Verify bidirectional partnership

**Steps:**
1. Create two user accounts in separate browser sessions/incognito
2. Copy User A's code
3. In User B's session, attempt pairing with User A's code
4. Verify both users show each other as partners
5. Test error cases with invalid codes

#### 3. Event Management (Offline-First)
**Test Cases:**
- [ ] Create event while online
- [ ] Create event while offline
- [ ] Edit existing event
- [ ] Delete event
- [ ] View event list
- [ ] Event date/time handling
- [ ] Event sharing with partner

**Steps:**
1. Create various events with different data
2. Disconnect network and create events offline
3. Reconnect and verify sync
4. Test CRUD operations on events
5. Verify partner can see shared events

#### 4. Real-time Synchronization
**Test Cases:**
- [ ] Real-time event creation sync
- [ ] Real-time event updates
- [ ] Connection/disconnection handling
- [ ] Offline queue sync on reconnection

**Steps:**
1. Open app in two browser tabs (same partner pair)
2. Create event in Tab 1, verify immediate appearance in Tab 2
3. Edit event in Tab 2, verify update in Tab 1
4. Disconnect one tab, make changes, reconnect and verify sync

#### 5. PWA Functionality
**Test Cases:**
- [ ] App installation prompt
- [ ] Offline functionality
- [ ] Service worker caching
- [ ] Responsive design on mobile
- [ ] App manifest validation

**Steps:**
1. Test installation on desktop/mobile
2. Go offline and verify app still loads
3. Test on various screen sizes
4. Check developer tools for PWA compliance

#### 6. Database Operations
**Test Cases:**
- [ ] Local SQLite operations
- [ ] PostgreSQL sync operations
- [ ] Data consistency between local/remote
- [ ] Conflict resolution

**Steps:**
1. Monitor network tab during operations
2. Check browser's IndexedDB/SQLite storage
3. Verify PostgreSQL database directly
4. Test sync after extended offline period

#### 7. Security Testing
**Test Cases:**
- [ ] JWT token validation
- [ ] Protected route access
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Password hashing verification

**Steps:**
1. Attempt accessing `/api/events` without token
2. Try malformed JWTs
3. Test input sanitization in forms
4. Verify passwords are hashed in database

### Mobile Testing

#### iOS Safari
- [ ] Installation as PWA
- [ ] Touch interactions
- [ ] Viewport behavior
- [ ] Offline functionality

#### Android Chrome
- [ ] Installation prompt
- [ ] Navigation gestures
- [ ] Background sync
- [ ] Push notification readiness

### Performance Testing

#### Load Testing
- [ ] Multiple concurrent users
- [ ] Large number of events
- [ ] Network latency simulation
- [ ] Database performance under load

#### Tools to Use
- Browser DevTools (Network, Performance tabs)
- Lighthouse PWA audit
- `npm run lint` and `npm run build` for code quality
- PostgreSQL query analysis

### Error Handling Testing

#### Network Scenarios
- [ ] Complete network failure
- [ ] Intermittent connectivity
- [ ] Server downtime
- [ ] Database connection loss

#### Edge Cases
- [ ] Very long event descriptions
- [ ] Special characters in names
- [ ] Timezone handling
- [ ] Browser storage limits

### Automated Testing Commands

```bash
# Code quality checks
npm run lint
npm run format

# Build verification  
npm run build
npm run preview

# Manual database inspection
psql honeybee -c "SELECT id, name, email, user_code FROM users;"
psql honeybee -c "SELECT * FROM events;"
```

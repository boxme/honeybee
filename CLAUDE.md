# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Honeybee is a Progressive Web App (PWA) designed for couples to share planned events and activities. The app works offline-first with local SQLite storage and syncs with a remote PostgreSQL database when online.

## Development Commands

### Frontend (React PWA)
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Backend (Node.js/Express)
- `npm run server` - Start production server
- `npm run server:dev` - Start development server with nodemon

### Database
- PostgreSQL database required for backend
- Run `server/db/schema.sql` to set up database schema
- Configure connection in `server/.env` file

## Architecture

### Frontend Stack
- **React 18** - UI framework
- **Vite** - Build tool with PWA plugin
- **React Router** - Client-side routing
- **Zustand** - State management
- **SQL.js** - Local SQLite database in browser
- **Socket.io-client** - Real-time updates
- **React Hook Form** - Form handling
- **date-fns** - Date manipulation

### Backend Stack
- **Express.js** - Web server
- **PostgreSQL** - Primary database
- **Socket.io** - Real-time WebSocket connections
- **bcrypt** - Password hashing
- **JWT** - Authentication tokens

### Key Features
- **Offline-first**: Events stored locally in SQLite, synced when online
- **Real-time sync**: Socket.io for instant updates between partners
- **PWA capabilities**: Installable, works offline, push notifications ready
- **Partner pairing**: 6-character codes to connect two users
- **Mobile-responsive**: Optimized for iOS and Android browsers

### Project Structure
```
src/
  components/     # React components
  services/       # API services and database
  stores/         # Zustand state stores
  utils/          # Utility functions
server/
  routes/         # Express API routes
  middleware/     # Authentication, etc.
  db/             # Database schema
```

## Environment Setup

1. Copy `.env.example` to `.env` and configure
2. Copy `server/.env.example` to `server/.env` and configure
3. Set up PostgreSQL database and run schema
4. Install dependencies: `npm install` and `cd server && npm install`

## Important Notes

- Users are paired through 6-character codes generated on registration
- Events sync between local SQLite and remote PostgreSQL automatically
- Socket connections enable real-time sharing between partners
- PWA manifest configured for mobile installation
- Service worker handles offline caching
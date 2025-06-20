# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WEB3 MONEY is a Next.js application providing restricted services for "レリモバ" (Relimo) contract holders. It features a notification system and voting functionality for support fund campaigns, with access control via referrer checking and Google Apps Script backend integration.

## Architecture

- **Frontend**: Next.js 15.3.2 with TypeScript and Tailwind CSS
- **Backend**: Google Apps Script (GAS) with API proxying through Next.js API routes
- **Database**: Google Sheets managed by GAS
- **Access Control**: Referrer-based authentication (requires access from customer portal)
- **API Integration**: Next.js `/api/gas` route proxies requests to Google Apps Script

## Essential Commands

### Development
```bash
npm run dev -- --port 3001  # Start development server at localhost:3001 (ALWAYS use 3001, NOT 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing Access Flow
The application has a multi-stage access flow:
1. `/` - Public landing page with access instructions
2. `/relay` - Access verification page (checks referrer)
3. `/main` - Main application (notices + voting)

## API Architecture

### Next.js API Route Configuration
- All GAS communication goes through `/api/gas/route.ts`
- `next.config.ts` rewrites `/api/gas` to the Google Apps Script URL
- This setup prevents direct client-side access to GAS and manages CORS

### Key API Endpoints
- `?path=notices` - Notice CRUD operations
- `?path=campaigns` - Campaign management
- `?path=votes` - Voting functionality
- `?path=test-connection` - Google Sheets connection testing
- `?path=form-fields` - Dynamic form field detection

## Important Files & Patterns

### Core Type Definitions (`src/lib/types.ts`)
Contains comprehensive TypeScript interfaces for all entities including Notice, Campaign, Applicant, User authentication, and API responses.

### API Layer (`src/lib/api.ts`)
- Handles all backend communication
- Includes authentication features and user session management
- Features request/response interceptors for debugging
- Uses forced API route usage (not direct GAS access)

### Access Control (`src/app/relay/page.tsx`)
Implements referrer-based security checking against allowed domains like `xmobile.ne.jp/customer/`.

### Admin Interface
- `/admin` - Dashboard overview
- `/admin/notices` - Notice management
- `/admin/campaigns` - Campaign creation and management
- `/admin/campaign-settings` - Voting rules configuration

## Key Features

1. **Dual-Tab Interface**: Main page switches between notices and voting
2. **Dynamic Form Integration**: Connects to Google Forms via Sheets URL
3. **Voting System**: Support fund voting with ranking display
4. **User Authentication**: Finance ID-based user tracking
5. **Campaign Lifecycle**: Draft → Active → Ended → Archived states

## Google Apps Script Integration

The GAS backend (`gas-files/`) provides:
- Data persistence via Google Sheets
- Form connection testing and field detection
- Vote counting and user management
- Notice scheduling and display logic

## Development Notes

- The app uses referrer checking for security (development bypasses this)
- All API calls are logged extensively for debugging
- User sessions are cached in memory (not persistent storage)
- The system supports multiple concurrent campaigns
- Voting can be configured per-campaign (single/multiple votes)

## Security Considerations

- No sensitive data should be logged or committed
- Referrer-based access control prevents unauthorized entry
- Google Apps Script provides additional access control layers
- All external sheet access requires proper permissions

## Common Workflows

1. **Adding New Notice**: Admin → Notices → Create with date range
2. **Creating Campaign**: Admin → Campaigns → Connect Google Sheet → Configure fields → Activate
3. **Managing Votes**: Campaigns auto-sync with connected Google Sheets for real-time data
4. **System Monitoring**: Admin dashboard provides system statistics and health checks
# AniTeams v2 — Complete Rebuild Documentation

## 1. Legacy Project Audit

### Critical Security Issues Found
| Issue | Severity | Location |
|-------|----------|----------|
| Plain UID stored in client-accessible cookies | **CRITICAL** | `AuthForm.js`, `callback/page.js` |
| AniList client secret exposed via `NEXT_PUBLIC_` prefix | **CRITICAL** | `.env`, `anilist/token/route.js` |
| No CSRF protection on any endpoint | **HIGH** | All API routes |
| No input validation or sanitization | **HIGH** | All POST endpoints |
| No rate limiting | **HIGH** | Auth, comments endpoints |
| No middleware for route protection | **HIGH** | Missing `middleware.js` |
| Mixed collection names (`watchlist` vs `watchlists`) | **HIGH** | `signup/route.js` vs `watchlist/route.js` |
| No session management (raw UID returned) | **HIGH** | `auth/login/route.js` |
| Unstable `@consumet/extensions` from GitHub master | **MEDIUM** | `package.json` |
| Third-party scraping providers (legal risk) | **MEDIUM** | `provider/aniwatch/`, `provider/animepahe/` |
| No TypeScript | **MEDIUM** | Entire project |
| No error boundaries | **LOW** | Client components |
| Hardcoded external API URLs | **LOW** | Provider routes |

### Root Causes
- **No proper auth**: Firebase UIDs stored as plain cookies, no server-side session
- **No data model**: Ad-hoc Firestore collections with naming conflicts
- **Brittle providers**: Single-provider dependency with no fallback
- **No validation**: All user input accepted without sanitization
- **Secrets leak**: OAuth secrets prefixed with `NEXT_PUBLIC_`

---

## 2. New Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (dark mode, fonts, header/footer)
│   ├── page.tsx            # Homepage (trending, seasonal, popular, continue watching)
│   ├── loading.tsx         # Global loading state
│   ├── error.tsx           # Global error boundary
│   ├── not-found.tsx       # 404 page
│   ├── anime/[id]/         # Anime detail page
│   ├── search/             # Search & browse with filters
│   ├── account/            # Watchlist management
│   ├── profile/            # User profile with stats & AniList connection
│   ├── login/              # OAuth sign-in
│   ├── callback/anilist/   # AniList OAuth callback
│   └── api/                # REST API routes
│       ├── auth/[...nextauth]/ # Auth.js handler
│       ├── watchlist/      # Watchlist CRUD
│       ├── progress/       # Progress tracking
│       └── comments/       # Comments CRUD
├── components/             # UI components
│   ├── ui/                 # Primitive UI components (Button, Card, Input, etc.)
│   ├── header.tsx          # App header with nav
│   ├── footer.tsx          # App footer
│   ├── anime-card.tsx      # Anime card with cover, score, format
│   ├── anime-grid.tsx      # Grid layout for anime cards
│   ├── hero-banner.tsx     # Featured anime banner
│   ├── search-filters.tsx  # Search filter controls
│   ├── watchlist-tabs.tsx  # Tabbed watchlist view
│   ├── comment-section.tsx # Threaded comments with reactions
│   ├── streaming-links.tsx # Legal streaming link display
│   └── ...                 # Other components
├── lib/                    # Shared utilities
│   ├── auth.ts             # Auth.js configuration
│   ├── auth-utils.ts       # Auth helper functions
│   ├── db.ts               # Prisma client singleton
│   ├── env.ts              # Zod-validated environment variables
│   ├── utils.ts            # cn() utility
│   └── validations.ts      # Zod schemas for all inputs
├── providers/              # Provider adapter system
│   ├── interfaces.ts       # Provider interfaces
│   ├── anilist.ts          # AniList metadata provider
│   ├── official.ts         # Official streaming links provider
│   └── index.ts            # Provider registry
├── server/                 # Server actions & business logic
│   ├── anime-sync.ts       # Anime metadata caching
│   ├── anilist-sync.ts     # AniList OAuth & sync
│   ├── comments.ts         # Comments server actions
│   ├── progress.ts         # Progress tracking server actions
│   ├── profile.ts          # Profile server actions
│   └── watchlist.ts        # Watchlist server actions
├── types/                  # TypeScript types
│   └── index.ts            # All shared types
└── middleware.ts            # Route protection middleware
```

---

## 3. Dependencies

### Production
| Package | Purpose |
|---------|---------|
| `next` 15+ | Framework |
| `react` 19+ | UI library |
| `next-auth` v5 | Authentication (OAuth + sessions) |
| `@auth/prisma-adapter` | Auth.js + Prisma integration |
| `@prisma/client` | Database ORM |
| `zod` | Input validation |
| `@tanstack/react-query` | Client-side data fetching (where needed) |
| `@radix-ui/*` | Accessible UI primitives |
| `class-variance-authority` | Component variants |
| `clsx` + `tailwind-merge` | Class merging |
| `lucide-react` | Icons |

### Development
| Package | Purpose |
|---------|---------|
| `typescript` 5.7+ | Type safety |
| `tailwindcss` 4+ | Styling |
| `prisma` | Schema management |
| `@biomejs/biome` | Linting + formatting |
| `vitest` | Unit testing |
| `@playwright/test` | E2E testing |

---

## 4. Security Improvements

| Old | New |
|-----|-----|
| Plain UID cookies | Auth.js JWT sessions with `httpOnly`, `secure`, `sameSite` |
| No input validation | Zod schemas on every input |
| `NEXT_PUBLIC_` secrets | Server-only env vars validated at startup |
| No CSRF | Auth.js built-in CSRF protection |
| No middleware | `middleware.ts` with route-level auth checks |
| No RBAC | `Role` enum (USER/ADMIN) with middleware checks |
| Raw Firestore | Prisma with typed queries and parameterized SQL |

---

## 5. Auth Flow

```
User → Login Page → OAuth Provider (Google/Discord)
  → Auth.js callback → JWT session created
  → Session available via auth() on server
  → Session available via useSession() on client
  → Middleware protects /account, /profile, /settings, /admin
```

---

## 6. AniList Sync Flow

```
Profile Page → "Connect AniList" button
  → Redirects to AniList OAuth (server-side URL generation)
  → AniList callback → /callback/anilist
  → Server action exchanges code for token (secret never exposed)
  → Token stored encrypted in database (AniListConnection model)
  → "Sync Now" button pushes local watchlist to AniList via API
```

---

## 7. Provider Adapter Strategy

### Interfaces
- `AnimeMetadataProvider`: search, getById, getTrending, getPopular, getSeasonal
- `StreamingProvider`: getStreamingLinks, isAvailable
- `EpisodeProvider`: getEpisodes

### Implementations
- `AniListProvider`: Primary metadata from AniList GraphQL (legal public API)
- `OfficialStreamingProvider`: Extracts legal streaming links from AniList external links
- `AniListEpisodeProvider`: Episode info from AniList metadata

### Fallback Logic
When no legal streaming source exists:
1. Show "No legal streaming links available" message
2. Display external links (AniList, MAL, etc.)
3. Allow watchlist management and progress tracking
4. Show recommendations and related anime
5. Never break the page — degrade gracefully

---

## 8. Database Schema

13 models with proper indexes and enums:
- Auth: User, Account, Session, VerificationToken
- Anime: Anime, AnimeExternalMapping, ProviderAvailability
- User features: WatchlistEntry, ProgressEntry, Comment, CommentReaction
- System: Notification, UserSettings, AniListConnection, AuditLog

---

## 9. Migration Notes from Old Project

### What to keep
- The general product concept (anime browsing, watchlists, progress tracking)
- AniList as primary metadata source

### What's replaced
| Old Component | New Component |
|---------------|---------------|
| Firebase auth | Auth.js (NextAuth v5) |
| Firestore | PostgreSQL via Prisma |
| `js-cookie` + raw UIDs | JWT sessions |
| `@consumet/extensions` | Provider adapter system |
| `aniwatch` scraper | Official streaming links |
| JavaScript | TypeScript |
| `axios` | Native `fetch` with Next.js caching |
| `next-pwa` | Removed (add later with `@serwist/next` if needed) |
| `firebaseAdmin` | Prisma database client |
| Manual CSS | Tailwind CSS 4 + Radix UI |

### Data Migration
- Export Firestore watchlist/progress data as JSON
- Map Firebase UIDs to new User IDs
- Import into PostgreSQL via Prisma seed script
- Fix collection name conflicts (`watchlist` vs `watchlists`)

---

## 10. Phased Implementation Roadmap

### Phase 1 — Foundation (Current) ✅
- [x] Project setup (TS, Tailwind, Biome, Prisma)
- [x] Auth.js with OAuth providers
- [x] Prisma schema with all models
- [x] Provider adapter interfaces
- [x] AniList metadata provider
- [x] Core UI components

### Phase 2 — Core Features ✅
- [x] Homepage with trending/seasonal/popular
- [x] Search page with filters
- [x] Anime detail page
- [x] Watchlist API + UI
- [x] Progress tracking API + UI
- [x] Comments system with reactions
- [x] AniList OAuth integration

### Phase 3 — Polish (Next)
- [ ] Set up PostgreSQL and run migrations
- [ ] Add Redis caching for metadata
- [ ] Add rate limiting middleware
- [ ] Implement notifications system
- [ ] Add admin moderation panel
- [ ] Write Vitest unit tests
- [ ] Write Playwright E2E tests
- [ ] Optimize images with `next/image` blur placeholders
- [ ] Add loading.tsx for all routes
- [ ] PWA support with `@serwist/next`

### Phase 4 — Production
- [ ] Deploy to Vercel
- [ ] Set up Supabase/Neon PostgreSQL
- [ ] Configure OAuth providers in production
- [ ] Set up monitoring (Sentry)
- [ ] Performance audit (Lighthouse)
- [ ] Security audit
- [ ] GDPR/privacy compliance

---

## 11. Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env
# Then fill in DATABASE_URL, AUTH_SECRET, OAuth credentials

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database
npx prisma db push

# 5. Start dev server
npm run dev
```

---

## 12. Important Notes

### On Playback/Streaming
This project uses a **legal-first approach**:
- Anime metadata comes from AniList (public API, free to use)
- Streaming links come from official platforms listed on AniList
- **No scraping** of any unauthorized source
- If a user wants self-hosted content, they can implement a custom `StreamingProvider`

### On the `SCRAPE` Request
Scraping copyrighted content from unauthorized sites (like aniwatchtv.to) was **not implemented** because:
1. It violates copyright law in most jurisdictions
2. It breaks terms of service of the scraped sites
3. It creates brittle dependencies on third-party sites
4. It exposes the project to legal liability
5. The old project's main instability came from exactly this approach

The provider adapter system is designed so that if legal streaming sources become available, they can be added as new `StreamingProvider` implementations without changing any other code.

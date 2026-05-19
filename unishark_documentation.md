# UniShark — Complete AI Training Documentation
**Version:** 1.0 | **Status:** Active Development | **Last Updated:** May 2026

---

## SECTION 1: PROJECT OVERVIEW

### What is UniShark?

UniShark is a two-sided marketplace platform built for the Indian college startup ecosystem. It connects **student founders** (who have startup ideas but no money or connections) with **angel investors** (who have money and want early-stage opportunities). The platform removes every barrier between a student's idea and actual funding — no cold emails, no networking events, no confusion about how to reach investors.

The name "UniShark" is a combination of "University" and "Shark" (as in Shark Tank — a show about pitching to investors). The brand speaks directly to ambitious college students who are ready to hustle.

### Target Users

**User Type 1 — Student Founders:**
- College students (1st year to final year) anywhere in India
- Have a startup idea, a prototype, or an early-stage business
- Need ₹5 lakh to ₹1 crore in seed funding
- Don't have investor contacts or know how to approach them

**User Type 2 — Angel Investors:**
- Experienced professionals, entrepreneurs, or HNI individuals
- Want to invest ₹5L to ₹50L in early-stage startups
- Want to find high-quality, vetted student-run ventures
- Prefer a structured platform over random LinkedIn messages

### Core Value Proposition

| Problem | UniShark's Solution |
|---|---|
| Students don't know how to find investors | A single platform where investors actively browse |
| Cold emails get ignored | Investors voluntarily join and are already looking |
| Pitches lack structure | UniShark's pitch form guides students step by step |
| No trust between strangers | Both sides are verified through their profiles |
| Legal paperwork is confusing | Platform provides support until term sheet is signed |

---

## SECTION 2: TECH STACK

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React.js | 18.x | Core UI framework, component-based architecture |
| TypeScript | 5.x | Type safety across the entire codebase |
| Vite | 5.x | Build tool and dev server — extremely fast HMR |
| Tailwind CSS | 3.x | Utility-first CSS, all styling done via class names |
| Framer Motion | 11.x | Animation library — spring physics, page transitions |
| Lucide React | latest | Icon set used throughout the UI |
| React Router DOM | 6.x | Client-side routing between pages |
| Sonner (toast) | latest | Toast notification system for success/error messages |

### Backend & Infrastructure

| Technology | Purpose |
|---|---|
| Supabase | The entire backend — database, auth, and storage |
| PostgreSQL | Relational database hosted by Supabase |
| Supabase Auth | User authentication — email/password + Google OAuth |
| Row Level Security (RLS) | Database-level access control policies |
| Supabase JS Client | Frontend SDK to query the database and manage auth |

### Project Structure

```
src/
├── assets/              # Images, illustrations, logo
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui base components (Button, Card, Input...)
│   ├── AuthLayout.tsx   # Wrapper for login/signup pages
│   ├── CustomCursor.tsx # Custom animated cursor effect
│   ├── GoogleSignInButton.tsx
│   ├── MagneticButton.tsx  # Hover effect button
│   ├── Navbar.tsx          # Fixed top navigation bar
│   ├── NavLink.tsx         # Navigation link with active state
│   ├── PhoneShowcase.tsx   # Animated phone component on landing page
│   ├── ProtectedRoute.tsx  # Redirects unauthenticated users
│   └── ThemeToggle.tsx     # Light/dark mode switcher
├── hooks/
│   ├── useAuth.tsx      # Global auth state (user, role, signOut)
│   ├── use-toast.ts     # Toast notification hook
│   └── use-mobile.tsx   # Detects mobile screen size
├── integrations/supabase/
│   ├── client.ts        # Supabase JS client instance
│   └── types.ts         # Auto-generated TypeScript types from DB
├── pages/
│   ├── Index.tsx           # Landing page
│   ├── Login.tsx           # Login page
│   ├── Signup.tsx          # Signup page with role selector
│   ├── AuthCallback.tsx    # OAuth redirect handler
│   ├── VerifyOtp.tsx       # OTP email verification
│   ├── Dashboard.tsx       # User dashboard (post login)
│   ├── Profile.tsx         # User profile view/edit
│   ├── PitchForm.tsx       # Create a pitch form
│   ├── PitchDetail.tsx     # Single pitch deep-dive view
│   ├── BrowsePitches.tsx   # Investor pitch discovery feed
│   ├── Admin.tsx           # Admin management panel
│   ├── NotFound.tsx        # 404 page
│   └── onboarding/
│       ├── StudentOnboarding.tsx
│       └── InvestorOnboarding.tsx
└── App.tsx              # Root component with routing setup
```

---

## SECTION 3: DATABASE SCHEMA

The database runs on PostgreSQL via Supabase. All tables use UUID primary keys. RLS is enabled on all tables.

### Table 1: `auth.users` (Supabase managed)
This is not a custom table — it is managed by Supabase Auth automatically.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key. Used as foreign key in all profile tables |
| email | TEXT | The user's email address |
| created_at | TIMESTAMP | Account creation date |
| user_metadata | JSONB | Stores `role` ("student" or "investor") set during signup |

### Table 2: `student_profiles`
Created by developers. One row per student user.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | FK → auth.users.id. Primary key for this table |
| college | TEXT | Name of the student's college/university |
| year | TEXT | Year of study stored as string e.g. "second_year" |
| linkedin_url | TEXT | Optional. Full URL to LinkedIn profile |
| skills | JSONB | Stores: skills[], startupInterests[], industriesInterest[], city, contactNumber |
| created_at | TIMESTAMP | Auto-set on row creation |

**RLS Policies on student_profiles:**
- SELECT: Users can read their own row (`auth.uid() = user_id`)
- INSERT/UPDATE: Users can only write to their own row

### Table 3: `investor_profiles`
One row per investor user.

| Column | Type | Notes |
|---|---|---|
| user_id | UUID | FK → auth.users.id. Primary key |
| company | TEXT | Company or fund name |
| investment_range | TEXT | e.g. "5L-20L", "20L-1Cr" |
| thesis | TEXT | Free text describing what they invest in |
| linkedin_url | TEXT | Optional |
| created_at | TIMESTAMP | Auto-set |

### Table 4: `pitches`
The central table for all startup pitches.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key, auto-generated |
| founder_id | UUID | FK → student_profiles.user_id |
| title | TEXT | Name of the startup |
| description | TEXT | What the startup does (elevator pitch) |
| problem | TEXT | The problem being solved |
| solution | TEXT | How the startup solves it |
| ask_amount | INTEGER | Funding needed in INR (e.g. 500000 = ₹5L) |
| equity_offered | DECIMAL | Percentage of equity offered (e.g. 10.5) |
| status | TEXT | "draft", "active", "funded", "rejected" |
| deck_url | TEXT | Optional link to Google Drive or Notion deck |
| industry | TEXT | Sector/industry tag |
| created_at | TIMESTAMP | Auto-set |
| updated_at | TIMESTAMP | Auto-updated on change |

### Database Relationships (ERD)
```
auth.users (1)
    ├──> student_profiles (1) ──> pitches (many)
    └──> investor_profiles (1)
```

---

## SECTION 4: COMPONENT DETAILS

### `Navbar.tsx`
- Fixed to the top of the screen (`fixed top-0 z-50`)
- Shows the UniShark logo (from `src/assets/logo.png`) and brand name
- Contains navigation links: How, Investors, Students, FAQ
- Shows "Sign In" and "Get Started" buttons for logged-out users
- Shows profile icon and sign-out option for logged-in users
- Has a mobile hamburger menu for screens smaller than `md`
- Uses `ThemeToggle` component for dark/light mode switching
- **IMPORTANT:** Because it is fixed, all pages must add `pt-28` to `pt-40` padding to their main content containers to prevent content from hiding behind the navbar

### `PhoneShowcase.tsx`
This is the most complex component in the codebase. It is placed inside the "How It Works" section on the landing page (`Index.tsx`).

**What it does:**
- Shows a realistic smartphone frame built with pure CSS/Tailwind
- Automatically cycles through 3 animated "scenes" every 5.5 seconds
- Users can also click on the step cards (left side) to jump to any scene
- Uses `framer-motion` `AnimatePresence` + `motion` for all transitions
- Uses `useInView` from framer-motion to only start the timer when the section is visible on screen

**Scene 1 — "Pitch" (Logo Expansion):**
- UniShark logo (`logo.png`) starts at scale 0, scales up to fill the screen, then zooms all the way out to reveal the website UI underneath
- The website UI shows: a fake navbar with the logo, a bold headline "Fund your student startup", a stats card showing "₹10L+ Raised", and a "Start Pitching" button

**Scene 2 — "Match" (Registration):**
- Shows a "Create Account" form with animated typing
- The name "Rahul Sharma" appears character by character with a blinking cursor
- "IIT Bombay" college appears with a delay
- A "Register Account" button springs into view at the end
- An animated SVG mouse cursor swoops across the screen

**Scene 3 — "Close" (Deal Closed):**
- Uses a custom AI-generated image (`deal_closed_handshake.png`) showing two people shaking hands
- Image springs onto screen with rotation animation
- "Deal Closed!" heading fades in below
- Neo-brutalist confetti pieces shoot upward

**The phone frame itself contains:**
- A notch at the top (dark pill shape)
- Fake status bar (time "9:41", icons)
- Physical button shapes on the left and right sides built with divs
- A home indicator bar at the bottom

### `AuthLayout.tsx`
- Wrapper used by Login and Signup pages
- Adds a `Navbar` at the top and sets `pt-28 md:pt-32` padding on the main content
- Keeps auth pages consistent in layout

### `ProtectedRoute.tsx`
- Wraps any route that requires authentication
- Reads the `user` from `useAuth()` hook
- If no user is logged in, it redirects to `/login`
- Used in `App.tsx` around Dashboard, Profile, PitchForm, etc.

### `MagneticButton.tsx`
- A special button component that creates a "magnetic" hover effect
- When the user hovers near the button, it smoothly moves toward the cursor
- Uses mouse position tracking with `useMotionValue` and `useSpring` from framer-motion

### `CustomCursor.tsx`
- Replaces the default browser cursor with a custom animated dot
- The cursor changes size and style on hover over interactive elements
- Part of the premium design aesthetic

### `GoogleSignInButton.tsx`
- A dedicated button component for Google OAuth sign-in
- Calls Supabase's `signInWithOAuth({ provider: 'google' })` method
- After Google redirects back, `AuthCallback.tsx` handles the session

### `useAuth.tsx` (Hook)
- The global authentication hook used across the entire app
- Exposes: `user` (Supabase user object), `roles` (student/investor), `signOut` function
- Listens to Supabase's `onAuthStateChange` to keep state in sync
- Is consumed by `Navbar`, `ProtectedRoute`, `Dashboard`, and all onboarding pages

---

## SECTION 5: ALL PAGES — DETAILED BREAKDOWN

### `Index.tsx` — Landing Page
**Route:** `/`
**Visible to:** Everyone (no auth required)

Sections in order:
1. **Hero Section** — Bold headline, subtext, two CTA buttons ("Start Pitching" and "Browse Startups"), floating animated badge elements
2. **Colleges/Social Proof Strip** — Scrolling marquee of known university names
3. **How It Works / PhoneShowcase** — The animated phone component (see above). Left side has 3 clickable cards (Pitch / Match / Close). Right side is the phone.
4. **Features Grid** — Cards showing key features like "Verified Profiles", "Secure Messaging", "Term Sheet Support"
5. **For Investors & For Students** — Two split sections with role-specific CTAs
6. **FAQ Section** — Expandable accordion of common questions
7. **Footer** — Links, copyright, social icons

**Key implementation details:**
- Uses scroll-based reveal animations via `useInView` wrapped in a custom `<Reveal>` component
- Uses a `<StaggerGroup>` and `<StaggerItem>` wrapper system to stagger children animations
- The scroll progress bar at the top uses `useScroll` + `useSpring` from framer-motion
- The Navbar on this page is transparent at the top and gets a background on scroll

### `Login.tsx`
**Route:** `/login`
**Wrapped in:** `AuthLayout.tsx`

- Shows email/password login form
- Has a "Forgot Password" link
- Has a Google sign-in button via `GoogleSignInButton` component
- On success, reads the user's role from `user_metadata` and redirects to the right place:
  - No profile yet → `/onboarding/student` or `/onboarding/investor`
  - Has profile → `/dashboard`

### `Signup.tsx`
**Route:** `/signup?role=student` or `/signup?role=investor`
**Wrapped in:** `AuthLayout.tsx`

- Reads the `role` from the URL query parameter
- Stores the role in Supabase's `user_metadata` during signup
- Supports both email signup and Google OAuth
- After email signup, redirects to `/verify-otp`
- After Google signup, `AuthCallback.tsx` handles it

### `AuthCallback.tsx`
**Route:** `/auth/callback`

- Supabase redirects here after Google OAuth
- Calls `supabase.auth.getSession()` to confirm the session
- Then checks if the user already has a profile in `student_profiles` or `investor_profiles`
- If profile exists → redirect to `/dashboard`
- If no profile → redirect to `/onboarding/student` or `/onboarding/investor` based on role

### `VerifyOtp.tsx`
**Route:** `/verify-otp`

- Shown after email signup
- User enters the 6-digit OTP sent to their email
- Calls `supabase.auth.verifyOtp()` on submit
- On success, redirects to the correct onboarding page

### `onboarding/StudentOnboarding.tsx`
**Route:** `/onboarding/student`
**Auth required:** Yes (student role)

**Form steps:**
1. College name (text input)
2. Year of study (dropdown: 1st, 2nd, 3rd, 4th, Postgrad)
3. LinkedIn URL (optional)
4. Skills (multi-select tags: e.g. "Frontend Dev", "Marketing", "Finance")
5. Startup interests and industry focus
6. City and contact number

**On submit:**
```typescript
await supabase.from("student_profiles").upsert({
  user_id: user.id,
  college,
  year: YEAR_TO_DB[year],
  linkedin_url: linkedinUrl || null,
  skills: { skills, startupInterests, industriesInterest, city, contactNumber },
}, { onConflict: "user_id" });
```
Uses `upsert` with `onConflict: "user_id"` so that if the user resubmits, it updates rather than creating a duplicate row.

### `onboarding/InvestorOnboarding.tsx`
**Route:** `/onboarding/investor`
**Auth required:** Yes (investor role)

**Form steps:**
1. Full name
2. Company/Fund name
3. Investment range (dropdown: ₹5L-20L, ₹20L-1Cr, etc.)
4. Industries of interest (multi-select)
5. Investment thesis (free text area)
6. LinkedIn URL

On submit, saves to `investor_profiles` table using the same upsert pattern.

### `Dashboard.tsx`
**Route:** `/dashboard`
**Auth required:** Yes

- Reads the user's role from `useAuth()`
- For students: Shows their pitch cards with status badges, view counts, and bookmarks
- For investors: Shows suggested pitches based on their thesis and industry preferences
- Has a quick-action button for students to create a new pitch

### `Profile.tsx`
**Route:** `/profile`
**Auth required:** Yes

- Fetches data from either `student_profiles` or `investor_profiles` based on role
- Displays the data in a read-only view
- Has an "Edit" button that opens the onboarding form pre-filled with existing data
- Shows the user's avatar (from Supabase Auth metadata if available)

### `PitchForm.tsx`
**Route:** `/pitch/new` or `/pitch/:id/edit`
**Auth required:** Yes (students only)

- A guided form to create or edit a startup pitch
- Fields: Title, Description, Problem, Solution, Industry, Ask Amount, Equity Offered, Deck URL
- On submit, inserts or updates a row in the `pitches` table
- After save, redirects to the pitch detail page or dashboard

### `BrowsePitches.tsx`
**Route:** `/pitches`
**Auth required:** Yes (investors primarily, but students can view)

- Fetches all pitches with `status = 'active'` from the database
- Displays them as cards in a responsive grid
- Supports filters by industry, funding range, and college
- Each card links to `/pitch/:id` for the full view

### `PitchDetail.tsx`
**Route:** `/pitch/:id`
**Auth required:** Yes

- Fetches full pitch data by ID
- Fetches the founder's `student_profile` to show college and year
- Shows all pitch fields + a "Request Deck" button and "Connect" button
- Investors can bookmark the pitch
- Students see their own pitch analytics

### `Admin.tsx`
**Route:** `/admin`
**Auth required:** Yes + Admin role check

- Lists all users from `student_profiles` and `investor_profiles`
- Shows all pitches with an "Approve" / "Reject" action
- Approval changes `status` from `'draft'` to `'active'`
- Has basic platform statistics (total users, active pitches, etc.)

---

## SECTION 6: AUTHENTICATION FLOW

### Email/Password Flow
```
User fills Signup form
→ supabase.auth.signUp({ email, password, options: { data: { role } } })
→ Supabase sends verification email
→ User lands on /verify-otp
→ User enters OTP
→ supabase.auth.verifyOtp({ email, token, type: 'email' })
→ Session created
→ AuthCallback.tsx checks if profile exists
→ Redirect to onboarding or dashboard
```

### Google OAuth Flow
```
User clicks "Sign in with Google"
→ supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })
→ Google shows consent screen
→ User approves → Supabase redirects to /auth/callback
→ AuthCallback.tsx calls supabase.auth.getSession()
→ Checks role from user_metadata
→ Checks if profile exists in DB
→ Redirect to onboarding or dashboard
```

### Role Selection Issue (Fixed)
A previous bug existed where Google OAuth users who had not selected a role during signup would get stuck. This was fixed by adding a route middleware in `AuthCallback.tsx` that detects missing role metadata and prompts the user to choose a role before proceeding.

---

## SECTION 7: DESIGN SYSTEM

### Design Language: Neo-Brutalism
UniShark does NOT use a typical soft, modern SaaS design. It uses Neo-Brutalism — a style that feels bold, raw, and physical.

**Core rules of Neo-Brutalism in this project:**
1. All cards and interactive elements have `border-2 border-foreground` (thick, solid, dark border)
2. Drop shadows are hard offset, not blurry: `shadow-[6px_6px_0_0_hsl(var(--foreground))]`
3. Background is off-white (`--bg: #FAFAF7`), foreground is near-black (`--fg: #1a1a1a`)
4. Pastel accent colors are used for section backgrounds and card fills
5. Fonts are heavy and bold — Syne (800 weight) for headings, Inter for body
6. Interactive elements shift position slightly on hover (`translate-x-[-2px] translate-y-[-2px]`) and cast a deeper shadow

### CSS Variables (HSL-based)
```css
--pastel-yellow: HSL value for soft warm yellow
--pastel-mint: HSL value for soft green
--pastel-pink: HSL value for soft pink
--pastel-blue: HSL value for soft blue
--pastel-peach: HSL value for soft orange-peach
--pastel-lilac: HSL value for soft purple
--foreground: Near-black for all borders and text
--background: Off-white for page background
--surface: Slightly different off-white for component backgrounds
--muted-foreground: Gray for secondary text
```

### Reusable Style Utilities (defined in Index.tsx)
```typescript
const brutalBorder = "border-2 border-foreground";
const brutalShadow = "shadow-[6px_6px_0_0_hsl(var(--foreground))]";
```

### Animation Rules
- Use `motion.div` from framer-motion for any element that needs to animate
- Use `type: "spring"` with `stiffness: 100, damping: 20` for bounce-in effects
- Use `whileInView` with `viewport={{ once: true }}` to trigger animations on scroll
- Use `AnimatePresence` with `mode="wait"` for transitions between states
- Never use raw CSS `transition` for major animated components

---

## SECTION 8: CURRENT DEVELOPMENT PROGRESS

### Fully Completed Features ✅

| Feature | Status | Notes |
|---|---|---|
| Supabase project setup | ✅ Done | Project ID: `irxssaogqjgkutogducx` |
| Database schema (all 4 tables) | ✅ Done | With RLS policies active |
| Google OAuth login | ✅ Done | Bug fixed — role selection now works correctly |
| Email/Password signup | ✅ Done | OTP verification working |
| Student onboarding form | ✅ Done | Saves correctly to `student_profiles` |
| Investor onboarding form | ✅ Done | Saves correctly to `investor_profiles` |
| Landing page (Index.tsx) | ✅ Done | All sections, animations, and CTAs |
| PhoneShowcase component | ✅ Done | 3 scenes, auto-cycles, logo animation |
| Scene 1 — Website demo | ✅ Done | Logo expansion + realistic site mockup |
| Scene 2 — Registration demo | ✅ Done | Animated typing form |
| Scene 3 — Deal closed demo | ✅ Done | Custom AI-generated handshake image |
| Navbar fixed + overlap fix | ✅ Done | All 11 pages updated with correct padding |
| Dark mode toggle | ✅ Done | Via ThemeToggle component |
| Custom cursor | ✅ Done | CustomCursor component |
| Magnetic button effects | ✅ Done | MagneticButton component |
| Protected routes | ✅ Done | ProtectedRoute redirects unauthenticated users |
| Dashboard page (structure) | ✅ Done | Basic layout and role detection |

### In Progress 🔄

| Feature | Status | Notes |
|---|---|---|
| Pitch creation form | 🔄 Partial | Form UI exists, full submit flow being tested |
| Browse pitches page | 🔄 Partial | Basic list view works, filters being added |
| Pitch detail page | 🔄 Partial | Data displays, action buttons being connected |
| Admin panel | 🔄 Partial | User list works, pitch approval flow in progress |

### Not Yet Started ❌

| Feature | Status | Priority |
|---|---|---|
| Real-time messaging (chat) | ❌ Not started | High — core feature |
| Pitch bookmarking system | ❌ Not started | High |
| Email notifications | ❌ Not started | Medium |
| Pitch deck file uploads | ❌ Not started | Medium |
| Investor recommendation engine | ❌ Not started | Low |
| Mobile app (React Native) | ❌ Not started | Future |

---

## SECTION 9: KNOWN BUGS AND FIXES

### Bug 1 — Navbar Content Overlap (FIXED)
- **Problem:** The Navbar uses `fixed top-0`, which means it floats above the page. Without explicit top padding, all page content was hidden behind the navbar.
- **Fix:** Added `pt-28` to `pt-40` (depending on the page) to the main content container on every page: Dashboard, Profile, Admin, BrowsePitches, PitchForm, PitchDetail, StudentOnboarding, InvestorOnboarding, AuthLayout, and Index hero section.

### Bug 2 — Google OAuth Role Not Persisting (FIXED)
- **Problem:** When a user signed up with Google, their `role` metadata was not being saved correctly because Google OAuth bypasses the standard signup form.
- **Fix:** Updated `AuthCallback.tsx` to detect when `user_metadata.role` is missing and prompt the user to select a role before proceeding to onboarding.

### Bug 3 — Duplicate Student Profiles (FIXED)
- **Problem:** If a student refreshed or resubmitted the onboarding form, a new row was inserted, causing a unique constraint error.
- **Fix:** Changed `.insert()` to `.upsert({ onConflict: "user_id" })` in `StudentOnboarding.tsx` and `InvestorOnboarding.tsx`.

---

## SECTION 10: STRICT RULES FOR AI CODING ASSISTANTS

If you are an AI model using this document to write code for UniShark, follow every one of these rules:

### Rule 1 — Always use Neo-Brutalist styling
Every new UI element must have thick borders and hard shadows.
- Cards: `border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-2xl`
- Buttons: `border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]`
- Never use `shadow-sm`, `shadow-md`, or any default Tailwind shadow.

### Rule 2 — Use HSL CSS variables, not hardcoded hex colors
Wrong: `bg-[#FFE566]`
Correct: `bg-[hsl(var(--pastel-yellow))]`

### Rule 3 — Role-based logic is critical
- Always get user role from `useAuth()` hook which returns a `roles` object
- Student data goes to `student_profiles` table, investor data to `investor_profiles`
- Never render student-only content to investors and vice versa

### Rule 4 — Always use framer-motion for animations
- Import: `import { motion, AnimatePresence } from "framer-motion"`
- Use `motion.div` instead of `div` for animated elements
- For scroll reveals: `whileInView={{ opacity: 1 }} viewport={{ once: true }}`
- For spring: `transition={{ type: "spring", stiffness: 100, damping: 20 }}`

### Rule 5 — Supabase client import path
Always import the client from:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

### Rule 6 — Profile saves must use upsert
```typescript
const { error } = await supabase.from("student_profiles").upsert(
  { user_id: user.id, ...data },
  { onConflict: "user_id" }
);
```

### Rule 7 — Error handling is mandatory
Every async operation must have try/catch and show a toast:
```typescript
try {
  const { error } = await supabase.from("table").insert(data);
  if (error) throw error;
  toast.success("Done!");
} catch (err: any) {
  toast.error(err.message || "Something went wrong");
}
```

### Rule 8 — Top padding on all pages
Every page that renders a `<Navbar />` must have a container with `pt-28 md:pt-32` minimum. Otherwise content will hide behind the fixed navbar.

### Rule 9 — Use TypeScript properly
All components must be typed. Use the types from `@/integrations/supabase/types` for any database interactions. Never use `any` unless absolutely necessary.

### Rule 10 — Assets import path
All image assets are in `src/assets/`. Import them using:
```typescript
import logo from "@/assets/logo.png";
import dealImage from "@/assets/deal_closed_handshake.png";
```
Do not reference them via public URL strings.

---

*This document was generated for AI training purposes. It reflects the exact state of the UniShark codebase as of May 2026.*

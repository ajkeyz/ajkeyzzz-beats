# AJKEYZZZ Beats Platform

Premium beats catalog with real audio streaming, admin dashboard, licensing checkout, and custom production inquiries. Built with React + Vite, backed by Supabase.

## Quick Start (Local Dev)

```bash
npm install
npm run dev
```

The site runs in **demo mode** without any external services — beats use localStorage, audio playback is simulated for beats without uploaded files.

## Full Setup (Production)

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Optionally run `supabase/seed.sql` to add demo beats
4. Create storage buckets:
   - `covers` — **public** (cover art images)
   - `previews` — **public** (preview MP3s for streaming)
   - `downloads` — **private** (full WAV/MP3 for paid downloads)
   - `stems` — **private** (stems ZIPs)
5. Create an admin user:
   - Go to Authentication → Users → Invite User
   - After the user is created, update their metadata in the SQL Editor:
   ```sql
   update auth.users set raw_user_meta_data = jsonb_set(
     raw_user_meta_data, '{role}', '"admin"'
   ) where email = 'your@email.com';
   ```

### 2. Stripe (for payments)

1. Get your publishable key from [stripe.com/dashboard](https://dashboard.stripe.com)
2. Add it as `VITE_STRIPE_PUBLISHABLE_KEY`
3. (Future) Set up a Supabase Edge Function for creating checkout sessions

### 3. Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_xxx
VITE_SITE_URL=https://your-domain.com
```

### 4. Deploy to Vercel

1. Push to GitHub
2. Import into Vercel
3. Add env vars in Vercel project settings
4. Deploy

## Admin Dashboard

### Local/Demo Mode
Navigate to `/admin` and log in with password: `ajkeyzzz2025`

### Production Mode (Supabase)
Navigate to `/admin` and log in with your Supabase admin email + password.

### Admin Features
- **Overview**: Stats (beats, plays, orders, inquiries)
- **Beats**: Create/edit beats with cover art + audio file uploads
- **Orders**: View purchases and download links
- **Inquiries**: Custom production leads with pipeline status
- **Messages**: Contact form submissions

## Upload Flow

1. Go to Admin → Beats → Add Beat
2. Fill in metadata (title, genre, BPM, key, tags)
3. Upload **cover art** (JPG/PNG, up to 5MB)
4. Upload **preview audio** (MP3, up to 20MB) — this streams publicly
5. Upload **full quality file** (WAV/MP3, up to 100MB) — delivered after purchase
6. Optionally upload **stems** (ZIP, up to 500MB)
7. Set pricing for each license tier
8. Toggle Featured / Published
9. Save

## Payments Flow

1. Customer clicks "License" on a beat
2. Selects license tier (Basic / Premium / Unlimited / Exclusive)
3. Enters email
4. Redirected to Stripe Checkout
5. After payment → receives secure download link via email
6. Admin sees order in dashboard

> **Note**: Stripe checkout session creation requires a server-side function. Currently shows a demo alert. Set up a Supabase Edge Function for production.

## Tech Stack

- **Frontend**: React 18, React Router 6, Vite 5
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe (Checkout Sessions)
- **Validation**: Zod
- **SEO**: react-helmet-async
- **Deployment**: Vercel

## Project Structure

```
src/
├── components/       # Shared UI components
│   ├── BeatCard.jsx
│   ├── BeatRow.jsx
│   ├── ErrorBoundary.jsx
│   ├── Footer.jsx
│   ├── Icons.jsx
│   ├── LicensingModal.jsx
│   ├── Navbar.jsx
│   ├── PlayerBar.jsx
│   └── SkeletonCard.jsx
├── hooks/
│   ├── useAudioPlayer.js   # Real audio + simulated fallback
│   └── useAuth.js           # Supabase auth + local fallback
├── lib/
│   ├── data.js       # Unified data layer (Supabase / localStorage)
│   ├── env.js        # Environment variable validation
│   ├── schema.js     # Zod validation schemas
│   ├── seeds.js      # Seed data + constants
│   ├── store.js      # localStorage helpers
│   ├── supabase.js   # Supabase client + storage helpers
│   └── utils.js      # Utilities (formatTime, slugify, etc.)
├── pages/
│   ├── admin/
│   │   ├── AdminBeats.jsx
│   │   ├── AdminInquiries.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── AdminMessages.jsx
│   │   ├── AdminOrders.jsx
│   │   ├── AdminOverview.jsx
│   │   └── BeatEditor.jsx
│   ├── BeatDetailPage.jsx
│   ├── CatalogPage.jsx
│   ├── ContactPage.jsx
│   ├── CustomPage.jsx
│   ├── HomePage.jsx
│   └── LicensingPage.jsx
├── styles/
│   └── global.css
├── App.jsx           # Router + layout
└── main.jsx          # Entry point
```

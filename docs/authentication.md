# Authentication & Authorization Architecture

## Overview
Project Atlas utilizes Supabase Authentication paired with strict PostgreSQL Row Level Security (RLS) to manage access to the CMS. 

## 1. Supabase Client Singleton
The Supabase client is initialized as a singleton in `src/utils/supabase.js`.
Upon initialization, it validates the presence of required environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). If missing, a hard error is thrown, caught by the React `<ErrorBoundary>`, and displayed cleanly to the user.

### Token Lifecycle
The client is configured with:
```javascript
{
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
}
```
- **Storage:** Sessions are persisted in `localStorage`.
- **Refresh:** Supabase automatically refreshes the short-lived JWT in the background before it expires.
- **Session Restoration:** Upon a full page reload, the client hydrates the session from `localStorage` immediately.

## 2. AuthProvider Context
The `AuthProvider.jsx` wraps the CMS. It hooks into the Supabase client to listen for auth state changes (`onAuthStateChange`).
It provides a seamless Loading state while the initial session is being resolved, ensuring users never see a flash of the `Login` component if they are already authenticated.

## 3. The Authorization Model (Roles)
The application defines 5 core roles at the database level (`owner`, `administrator`, `editor`, `author`, `viewer`).

- When a user signs up, a Postgres Trigger (`handle_new_user`) creates a profile and defaults them to `viewer`.
- Elevated roles (like `owner`) must be assigned out-of-band (via Supabase Dashboard or seed scripts) to ensure security.

### Frontend Role Guards
The `<ProtectedRoute>` abstraction (in `src/components/admin/layout/ProtectedRoute.jsx`) is designed to support a `requiredRole` prop.
Currently, it blocks any unauthenticated access to the CMS.
In future iterations, once user profiles are queried into the session, it will enforce route-level Role Checks (e.g. preventing an `author` from accessing `/admin/settings`).

### Backend RLS (The Source of Truth)
Even if the frontend is compromised or bypassed, the Supabase Postgres Database enforces RLS. 
A user attempting an operation via the API will have their JWT evaluated against the table policies (e.g., only `owner` can `UPDATE settings`). This ensures the backend remains the impenetrable source of truth for authorization.

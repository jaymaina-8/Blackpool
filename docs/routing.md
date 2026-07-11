# Routing Architecture

## Overview
Project Atlas serves two distinct environments from the same React application shell:
1. **The Public Portfolio (Frontend):** Uses legacy hash-based routing.
2. **The CMS Dashboard (Backend):** Uses modern path-based routing (`/admin/*`).

To avoid bundling two heavy routing libraries (like adding `react-router-dom` to the legacy shell), we have extended the existing `LocationProvider` to seamlessly handle both paradigms securely.

## The Architecture

### 1. Route Interception (`main.jsx`)
When the application first boots, it inspects `window.location.pathname`.
If the path begins with `/admin`, we bypass the legacy frontend initialization (which would normally rewrite the URL and push state to the base path).
Instead, we asynchronously lazy-load the `<AdminApp />` using React's `Suspense` and `lazy()`. This ensures the public website never pays the bundle size cost of the CMS.

### 2. LocationProvider Extension
The `LocationProvider.jsx` context was extended to expose:
- `isAdminRoute`: A boolean flag identifying if the user is in the CMS scope.
- `adminPath`: The specific CMS path they are on (e.g. `/articles`, `/settings`).
- `goToAdminRoute(subpath)`: A method that cleanly utilizes `window.history.pushState` to navigate the CMS without full page reloads.

Because hash-based routing and path-based routing exist in the same app, the `LocationProvider` explicitly silences the `hashchange` listener when `isAdminRoute` is active.

### 3. Protected Routes
The `AdminApp` mounts the extended `LocationProvider` alongside the `AuthProvider` and our `AdminLayout`. The layout is wrapped in a `<ProtectedRoute>` which acts as the guard (redirecting to `/admin/login` if unauthenticated).

## Flow Diagram
1. User visits `/admin/articles`
2. `main.jsx` intercepts the request -> renders `<AdminApp>`
3. `LocationProvider` initializes `adminPath` as `/articles`
4. `AuthProvider` verifies session.
5. If session is valid -> `<ProtectedRoute>` allows rendering.
6. `<AdminLayout>` reads `adminPath` -> highlights "Articles" in sidebar and renders the Articles component in the main area.

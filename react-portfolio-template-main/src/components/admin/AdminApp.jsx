import React from 'react'
import AuthProvider from '/src/providers/AuthProvider.jsx'
import AdminLayout from '/src/components/admin/layout/AdminLayout.jsx'
import LocationProvider from '/src/providers/LocationProvider.jsx'
import { ErrorBoundary } from '/src/components/admin/ErrorBoundary.jsx'

// Minimal providers wrapper for the admin area, preventing public providers from firing
export default function AdminApp() {
    return (
        <ErrorBoundary>
            <LocationProvider sections={[]} categories={[]}>
                <AuthProvider>
                    <AdminLayout />
                </AuthProvider>
            </LocationProvider>
        </ErrorBoundary>
    )
}

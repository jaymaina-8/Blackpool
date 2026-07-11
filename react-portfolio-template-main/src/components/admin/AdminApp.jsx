import React from 'react'
import AuthProvider from '/src/providers/AuthProvider.jsx'
import AdminLayout from '/src/components/admin/layout/AdminLayout.jsx'
import LocationProvider from '/src/providers/LocationProvider.jsx'
import { ErrorBoundary } from '/src/components/admin/ErrorBoundary.jsx'

import ThemeProvider from '/src/providers/ThemeProvider.jsx'
import ViewportProvider from '/src/providers/ViewportProvider.jsx'

const adminThemes = [
    { id: 'dark', name: 'Dark Mode', icon: 'pi pi-moon' },
    { id: 'light', name: 'Light Mode', icon: 'pi pi-sun' }
]

// Minimal providers wrapper for the admin area, preventing public providers from firing
export default function AdminApp() {
    return (
        <ErrorBoundary>
            <LocationProvider sections={[]} categories={[]}>
                <ViewportProvider>
                    <ThemeProvider 
                        supportedThemes={adminThemes} 
                        defaultThemeId="dark" 
                        showSpinnerOnThemeChange={false}
                        onThemeChanged={() => {}}
                    >
                        <AuthProvider>
                            <AdminLayout />
                        </AuthProvider>
                    </ThemeProvider>
                </ViewportProvider>
            </LocationProvider>
        </ErrorBoundary>
    )
}

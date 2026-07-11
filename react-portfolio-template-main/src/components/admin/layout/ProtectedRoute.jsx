import React from 'react'
import { useAuth } from '/src/providers/AuthProvider.jsx'
import Login from '/src/components/admin/Login.jsx'

export default function ProtectedRoute({ children, requiredRole = null }) {
    const { session, user } = useAuth()

    if (!session) {
        return <Login />
    }

    // RoleGuard: In future phases, we will fetch user profile role from Supabase DB or JWT custom claims.
    // For now, if a requiredRole is passed and doesn't match the mock metadata, block access.
    if (requiredRole && user?.user_metadata?.role !== requiredRole) {
        return (
            <div className="p-4 text-center mt-5">
                <h4 className="text-danger fw-bold">Access Denied</h4>
                <p className="text-muted">You do not have the required permissions ({requiredRole}) to view this page.</p>
            </div>
        )
    }

    return children
}

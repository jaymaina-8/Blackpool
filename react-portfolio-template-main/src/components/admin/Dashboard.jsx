import React from 'react'
import { useAuth } from '/src/providers/AuthProvider.jsx'
import { useLocation } from '/src/providers/LocationProvider.jsx'

export default function Dashboard() {
    const { user, signOut } = useAuth()
    const { goToAdminRoute } = useLocation()

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">Dashboard</h2>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted">{user?.email}</span>
                    <button className="btn btn-outline-danger btn-sm" onClick={signOut}>
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Total Articles</h6>
                            <h3 className="fw-bold mb-0">0</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h6 className="text-muted mb-2">Published</h6>
                            <h3 className="fw-bold mb-0">0</h3>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-5 p-5 text-center admin-card rounded shadow-sm border-0">
                <h4 className="text-muted mb-3">Welcome to Project Atlas</h4>
                <p className="text-muted mb-0">The Phase 2 CMS layout has been successfully initialized.</p>
            </div>
        </div>
    )
}

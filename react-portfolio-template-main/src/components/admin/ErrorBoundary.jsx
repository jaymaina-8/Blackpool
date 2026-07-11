import React from 'react'

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-light text-center p-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    <h3 className="text-danger fw-bold mb-3">Admin Configuration Error</h3>
                    <div className="alert alert-danger shadow-sm d-inline-block text-start">
                        <strong>Error:</strong> {this.state.error?.message || "An unexpected error occurred in the CMS."}
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

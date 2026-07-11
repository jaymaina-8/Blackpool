import React from 'react'

export default function ArticleNotFound({ navigate }) {
    return (
        <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
            <h1 className="display-1 fw-bold text-muted opacity-25">404</h1>
            <h2 className="mb-4 fw-bold">Article Not Found</h2>
            <p className="text-muted mb-4 lead" style={{ maxWidth: '500px' }}>
                The article you are looking for does not exist, has been removed, or is not currently published.
            </p>
            <button className="btn btn-primary px-4 py-2" onClick={() => navigate('/blog')}>
                Back to Insights
            </button>
        </div>
    )
}

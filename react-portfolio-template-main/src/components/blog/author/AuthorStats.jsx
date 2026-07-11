import React from 'react'

export default function AuthorStats({ stats }) {
    if (!stats) return null

    return (
        <div className="row g-4 mb-5">
            <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
                    <i className="fa-solid fa-file-lines fs-3 text-primary mb-2"></i>
                    <h3 className="fw-bold mb-1">{stats.articlesPublished}</h3>
                    <span className="text-muted small fw-medium text-uppercase tracking-wider">Articles</span>
                </div>
            </div>
            <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
                    <i className="fa-solid fa-clock fs-3 text-success mb-2"></i>
                    <h3 className="fw-bold mb-1">{stats.readingMinutes}</h3>
                    <span className="text-muted small fw-medium text-uppercase tracking-wider">Minutes Read</span>
                </div>
            </div>
            <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
                    <i className="fa-solid fa-pen-nib fs-3 text-info mb-2"></i>
                    <h3 className="fw-bold mb-1">{stats.wordsWritten >= 1000 ? (stats.wordsWritten / 1000).toFixed(1) + 'k' : stats.wordsWritten}</h3>
                    <span className="text-muted small fw-medium text-uppercase tracking-wider">Words Written</span>
                </div>
            </div>
            <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100">
                    <i className="fa-solid fa-eye fs-3 text-warning mb-2"></i>
                    <h3 className="fw-bold mb-1">{stats.totalViews >= 1000 ? (stats.totalViews / 1000).toFixed(1) + 'k' : stats.totalViews}</h3>
                    <span className="text-muted small fw-medium text-uppercase tracking-wider">Total Views</span>
                </div>
            </div>
        </div>
    )
}

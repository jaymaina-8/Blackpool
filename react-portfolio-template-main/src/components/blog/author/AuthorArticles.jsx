import React from 'react'
import ArticleCard from '../ArticleCard.jsx'

export default function AuthorArticles({ articles, currentPage = 1, totalPages = 1, onPageChange }) {
    if (!articles || articles.length === 0) return (
        <div className="text-center py-5 bg-light rounded-4">
            <h4 className="text-muted fw-bold">No articles yet</h4>
            <p className="text-muted mb-0">Check back soon for insights from this author.</p>
        </div>
    )

    return (
        <div>
            <h3 className="fw-bold mb-4 tracking-tight">Latest from this Author</h3>
            <div className="row g-4 mb-5">
                {articles.map(article => (
                    <div key={article.id} className="col-md-6 col-lg-4">
                        <ArticleCard article={article} />
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mb-5">
                    <button 
                        className="btn btn-outline-secondary rounded-pill px-4" 
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span className="btn btn-light rounded-pill px-4 disabled">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        className="btn btn-outline-secondary rounded-pill px-4" 
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

import React from 'react'

export default function Pagination({ currentPage, totalCount, pageSize = 12, onPageChange }) {
    const totalPages = Math.ceil(totalCount / pageSize)
    
    if (totalPages <= 1) return null

    const pages = []
    
    // Simple windowing for pagination if pages are too many
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + 4)
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4)
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }

    return (
        <nav aria-label="Page navigation" className="mt-5 d-flex justify-content-center">
            <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                        className="page-link shadow-sm border-0 mx-1 rounded" 
                        onClick={() => onPageChange(currentPage - 1)} 
                        disabled={currentPage === 1} 
                        aria-label="Previous"
                    >
                        <span aria-hidden="true">&laquo;</span>
                    </button>
                </li>
                {startPage > 1 && (
                    <li className="page-item disabled">
                        <span className="page-link shadow-sm border-0 mx-1 rounded bg-transparent">...</span>
                    </li>
                )}
                {pages.map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button 
                            className={`page-link shadow-sm border-0 mx-1 rounded ${currentPage === page ? 'fw-bold' : ''}`} 
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    </li>
                ))}
                {endPage < totalPages && (
                    <li className="page-item disabled">
                        <span className="page-link shadow-sm border-0 mx-1 rounded bg-transparent">...</span>
                    </li>
                )}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                        className="page-link shadow-sm border-0 mx-1 rounded" 
                        onClick={() => onPageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages} 
                        aria-label="Next"
                    >
                        <span aria-hidden="true">&raquo;</span>
                    </button>
                </li>
            </ul>
        </nav>
    )
}

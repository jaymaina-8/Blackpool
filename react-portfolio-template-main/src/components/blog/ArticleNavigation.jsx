import React from 'react'

export default function ArticleNavigation({ adjacent, navigate }) {
    if (!adjacent || (!adjacent.prev && !adjacent.next)) return null

    return (
        <div className="mt-5 pt-5 pb-2 border-top mx-auto">
            <div className="row g-4">
                <div className="col-12 col-md-6">
                    {adjacent.prev && (
                        <div 
                            className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark bg-light"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onClick={() => navigate(`/blog/${adjacent.prev.slug}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.classList.add('shadow')
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.classList.remove('shadow')
                            }}
                        >
                            <div className="card-body p-4 d-flex flex-column justify-content-center text-start">
                                <span className="text-muted small text-uppercase tracking-wider fw-bold mb-2">
                                    <i className="fa-solid fa-arrow-left me-2"></i> Previous Article
                                </span>
                                <h5 className="fw-bold m-0" style={{ lineHeight: '1.4' }}>{adjacent.prev.title}</h5>
                            </div>
                        </div>
                    )}
                </div>
                <div className="col-12 col-md-6">
                    {adjacent.next && (
                        <div 
                            className="card h-100 border-0 shadow-sm rounded-4 text-decoration-none text-dark bg-light"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onClick={() => navigate(`/blog/${adjacent.next.slug}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.classList.add('shadow')
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.classList.remove('shadow')
                            }}
                        >
                            <div className="card-body p-4 d-flex flex-column justify-content-center text-end">
                                <span className="text-muted small text-uppercase tracking-wider fw-bold mb-2">
                                    Next Article <i className="fa-solid fa-arrow-right ms-2"></i>
                                </span>
                                <h5 className="fw-bold m-0" style={{ lineHeight: '1.4' }}>{adjacent.next.title}</h5>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

import React from 'react'

export default function SEOScorePanel({ score, color }) {
    return (
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
                <span>SEO Score</span>
                <span className={`badge bg-${color} fs-6`}>{score} / 100</span>
            </div>
            <div className="card-body">
                <div className="progress" style={{ height: '8px' }}>
                    <div 
                        className={`progress-bar bg-${color}`} 
                        role="progressbar" 
                        style={{ width: `${score}%` }} 
                        aria-valuenow={score} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                    ></div>
                </div>
                <div className="text-center mt-3 small text-muted">
                    {score >= 80 ? "Great job! This article is well optimized." : 
                     score >= 50 ? "Good, but could use a few improvements." : 
                     "Needs more optimization before publishing."}
                </div>
            </div>
        </div>
    )
}

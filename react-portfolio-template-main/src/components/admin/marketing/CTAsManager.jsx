import React, { useEffect, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function CTAsManager() {
    const [ctas, setCtas] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('marketing_ctas').select('*').order('created_at', { ascending: false })
            setCtas(data || [])
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">Call to Actions (CTAs)</h2>
                <button className="btn btn-primary fw-medium" onClick={() => setShowForm(!showForm)}>
                    <i className="fa-solid fa-plus me-2"></i> New CTA
                </button>
            </div>

            {showForm && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <h5 className="fw-bold mb-3">Create New CTA (Demo)</h5>
                    <p className="text-muted small">
                        This is a visual placeholder for the CTA creation form. In a complete implementation, this would save to the `marketing_ctas` table.
                    </p>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <input type="text" className="form-control" placeholder="CTA Title" />
                        </div>
                        <div className="col-md-6">
                            <input type="text" className="form-control" placeholder="Button Text" />
                        </div>
                        <div className="col-12">
                            <button className="btn btn-success fw-medium mt-2" onClick={() => setShowForm(false)}>Save CTA</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Placement</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-4"><span className="spinner-border text-primary"></span></td></tr>
                        ) : ctas.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-5 text-muted">No CTAs found.</td></tr>
                        ) : ctas.map(cta => (
                            <tr key={cta.id}>
                                <td className="px-4 py-3 fw-medium">{cta.title}</td>
                                <td className="px-4 py-3">
                                    <span className="badge bg-light text-dark border">{cta.placement}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`badge ${cta.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                        {cta.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button className="btn btn-sm btn-light text-primary me-2"><i className="fa-solid fa-pen"></i></button>
                                    <button className="btn btn-sm btn-light text-danger"><i className="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

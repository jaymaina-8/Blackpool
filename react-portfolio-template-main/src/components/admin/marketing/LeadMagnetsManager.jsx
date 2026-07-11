import React, { useEffect, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function LeadMagnetsManager() {
    const [magnets, setMagnets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('lead_magnets').select('*').order('created_at', { ascending: false })
            setMagnets(data || [])
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">Lead Magnets</h2>
                <button className="btn btn-primary fw-medium">
                    <i className="fa-solid fa-plus me-2"></i> New Lead Magnet
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Email Required</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4"><span className="spinner-border text-primary"></span></td></tr>
                        ) : magnets.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-5 text-muted">No Lead Magnets found.</td></tr>
                        ) : magnets.map(m => (
                            <tr key={m.id}>
                                <td className="px-4 py-3 fw-medium">{m.title}</td>
                                <td className="px-4 py-3 text-muted">{m.category}</td>
                                <td className="px-4 py-3 text-muted">{m.email_required ? 'Yes' : 'No'}</td>
                                <td className="px-4 py-3">
                                    <span className={`badge ${m.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button className="btn btn-sm btn-light text-primary me-2"><i className="fa-solid fa-pen"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

import React, { useEffect, useState } from 'react'
import { supabase } from '/src/utils/supabase.js'

export default function CampaignsManager() {
    const [campaigns, setCampaigns] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: false })
            setCampaigns(data || [])
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0">Campaigns</h2>
                <button className="btn btn-primary fw-medium">
                    <i className="fa-solid fa-plus me-2"></i> New Campaign
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Duration</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-4"><span className="spinner-border text-primary"></span></td></tr>
                        ) : campaigns.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-5 text-muted">No Campaigns found.</td></tr>
                        ) : campaigns.map(c => (
                            <tr key={c.id}>
                                <td className="px-4 py-3 fw-medium">{c.name}</td>
                                <td className="px-4 py-3 text-muted small">
                                    {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A'} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`badge ${c.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                        {c.status}
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

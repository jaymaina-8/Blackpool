import React from 'react'

export default function CampaignBadge({ campaign }) {
    if (!campaign) return null

    return (
        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 shadow-sm d-inline-flex align-items-center gap-2">
            <i className="fa-solid fa-bolt text-warning"></i>
            {campaign.name}
        </span>
    )
}

import React from 'react'
import { servicesConfig } from '/src/config/servicesConfig.js'
import { track, EVENTS } from '/src/utils/analytics/index.js'

export default function RelatedServices() {
    return (
        <div className="mb-5">
            <h3 className="fw-bold mb-4 text-center text-md-start">Our Services</h3>
            <div className="row g-4">
                {servicesConfig.map((service) => (
                    <div key={service.id} className="col-md-6 col-lg-3">
                        <div 
                            className="card h-100 border-0 shadow-sm rounded-4 text-center text-md-start p-4 text-decoration-none"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.classList.add('shadow')
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.classList.remove('shadow')
                            }}
                        >
                            <div className="mb-3 text-primary">
                                <i className={`${service.icon} fs-1`}></i>
                            </div>
                            <h5 className="fw-bold mb-2 tracking-tight">{service.title}</h5>
                            <p className="text-muted small mb-4">{service.description}</p>
                            <a 
                                href={service.url} 
                                className="btn btn-sm btn-outline-primary mt-auto rounded-pill fw-medium"
                                onClick={() => track(EVENTS.SERVICE_CLICKED, { serviceId: service.id })}
                                aria-label={`Learn more about ${service.title}`}
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

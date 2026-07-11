import React from 'react'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart
} from 'recharts'

// Custom tooltip styling
const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border rounded shadow-sm p-3">
                <p className="fw-bold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="d-flex align-items-center mb-1">
                        <div style={{width: '10px', height: '10px', backgroundColor: entry.color, marginRight: '8px', borderRadius: '50%'}}></div>
                        <span className="me-3 text-muted">{entry.name}:</span>
                        <span className="fw-medium">{formatter ? formatter(entry.value) : entry.value}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export const TrendAreaChart = React.memo(({ data, xKey, yKey, color = "#0d6efd", name, height = 300 }) => {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`color${yKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6c757d'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6c757d'}} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey={yKey} name={name || yKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color${yKey})`} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
})

export const SimpleBarChart = React.memo(({ data, xKey, yKey, color = "#0d6efd", name, height = 300 }) => {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6c757d'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6c757d'}} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey={yKey} name={name || yKey} fill={color} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
})

export const TrafficSourcesPieChart = React.memo(({ data, height = 300 }) => {
    const COLORS = ['#0d6efd', '#198754', '#ffc107', '#0dcaf0', '#d63384', '#6f42c1']

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
})

export const FunnelChart = React.memo(({ data, height = 300 }) => {
    // Recharts does not have a native Funnel chart in version 2.x without extra plugins
    // We emulate a Funnel using a horizontal BarChart or a ComposedChart
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 13, fontWeight: 'bold'}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Readers" fill="#0d6efd" radius={[0, 4, 4, 0]} barSize={30}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`rgba(13, 110, 253, ${1 - index * 0.15})`} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
})

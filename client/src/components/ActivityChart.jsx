import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ActivityChart = ({ events = [] }) => {
    if (!events || events.length === 0) {
        return (
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 13
            }}>
                No activity data available
            </div>
        )
    }

    // Group events by date
    const eventsByDate = {}
    events.forEach(event => {
        const date = new Date(event.occurredAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
        eventsByDate[date] = (eventsByDate[date] || 0) + 1
    })

    const data = Object.entries(eventsByDate).map(([date, count]) => ({
        date,
        count
    })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30) // Last 30 days

    return (
        <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '20px 24px'
        }}>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
                Activity Timeline
            </p>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        axisLine={{ stroke: 'var(--border)' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            color: 'var(--text-primary)'
                        }}
                        formatter={(value) => [`${value} events`, 'Count']}
                    />
                    <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default ActivityChart


import { useMemo, useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer
} from 'recharts'

const EVENT_COLORS = {
    pr_merged: '#2DD4BF',
    review: '#34D399',
    issue_closed: '#FBBF24',
    push: '#818CF8',
    comment: '#94A3B8'
}

const EVENT_LABELS = {
    pr_merged: 'Merged PR',
    review: 'Review',
    issue_closed: 'Issue Closed',
    push: 'Push',
    comment: 'Comment'
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const total = payload.reduce((sum, entry) => sum + entry.value, 0)
    
    return (
        <div style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 12,
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>{label}</p>
            {payload.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: entry.fill, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{EVENT_LABELS[entry.dataKey] || entry.dataKey}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: entry.fill, fontWeight: 600 }}>
                        {entry.value}
                    </span>
                </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 8, paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total:</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{total}</span>
                </div>
            </div>
        </div>
    )
}

const ActivityChart = ({ events = [] }) => {
    const [period, setPeriod] = useState('monthly')

    const chartData = useMemo(() => {
        if (!events.length) return []

        if (period === 'daily') {
            return aggregateByDay(events)
        } else if (period === 'weekly') {
            return aggregateByWeek(events)
        } else {
            return aggregateByMonth(events)
        }
    }, [events, period])

    if (!chartData.length) return null

    const getBarSize = () => {
        if (period === 'daily') return 6
        if (period === 'weekly') return 8
        return 10
    }

    const getChartHeight = () => {
        if (period === 'daily') return 220
        if (period === 'weekly') return 200
        return 180
    }

    const visibleBars = chartData.length
    const shouldShowDate = visibleBars <= 12

    return (
        <div>
            {/* Period Selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['daily', 'weekly', 'monthly'].map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            border: `1.5px solid ${period === p ? 'var(--accent)' : 'var(--border)'}`,
                            background: period === p ? 'var(--accent-dim)' : 'transparent',
                            color: period === p ? 'var(--accent-text)' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 12,
                            fontWeight: period === p ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            textTransform: 'capitalize'
                        }}
                        onMouseEnter={e => {
                            if (period !== p) {
                                e.currentTarget.style.borderColor = 'var(--accent)'
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                            }
                        }}
                        onMouseLeave={e => {
                            if (period !== p) {
                                e.currentTarget.style.borderColor = 'var(--border)'
                                e.currentTarget.style.backgroundColor = 'transparent'
                            }
                        }}
                    >
                        {p === 'daily' ? '📅 Daily' : p === 'weekly' ? '📊 Weekly' : '📈 Monthly'}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={getChartHeight()}>
                <BarChart
                    data={chartData}
                    barSize={getBarSize()}
                    barGap={period === 'daily' ? 0 : 2}
                    margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
                >
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                        axisLine={false}
                        tickLine={false}
                        interval={shouldShowDate ? 0 : Math.floor(chartData.length / 8)}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={30}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'var(--bg-hover)', radius: 6, opacity: 0.5 }}
                        contentStyle={{ outline: 'none' }}
                    />
                    {Object.keys(EVENT_COLORS).map(type => (
                        <Bar
                            key={type}
                            dataKey={type}
                            stackId="a"
                            fill={EVENT_COLORS[type]}
                            radius={type === 'comment' ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
                {Object.entries(EVENT_COLORS).map(([type, color]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 3, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                            {EVENT_LABELS[type]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Helper functions to aggregate events by time period
function getDateKey(date, period) {
    if (period === 'daily') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else if (period === 'weekly') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return `W${Math.ceil((date.getDate() - date.getDay()) / 7)} ${date.toLocaleDateString('en-US', { month: 'short' })}`
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }
}

function aggregateByDay(events) {
    const dayMap = {}

    events.forEach(event => {
        const date = new Date(event.occurredAt)
        date.setHours(0, 0, 0, 0)
        const key = date.toISOString().split('T')[0]
        const label = getDateKey(date, 'daily')

        if (!dayMap[key]) {
            dayMap[key] = {
                label,
                _date: date,
                pr_merged: 0,
                review: 0,
                issue_closed: 0,
                push: 0,
                comment: 0
            }
        }
        if (dayMap[key][event.type] !== undefined) {
            dayMap[key][event.type]++
        }
    })

    return Object.values(dayMap)
        .sort((a, b) => a._date - b._date)
        .slice(-30)
        .map(({ _date, ...rest }) => rest)
}

function aggregateByWeek(events) {
    const weekMap = {}

    events.forEach(event => {
        const date = new Date(event.occurredAt)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        weekStart.setHours(0, 0, 0, 0)
        const key = weekStart.toISOString().split('T')[0]
        const label = getDateKey(date, 'weekly')

        if (!weekMap[key]) {
            weekMap[key] = {
                label,
                _date: new Date(weekStart),
                pr_merged: 0,
                review: 0,
                issue_closed: 0,
                push: 0,
                comment: 0
            }
        }
        if (weekMap[key][event.type] !== undefined) {
            weekMap[key][event.type]++
        }
    })

    return Object.values(weekMap)
        .sort((a, b) => a._date - b._date)
        .slice(-12)
        .map(({ _date, ...rest }) => rest)
}

function aggregateByMonth(events) {
    const monthMap = {}

    events.forEach(event => {
        const date = new Date(event.occurredAt)
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

        if (!monthMap[key]) {
            monthMap[key] = {
                label: key,
                _date: new Date(date.getFullYear(), date.getMonth(), 1),
                pr_merged: 0,
                review: 0,
                issue_closed: 0,
                push: 0,
                comment: 0
            }
        }
        if (monthMap[key][event.type] !== undefined) {
            monthMap[key][event.type]++
        }
    })

    return Object.values(monthMap)
        .sort((a, b) => a._date - b._date)
        .slice(-12)
        .map(({ _date, ...rest }) => rest)
}

export default ActivityChart
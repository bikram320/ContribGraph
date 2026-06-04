import { useState, useEffect } from 'react'
import useAuthStore from '../store/authStore.js'
import { updateAvailability } from '../api/developer.api.js'
import toast from 'react-hot-toast'

const Settings = () => {
    const { user, developer, updateAvailability: updateStore } = useAuthStore()
    const [availability, setAvailability] = useState(developer?.availability || 'closed')
    const [saving, setSaving] = useState(false)
    const [email, setEmail] = useState(user?.email || '')
    const [bio, setBio] = useState('')

    useEffect(() => {
        if (developer?.availability) {
            setAvailability(developer.availability)
        }
    }, [developer])

    const handleAvailabilityChange = async (value) => {
        setAvailability(value)
        setSaving(true)
        try {
            await updateAvailability(value)
            updateStore(value)
            toast.success(`Availability updated to "${value}"`)
        } catch (err) {
            console.error('Failed to update availability:', err)
            toast.error('Failed to update availability')
            setAvailability(developer?.availability || 'closed')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
                    ⚙️ Settings
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    Manage your profile and preferences
                </p>
            </div>

            {/* Account Section */}
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '24px',
                marginBottom: 24
            }}>
                <h2 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--border)'
                }}>
                    Account Information
                </h2>

                {/* Username */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)',
                        marginBottom: 8
                    }}>
                        GitHub Username
                    </label>
                    <input
                        type="text"
                        value={user?.username || ''}
                        disabled
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            cursor: 'not-allowed'
                        }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                        Cannot be changed — linked to your GitHub account
                    </p>
                </div>

                {/* Email */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)',
                        marginBottom: 8
                    }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-muted)',
                            fontSize: 13,
                            cursor: 'not-allowed'
                        }}
                    />
                </div>

                {/* Role */}
                <div>
                    <label style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)',
                        marginBottom: 8
                    }}>
                        Account Type
                    </label>
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        textTransform: 'capitalize'
                    }}>
                        {user?.role || 'developer'}
                    </div>
                </div>
            </div>

            {/* Availability Section */}
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '24px',
                marginBottom: 24
            }}>
                <h2 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--border)'
                }}>
                    Open to Work
                </h2>

                <p style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    marginBottom: 16,
                    lineHeight: 1.5
                }}>
                    Let recruiters know your current employment status. This appears on your public profile.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        {
                            value: 'open',
                            label: 'Open to Work',
                            desc: 'Actively looking for new opportunities',
                            icon: '⬤'
                        },
                        {
                            value: 'busy',
                            label: 'Currently Busy',
                            desc: 'Open to interesting opportunities, but not actively looking',
                            icon: '⬤'
                        },
                        {
                            value: 'closed',
                            label: 'Not Available',
                            desc: 'Not looking for new opportunities right now',
                            icon: '⬤'
                        }
                    ].map(option => (
                        <div
                            key={option.value}
                            onClick={() => handleAvailabilityChange(option.value)}
                            style={{
                                padding: '14px 16px',
                                borderRadius: 10,
                                border: '2px solid ' + (availability === option.value ? 'var(--accent)' : 'var(--border)'),
                                background: availability === option.value ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12
                            }}
                            onMouseEnter={e => {
                                if (!saving) {
                                    e.currentTarget.style.borderColor = 'var(--accent)'
                                }
                            }}
                        >
                            <input
                                type="radio"
                                name="availability"
                                value={option.value}
                                checked={availability === option.value}
                                onChange={() => handleAvailabilityChange(option.value)}
                                disabled={saving}
                                style={{ marginTop: 2, cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    marginBottom: 4
                                }}>
                                    {option.label}
                                </p>
                                <p style={{
                                    fontSize: 12,
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.4
                                }}>
                                    {option.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Privacy Section */}
            <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '24px',
                marginBottom: 24
            }}>
                <h2 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--border)'
                }}>
                    Privacy & Data
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0'
                    }}>
                        <div>
                            <p style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                marginBottom: 4
                            }}>
                                Public Profile
                            </p>
                            <p style={{
                                fontSize: 12,
                                color: 'var(--text-secondary)'
                            }}>
                                Allow others to view your profile and score
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderTop: '1px solid var(--border)',
                        paddingTop: '16px'
                    }}>
                        <div>
                            <p style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                marginBottom: 4
                            }}>
                                Appear in Leaderboards
                            </p>
                            <p style={{
                                fontSize: 12,
                                color: 'var(--text-secondary)'
                            }}>
                                Include your profile in top developers ranking
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div style={{
                backgroundColor: 'var(--red-dim)',
                border: '1px solid var(--red)',
                borderRadius: 14,
                padding: '24px'
            }}>
                <h2 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--red)',
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--red)'
                }}>
                    Danger Zone
                </h2>

                <p style={{
                    fontSize: 13,
                    color: 'var(--red)',
                    marginBottom: 16,
                    lineHeight: 1.5
                }}>
                    These actions are irreversible. Please proceed with caution.
                </p>

                <button
                    style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: '1px solid var(--red)',
                        background: 'transparent',
                        color: 'var(--red)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--red)'
                        e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = 'var(--red)'
                    }}
                    onClick={() => {
                        if (confirm('This will delete all your data. Are you sure?')) {
                            toast.success('Account deletion requested')
                        }
                    }}
                >
                    Delete Account
                </button>
            </div>

        </div>
    )
}

export default Settings


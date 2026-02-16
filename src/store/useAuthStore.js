import { create } from 'zustand'

export const useAuthStore = create((set) => ({
    token: localStorage.getItem('bt_token') || null,
    user: JSON.parse(localStorage.getItem('bt_user') || 'null'),

    login: (token, user) => {
        localStorage.setItem('bt_token', token)
        localStorage.setItem('bt_user', JSON.stringify(user))
        set({ token, user })
    },

    logout: () => {
        localStorage.removeItem('bt_token')
        localStorage.removeItem('bt_user')
        set({ token: null, user: null })
    },
}))

/**
 * Derive role + referringAgent from a referral code.
 *  AGT-xxx  → agent  (the agent IS the referring agent)
 *  OPR-xxx  → operator
 *  anything else → player
 */
export function parseReferralCode(code) {
    const trimmed = (code || '').trim().toUpperCase()
    if (trimmed.startsWith('AGT-')) {
        return { role: 'agent', referringAgent: trimmed }
    }
    if (trimmed.startsWith('OPR-')) {
        return { role: 'operator', referringAgent: trimmed.replace('OPR-', 'AGT-') }
    }
    // Default: player — referringAgent is the code itself (belongs to an agent)
    return { role: 'player', referringAgent: trimmed || null }
}

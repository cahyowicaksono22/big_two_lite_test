import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, parseReferralCode } from '../store/useAuthStore'
import Button from '../components/ui/Button'
import { Spade, LogIn, UserPlus } from 'lucide-react'

export default function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((s) => s.login)

    const [isRegister, setIsRegister] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [referralCode, setReferralCode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!username.trim() || !password.trim()) {
            setError('Username and password are required')
            return
        }

        if (isRegister && !referralCode.trim()) {
            setError('Referral code is required for registration')
            return
        }

        setLoading(true)

        // TODO: Replace with real API call
        setTimeout(() => {
            const { role, referringAgent } = isRegister
                ? parseReferralCode(referralCode)
                : { role: 'player', referringAgent: null }

            const mockToken = 'mock_token_' + Date.now()
            const mockUser = {
                id: '1',
                username: username.trim(),
                role,
                balance: 1000,
                referralCode: referralCode.trim() || null,
                referringAgent,
            }
            login(mockToken, mockUser)
            navigate('/lobby')
            setLoading(false)
        }, 800)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative w-full max-w-md"
            >
                {/* Logo / Title */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mb-4 shadow-xl shadow-emerald-500/30"
                    >
                        <Spade size={40} className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gradient-gold mb-2">Big Two Club</h1>
                    <p className="text-text-secondary text-sm">The ultimate card game experience</p>
                </div>

                {/* Login / Register Toggle */}
                <div className="flex rounded-xl overflow-hidden mb-6 border border-glass-border">
                    <button
                        type="button"
                        onClick={() => { setIsRegister(false); setError('') }}
                        className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${!isRegister
                                ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400'
                                : 'bg-white/3 text-text-muted hover:text-text-secondary'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsRegister(true); setError('') }}
                        className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${isRegister
                                ? 'bg-gold-400/20 text-gold-400 border-b-2 border-gold-400'
                                : 'bg-white/3 text-text-muted hover:text-text-secondary'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Form Card */}
                <div className="glass-panel p-8 bg-surface-800/80">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                  text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                  transition-all duration-200"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                  text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
                  transition-all duration-200"
                            />
                        </div>

                        {/* Referral Code — mandatory for register, hidden for login */}
                        <AnimatePresence>
                            {isRegister && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                                        Referral Code <span className="text-ember-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value)}
                                        placeholder="e.g. AGT-ADMIN or PLAYER-001"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
                      text-text-primary placeholder-text-muted
                      focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-400/20
                      transition-all duration-200"
                                    />
                                    <p className="text-[10px] text-text-muted mt-1.5">
                                        Required — must be a valid agent code
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error */}
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-ember-500 text-sm text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* Submit */}
                        <Button
                            variant={isRegister ? 'gold' : 'primary'}
                            size="lg"
                            className="w-full flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-felt-900/30 border-t-felt-900 rounded-full animate-spin" />
                            ) : isRegister ? (
                                <>
                                    <UserPlus size={18} />
                                    Create Account
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Enter the Club
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-text-muted text-xs mt-6">
                    Play responsibly • Big Two Club © 2026
                </p>
            </motion.div>
        </div>
    )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/useGameStore'
import { X, Trophy, TrendingUp, TrendingDown, Crown, Medal, BarChart3, History, Award } from 'lucide-react'

const TABS = [
    { id: 'history', label: 'Rounds', icon: History },
    { id: 'standings', label: 'Standings', icon: BarChart3 },
    { id: 'settlement', label: 'Settlement', icon: Award },
]

export default function ScoreSheetPanel({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('history')
    const roundHistory = useGameStore((s) => s.roundHistory)
    const matchStatus = useGameStore((s) => s.matchStatus)
    const getLiveStandings = useGameStore((s) => s.getLiveStandings)

    const standings = getLiveStandings()
    const isEnded = matchStatus === 'ended' || matchStatus === 'pending_decision'

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:backdrop-blur-none"
                    />

                    {/* Panel — full screen on mobile, side drawer on desktop */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed z-50 right-0 top-0 h-full
                            w-full sm:w-[400px]
                            bg-surface-800/98 border-l border-glass-border
                            flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border flex-shrink-0">
                            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                                <BarChart3 size={18} className="text-gold-400" />
                                Scoresheet
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tab bar */}
                        <div className="flex border-b border-glass-border flex-shrink-0">
                            {TABS.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                const isDisabled = tab.id === 'settlement' && !isEnded
                                return (
                                    <button
                                        key={tab.id}
                                        disabled={isDisabled}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer
                                            ${isActive
                                                ? 'text-gold-400 border-b-2 border-gold-400 bg-gold-400/5'
                                                : isDisabled
                                                    ? 'text-text-muted/30 cursor-not-allowed'
                                                    : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                            {activeTab === 'history' && <RoundHistoryTab rounds={roundHistory} />}
                            {activeTab === 'standings' && <StandingsTab standings={standings} />}
                            {activeTab === 'settlement' && <SettlementTab standings={standings} isEnded={isEnded} />}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

/* ===== Round History Tab ===== */
function RoundHistoryTab({ rounds }) {
    if (rounds.length === 0) {
        return <EmptyState icon={History} text="No rounds played yet" />
    }

    return (
        <div className="space-y-3">
            {rounds.map((round, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl bg-white/[0.03] border border-glass-border overflow-hidden"
                >
                    <div className="px-3 py-2 bg-white/[0.02] border-b border-glass-border flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">Round {round.round}</span>
                        <span className="text-[10px] text-text-muted">
                            🏆 {round.scores.find(s => s.isWinner)?.name}
                        </span>
                    </div>
                    <div className="divide-y divide-glass-border/50">
                        {round.scores.map((s, i) => (
                            <div key={i} className={`flex items-center justify-between px-3 py-2
                                ${s.isWinner ? 'bg-gold-400/5' : ''}`}>
                                <div className="flex items-center gap-2">
                                    {s.isWinner && <Trophy size={12} className="text-gold-400" />}
                                    <span className={`text-xs ${s.isWinner ? 'text-gold-400 font-semibold' : 'text-text-secondary'}`}>
                                        {s.name}
                                    </span>
                                    {!s.isWinner && s.cardCount > 0 && (
                                        <span className="text-[9px] text-text-muted">{s.cardCount} cards</span>
                                    )}
                                </div>
                                <ScoreValue score={s.netScore} />
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

/* ===== Standings Tab ===== */
function StandingsTab({ standings }) {
    if (standings.length === 0) return <EmptyState icon={BarChart3} text="No data yet" />

    const medalColors = ['text-gold-400', 'text-gray-300', 'text-amber-600']

    return (
        <div className="space-y-2">
            {standings.map((p, i) => (
                <motion.div
                    key={p.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                        ${i === 0
                            ? 'bg-gold-400/10 border-gold-400/20'
                            : 'bg-white/[0.03] border-glass-border'
                        }`}
                >
                    {/* Rank */}
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                        {i < 3 ? (
                            <Medal size={16} className={medalColors[i]} />
                        ) : (
                            <span className="text-xs font-bold text-text-muted">{i + 1}</span>
                        )}
                    </div>

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${i === 0 ? 'text-gold-400' : 'text-text-primary'}`}>
                            {p.avatar} {p.name}
                        </p>
                        <p className="text-[10px] text-text-muted">{p.wins} win{p.wins !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Score */}
                    <ScoreValue score={p.total} large />
                </motion.div>
            ))}
        </div>
    )
}

/* ===== Settlement Tab ===== */
function SettlementTab({ standings, isEnded }) {
    if (!isEnded) {
        return <EmptyState icon={Award} text="Match still in progress" />
    }

    return (
        <div className="space-y-4">
            {/* Podium header */}
            <div className="text-center py-3">
                <Crown size={32} className="text-gold-400 mx-auto mb-2" />
                <h3 className="text-lg font-black text-gradient-gold">Final Settlement</h3>
                <p className="text-xs text-text-muted mt-1">Match completed</p>
            </div>

            {/* Results */}
            <div className="space-y-2">
                {standings.map((p, i) => {
                    const isFirst = i === 0
                    return (
                        <motion.div
                            key={p.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`flex items-center justify-between p-4 rounded-xl border
                                ${isFirst
                                    ? 'bg-gold-400/10 border-gold-400/25 glow-gold'
                                    : 'bg-white/[0.03] border-glass-border'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{p.avatar}</span>
                                <div>
                                    <p className={`text-sm font-bold ${isFirst ? 'text-gold-400' : 'text-text-primary'}`}>
                                        {isFirst && '👑 '}{p.name}
                                    </p>
                                    <p className="text-[10px] text-text-muted">{p.wins} round win{p.wins !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <ScoreValue score={p.total} large />
                                <p className="text-[10px] text-text-muted mt-0.5">net score</p>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

/* ===== Shared ===== */
function ScoreValue({ score, large = false }) {
    const isPositive = score > 0
    const isNegative = score < 0
    return (
        <div className="flex items-center gap-1">
            {isPositive && <TrendingUp size={large ? 14 : 10} className="text-emerald-400" />}
            {isNegative && <TrendingDown size={large ? 14 : 10} className="text-red-400" />}
            <span className={`font-bold tabular-nums
                ${large ? 'text-sm' : 'text-xs'}
                ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-text-muted'}`}
            >
                {isPositive ? '+' : ''}{score}
            </span>
        </div>
    )
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-text-muted/50">
            <Icon size={32} className="mb-3" />
            <p className="text-sm">{text}</p>
        </div>
    )
}

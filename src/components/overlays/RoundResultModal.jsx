import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Trophy, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react'
import { getMultiplierLabel } from '../../lib/scoreCalculator'

export default function RoundResultModal({ isOpen, onClose, scores, roundNumber, isBombRound = false }) {
    // Mock scores if not provided
    const displayScores = scores || [
        { name: 'You', cardCount: 0, multiplier: 0, netScore: 45, isWinner: true, isCulprit: false, label: null },
        { name: 'Alice', cardCount: 5, multiplier: 1, netScore: -125, isWinner: false, isCulprit: false, label: null },
        { name: 'Bob', cardCount: 8, multiplier: 1, netScore: -200, isWinner: false, isCulprit: false, label: null },
        { name: 'Charlie', cardCount: 10, multiplier: 2, netScore: -250, isWinner: false, isCulprit: false, label: '⚠️ Heavy (x2)' },
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Round ${roundNumber || '—'} Results`}>
            {isBombRound && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs text-red-300 font-medium">
                        💣 Bomb Round — Culprit absorbs all penalties
                    </span>
                </div>
            )}

            <div className="space-y-2">
                {displayScores.map((player, i) => {
                    const isPositive = player.netScore > 0
                    const isDragon = player.cardCount >= 13 && !player.isWinner
                    const multiplierLabel = player.label || (player.cardCount > 0 ? getMultiplierLabel(player.cardCount) : null)

                    return (
                        <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-xl ${player.isWinner
                                    ? 'bg-gold-400/10 border border-gold-400/20'
                                    : player.isCulprit
                                        ? 'bg-red-500/10 border border-red-500/20'
                                        : 'bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {player.isWinner && <Trophy size={16} className="text-gold-400" />}
                                <div>
                                    <span className="text-sm font-medium text-text-primary">{player.name}</span>
                                    {!player.isWinner && player.cardCount > 0 && (
                                        <span className="text-[10px] text-text-muted ml-2">
                                            {player.cardCount} cards left
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Multiplier badge */}
                                {multiplierLabel && !player.isWinner && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isDragon
                                            ? 'bg-red-500/20 text-red-400'
                                            : player.multiplier >= 2
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : 'bg-white/10 text-text-muted'
                                        }`}>
                                        {multiplierLabel}
                                    </span>
                                )}

                                {/* Score */}
                                <div className="flex items-center gap-1">
                                    {isPositive ? (
                                        <TrendingUp size={14} className="text-emerald-400" />
                                    ) : player.netScore < 0 ? (
                                        <TrendingDown size={14} className="text-ember-500" />
                                    ) : null}
                                    <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-400' : player.netScore < 0 ? 'text-ember-500' : 'text-text-muted'
                                        }`}>
                                        {isPositive ? '+' : ''}{player.netScore}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-5 flex justify-center">
                <Button variant="primary" onClick={onClose}>Continue</Button>
            </div>
        </Modal>
    )
}

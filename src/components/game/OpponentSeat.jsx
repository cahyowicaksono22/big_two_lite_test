import { motion } from 'framer-motion'
import Badge from '../ui/Badge'
import PingIndicator from '../ui/PingIndicator'
import TimerRing from '../ui/TimerRing'
import { Crown, UserX } from 'lucide-react'

export default function OpponentSeat({ player, isActive, position = 'top', canKick = false, onKick }) {
    if (!player) {
        return (
            <div className="flex flex-col items-center gap-1 sm:gap-2 opacity-30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-text-muted text-[10px] sm:text-xs">
                    Empty
                </div>
            </div>
        )
    }

    const isZombie = player.status === 'zombie'
    const isDisconnected = player.status === 'disconnected'
    const isPassed = player.status === 'pass'
    const hasWon = player.cardCount === 0

    return (
        <motion.div
            layout
            className="flex flex-col items-center gap-1 sm:gap-1.5 relative group"
        >
            {/* Kick button (Agent only) */}
            {canKick && (
                <button
                    onClick={() => onKick?.(player)}
                    className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30
                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer
                        hover:bg-red-500/40"
                    title={`Kick ${player.name}`}
                >
                    <UserX size={12} className="text-red-400" />
                </button>
            )}

            {/* Avatar with timer ring */}
            <div className="relative">
                {isActive && (
                    <>
                        {/* Mobile timer ring (matches w-10 = 40px avatar) */}
                        <div className="absolute -inset-1 z-0 sm:hidden">
                            <TimerRing seconds={20} maxSeconds={30} size={44} strokeWidth={2.5} />
                        </div>
                        {/* Desktop timer ring (matches w-12 = 48px avatar) */}
                        <div className="absolute -inset-1 z-0 hidden sm:block">
                            <TimerRing seconds={20} maxSeconds={30} size={56} strokeWidth={3} />
                        </div>
                    </>
                )}
                <motion.div
                    animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`
                        relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl
                        border-2 transition-all duration-300
                        ${isActive ? 'border-gold-400 animate-pulse-glow bg-surface-700' : 'border-white/10 bg-surface-800'}
                        ${isZombie ? 'grayscale opacity-60' : ''}
                        ${isDisconnected ? 'opacity-40' : ''}
                    `}
                >
                    {isZombie ? '🧟' : player.avatar}
                </motion.div>
            </div>

            {/* Name + Balance */}
            <div className="text-center">
                <p className={`text-[10px] sm:text-xs font-semibold ${isActive ? 'text-gold-400' : 'text-text-primary'}`}>
                    {player.name}
                </p>
                <p className="text-[9px] sm:text-[10px] text-text-muted">{player.balance} pts</p>
            </div>

            {/* Ping indicator — visible to all */}
            {player.latency !== undefined && (
                <PingIndicator latency={player.latency} size="sm" />
            )}

            {/* Status badge */}
            {(isPassed || isZombie || isDisconnected) && (
                <Badge status={player.status} />
            )}

            {/* Numeric card count badge (Clean UI Rule) */}
            <div className="mt-0.5 sm:mt-1">
                {hasWon ? (
                    <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gold-400/15 border border-gold-400/30">
                        <Crown size={12} className="text-gold-400 sm:hidden" />
                        <Crown size={14} className="text-gold-400 hidden sm:block" />
                        <span className="text-xs sm:text-sm font-black text-gold-400">WIN</span>
                    </div>
                ) : (
                    <div className={`
                        px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-center min-w-[2.5rem] sm:min-w-[3rem]
                        ${isActive
                            ? 'bg-gold-400/10 border-gold-400/30'
                            : 'bg-white/5 border-glass-border'
                        }
                    `}>
                        <span className={`text-xl sm:text-2xl font-black tabular-nums ${isActive ? 'text-gold-400' : 'text-text-primary'
                            }`}>
                            {player.cardCount}
                        </span>
                        <p className="text-[7px] sm:text-[8px] text-text-muted uppercase tracking-wider -mt-0.5">cards</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}


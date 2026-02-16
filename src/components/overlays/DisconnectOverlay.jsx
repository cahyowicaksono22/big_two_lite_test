import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Zap } from 'lucide-react'

export default function DisconnectOverlay({ isOpen, countdown = 119, disconnectNumber = 1 }) {
    const isFirstDisconnect = disconnectNumber <= 1
    const minutes = Math.floor(countdown / 60)
    const seconds = countdown % 60

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="flex flex-col items-center text-center p-8 max-w-sm"
                    >
                        {isFirstDisconnect ? (
                            <>
                                {/* First disconnect: Game pauses, 2 min timer */}
                                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                                    <WifiOff size={32} className="text-amber-400" />
                                </div>
                                <h2 className="text-xl font-bold text-text-primary mb-1">⏸ Game Paused</h2>
                                <p className="text-text-secondary text-sm mb-4">
                                    A player disconnected. Attempting to reconnect…
                                </p>
                                <div className="text-4xl font-mono font-bold text-amber-400 mb-2">
                                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                </div>
                                <p className="text-text-muted text-xs">
                                    If not reconnected in time, <span className="text-purple-400 font-semibold">Zombie Mode</span> will activate
                                </p>
                                <div className="mt-6 w-8 h-8 border-3 border-white/10 border-t-amber-400 rounded-full animate-spin" />
                            </>
                        ) : (
                            <>
                                {/* 2nd+ disconnect: Immediate zombie, no pause */}
                                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                                    <Zap size={32} className="text-purple-400" />
                                </div>
                                <h2 className="text-xl font-bold text-text-primary mb-1">⚡ Instant Zombie</h2>
                                <p className="text-text-secondary text-sm mb-2">
                                    Disconnect #{disconnectNumber} — no grace period.
                                </p>
                                <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
                                    <p className="text-xs text-purple-300 font-medium">
                                        🧟 Zombie Mode activated immediately
                                    </p>
                                    <p className="text-[10px] text-purple-300/60 mt-1">
                                        Game continues without interruption
                                    </p>
                                </div>
                                <p className="text-text-muted text-xs">
                                    Reconnect to take back control
                                </p>
                                <div className="mt-4 w-8 h-8 border-3 border-white/10 border-t-purple-400 rounded-full animate-spin" />
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

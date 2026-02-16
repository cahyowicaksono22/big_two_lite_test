import { motion, AnimatePresence } from 'framer-motion'

export default function BombAnimation({ isActive, bomberName, victimName, points = 500, bombType = 'classic' }) {
    const isEndgame = bombType === 'endgame'
    const title = isEndgame ? '💥 END-GAME BOMB!' : '💣 BOMB!'
    const subtitle = isEndgame
        ? 'Risky 2-card gamble failed!'
        : 'Single 2 countered!'

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
                >
                    {/* Screen shake wrapper */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
                            y: [0, 4, -4, 3, -3, 2, -2, 1, -1, 0],
                        }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Flash */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.6, 0] }}
                            transition={{ duration: 0.3 }}
                            className={`absolute inset-0 ${isEndgame ? 'bg-red-500/30' : 'bg-amber-400/30'}`}
                        />
                    </motion.div>

                    {/* Explosion center */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 2], opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`absolute w-40 h-40 rounded-full blur-xl ${isEndgame
                                ? 'bg-gradient-radial from-red-400 via-red-600 to-transparent'
                                : 'bg-gradient-radial from-gold-400 via-amber-500 to-transparent'
                            }`}
                    />

                    {/* BOMB text */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: [0, 1.3, 1], rotate: [20, -5, 0] }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative z-10 text-center"
                    >
                        <h2 className={`text-5xl font-black tracking-widest drop-shadow-2xl ${isEndgame ? 'text-red-400' : 'text-gradient-gold'
                            }`}>
                            {title}
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
                    </motion.div>

                    {/* Score breakdown */}
                    <motion.div
                        className="absolute bottom-1/3 flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {victimName && (
                            <span className="text-lg font-bold text-ember-500">
                                💀 {victimName} absorbs all penalties: -{points} pts
                            </span>
                        )}
                        {bomberName && (
                            <span className="text-lg font-bold text-emerald-400">
                                🏆 {bomberName} wins: +{points} pts
                            </span>
                        )}
                        {isEndgame && (
                            <span className="text-xs text-text-muted mt-1">
                                🛡️ Other players are safe (pay nothing)
                            </span>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

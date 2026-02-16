import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import { Brain } from 'lucide-react'

export default function ZombieNotification({ isOpen, onResume }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full mx-4"
                >
                    <div className="glass-panel px-5 py-4 bg-purple-900/80 border-purple-500/30 shadow-xl shadow-purple-500/20">
                        <div className="flex items-center gap-4 mb-3">
                            <Brain size={28} className="text-purple-400 animate-pulse flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-purple-200">🧟 Zombie Mode Active</p>
                                <p className="text-xs text-purple-300/70">Auto-play is controlling your turns</p>
                            </div>
                            <Button variant="gold" size="sm" onClick={onResume}>
                                TAKE CONTROL
                            </Button>
                        </div>

                        {/* Auto-play rules */}
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="px-2 py-1.5 rounded-lg bg-white/5 text-center">
                                <p className="text-[10px] text-purple-300 font-semibold">Has 3♦?</p>
                                <p className="text-[9px] text-text-muted">Plays Single 3♦</p>
                            </div>
                            <div className="px-2 py-1.5 rounded-lg bg-white/5 text-center">
                                <p className="text-[10px] text-purple-300 font-semibold">Following?</p>
                                <p className="text-[9px] text-text-muted">Always Passes</p>
                            </div>
                            <div className="px-2 py-1.5 rounded-lg bg-white/5 text-center">
                                <p className="text-[10px] text-purple-300 font-semibold">Leading?</p>
                                <p className="text-[9px] text-text-muted">Lowest Single</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

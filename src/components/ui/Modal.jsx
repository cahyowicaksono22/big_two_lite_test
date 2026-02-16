import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, closeable = true, title, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={closeable ? onClose : undefined}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative glass-panel p-6 max-w-lg w-full bg-surface-800/95 border border-glass-border"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                            {closeable && (
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

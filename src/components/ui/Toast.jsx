import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

let toastId = 0
let addToastFn = null

export function showToast(message, type = 'info', duration = 3000) {
    if (addToastFn) {
        addToastFn({ id: ++toastId, message, type, duration })
    }
}

const typeStyles = {
    info: 'border-ocean-500/40 bg-ocean-500/10',
    success: 'border-emerald-500/40 bg-emerald-500/10',
    warning: 'border-gold-400/40 bg-gold-400/10',
    error: 'border-ember-500/40 bg-ember-500/10',
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((toast) => {
        setToasts((prev) => [...prev, toast])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, toast.duration)
    }, [])

    useEffect(() => {
        addToastFn = addToast
        return () => { addToastFn = null }
    }, [addToast])

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className={`
              pointer-events-auto glass-panel px-4 py-3 min-w-[260px] max-w-sm
              flex items-center gap-3 border
              ${typeStyles[toast.type] || typeStyles.info}
            `}
                    >
                        <span className="text-sm text-text-primary flex-1">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

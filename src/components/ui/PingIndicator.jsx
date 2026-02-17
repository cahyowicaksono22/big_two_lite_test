import { motion } from 'framer-motion'

function getPingColor(latency) {
    if (latency < 100) return { dot: 'bg-emerald-400', text: 'text-emerald-400', glow: 'shadow-emerald-400/40' }
    if (latency <= 300) return { dot: 'bg-amber-400', text: 'text-amber-400', glow: 'shadow-amber-400/40' }
    return { dot: 'bg-red-500', text: 'text-red-500', glow: 'shadow-red-500/40' }
}

export default function PingIndicator({ latency = 0, size = 'sm' }) {
    const color = getPingColor(latency)
    const isSmall = size === 'sm'

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-1 rounded-full
                ${isSmall ? 'px-1.5 py-0.5' : 'px-2 py-1'}
                bg-black/30 backdrop-blur-sm border border-white/5`}
        >
            <span className={`inline-block rounded-full animate-ping-dot
                ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'}
                ${color.dot} ${color.glow} shadow-sm`}
            />
            <span className={`font-mono font-semibold tabular-nums
                ${isSmall ? 'text-[8px]' : 'text-[10px]'}
                ${color.text}`}
            >
                {latency}ms
            </span>
        </motion.div>
    )
}

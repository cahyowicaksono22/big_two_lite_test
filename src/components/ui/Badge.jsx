const badgeStyles = {
    pass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    zombie: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    disconnected: 'bg-red-500/20 text-red-400 border-red-500/30',
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    waiting: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    playing: 'bg-ocean-500/20 text-ocean-500 border-ocean-500/30',
    watching: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pending_decision: 'bg-gold-400/20 text-gold-400 border-gold-400/30',
}

const badgeLabels = {
    pass: 'PASS',
    zombie: '🧟 ZOMBIE',
    disconnected: '⚡ DISCONNECTED',
    active: 'ACTIVE',
    waiting: 'WAITING',
    playing: 'PLAYING',
    watching: '👁 WATCHING',
    pending_decision: '⏳ PENDING',
}

export default function Badge({ status, className = '' }) {
    return (
        <span
            className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
        uppercase tracking-wider border
        ${badgeStyles[status] || badgeStyles.waiting}
        ${className}
      `}
        >
            {badgeLabels[status] || status?.toUpperCase()}
        </span>
    )
}

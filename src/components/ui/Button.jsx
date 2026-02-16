import { motion } from 'framer-motion'

const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20',
    danger: 'bg-gradient-to-r from-ember-500 to-ember-600 hover:from-ember-600 hover:to-red-700 text-white shadow-lg shadow-ember-500/20',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20',
    ghost: 'bg-white/5 hover:bg-white/10 text-text-secondary border border-glass-border',
    gold: 'bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-amber-700 text-felt-900 font-bold shadow-lg shadow-gold-500/20',
    blue: 'bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-blue-700 text-white shadow-lg shadow-ocean-500/20',
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick,
    className = '',
    ...props
}) {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-5 py-2.5 text-sm rounded-xl',
        lg: 'px-8 py-3.5 text-base rounded-xl',
    }

    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`
        ${variants[variant]}
        ${sizeClasses[size]}
        font-medium transition-all duration-200 cursor-pointer
        ${disabled ? 'opacity-40 cursor-not-allowed saturate-0' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </motion.button>
    )
}

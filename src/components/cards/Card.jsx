import { motion } from 'framer-motion'
import { getSuitSymbol, getSuitColor, getValueName } from '../../lib/cardValidator'

export default function Card({ card, selected = false, onClick, faceDown = false, small = false }) {
    const width = small ? 48 : 72
    const height = small ? 68 : 100

    if (faceDown) {
        return (
            <div
                className="rounded-lg border border-white/10 flex items-center justify-center"
                style={{
                    width,
                    height,
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2344 50%, #1e3a5f 100%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
            >
                <div
                    className="rounded-sm"
                    style={{
                        width: width - 12,
                        height: height - 12,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)',
                    }}
                />
            </div>
        )
    }

    const suitSymbol = getSuitSymbol(card.suit)
    const suitColor = getSuitColor(card.suit)
    const valueName = getValueName(card.value)

    return (
        <motion.div
            layout
            onClick={onClick}
            whileHover={{ y: selected ? -10 : -6, scale: 1.05 }}
            animate={{ y: selected ? -14 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`
        relative rounded-lg cursor-pointer select-none
        border-2 transition-colors duration-150
        ${selected
                    ? 'border-gold-400 shadow-lg shadow-gold-400/30 z-10'
                    : 'border-white/20 hover:border-white/40'
                }
      `}
            style={{
                width,
                height,
                background: 'linear-gradient(165deg, #ffffff 0%, #f5f5f5 50%, #ebebeb 100%)',
                boxShadow: selected
                    ? '0 8px 24px rgba(251,191,36,0.3), 0 2px 8px rgba(0,0,0,0.2)'
                    : '0 2px 8px rgba(0,0,0,0.2)',
            }}
        >
            {/* Top-left value + suit */}
            <div className="absolute top-1 left-1.5 flex flex-col items-center leading-tight" style={{ color: suitColor }}>
                <span className={`font-bold ${small ? 'text-[10px]' : 'text-xs'}`}>{valueName}</span>
                <span className={small ? 'text-[10px] -mt-0.5' : 'text-xs -mt-0.5'}>{suitSymbol}</span>
            </div>

            {/* Center suit */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ color: suitColor }}
            >
                <span className={small ? 'text-xl' : 'text-3xl'}>{suitSymbol}</span>
            </div>

            {/* Bottom-right value + suit (inverted) */}
            <div
                className="absolute bottom-1 right-1.5 flex flex-col items-center leading-tight rotate-180"
                style={{ color: suitColor }}
            >
                <span className={`font-bold ${small ? 'text-[10px]' : 'text-xs'}`}>{valueName}</span>
                <span className={small ? 'text-[10px] -mt-0.5' : 'text-xs -mt-0.5'}>{suitSymbol}</span>
            </div>
        </motion.div>
    )
}

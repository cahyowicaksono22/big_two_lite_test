import { motion, AnimatePresence } from 'framer-motion'
import CardStack from '../cards/CardStack'
import { useGameStore } from '../../store/useGameStore'

export default function TableCenter() {
    const tableCards = useGameStore((s) => s.tableCards)

    return (
        <div className="flex flex-col items-center justify-center min-h-[120px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={tableCards.map((c) => c.id).join('-') || 'empty'}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <CardStack cards={tableCards} small />
                </motion.div>
            </AnimatePresence>

            {tableCards.length > 0 && (
                <p className="text-[10px] text-text-muted mt-2 uppercase tracking-wider">Last played</p>
            )}
        </div>
    )
}

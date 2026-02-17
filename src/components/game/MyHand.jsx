import { motion, AnimatePresence } from 'framer-motion'
import Card from '../cards/Card'
import { useGameStore } from '../../store/useGameStore'
import { ArrowUpDown, Group, Ungroup, X } from 'lucide-react'

export default function MyHand() {
    const myHand = useGameStore((s) => s.myHand)
    const selectedCards = useGameStore((s) => s.selectedCards)
    const groupedCards = useGameStore((s) => s.groupedCards)
    const selectCard = useGameStore((s) => s.selectCard)
    const sortHand = useGameStore((s) => s.sortHand)
    const groupCards = useGameStore((s) => s.groupCards)
    const ungroupCards = useGameStore((s) => s.ungroupCards)
    const ungroupAll = useGameStore((s) => s.ungroupAll)

    const hasSelection = selectedCards.length > 0
    const canGroup = hasSelection && selectedCards.length <= 5

    return (
        <div className="flex flex-col items-center gap-2 sm:gap-3">
            {/* Grouped Cards — above main hand */}
            <AnimatePresence>
                {groupedCards.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex flex-col items-center gap-2 w-full"
                    >
                        {/* Ungroup all button */}
                        <button
                            onClick={ungroupAll}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20
                                text-rose-400 text-[10px] hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                            <Ungroup size={10} />
                            Ungroup All
                        </button>

                        {/* Group slots */}
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                            {groupedCards.map((group, groupIdx) => (
                                <motion.div
                                    key={`group-${groupIdx}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative flex items-end gap-0.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl
                                        bg-gold-400/5 border border-gold-400/20 backdrop-blur-sm"
                                >
                                    {/* Ungroup single group button */}
                                    <button
                                        onClick={() => ungroupCards(groupIdx)}
                                        className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full
                                            bg-surface-800 border border-glass-border
                                            flex items-center justify-center cursor-pointer
                                            hover:bg-rose-500/20 hover:border-rose-500/30 transition-colors"
                                        title="Return cards to hand"
                                    >
                                        <X size={10} className="text-text-muted hover:text-rose-400" />
                                    </button>

                                    {/* Group label */}
                                    <span className="absolute -top-2 left-2 px-1.5 py-0 rounded-full
                                        bg-gold-400/15 text-gold-400 text-[8px] font-bold tracking-wider uppercase">
                                        G{groupIdx + 1}
                                    </span>

                                    {/* Cards in group */}
                                    {group.map((card) => (
                                        <Card key={card.id} card={card} small />
                                    ))}
                                </motion.div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="w-32 sm:w-48 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sort + Group Controls */}
            <div className="flex gap-2">
                <button
                    onClick={() => sortHand('value')}
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-white/5 border border-glass-border
                        text-text-secondary text-[10px] sm:text-[11px] hover:bg-white/10 hover:text-text-primary
                        transition-all cursor-pointer"
                >
                    <ArrowUpDown size={12} />
                    Sort
                </button>
                <button
                    onClick={groupCards}
                    disabled={!canGroup}
                    className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px]
                        transition-all
                        ${canGroup
                            ? 'bg-gold-400/10 border-gold-400/30 text-gold-400 hover:bg-gold-400/20 cursor-pointer'
                            : 'bg-white/3 border-glass-border text-text-muted/40 cursor-not-allowed'
                        }`}
                >
                    <Group size={12} />
                    Group
                </button>
            </div>

            {/* Main Hand Cards — horizontal scroll on mobile, wrap on desktop */}
            <div className="flex sm:flex-wrap sm:justify-center gap-1 sm:gap-1.5 px-2 max-w-full sm:max-w-[640px]
                overflow-x-auto scrollbar-none pb-2 sm:pb-0 snap-x snap-mandatory sm:snap-none">
                {myHand.map((card, index) => (
                    <motion.div
                        key={card.id}
                        layout
                        initial={{ opacity: 0, y: 40, rotateY: 180 }}
                        animate={{ opacity: 1, y: 0, rotateY: 0 }}
                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
                        className="flex-shrink-0 sm:flex-shrink snap-center"
                    >
                        <Card
                            card={card}
                            selected={selectedCards.includes(card.id)}
                            onClick={() => selectCard(card.id)}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Selection info */}
            {hasSelection && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-[10px] sm:text-[11px] ${selectedCards.length >= 5 ? 'text-amber-400' : 'text-gold-400'}`}
                >
                    {selectedCards.length}/5 card{selectedCards.length > 1 ? 's' : ''} selected
                    {selectedCards.length >= 5 && ' (max)'}
                </motion.p>
            )}
        </div>
    )
}


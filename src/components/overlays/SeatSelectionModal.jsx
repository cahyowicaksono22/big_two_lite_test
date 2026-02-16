import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const SEAT_POSITIONS = [
    { label: 'Seat 1', angle: 180 },  // Bottom
    { label: 'Seat 2', angle: 270 },  // Left
    { label: 'Seat 3', angle: 0 },    // Top
    { label: 'Seat 4', angle: 90 },   // Right
]

export default function SeatSelectionModal({ isOpen, occupiedSeats = [], onSelect }) {
    const [selected, setSelected] = useState(null)

    const handleConfirm = () => {
        if (selected !== null) {
            onSelect(selected)
        }
    }

    return (
        <Modal isOpen={isOpen} closeable={false} title="Choose Your Seat">
            <p className="text-text-secondary text-sm mb-6 text-center">
                Select an available seat at the table.
            </p>

            {/* Mini table with 4 seats */}
            <div className="relative w-56 h-56 mx-auto mb-6">
                {/* Table felt */}
                <div
                    className="absolute inset-6 rounded-full border-2 border-emerald-800/60"
                    style={{
                        background: 'radial-gradient(circle, #1a5c2e 0%, #0f3d1c 80%)',
                        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
                    }}
                />

                {/* Seats */}
                {SEAT_POSITIONS.map((pos, i) => {
                    const isOccupied = occupiedSeats.includes(i)
                    const isSelected = selected === i
                    const rad = (pos.angle * Math.PI) / 180
                    const cx = 112 + Math.cos(rad) * 90
                    const cy = 112 + Math.sin(rad) * 90

                    return (
                        <motion.button
                            key={i}
                            whileHover={!isOccupied ? { scale: 1.1 } : {}}
                            whileTap={!isOccupied ? { scale: 0.95 } : {}}
                            onClick={() => !isOccupied && setSelected(i)}
                            disabled={isOccupied}
                            className={`
                                absolute w-14 h-14 rounded-full flex flex-col items-center justify-center
                                -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer
                                border-2 text-xs font-bold
                                ${isOccupied
                                    ? 'bg-white/5 border-white/10 text-text-muted cursor-not-allowed opacity-40'
                                    : isSelected
                                        ? 'bg-gold-400/20 border-gold-400 text-gold-400 shadow-lg shadow-gold-400/20'
                                        : 'bg-surface-700 border-glass-border text-text-secondary hover:border-emerald-500/50 hover:text-text-primary'
                                }
                            `}
                            style={{ left: cx, top: cy }}
                        >
                            {isOccupied ? (
                                <span className="text-base">👤</span>
                            ) : isSelected ? (
                                <Check size={18} className="text-gold-400" />
                            ) : (
                                <span className="text-lg">🪑</span>
                            )}
                            <span className="text-[8px] mt-0.5">{pos.label}</span>
                        </motion.button>
                    )
                })}
            </div>

            <Button
                variant="gold"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                disabled={selected === null}
                onClick={handleConfirm}
            >
                {selected !== null ? `Sit at Seat ${selected + 1}` : 'Select a seat'}
            </Button>
        </Modal>
    )
}

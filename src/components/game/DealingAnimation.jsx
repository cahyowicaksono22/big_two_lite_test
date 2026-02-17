import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Positions for 4 players: bottom (you), left, top, right
const SEAT_TARGETS = [
    { x: 0, y: 220, label: 'You' },       // Seat 0 — bottom
    { x: -280, y: 0, label: 'Left' },      // Seat 1 — left
    { x: 0, y: -220, label: 'Top' },       // Seat 2 — top
    { x: 280, y: 0, label: 'Right' },      // Seat 3 — right
]

// Mobile-adjusted positions
const SEAT_TARGETS_MOBILE = [
    { x: 0, y: 180, label: 'You' },
    { x: -120, y: -160, label: 'Left' },
    { x: 0, y: -160, label: 'Top' },
    { x: 120, y: -160, label: 'Right' },
]

const TOTAL_CARDS = 52
const CARDS_PER_PLAYER = 13
const DEAL_INTERVAL = 60 // ms between each card dealt

function CardBack({ style, className = '' }) {
    return (
        <div
            className={`rounded-lg border border-white/15 ${className}`}
            style={{
                width: 48,
                height: 68,
                background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2344 50%, #1e3a5f 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                ...style,
            }}
        >
            <div
                className="rounded-sm"
                style={{
                    width: 36,
                    height: 56,
                    margin: '5px auto',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)',
                }}
            />
        </div>
    )
}

export default function DealingAnimation({ isActive, onComplete, playerNames = [] }) {
    const [phase, setPhase] = useState('idle') // idle → shuffle → deal → done
    const [dealtCards, setDealtCards] = useState([])
    const [isMobile, setIsMobile] = useState(false)

    // Stable refs to avoid re-triggering effects
    const onCompleteRef = useRef(onComplete)
    onCompleteRef.current = onComplete

    const cardIndexRef = useRef(0)
    const intervalRef = useRef(null)
    const doneTimerRef = useRef(null)

    // Check for mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Memoize targets so the reference is stable
    const targets = useMemo(
        () => isMobile ? SEAT_TARGETS_MOBILE : SEAT_TARGETS,
        [isMobile]
    )

    // Phase controller — only depends on isActive
    useEffect(() => {
        if (!isActive) {
            setPhase('idle')
            setDealtCards([])
            cardIndexRef.current = 0
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
            return
        }

        // Start shuffle phase
        setPhase('shuffle')
        setDealtCards([])
        cardIndexRef.current = 0

        const shuffleTimer = setTimeout(() => {
            setPhase('deal')
        }, 1800) // Shuffle lasts 1.8s

        return () => clearTimeout(shuffleTimer)
    }, [isActive])

    // Dealing phase — only depends on phase (stable string)
    useEffect(() => {
        if (phase !== 'deal') return

        // Reset for a clean deal
        cardIndexRef.current = 0
        setDealtCards([])

        intervalRef.current = setInterval(() => {
            const idx = cardIndexRef.current
            if (idx >= TOTAL_CARDS) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
                // Brief pause then complete
                doneTimerRef.current = setTimeout(() => {
                    setPhase('done')
                    onCompleteRef.current?.()
                }, 600)
                return
            }

            const seatIndex = idx % 4
            // Read current targets from the stable memo — safe because we capture by closure
            const currentTargets = window.innerWidth < 640 ? SEAT_TARGETS_MOBILE : SEAT_TARGETS
            setDealtCards((prev) => {
                // Guard: never exceed TOTAL_CARDS
                if (prev.length >= TOTAL_CARDS) return prev
                return [...prev, {
                    id: idx,
                    seatIndex,
                    target: currentTargets[seatIndex],
                }]
            })
            cardIndexRef.current = idx + 1
        }, DEAL_INTERVAL)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            if (doneTimerRef.current) {
                clearTimeout(doneTimerRef.current)
                doneTimerRef.current = null
            }
        }
    }, [phase])

    const names = playerNames.length === 4
        ? playerNames
        : ['You', 'Player 2', 'Player 3', 'Player 4']

    // Count dealt cards per player
    const countForSeat = (seatIdx) => dealtCards.filter(c => c.seatIndex === seatIdx).length

    return (
        <AnimatePresence>
            {isActive && phase !== 'idle' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    className="fixed inset-0 z-[70] flex items-center justify-center"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)' }}
                >
                    {/* Title */}
                    <motion.div
                        className="absolute top-6 sm:top-10 left-0 right-0 text-center z-20"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-lg sm:text-2xl font-black tracking-wider text-gradient-gold">
                            {phase === 'shuffle' ? '🔀 Shuffling...' : phase === 'deal' ? '🃏 Dealing Cards' : '✅ Ready!'}
                        </h2>
                        {phase === 'deal' && (
                            <p className="text-[10px] sm:text-xs text-text-muted mt-1">
                                {dealtCards.length} / {TOTAL_CARDS} cards dealt
                            </p>
                        )}
                    </motion.div>

                    {/* Card counters — only visible during deal phase */}
                    {(phase === 'deal' || phase === 'done') && targets.map((target, idx) => (
                        <motion.div
                            key={`label-${idx}`}
                            className="absolute z-10 text-center"
                            style={{
                                transform: `translate(${target.x}px, ${target.y}px)`,
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.08 }}
                        >
                            <motion.span
                                key={countForSeat(idx)}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: 1 }}
                                className="text-xs sm:text-sm text-gold-400 font-mono font-bold"
                            >
                                {countForSeat(idx)}/{CARDS_PER_PLAYER}
                            </motion.span>
                        </motion.div>
                    ))}

                    {/* === SHUFFLE PHASE === */}
                    {phase === 'shuffle' && (
                        <div className="relative">
                            {/* Deck stack — cards shuffle back and forth */}
                            {Array.from({ length: 8 }).map((_, i) => (
                                <motion.div
                                    key={`shuffle-${i}`}
                                    className="absolute"
                                    style={{
                                        top: -34 + i * -1.5,
                                        left: -24 + i * -0.5,
                                    }}
                                    animate={{
                                        x: [
                                            0,
                                            i % 2 === 0 ? 30 : -30,
                                            i % 2 === 0 ? -20 : 20,
                                            0,
                                            i % 2 === 0 ? -25 : 25,
                                            i % 2 === 0 ? 15 : -15,
                                            0,
                                        ],
                                        y: [0, -8, 4, 0, -6, 3, 0],
                                        rotateZ: [0, i % 2 === 0 ? 8 : -8, i % 2 === 0 ? -5 : 5, 0],
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: i * 0.05,
                                        repeat: 2,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <CardBack />
                                </motion.div>
                            ))}

                            {/* Shuffle whoosh effect */}
                            <motion.div
                                className="absolute -inset-16 rounded-full"
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(251,191,36,0)',
                                        '0 0 40px rgba(251,191,36,0.3)',
                                        '0 0 20px rgba(251,191,36,0)',
                                    ],
                                }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            />
                        </div>
                    )}

                    {/* === DEAL PHASE === */}
                    {(phase === 'deal' || phase === 'done') && (
                        <>
                            {/* Remaining deck in center */}
                            {phase === 'deal' && dealtCards.length < TOTAL_CARDS && (
                                <div className="relative z-5">
                                    {Array.from({ length: Math.max(1, Math.ceil((TOTAL_CARDS - dealtCards.length) / 8)) }).map((_, i) => (
                                        <div
                                            key={`deck-${i}`}
                                            className="absolute"
                                            style={{
                                                top: i * -1.5,
                                                left: i * -0.5,
                                            }}
                                        >
                                            <CardBack />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Flying cards */}
                            {dealtCards.map((card) => (
                                <motion.div
                                    key={card.id}
                                    className="absolute z-10"
                                    initial={{
                                        x: 0,
                                        y: 0,
                                        scale: 1,
                                        opacity: 1,
                                        rotateZ: 0,
                                    }}
                                    animate={{
                                        x: card.target.x,
                                        y: card.target.y,
                                        scale: 0.6,
                                        opacity: 0.7,
                                        rotateZ: (Math.random() - 0.5) * 30,
                                    }}
                                    transition={{
                                        duration: 0.35,
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                    }}
                                >
                                    <CardBack style={{ width: 40, height: 56 }} />
                                </motion.div>
                            ))}
                        </>
                    )}

                    {/* Done flash */}
                    {phase === 'done' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1.5] }}
                            transition={{ duration: 0.8 }}
                            className="absolute w-48 h-48 rounded-full bg-gold-400/20 blur-3xl"
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

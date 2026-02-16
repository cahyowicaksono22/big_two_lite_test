import { useGameStore } from '../../store/useGameStore'
import { getCombinationType, canBeatTable, includesThreeOfDiamonds } from '../../lib/cardValidator'
import Button from '../ui/Button'
import { Play, SkipForward, X, Diamond } from 'lucide-react'

export default function ActionControls() {
    const myHand = useGameStore((s) => s.myHand)
    const selectedCards = useGameStore((s) => s.selectedCards)
    const tableCards = useGameStore((s) => s.tableCards)
    const turnSeatIndex = useGameStore((s) => s.turnSeatIndex)
    const leadSeatIndex = useGameStore((s) => s.leadSeatIndex)
    const turnTimer = useGameStore((s) => s.turnTimer)
    const submitTurn = useGameStore((s) => s.submitTurn)
    const sendPass = useGameStore((s) => s.sendPass)
    const clearSelection = useGameStore((s) => s.clearSelection)
    const isFirstTurnOfRound = useGameStore((s) => s.isFirstTurnOfRound)
    const passedLocked = useGameStore((s) => s.passedLocked)
    const mySeatIndex = useGameStore((s) => s.mySeatIndex)

    const isMyTurn = turnSeatIndex === mySeatIndex
    const isLead = leadSeatIndex === turnSeatIndex
    const isLockedOut = passedLocked.includes(mySeatIndex)
    const selected = myHand.filter((c) => selectedCards.includes(c.id))
    const combo = getCombinationType(selected)
    const isValid = combo.type !== 'invalid'
    const canBeat = isLead ? isValid : canBeatTable(selected, tableCards)

    // 3♦ enforcement on first turn
    const needs3D = isFirstTurnOfRound && isMyTurn
    const has3DInSelection = includesThreeOfDiamonds(selected)
    const passDisabled = isFirstTurnOfRound // Can't pass on first turn
    const playDisabled = !isMyTurn || selectedCards.length === 0 || !canBeat || (needs3D && !has3DInSelection)
    const canPass = isMyTurn && !isLead && !passDisabled && !isLockedOut

    // Timer bar
    const timerPct = Math.max(0, (turnTimer / 30) * 100)
    const timerColor =
        turnTimer <= 5 ? 'bg-ember-500' : turnTimer <= 10 ? 'bg-gold-400' : 'bg-emerald-500'

    // Status label
    let statusLabel = 'Select cards'
    if (isLockedOut) {
        statusLabel = '🔒 PASSED — Waiting for new lead'
    } else if (needs3D && !has3DInSelection && selectedCards.length > 0) {
        statusLabel = '♦ Must include 3♦'
    } else if (isValid) {
        statusLabel = combo.type.replace(/_/g, ' ').toUpperCase()
    }

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
            {/* Timer bar */}
            {isMyTurn && !isLockedOut && (
                <div className="w-full">
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${timerColor}`}
                            style={{ width: `${timerPct}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className={`text-[10px] ${needs3D && !has3DInSelection ? 'text-amber-400 font-semibold' : 'text-text-muted'}`}>
                            {statusLabel}
                        </span>
                        <span className={`text-[10px] font-bold ${turnTimer <= 5 ? 'text-ember-500' : 'text-text-muted'}`}>
                            {turnTimer}s
                        </span>
                    </div>
                </div>
            )}

            {/* 3♦ First turn hint */}
            {needs3D && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Diamond size={12} className="text-red-400" />
                    <span className="text-[10px] text-amber-300 font-medium">
                        First turn — must include 3♦ in your play
                    </span>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
                {isLockedOut ? (
                    <div className="text-amber-400 text-sm font-medium px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        🔒 Passed — Locked until new lead
                    </div>
                ) : isMyTurn ? (
                    <>
                        <Button
                            variant="danger"
                            size="md"
                            disabled={!canPass}
                            onClick={sendPass}
                            className="flex items-center gap-1.5"
                        >
                            <SkipForward size={16} />
                            Pass
                        </Button>

                        {selectedCards.length > 0 && (
                            <Button
                                variant="ghost"
                                size="md"
                                onClick={clearSelection}
                                className="flex items-center gap-1.5"
                            >
                                <X size={16} />
                                Clear
                            </Button>
                        )}

                        <Button
                            variant="gold"
                            size="md"
                            disabled={playDisabled}
                            onClick={submitTurn}
                            className="flex items-center gap-1.5"
                        >
                            <Play size={16} />
                            Play
                        </Button>
                    </>
                ) : (
                    <div className="text-text-muted text-sm italic px-4 py-2">
                        Waiting for other player&apos;s turn…
                    </div>
                )}
            </div>
        </div>
    )
}

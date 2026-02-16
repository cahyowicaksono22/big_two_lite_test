import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { useAuthStore } from '../store/useAuthStore'
import GameTable from '../components/game/GameTable'
import BombAnimation from '../components/game/BombAnimation'
import RoundResultModal from '../components/overlays/RoundResultModal'
import DisconnectOverlay from '../components/overlays/DisconnectOverlay'
import ZombieNotification from '../components/overlays/ZombieNotification'
import AgentDecisionModal from '../components/overlays/AgentDecisionModal'
import SeatSelectionModal from '../components/overlays/SeatSelectionModal'
import ToastContainer, { showToast } from '../components/ui/Toast'
import { Wifi, WifiOff, ArrowLeft, Eye, FastForward, OctagonX } from 'lucide-react'

export default function GameRoomPage() {
    const { roomId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const roundsInfo = useGameStore((s) => s.roundsInfo)
    const matchStatus = useGameStore((s) => s.matchStatus)
    const isConnected = useGameStore((s) => s.isConnected)
    const latency = useGameStore((s) => s.latency)
    const viewMode = useGameStore((s) => s.viewMode)
    const setViewMode = useGameStore((s) => s.setViewMode)
    const setTurnTimer = useGameStore((s) => s.setTurnTimer)
    const setConnected = useGameStore((s) => s.setConnected)
    const setMatchStatus = useGameStore((s) => s.setMatchStatus)
    const setMySeatIndex = useGameStore((s) => s.setMySeatIndex)
    const addRounds = useGameStore((s) => s.addRounds)
    const forceStop = useGameStore((s) => s.forceStop)

    const [showRoundResult, setShowRoundResult] = useState(false)
    const [showBomb, setShowBomb] = useState(false)
    const [showDisconnect, setShowDisconnect] = useState(false)
    const [showZombie, setShowZombie] = useState(false)
    const [showSeatSelection, setShowSeatSelection] = useState(false)
    const [bombType, setBombType] = useState('classic')
    const [disconnectNumber, setDisconnectNumber] = useState(1)
    const [showForceStopConfirm, setShowForceStopConfirm] = useState(false)

    const role = user?.role || 'player'
    // Operator is ALWAYS spectator per spec
    const isSpectator = viewMode === 'spectator' || role === 'operator'
    const canDecide = role === 'agent' || role === 'operator'
    const canControl = role === 'agent' || role === 'operator'
    const isPendingDecision = matchStatus === 'pending_decision'
    const isPlaying = matchStatus === 'playing'

    // Set view mode from query param on mount
    useEffect(() => {
        const mode = searchParams.get('mode')
        if (role === 'operator') {
            // Operator is always spectator
            setViewMode('spectator')
        } else if (mode === 'spectator') {
            setViewMode('spectator')
        } else {
            setViewMode('player')
            // Show seat selection for players joining
            setShowSeatSelection(true)
        }
    }, [searchParams, setViewMode, role])

    // Simulate connection + timer
    useEffect(() => {
        setConnected(true)
        const timer = setInterval(() => {
            setTurnTimer(Math.max(0, useGameStore.getState().turnTimer - 1))
        }, 1000)
        return () => clearInterval(timer)
    }, [setConnected, setTurnTimer])

    // Handle seat selection
    const handleSeatSelected = (seatIndex) => {
        setMySeatIndex(seatIndex)
        setShowSeatSelection(false)
        showToast(`Seated at Seat ${seatIndex + 1}`, 'success')
    }

    // Demo controls
    const triggerBomb = (type) => {
        setBombType(type)
        setShowBomb(true)
        setTimeout(() => setShowBomb(false), 2500)
    }

    const triggerDisconnect = (num) => {
        setDisconnectNumber(num)
        setShowDisconnect(true)
    }

    const handleForceStop = () => {
        forceStop()
        showToast('Match force-stopped by admin', 'info')
        setShowForceStopConfirm(false)
        navigate('/lobby')
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <ToastContainer />

            {/* Seat Selection Modal (players only, on entry) */}
            <SeatSelectionModal
                isOpen={showSeatSelection}
                occupiedSeats={[1, 2]} // Mock: seats 2 and 3 taken
                onSelect={handleSeatSelected}
            />

            {/* Top bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-20 flex items-center justify-between px-4 py-3"
            >
                {/* Left: Match info */}
                <div className="flex items-center gap-4">
                    {isSpectator ? (
                        <button
                            onClick={() => navigate('/lobby')}
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                        <div className="w-8" />
                    )}
                    <div>
                        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                            Room: {roomId}
                            {isSpectator && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-semibold">
                                    <Eye size={10} /> SPECTATING
                                </span>
                            )}
                        </h2>
                        <p className="text-[11px] text-text-muted">
                            Round {roundsInfo.current}/{roundsInfo.total} • Base Score 25
                        </p>
                    </div>
                </div>

                {/* Right: Controls + Demo + Ping */}
                <div className="flex items-center gap-2">
                    {/* Agent/Operator in-game controls */}
                    {canControl && isPlaying && (
                        <>
                            <button
                                onClick={() => { addRounds(10); showToast('Extended by 10 rounds', 'success') }}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer flex items-center gap-1"
                            >
                                <FastForward size={12} /> +10 Rounds
                            </button>
                            <button
                                onClick={() => setShowForceStopConfirm(true)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-semibold hover:bg-red-500/20 transition-colors cursor-pointer flex items-center gap-1"
                            >
                                <OctagonX size={12} /> Force Stop
                            </button>
                        </>
                    )}

                    {/* Demo buttons */}
                    <div className="flex items-center gap-1 ml-2 border-l border-glass-border pl-2">
                        <button onClick={() => triggerBomb('classic')} className="px-1.5 py-1 rounded bg-amber-500/10 text-amber-400 text-[9px] hover:bg-amber-500/20 cursor-pointer">💣</button>
                        <button onClick={() => triggerBomb('endgame')} className="px-1.5 py-1 rounded bg-red-500/10 text-red-400 text-[9px] hover:bg-red-500/20 cursor-pointer">💥</button>
                        <button onClick={() => setShowRoundResult(true)} className="px-1.5 py-1 rounded bg-blue-500/10 text-blue-400 text-[9px] hover:bg-blue-500/20 cursor-pointer">🏆</button>
                        <button onClick={() => triggerDisconnect(1)} className="px-1.5 py-1 rounded bg-amber-500/10 text-amber-400 text-[9px] hover:bg-amber-500/20 cursor-pointer">DC1</button>
                        <button onClick={() => triggerDisconnect(2)} className="px-1.5 py-1 rounded bg-purple-500/10 text-purple-400 text-[9px] hover:bg-purple-500/20 cursor-pointer">DC2</button>
                        <button onClick={() => setShowZombie(!showZombie)} className="px-1.5 py-1 rounded bg-purple-500/10 text-purple-400 text-[9px] hover:bg-purple-500/20 cursor-pointer">🧟</button>
                        <button
                            onClick={() => setMatchStatus(matchStatus === 'pending_decision' ? 'playing' : 'pending_decision')}
                            className="px-1.5 py-1 rounded bg-green-500/10 text-green-400 text-[9px] hover:bg-green-500/20 cursor-pointer"
                        >🎲</button>
                    </div>

                    {/* Ping */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-glass-border ml-1">
                        {isConnected ? <Wifi size={12} className="text-emerald-400" /> : <WifiOff size={12} className="text-ember-500" />}
                        <span className="text-[10px] text-text-muted font-mono">{latency}ms</span>
                    </div>
                </div>
            </motion.div>

            {/* Spectator banner */}
            {isSpectator && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 mx-4 mb-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-xs text-blue-300">
                        <Eye size={12} className="inline mr-1" />
                        You are watching this table. Cards are hidden.
                        {role === 'operator' && ' (Operators are always spectators)'}
                    </p>
                </motion.div>
            )}

            {/* Pending decision banner */}
            {isPendingDecision && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 mx-4 mb-2 px-4 py-2 rounded-xl bg-gold-400/10 border border-gold-400/20 text-center">
                    <p className="text-xs text-gold-400 font-semibold">
                        🏁 Match Over — Pending Decision (Round {roundsInfo.current}/{roundsInfo.total})
                    </p>
                </motion.div>
            )}

            {/* Game Table */}
            <GameTable isSpectator={isSpectator} canKick={role === 'agent'} />

            {/* Force Stop Confirmation */}
            {showForceStopConfirm && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                    <div className="glass-panel p-6 max-w-sm text-center">
                        <OctagonX size={40} className="text-red-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-text-primary mb-2">Force Stop Match?</h3>
                        <p className="text-sm text-text-secondary mb-4">This will immediately end the match. All players will be unseated.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowForceStopConfirm(false)} className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-text-secondary hover:bg-white/10 transition-colors cursor-pointer">Cancel</button>
                            <button onClick={handleForceStop} className="flex-1 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-colors cursor-pointer">Force Stop</button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Overlays */}
            <BombAnimation
                isActive={showBomb}
                bomberName="Alice"
                victimName="You"
                points={500}
                bombType={bombType}
            />

            <RoundResultModal
                isOpen={showRoundResult}
                onClose={() => setShowRoundResult(false)}
                roundNumber={roundsInfo.current}
            />

            <DisconnectOverlay
                isOpen={showDisconnect}
                countdown={disconnectNumber <= 1 ? 119 : 0}
                disconnectNumber={disconnectNumber}
            />

            <ZombieNotification
                isOpen={showZombie}
                onResume={() => { setShowZombie(false); setShowDisconnect(false); showToast('Control resumed!', 'success') }}
            />

            {canDecide && (
                <AgentDecisionModal
                    isOpen={isPendingDecision}
                    userRole={role}
                    onEndTable={() => { setMatchStatus('ended'); showToast('Table ended — final reports released', 'info'); navigate('/lobby') }}
                    onExtend={(rounds) => { addRounds(rounds); showToast(`Match extended by ${rounds} rounds! Scores preserved.`, 'success') }}
                />
            )}
        </div>
    )
}

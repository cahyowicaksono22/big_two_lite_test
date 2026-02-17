import OpponentSeat from './OpponentSeat'
import TableCenter from './TableCenter'
import PlayerArea from './PlayerArea'
import { useGameStore } from '../../store/useGameStore'
import { showToast } from '../ui/Toast'

export default function GameTable({ isSpectator = false, canKick = false }) {
    const players = useGameStore((s) => s.players)
    const turnSeatIndex = useGameStore((s) => s.turnSeatIndex)

    // Seat layout: Player=0 (bottom), Seat 1=left, Seat 2=top, Seat 3=right
    const opponent1 = players[1] // Left
    const opponent2 = players[2] // Top
    const opponent3 = players[3] // Right

    const handleKick = (player) => {
        showToast(`${player.name} kicked from the table`, 'info')
    }

    return (
        <div className="relative w-full max-w-4xl mx-auto" style={{ minHeight: '55dvh' }}>
            {/* Felt table background */}
            <div
                className="absolute inset-2 sm:inset-4 rounded-[24px] sm:rounded-[40px] border-2 sm:border-4 border-emerald-900/60"
                style={{
                    background: 'radial-gradient(ellipse at center, #1a5c2e 0%, #0f3d1c 60%, #0a2d14 100%)',
                    boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4), 0 10px 40px rgba(0,0,0,0.5)',
                }}
            />

            {/* Mobile layout: opponents in a row at top, center in middle, player at bottom */}
            <div className="relative sm:hidden flex flex-col items-center gap-1 p-3" style={{ minHeight: '55dvh' }}>
                {/* Opponents row */}
                <div className="flex items-start justify-around w-full gap-1 py-2">
                    <OpponentSeat player={opponent1} isActive={turnSeatIndex === 1} position="left" canKick={canKick} onKick={handleKick} />
                    <OpponentSeat player={opponent2} isActive={turnSeatIndex === 2} position="top" canKick={canKick} onKick={handleKick} />
                    <OpponentSeat player={opponent3} isActive={turnSeatIndex === 3} position="right" canKick={canKick} onKick={handleKick} />
                </div>

                {/* Table Center */}
                <div className="flex-1 flex items-center justify-center">
                    <TableCenter />
                </div>

                {/* Player area (bottom) */}
                <div className="w-full py-2">
                    {isSpectator ? (
                        <OpponentSeat player={players[0]} isActive={turnSeatIndex === 0} position="bottom" />
                    ) : (
                        <PlayerArea />
                    )}
                </div>
            </div>

            {/* Desktop layout: original 3-column grid */}
            <div className="hidden sm:grid relative grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto] items-center justify-items-center gap-2 p-6" style={{ minHeight: '60vh' }}>
                {/* Top opponent (center) */}
                <div className="col-start-2 row-start-1 py-2">
                    <OpponentSeat player={opponent2} isActive={turnSeatIndex === 2} position="top" canKick={canKick} onKick={handleKick} />
                </div>

                {/* Left opponent */}
                <div className="col-start-1 row-start-2 px-2">
                    <OpponentSeat player={opponent1} isActive={turnSeatIndex === 1} position="left" canKick={canKick} onKick={handleKick} />
                </div>

                {/* Table Center */}
                <div className="col-start-2 row-start-2">
                    <TableCenter />
                </div>

                {/* Right opponent */}
                <div className="col-start-3 row-start-2 px-2">
                    <OpponentSeat player={opponent3} isActive={turnSeatIndex === 3} position="right" canKick={canKick} onKick={handleKick} />
                </div>

                {/* Player area (bottom) — hidden for spectators */}
                <div className="col-start-1 col-span-3 row-start-3 w-full py-4">
                    {isSpectator ? (
                        <OpponentSeat player={players[0]} isActive={turnSeatIndex === 0} position="bottom" />
                    ) : (
                        <PlayerArea />
                    )}
                </div>
            </div>
        </div>
    )
}


import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ToastContainer, { showToast } from '../components/ui/Toast'
import CreateTableModal from '../components/overlays/CreateTableModal'
import {
    Plus, Eye, LogOut, Users, Zap, Crown, Trash2, Clock, Gamepad2, UserX,
} from 'lucide-react'

// Mock tables
const INITIAL_TABLES = [
    { id: 'room-1', name: 'Table #1', players: 3, maxPlayers: 4, status: 'waiting', round: null, totalRounds: 25, baseScore: 25, agent: 'AGT-ADMIN', seatNames: ['Alice', 'Bob', 'Charlie'] },
    { id: 'room-2', name: 'Table #2', players: 4, maxPlayers: 4, status: 'playing', round: 12, totalRounds: 25, baseScore: 25, agent: 'AGT-ADMIN', seatNames: ['Dave', 'Eve', 'Frank', 'Grace'] },
    { id: 'room-3', name: 'Table #3', players: 2, maxPlayers: 4, status: 'waiting', round: null, totalRounds: 25, baseScore: 25, agent: 'AGT-DEALERX', seatNames: ['Hank', 'Ivy'] },
    { id: 'room-4', name: 'VIP Table', players: 4, maxPlayers: 4, status: 'playing', round: 5, totalRounds: 30, baseScore: 50, agent: 'AGT-ADMIN', seatNames: ['Jack', 'Kate', 'Leo', 'Mia'] },
]

function TableCard({ table, role, onSit, onWatch, onPlay, onDelete, onExtend, onKick }) {
    const isFull = table.players >= table.maxPlayers
    const isPlaying = table.status === 'playing'
    const canSit = !isFull && !isPlaying

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="glass-panel p-3 sm:p-5 bg-surface-800/60 hover:bg-surface-700/60 transition-colors group"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-bold text-sm sm:text-base text-text-primary flex items-center gap-2">
                        {table.name}
                        {table.name.includes('VIP') && <Crown size={14} className="text-gold-400" />}
                    </h3>
                    <p className="text-text-muted text-[10px] sm:text-xs mt-0.5">Agent: {table.agent}</p>
                </div>
                <Badge status={table.status} />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 text-text-secondary text-[10px] sm:text-xs">
                <span className="flex items-center gap-1"><Users size={12} />{table.players}/{table.maxPlayers}</span>
                {isPlaying && <span className="flex items-center gap-1"><Clock size={12} />Round {table.round}/{table.totalRounds}</span>}
                <span className="flex items-center gap-1"><Zap size={12} />{table.baseScore} pts</span>
            </div>

            {/* Seated players (for agent kick control) */}
            {table.seatNames && table.seatNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {table.seatNames.map((name, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-text-secondary">
                            👤 {name}
                            {role === 'agent' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onKick?.(table.id, name) }}
                                    className="ml-0.5 text-red-400/50 hover:text-red-400 transition-colors cursor-pointer"
                                    title={`Kick ${name}`}
                                >
                                    <UserX size={10} />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {table.status === 'waiting' && (
                <p className="text-[10px] text-text-muted mb-3">
                    ⏳ Waiting for {table.maxPlayers - table.players} more player{table.maxPlayers - table.players > 1 ? 's' : ''}…
                </p>
            )}

            <div className="flex gap-2">
                {/* Player: Sit + Watch */}
                {role === 'player' && (
                    <>
                        {canSit && (
                            <Button variant="gold" size="sm" onClick={onSit} className="flex items-center gap-1">
                                <Gamepad2 size={13} /> Sit
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={onWatch} className="flex items-center gap-1">
                            <Eye size={13} /> Watch
                        </Button>
                    </>
                )}

                {/* Agent: Play + Watch + Delete */}
                {role === 'agent' && (
                    <>
                        {canSit && (
                            <Button variant="primary" size="sm" onClick={onPlay} className="flex items-center gap-1">
                                <Gamepad2 size={13} /> Play
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={onWatch} className="flex items-center gap-1">
                            <Eye size={13} /> Watch
                        </Button>
                        {table.players === 0 && (
                            <Button variant="danger" size="sm" onClick={onDelete} className="flex items-center gap-1">
                                <Trash2 size={13} /> Delete
                            </Button>
                        )}
                    </>
                )}

                {/* Operator: Watch ONLY + Extend (playing) — NO SIT/PLAY */}
                {role === 'operator' && (
                    <>
                        <Button variant="ghost" size="sm" onClick={onWatch} className="flex items-center gap-1">
                            <Eye size={13} /> Watch
                        </Button>
                        {isPlaying && (
                            <Button variant="blue" size="sm" onClick={onExtend} className="flex items-center gap-1">
                                <Plus size={13} /> Extend
                            </Button>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    )
}

export default function LobbyPage() {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout)
    const role = user?.role || 'player'
    const [tables, setTables] = useState(INITIAL_TABLES)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const visibleTables = tables.filter((t) => {
        if (role === 'agent') return t.agent === user?.referralCode?.toUpperCase() || t.agent === user?.referringAgent
        if (role === 'operator' || role === 'player') return t.agent === user?.referringAgent
        return true
    })

    const handleSitOrPlay = (tableId) => navigate(`/room/${tableId}?mode=player`)
    const handleWatch = (tableId) => navigate(`/room/${tableId}?mode=spectator`)
    const handleDelete = (tableId) => { setTables((prev) => prev.filter((t) => t.id !== tableId)); showToast('Table deleted', 'info') }
    const handleExtend = () => showToast('Rounds extended!', 'success')

    const handleKick = (tableId, playerName) => {
        setTables((prev) => prev.map((t) => {
            if (t.id !== tableId) return t
            return { ...t, seatNames: t.seatNames.filter((n) => n !== playerName), players: t.players - 1 }
        }))
        showToast(`${playerName} kicked from table`, 'info')
    }

    const handleCreateTable = (config) => {
        const newTable = {
            id: 'room-' + Date.now(),
            name: config.name,
            players: 0,
            maxPlayers: 4,
            status: 'waiting',
            round: null,
            totalRounds: config.targetRounds,
            baseScore: config.baseScore,
            agent: user?.referralCode?.toUpperCase() || user?.referringAgent || 'AGT-ADMIN',
            seatNames: [],
        }
        setTables((prev) => [...prev, newTable])
        setShowCreateModal(false)
        showToast(`"${config.name}" created!`, 'success')
    }

    const handleLogout = () => { logout(); navigate('/login') }

    return (
        <div className="min-h-[100dvh] p-3 sm:p-4 md:p-8">
            <ToastContainer />

            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8"
            >
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gradient-gold">Big Two Club</h1>
                    <p className="text-text-secondary text-xs sm:text-sm">
                        Welcome back, <span className="text-text-primary font-medium">{user?.username}</span>
                        <Badge status={role === 'agent' ? 'active' : role === 'operator' ? 'watching' : 'playing'} className="ml-2" />
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    {role === 'agent' && (
                        <Button variant="gold" onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 sm:gap-2 text-sm">
                            <Plus size={15} /> Create Table
                        </Button>
                    )}
                    <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2 text-sm">
                        <LogOut size={15} /> Logout
                    </Button>
                </div>
            </motion.header>

            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="glass-panel p-3 sm:p-4 mb-4 sm:mb-6 bg-surface-800/40 border-emerald-500/20"
            >
                <p className="text-xs sm:text-sm text-text-secondary">
                    {role === 'agent' && '🎯 Agent View — Create tables, play or watch games, kick players, delete empty tables.'}
                    {role === 'operator' && '🔭 Operator View — Watch games and extend rounds. Cannot create tables or sit at seats.'}
                    {role === 'player' && '🃏 Player View — Sit at available tables or watch games in progress.'}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {visibleTables.map((table, i) => (
                    <motion.div key={table.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                        <TableCard
                            table={table}
                            role={role}
                            onSit={() => handleSitOrPlay(table.id)}
                            onPlay={() => handleSitOrPlay(table.id)}
                            onWatch={() => handleWatch(table.id)}
                            onDelete={() => handleDelete(table.id)}
                            onExtend={() => handleExtend(table.id)}
                            onKick={handleKick}
                        />
                    </motion.div>
                ))}
            </div>

            {visibleTables.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-text-muted">
                    <Users size={40} className="mb-4 opacity-30" />
                    <p className="text-base sm:text-lg">No tables available</p>
                    <p className="text-xs sm:text-sm">{role === 'agent' ? 'Create your first table to get started' : 'Your agent hasn\'t created any tables yet'}</p>
                </div>
            )}

            <CreateTableModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateTable} />
        </div>
    )
}

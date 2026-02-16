import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Plus, Minus } from 'lucide-react'

const BASE_SCORES = [10, 25, 50]

export default function CreateTableModal({ isOpen, onClose, onCreate }) {
    const [tableName, setTableName] = useState('')
    const [targetRounds, setTargetRounds] = useState(25)
    const [baseScore, setBaseScore] = useState(25)

    const handleCreate = () => {
        if (!tableName.trim()) return
        onCreate?.({
            name: tableName.trim(),
            targetRounds,
            baseScore,
        })
        // Reset form
        setTableName('')
        setTargetRounds(25)
        setBaseScore(25)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Table">
            <div className="space-y-5">
                {/* Table Name */}
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Table Name
                    </label>
                    <input
                        type="text"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        placeholder="e.g. VIP Lounge"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border
              text-text-primary placeholder-text-muted
              focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
              transition-all duration-200"
                    />
                </div>

                {/* Target Rounds */}
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Target Rounds
                    </label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setTargetRounds(Math.max(25, targetRounds - 5))}
                            className="p-2 rounded-lg bg-white/5 border border-glass-border text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <Minus size={16} />
                        </button>
                        <div className="flex-1">
                            <input
                                type="range"
                                min={25}
                                max={100}
                                step={5}
                                value={targetRounds}
                                onChange={(e) => setTargetRounds(Number(e.target.value))}
                                className="w-full accent-emerald-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setTargetRounds(Math.min(100, targetRounds + 5))}
                            className="p-2 rounded-lg bg-white/5 border border-glass-border text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <Plus size={16} />
                        </button>
                        <span className="w-14 text-center text-lg font-bold text-text-primary tabular-nums">
                            {targetRounds}
                        </span>
                    </div>
                </div>

                {/* Base Score */}
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Base Score
                    </label>
                    <div className="flex gap-2">
                        {BASE_SCORES.map((score) => (
                            <button
                                key={score}
                                type="button"
                                onClick={() => setBaseScore(score)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer border ${baseScore === score
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                        : 'bg-white/3 text-text-muted border-glass-border hover:text-text-secondary hover:bg-white/5'
                                    }`}
                            >
                                {score} pts
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="gold"
                        className="flex-1 flex items-center justify-center gap-2"
                        onClick={handleCreate}
                        disabled={!tableName.trim()}
                    >
                        <Plus size={16} />
                        Create Table
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

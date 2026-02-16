import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { XCircle, Plus } from 'lucide-react'

const ROUND_OPTIONS = [5, 10, 25, 50]

export default function AgentDecisionModal({ isOpen, userRole, onEndTable, onExtend }) {
    const [customRounds, setCustomRounds] = useState(10)
    const canEnd = userRole === 'agent'

    return (
        <Modal isOpen={isOpen} closeable={false} title="Match Over — Pending Decision">
            <p className="text-text-secondary text-sm mb-2">
                All rounds have been completed. {canEnd ? 'Choose what to do next.' : 'Waiting for agent decision, or add more rounds.'}
            </p>
            <p className="text-[10px] text-text-muted mb-6 flex items-center gap-1">
                💡 Adding rounds will continue without resetting scores.
            </p>

            <div className="space-y-4">
                {/* Round increment selector */}
                <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Rounds to Add
                    </label>
                    <div className="flex gap-2">
                        {ROUND_OPTIONS.map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setCustomRounds(n)}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer border ${customRounds === n
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                        : 'bg-white/3 text-text-muted border-glass-border hover:text-text-secondary hover:bg-white/5'
                                    }`}
                            >
                                +{n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add Rounds button (Agent + Operator) */}
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => onExtend?.(customRounds)}
                >
                    <Plus size={18} />
                    Add {customRounds} Rounds
                </Button>

                {/* End Table button (Agent only) */}
                {canEnd && (
                    <Button
                        variant="danger"
                        size="lg"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => onEndTable?.()}
                    >
                        <XCircle size={18} />
                        End Table
                    </Button>
                )}
            </div>
        </Modal>
    )
}

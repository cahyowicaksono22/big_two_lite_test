import Card from './Card'

export default function CardStack({ cards, small = false }) {
    if (!cards || cards.length === 0) {
        return (
            <div className="flex items-center justify-center h-[100px]">
                <span className="text-text-muted text-sm italic">No cards played</span>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center gap-1">
            {cards.map((card, index) => (
                <div
                    key={card.id}
                    style={{
                        transform: `rotate(${(index - Math.floor(cards.length / 2)) * 5}deg)`,
                        zIndex: index,
                    }}
                >
                    <Card card={card} small={small} />
                </div>
            ))}
        </div>
    )
}

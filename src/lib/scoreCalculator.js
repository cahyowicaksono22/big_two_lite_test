/**
 * Score Calculator — Big Two scoring with multipliers.
 *
 * Penalty Multipliers:
 *   x1  — less than 10 cards remaining
 *   x2  — 10 or more cards remaining
 *   x4  — 13 cards remaining (Dragon / full hand)
 */

export function getMultiplier(cardCount) {
    if (cardCount >= 13) return 4 // Dragon
    if (cardCount >= 10) return 2
    return 1
}

export function getMultiplierLabel(cardCount) {
    if (cardCount >= 13) return '🐉 Dragon (x4)'
    if (cardCount >= 10) return '⚠️ Heavy (x2)'
    return 'x1'
}

/**
 * Calculate round scores for all players.
 * @param {Array} players - [{ name, cardCount, seatIndex }]
 * @param {number} baseScore - Points per card (e.g. 25)
 * @param {number} winnerSeatIndex - Seat of the player who emptied their hand
 * @returns {Array} [{ name, cardCount, multiplier, penalty, netScore, isWinner }]
 */
export function calculateRoundScores(players, baseScore, winnerSeatIndex) {
    const results = players.map((p) => {
        const isWinner = p.seatIndex === winnerSeatIndex
        const multiplier = isWinner ? 0 : getMultiplier(p.cardCount)
        const penalty = isWinner ? 0 : p.cardCount * baseScore * multiplier
        return {
            name: p.name,
            seatIndex: p.seatIndex,
            cardCount: p.cardCount,
            multiplier,
            multiplierLabel: isWinner ? '—' : getMultiplierLabel(p.cardCount),
            penalty,
            netScore: isWinner ? 0 : -penalty,
            isWinner,
        }
    })

    // Winner receives sum of all penalties
    const totalPenalties = results.reduce((sum, r) => sum + r.penalty, 0)
    const winner = results.find((r) => r.isWinner)
    if (winner) {
        winner.netScore = totalPenalties
    }

    return results
}

/**
 * Calculate bomb scores (Culprit absorbs all penalties → Winner).
 * @param {Object} culprit   - { name, cardCount, seatIndex }
 * @param {Object} winner    - { name, seatIndex }
 * @param {Array}  innocents - [{ name, cardCount, seatIndex }]  (C and D)
 * @param {number} baseScore
 * @returns {Array} Results for all players
 */
export function calculateBombScores(culprit, winner, innocents, baseScore) {
    const culpritPenalty = culprit.cardCount * baseScore * getMultiplier(culprit.cardCount)
    const innocentTotal = innocents.reduce(
        (sum, p) => sum + p.cardCount * baseScore * getMultiplier(p.cardCount),
        0
    )
    const totalToWinner = culpritPenalty + innocentTotal

    return [
        {
            name: winner.name,
            seatIndex: winner.seatIndex,
            cardCount: 0,
            netScore: totalToWinner,
            isWinner: true,
            isCulprit: false,
            label: '💣 Bomb Winner',
        },
        {
            name: culprit.name,
            seatIndex: culprit.seatIndex,
            cardCount: culprit.cardCount,
            netScore: -totalToWinner,
            isWinner: false,
            isCulprit: true,
            label: '💀 Bomb Culprit (absorbs all)',
        },
        ...innocents.map((p) => ({
            name: p.name,
            seatIndex: p.seatIndex,
            cardCount: p.cardCount,
            netScore: 0,
            isWinner: false,
            isCulprit: false,
            label: '🛡️ Safe',
        })),
    ]
}

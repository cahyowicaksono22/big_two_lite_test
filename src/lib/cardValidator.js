/**
 * Card Validator — Pure functions for Big Two hand validation.
 *
 * Card value mapping (Big Two order):
 *   1 = 3, 2 = 4, ... 8 = 10, 9 = J, 10 = Q, 11 = K, 12 = A, 13 = 2
 *
 * Suit ranking (Big Two):
 *   0 = Diamond (♦) < 1 = Club (♣) < 2 = Heart (♥) < 3 = Spade (♠)
 */

const VALUE_NAMES = ['', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']
const SUIT_SYMBOLS = ['♦', '♣', '♥', '♠']
const SUIT_NAMES = ['Diamond', 'Club', 'Heart', 'Spade']

export function getCardLabel(card) {
    return `${VALUE_NAMES[card.value]}${SUIT_SYMBOLS[card.suit]}`
}

export function getSuitColor(suit) {
    return suit === 0 || suit === 2 ? '#ef4444' : '#1e1e2e'
}

export function getSuitSymbol(suit) {
    return SUIT_SYMBOLS[suit]
}

export function getSuitName(suit) {
    return SUIT_NAMES[suit]
}

export function getValueName(value) {
    return VALUE_NAMES[value]
}

// ──────────────────────────────────────────────
// 3♦ First-Turn Logic
// ──────────────────────────────────────────────

/** The 3♦ card has value=1 (maps to "3") and suit=0 (Diamond). */
export const THREE_OF_DIAMONDS = { value: 1, suit: 0 }

/** Check if a hand of cards includes the 3♦. */
export function includesThreeOfDiamonds(cards) {
    return cards.some((c) => c.value === 1 && c.suit === 0)
}

/** Validate that 3♦ is included when it's the first turn of a round. */
export function mustIncludeThreeOfDiamonds(cards, isFirstTurnOfRound) {
    if (!isFirstTurnOfRound) return true
    return includesThreeOfDiamonds(cards)
}

/** Find which seat index holds the 3♦ (for determining first player). */
export function findThreeOfDiamondsHolder(playerHands) {
    for (const [seatIndex, hand] of Object.entries(playerHands)) {
        if (hand.some((c) => c.value === 1 && c.suit === 0)) {
            return Number(seatIndex)
        }
    }
    return 0
}

// ──────────────────────────────────────────────
// Combination Type Detection
// ──────────────────────────────────────────────

/**
 * Determine the type of a combination of selected cards.
 * Returns: { type, rank } or { type: 'invalid' }
 */
export function getCombinationType(cards) {
    if (!cards || cards.length === 0) return { type: 'invalid' }

    const n = cards.length
    const sorted = [...cards].sort((a, b) => a.value - b.value || a.suit - b.suit)

    if (n === 1) {
        return { type: 'single', rank: sorted[0].value * 4 + sorted[0].suit }
    }

    if (n === 2) {
        if (sorted[0].value === sorted[1].value) {
            return { type: 'pair', rank: sorted[1].value * 4 + sorted[1].suit }
        }
        return { type: 'invalid' }
    }

    if (n === 3) {
        if (sorted[0].value === sorted[1].value && sorted[1].value === sorted[2].value) {
            return { type: 'triple', rank: sorted[2].value * 4 + sorted[2].suit }
        }
        return { type: 'invalid' }
    }

    if (n === 5) {
        // Check for straight
        const isStraight = checkStraight(sorted)
        const isFlush = sorted.every((c) => c.suit === sorted[0].suit)
        const isFourOfAKind = checkFourOfAKind(sorted)
        const isFullHouse = checkFullHouse(sorted)

        if (isStraight && isFlush) {
            return { type: 'straight_flush', rank: 800 + sorted[4].value * 4 + sorted[4].suit }
        }
        if (isFourOfAKind) {
            const quadValue = sorted[1].value === sorted[2].value ? sorted[1].value : sorted[3].value
            return { type: 'four_of_a_kind', rank: 700 + quadValue * 4 }
        }
        if (isFullHouse) {
            const tripleValue = sorted[2].value
            return { type: 'full_house', rank: 600 + tripleValue * 4 }
        }
        if (isFlush) {
            return { type: 'flush', rank: 500 + sorted[4].value * 4 + sorted[4].suit }
        }
        if (isStraight) {
            return { type: 'straight', rank: 400 + sorted[4].value * 4 + sorted[4].suit }
        }
    }

    return { type: 'invalid' }
}

function checkStraight(sorted) {
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].value !== sorted[i - 1].value + 1) return false
    }
    return true
}

function checkFourOfAKind(sorted) {
    // XXXX Y or X YYYY
    return (
        (sorted[0].value === sorted[3].value) ||
        (sorted[1].value === sorted[4].value)
    )
}

function checkFullHouse(sorted) {
    // XXX YY or XX YYY
    return (
        (sorted[0].value === sorted[2].value && sorted[3].value === sorted[4].value) ||
        (sorted[0].value === sorted[1].value && sorted[2].value === sorted[4].value)
    )
}

// ──────────────────────────────────────────────
// Table Beating Logic
// ──────────────────────────────────────────────

/**
 * Check if the selected hand can beat the cards currently on the table.
 */
export function canBeatTable(selected, tableCards) {
    if (!tableCards || tableCards.length === 0) return true // Leading: any valid combo

    const selCombo = getCombinationType(selected)
    const tblCombo = getCombinationType(tableCards)

    if (selCombo.type === 'invalid') return false

    // Bombs beat non-bombs (5-card only)
    const bombTypes = ['four_of_a_kind', 'straight_flush']
    if (selected.length === 5 && tableCards.length === 5) {
        if (bombTypes.includes(selCombo.type) && !bombTypes.includes(tblCombo.type)) return true
    }

    // Same type, higher rank
    if (selCombo.type === tblCombo.type && selected.length === tableCards.length) {
        return selCombo.rank > tblCombo.rank
    }

    // 5-card hierarchy: straight < flush < full_house < four_of_a_kind < straight_flush
    if (selected.length === 5 && tableCards.length === 5) {
        return selCombo.rank > tblCombo.rank
    }

    return false
}

// ──────────────────────────────────────────────
// BOMB Detection (Dual Triggers)
// ──────────────────────────────────────────────

/**
 * Trigger 1: Classic Bomb — Counter a single 2 with 4-of-a-kind or Straight Flush.
 */
export function detectBombTrigger1(prevCards, currentCards) {
    if (!prevCards || !currentCards) return false
    const prevCombo = getCombinationType(prevCards)
    const currCombo = getCombinationType(currentCards)

    // Previous was a single 2 (value 13)
    if (prevCombo.type === 'single' && prevCards[0]?.value === 13) {
        if (currCombo.type === 'four_of_a_kind' || currCombo.type === 'straight_flush') {
            return true
        }
    }
    return false
}

/**
 * Trigger 2: End-Game Gamble — Player has exactly 2 singles remaining,
 * plays the lower card, and opponent successfully beats it.
 *
 * @param {number}  playerCardCount - Cards remaining BEFORE this play
 * @param {Object}  playedCard      - The single card played
 * @param {Array}   fullHand        - The 2 cards the player had before playing
 * @param {boolean} wasBeaten       - Whether an opponent cut/beat the card
 * @returns {{ triggered: boolean, isSafe: boolean }}
 */
export function detectBombTrigger2(playerCardCount, playedCard, fullHand, wasBeaten) {
    // Must have had exactly 2 cards (singles)
    if (playerCardCount !== 2) return { triggered: false, isSafe: false }
    if (!fullHand || fullHand.length !== 2) return { triggered: false, isSafe: false }

    // Both must be singles (different values — not a pair)
    if (fullHand[0].value === fullHand[1].value) return { triggered: false, isSafe: false }

    // Player played the lower card
    const sorted = [...fullHand].sort((a, b) => a.value - b.value || a.suit - b.suit)
    const isLowerCard = playedCard.value === sorted[0].value && playedCard.suit === sorted[0].suit

    if (!isLowerCard) return { triggered: false, isSafe: false }

    // Bomb explodes if beaten, safe if everyone passes
    if (wasBeaten) {
        return { triggered: true, isSafe: false }
    }
    return { triggered: false, isSafe: true } // Everyone passed, bomb defused
}

// Keep legacy alias
export const detectBomb = detectBombTrigger1

// ──────────────────────────────────────────────
// Zombie Auto-Play Logic
// ──────────────────────────────────────────────

/**
 * Determine the auto-play action for a zombie player.
 * @param {Array}   hand           - The zombie's current hand
 * @param {boolean} isFirstTurn    - Is it the first turn of the round?
 * @param {boolean} isLeading      - Is the zombie the lead player (won last trick)?
 * @param {boolean} isFollowing    - Is the zombie following (someone else played)?
 * @returns {{ action: 'play'|'pass', cards: Array }}
 */
export function getZombieAutoPlay(hand, isFirstTurn, isLeading, isFollowing) {
    if (!hand || hand.length === 0) return { action: 'pass', cards: [] }

    const sorted = [...hand].sort((a, b) => a.value - b.value || a.suit - b.suit)

    // Scenario 1: Holding 3♦ on round start → must play single 3♦
    if (isFirstTurn && includesThreeOfDiamonds(hand)) {
        const threeD = hand.find((c) => c.value === 1 && c.suit === 0)
        return { action: 'play', cards: [threeD] }
    }

    // Scenario 2: Following → always pass
    if (isFollowing) {
        return { action: 'pass', cards: [] }
    }

    // Scenario 3: Leading → play lowest single card
    if (isLeading) {
        return { action: 'play', cards: [sorted[0]] }
    }

    // Default: pass
    return { action: 'pass', cards: [] }
}

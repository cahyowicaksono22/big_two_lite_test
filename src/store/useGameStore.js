import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
    // Connection State
    socket: null,
    isConnected: false,
    latency: 0,

    // Room State
    roomId: null,
    matchStatus: 'waiting', // waiting | playing | paused | pending_decision | ended
    roundsInfo: { current: 1, total: 25 },
    baseScore: 25,
    viewMode: 'player', // 'player' | 'spectator'
    mySeatIndex: 0, // Set by SeatSelectionModal

    players: [
        // Mock 4 players for UI development
        { seatIndex: 0, name: 'You', avatar: '🃏', balance: 1000, cardCount: 13, status: 'active' },
        { seatIndex: 1, name: 'Alice', avatar: '👩', balance: 850, cardCount: 10, status: 'active' },
        { seatIndex: 2, name: 'Bob', avatar: '👨', balance: 1200, cardCount: 8, status: 'active' },
        { seatIndex: 3, name: 'Charlie', avatar: '🧑', balance: 950, cardCount: 5, status: 'pass' },
    ],

    // Game State (Dynamic)
    turnSeatIndex: 0,
    leadSeatIndex: 0,
    tableCards: [],
    myHand: generateMockHand(),
    selectedCards: [],
    groupedCards: [], // Array of groups, each group is an array of card objects
    passedPlayers: [3],
    passedLocked: [], // Players locked out of current trick
    turnTimer: 30,
    isFirstTurnOfRound: true,
    disconnectCounts: { 0: 0, 1: 0, 2: 0, 3: 0 }, // per-player per-match

    // Actions
    setViewMode: (mode) => set({ viewMode: mode }),
    setMySeatIndex: (idx) => set({ mySeatIndex: idx }),

    selectCard: (cardId) => {
        const { selectedCards } = get()
        if (selectedCards.includes(cardId)) {
            set({ selectedCards: selectedCards.filter((id) => id !== cardId) })
        } else if (selectedCards.length < 5) {
            // Max 5 cards can be grouped
            set({ selectedCards: [...selectedCards, cardId] })
        }
    },

    clearSelection: () => set({ selectedCards: [] }),

    // Card Grouping — pull selected cards out of main hand into a group above
    groupCards: () => {
        const { selectedCards, myHand, groupedCards } = get()
        if (selectedCards.length === 0 || selectedCards.length > 5) return
        const cardsToGroup = myHand.filter((c) => selectedCards.includes(c.id))
        const remaining = myHand.filter((c) => !selectedCards.includes(c.id))
        set({
            groupedCards: [...groupedCards, cardsToGroup],
            myHand: remaining,
            selectedCards: [],
        })
    },

    ungroupCards: (groupIndex) => {
        const { groupedCards, myHand } = get()
        if (groupIndex < 0 || groupIndex >= groupedCards.length) return
        const returned = groupedCards[groupIndex]
        set({
            myHand: [...myHand, ...returned],
            groupedCards: groupedCards.filter((_, i) => i !== groupIndex),
            selectedCards: [],
        })
    },

    ungroupAll: () => {
        const { groupedCards, myHand } = get()
        const allGrouped = groupedCards.flat()
        set({
            myHand: [...myHand, ...allGrouped],
            groupedCards: [],
            selectedCards: [],
        })
    },

    submitTurn: () => {
        const { selectedCards, myHand, turnSeatIndex } = get()
        // Move selected cards to table, remove from hand
        const played = myHand.filter((c) => selectedCards.includes(c.id))
        const remaining = myHand.filter((c) => !selectedCards.includes(c.id))
        set({
            tableCards: played,
            myHand: remaining,
            selectedCards: [],
            turnSeatIndex: getNextActiveSeat(get(), (turnSeatIndex + 1) % 4),
            leadSeatIndex: turnSeatIndex,
            isFirstTurnOfRound: false,
        })
    },

    sendPass: () => {
        const { turnSeatIndex, passedLocked, mySeatIndex } = get()
        // Strict pass-out: lock player out of current trick
        const newLocked = [...passedLocked, turnSeatIndex]
        const nextSeat = getNextActiveSeat(get(), (turnSeatIndex + 1) % 4)

        // Check if everyone passed → new lead (clear lock)
        const allPassed = newLocked.length >= 3
        if (allPassed) {
            set({
                passedLocked: [],
                turnSeatIndex: get().leadSeatIndex,
                tableCards: [],
            })
        } else {
            set({
                passedLocked: newLocked,
                turnSeatIndex: nextSeat,
            })
        }
    },

    setTurnTimer: (seconds) => set({ turnTimer: seconds }),

    sortHand: () => {
        const { myHand } = get()
        const sorted = [...myHand].sort((a, b) => a.value - b.value || a.suit - b.suit)
        set({ myHand: sorted })
    },

    addRounds: (n) => {
        const { roundsInfo } = get()
        set({
            roundsInfo: { ...roundsInfo, total: roundsInfo.total + n },
            matchStatus: 'playing',
        })
    },

    forceStop: () => {
        set({ matchStatus: 'ended' })
    },

    recordDisconnect: (seatIndex) => {
        const { disconnectCounts } = get()
        set({
            disconnectCounts: {
                ...disconnectCounts,
                [seatIndex]: (disconnectCounts[seatIndex] || 0) + 1,
            },
        })
    },

    getDisconnectCount: (seatIndex) => {
        return get().disconnectCounts[seatIndex] || 0
    },

    // Connection
    setConnected: (val) => set({ isConnected: val }),
    setLatency: (ms) => set({ latency: ms }),
    setMatchStatus: (status) => set({ matchStatus: status }),
}))

/** Skip over locked-out players to find next active seat. */
function getNextActiveSeat(state, startSeat) {
    const { passedLocked, leadSeatIndex } = state
    let seat = startSeat
    for (let i = 0; i < 4; i++) {
        if (!passedLocked.includes(seat) || seat === leadSeatIndex) return seat
        seat = (seat + 1) % 4
    }
    return startSeat
}

// --- Mock Data Generator ---
function generateMockHand() {
    const suits = [0, 1, 2, 3] // 0=Diamond, 1=Club, 2=Heart, 3=Spade
    const hand = []
    const usedCards = new Set()

    // Always include 3♦ for first-turn testing
    hand.push({ id: '0-1', suit: 0, value: 1 })
    usedCards.add('0-1')

    while (hand.length < 13) {
        const suit = suits[Math.floor(Math.random() * 4)]
        const value = Math.floor(Math.random() * 13) + 1 // 1=3 ... 13=2
        const key = `${suit}-${value}`
        if (!usedCards.has(key)) {
            usedCards.add(key)
            hand.push({ id: key, suit, value })
        }
    }

    // Fisher-Yates shuffle — cards dealt in random order (natural card play)
    for (let i = hand.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [hand[i], hand[j]] = [hand[j], hand[i]]
    }
    return hand
}

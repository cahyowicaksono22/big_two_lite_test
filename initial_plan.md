Big Two Club - Frontend Architecture Plan
1. Technology Stack Recommendation
Framework: React 18+ (Vite)
Styling: Tailwind CSS (Critical for rapid responsive layout)
State Management: Zustand (Simpler than Redux, perfect for fast game state updates)
Real-time Communication: Socket.io-client
Animations: Framer Motion (Card dealing, turn transitions, bomb explosions)
Icons: Lucide React or FontAwesome
2. Page Structure & Routing
A. Public Routes
/login:
Fields: Username, Password.
Referral Code Input: Validates against backend before allowing submit.
B. Protected Routes (Requires Auth Token)
/lobby (Main Dashboard)
Agent View:
Button: "Create New Table".
List of active tables with status (Waiting 2/4, Playing Round 5/25).
Action buttons: "Enter Room", "Kick User".
Operator View:
List of Agent's tables.
Action buttons: "Watch", "Extend Match".
Player View:
List of tables.
Action buttons: "Sit" (if empty seats), "Watch".
/room/:roomId (The Game Canvas)
Single immersive view handling both "Player" and "Spectator" modes.
3. Game Room Component Architecture
This is the most complex part of the app. The layout must be strictly responsive (Mobile Landscape & Desktop).
A. Main Layout (GameRoom.jsx)
BackgroundLayer: Green felt texture or gradient.
PingIndicator: Top right, absolute position.
MatchInfo: Top left (Round 5/25, Base Score).
DecisionOverlay: Appears only post-match (End Table vs Add Rounds).
B. The Table (GameTable.jsx)
Visual representation of the 4 seats.
OpponentSeat Component (x3)
Props: playerData, isActive (Is it their turn?), isZombie.
Visuals: Avatar, Name, Balance.
Cards: Renders card backs based on cardCount. DO NOT render actual card values here (security).
TimerRing: Circular progress bar around avatar during their turn.
Status Badges: "PASS", "ZOMBIE", "DISCONNECTED".
TableCenter Component
PlayedCardsStack: Displays the last valid hand played.
BombAnimation: Overlay trigger when Bomb rule is activated.
PlayerArea Component (Bottom - The User)
MyHand:
Horizontal scroll container (if many cards).
Interaction: Click card to toggle "Selected" (moves up 10px).
Sorting Controls: Buttons to sort by Suit or Value.
ActionControls:
Pass Button: Disabled if isLead or strict pass-out rule active.
Submit Button: Disabled if selected cards are invalid.
Timer Bar: Urgent visual countdown.
C. Modals & Overlays
RoundResultModal: Shows score changes after every round.
DisconnectOverlay: "Connection Lost. Reconnecting... (01:59)".
ZombieNotification: "You are in Zombie Mode. Click to Resume."
4. State Management (Zustand Store)
We need a separated store logic to keep re-renders optimized.
// useGameStore.js
{
  // Connection State
  socket: null,
  isConnected: false,
  latency: 0,

  // Room State
  roomId: null,
  matchStatus: 'waiting', // waiting, playing, paused, pending_decision
  roundsInfo: { current: 1, total: 25 },
  players: [], // Array of user objects + seat index
  
  // Game State (Dynamic)
  turnSeatIndex: 0, // Whose turn is it?
  leadSeatIndex: 0, // Who started the current trick?
  tableCards: [],   // Cards currently on table
  myHand: [],       // Array of cards (ONLY for current user)
  passedPlayers: [], // List of seatIndexes locked out of current trick

  // Actions
  selectCard: (cardId) => { ... },
  submitTurn: () => { ... }, // Emits 'play_cards'
  sendPass: () => { ... },   // Emits 'pass_turn'
}


5. Critical Logic Implementation
A. Card Selection & Validation (Frontend Side)
Before sending data to the server, validate immediately for UX.
isCombinationValid(selectedCards):
Returns type: "Single", "Pair", "Straight", "Bomb", or "Invalid".
Rule Check: If isLead, allow any valid combo.
Rule Check: If !isLead, selected combo must beat tableCards (Higher rank, same type).
B. The "Bomb" Visuals
Detection: If prevTurn was a "Single 2" and currentTurn is "Quads" or "Straight Flush".
Animation:
Shake the screen.
Overlay an explosion GIF/Lottie animation.
Show floating text: "-500 pts" on the victim, "+500 pts" on the bomber.
C. Zombie/Disconnect UI
If player.status === 'zombie', gray out their avatar and overlay a "brain" or "zombie" icon.
If my.status === 'zombie', show a large button "TAKE CONTROL" that emits a resume_game socket event.
D. Post-Match Agent Decision
If user.role === 'agent' and matchStatus === 'pending_decision':
Render a modal that cannot be closed.
Button 1: "End Table" (Red).
Button 2: "Add 10 Rounds" (Green).
Button 3: "Add 20 Rounds" (Blue).
6. Socket Event Map (Frontend Listeners)
Event Name
Payload
Action
game_state_update
{ players, turn, ... }
Sync generic table state.
hand_update
[Card Objects]
Private. Update myHand.
timer_tick
{ seatIndex, seconds }
Update countdown ring.
player_action
{ seat, action, cards }
Animate cards flying from avatar to table.
round_over
{ scores, winner }
Show RoundResultModal.
match_decision_req
{ matchId }
Trigger Agent decision modal.
match_extended
{ newTotal }
Toast: "Match extended to X rounds!".
latency_update
[{ seat, ms }]
Update ping indicators.

7. Asset Plan
Cards: Use SVG library (e.g., react-playing-cards or custom SVG sprites) to ensure crisp rendering on all screen sizes.
Audio:
turn_alert.mp3: Your turn.
card_place.mp3: Snap sound.
pass.mp3: Soft "check" sound.
bomb_explode.mp3: Heavy impact sound.
win.mp3: Victory jingle.

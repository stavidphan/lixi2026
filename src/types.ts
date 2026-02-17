export interface Denomination {
  id: string;
  value: number;
  quantity: number;
}

export interface GameState {
  screen: 'lobby' | 'setup' | 'fingerprint' | 'envelope' | 'end';
  denominations: Denomination[];
  pool: number[];
  currentPrize: number | null;
  totalPlayed: number;
  totalMoneyGiven: number;
  history: number[];
  currentRoomId: string | null;
  currentRoomName: string;
}

export interface Room {
  id: string;
  name: string;
  createdAt: number;
  gameState: GameState;
}

export type GameAction =
  | { type: 'SET_DENOMINATIONS'; denominations: Denomination[] }
  | { type: 'START_GAME' }
  | { type: 'DRAW_PRIZE' }
  | { type: 'SHOW_ENVELOPE' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'RESET_GAME' }
  | { type: 'GO_TO_SCREEN'; screen: GameState['screen'] }
  | { type: 'GO_TO_LOBBY' }
  | { type: 'LOAD_ROOM'; room: Room }
  | { type: 'CREATE_ROOM'; name: string; roomId: string }
  | { type: 'DELETE_ROOM'; roomId: string };

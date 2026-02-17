export interface Denomination {
  id: string;
  value: number;
  quantity: number;
}

export interface GameState {
  screen: 'setup' | 'fingerprint' | 'envelope' | 'end';
  denominations: Denomination[];
  pool: number[];
  currentPrize: number | null;
  totalPlayed: number;
  totalMoneyGiven: number;
  history: number[];
}

export type GameAction =
  | { type: 'SET_DENOMINATIONS'; denominations: Denomination[] }
  | { type: 'START_GAME' }
  | { type: 'DRAW_PRIZE' }
  | { type: 'SHOW_ENVELOPE' }
  | { type: 'NEXT_PLAYER' }
  | { type: 'RESET_GAME' }
  | { type: 'GO_TO_SCREEN'; screen: GameState['screen'] };

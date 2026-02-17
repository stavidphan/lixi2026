import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction, Denomination } from '../types';
import { buildPool, drawFromPool } from '../utils/lottery';

const STORAGE_KEY = 'lixi2026_game';

const initialState: GameState = {
  screen: 'setup',
  denominations: [],
  pool: [],
  currentPrize: null,
  totalPlayed: 0,
  totalMoneyGiven: 0,
  history: [],
};

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return initialState;
}

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_DENOMINATIONS':
      return { ...state, denominations: action.denominations };

    case 'START_GAME': {
      const pool = buildPool(state.denominations);
      return {
        ...state,
        pool,
        screen: 'fingerprint',
        currentPrize: null,
        totalPlayed: 0,
        totalMoneyGiven: 0,
        history: [],
      };
    }

    case 'DRAW_PRIZE': {
      const result = drawFromPool(state.pool);
      if (!result) {
        return { ...state, screen: 'end' };
      }
      return {
        ...state,
        pool: result.remainingPool,
        currentPrize: result.prize,
        screen: 'envelope',
      };
    }

    case 'SHOW_ENVELOPE':
      return { ...state, screen: 'envelope' };

    case 'NEXT_PLAYER': {
      const newTotalPlayed = state.totalPlayed + 1;
      const newTotalMoney = state.totalMoneyGiven + (state.currentPrize || 0);
      const newHistory = [...state.history, state.currentPrize || 0];

      if (state.pool.length === 0) {
        return {
          ...state,
          screen: 'end',
          totalPlayed: newTotalPlayed,
          totalMoneyGiven: newTotalMoney,
          history: newHistory,
          currentPrize: null,
        };
      }

      return {
        ...state,
        screen: 'fingerprint',
        currentPrize: null,
        totalPlayed: newTotalPlayed,
        totalMoneyGiven: newTotalMoney,
        history: newHistory,
      };
    }

    case 'RESET_GAME':
      localStorage.removeItem(STORAGE_KEY);
      return initialState;

    case 'GO_TO_SCREEN':
      return { ...state, screen: action.screen };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  setDenominations: (denoms: Denomination[]) => void;
  startGame: () => void;
  drawPrize: () => void;
  nextPlayer: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value: GameContextType = {
    state,
    dispatch,
    setDenominations: (denoms) => dispatch({ type: 'SET_DENOMINATIONS', denominations: denoms }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    drawPrize: () => dispatch({ type: 'DRAW_PRIZE' }),
    nextPlayer: () => dispatch({ type: 'NEXT_PLAYER' }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

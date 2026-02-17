import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { GameState, GameAction, Denomination, Room } from '../types';
import { buildPool, drawFromPool } from '../utils/lottery';

const STORAGE_KEY = 'lixi2026_game';
const ROOMS_KEY = 'lixi2026_rooms';

const initialState: GameState = {
  screen: 'lobby',
  denominations: [],
  pool: [],
  currentPrize: null,
  totalPlayed: 0,
  totalMoneyGiven: 0,
  history: [],
  currentRoomId: null,
  currentRoomName: '',
};

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed };
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

export function loadRooms(): Room[] {
  try {
    const saved = localStorage.getItem(ROOMS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function saveRooms(rooms: Room[]) {
  try {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  } catch {
    // ignore
  }
}

function saveRoomToList(state: GameState) {
  if (!state.currentRoomId) return;
  const rooms = loadRooms();
  const idx = rooms.findIndex((r) => r.id === state.currentRoomId);
  const roomState: GameState = { ...state };
  if (idx >= 0) {
    rooms[idx] = { ...rooms[idx], gameState: roomState };
  } else {
    rooms.push({
      id: state.currentRoomId,
      name: state.currentRoomName || 'Phòng mới',
      createdAt: Date.now(),
      gameState: roomState,
    });
  }
  saveRooms(rooms);
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
      return { ...initialState, screen: 'lobby' };

    case 'GO_TO_SCREEN':
      return { ...state, screen: action.screen };

    case 'GO_TO_LOBBY':
      return { ...initialState, screen: 'lobby' };

    case 'CREATE_ROOM': {
      const roomId = action.roomId;
      return {
        ...initialState,
        screen: 'setup',
        currentRoomId: roomId,
        currentRoomName: action.name,
      };
    }

    case 'LOAD_ROOM':
      return {
        ...action.room.gameState,
        currentRoomId: action.room.id,
        currentRoomName: action.room.name,
      };

    case 'DELETE_ROOM':
      return state;

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
  goToLobby: () => void;
  createRoom: (name: string) => void;
  loadRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
    if (state.currentRoomId && state.screen !== 'lobby') {
      saveRoomToList(state);
    }
  }, [state]);

  const goToLobby = useCallback(() => {
    if (state.currentRoomId) {
      saveRoomToList(state);
    }
    dispatch({ type: 'GO_TO_LOBBY' });
  }, [state]);

  const createRoom = useCallback((name: string) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newRoomState: GameState = {
      ...initialState,
      screen: 'setup',
      currentRoomId: roomId,
      currentRoomName: name,
    };
    const rooms = loadRooms();
    rooms.push({
      id: roomId,
      name,
      createdAt: Date.now(),
      gameState: newRoomState,
    });
    saveRooms(rooms);
    dispatch({ type: 'CREATE_ROOM', name, roomId });
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    const rooms = loadRooms().filter((r) => r.id !== roomId);
    saveRooms(rooms);
    dispatch({ type: 'DELETE_ROOM', roomId });
  }, []);

  const value: GameContextType = {
    state,
    dispatch,
    setDenominations: (denoms) => dispatch({ type: 'SET_DENOMINATIONS', denominations: denoms }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    drawPrize: () => dispatch({ type: 'DRAW_PRIZE' }),
    nextPlayer: () => dispatch({ type: 'NEXT_PLAYER' }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    goToLobby,
    createRoom,
    loadRoom: (room: Room) => dispatch({ type: 'LOAD_ROOM', room }),
    deleteRoom,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

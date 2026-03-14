import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { SCREEN_TIME_REMINDER_MINUTES, WORLDS, LEVELS_PER_WORLD, ALL_LEVELS_UNLOCKED, type CharacterType, getRandomCharacter, type GameType, getLevelGameType, getDifficulty } from "@shared/gameConfig";

export type GameScreen = "welcome" | "worldMap" | "levelSelect" | "game" | "reward" | "screenTimeReminder";

interface GameState {
  screen: GameScreen;
  currentWorld: number;
  currentLevel: number;
  totalStars: number;
  totalHearts: number;
  activeCharacter: CharacterType;
  currentGameType: GameType;
  currentDifficulty: number;
  score: number;
  sessionStartTime: number;
  soundEnabled: boolean;
  musicStarted: boolean;
  levelStars: Record<string, number>;
}

interface GameContextType extends GameState {
  setScreen: (screen: GameScreen) => void;
  selectWorld: (worldId: number) => void;
  startLevel: (worldId: number, levelId: number) => void;
  completeLevel: (stars: number, score: number) => void;
  addHeart: () => void;
  toggleSound: () => void;
  resetGame: () => void;
  getStarsForLevel: (worldId: number, levelId: number) => number;
  isLevelUnlocked: (worldId: number, levelId: number) => boolean;
  isWorldUnlocked: (worldId: number) => boolean;
  setMusicStarted: () => void;
  isMobile: boolean;
}

const defaultState: GameState = {
  screen: "welcome",
  currentWorld: 1,
  currentLevel: 1,
  totalStars: 0,
  totalHearts: 0,
  activeCharacter: "both",
  currentGameType: "alphabet",
  currentDifficulty: 1,
  score: 0,
  sessionStartTime: Date.now(),
  soundEnabled: true,
  musicStarted: false,
  levelStars: {},
};

const STORAGE_KEY = "raes-learning-adventure-state";

function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultState,
        ...parsed,
        screen: "welcome",
        sessionStartTime: Date.now(),
        musicStarted: false,
      };
    }
  } catch (e) {
    // ignore
  }
  return { ...defaultState, sessionStartTime: Date.now() };
}

function saveState(state: GameState) {
  try {
    const { screen, sessionStartTime, musicStarted, ...toSave } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // ignore
  }
}

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (window.innerWidth <= 768);
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);
  const [isMobile, setIsMobile] = useState(detectMobile);
  const screenTimeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect mobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(detectMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Screen time reminder
  useEffect(() => {
    if (screenTimeRef.current) {
      clearInterval(screenTimeRef.current);
    }
    screenTimeRef.current = setInterval(() => {
      const elapsed = (Date.now() - state.sessionStartTime) / 1000 / 60;
      if (elapsed >= SCREEN_TIME_REMINDER_MINUTES) {
        setState(prev => ({ ...prev, screen: "screenTimeReminder" }));
      }
    }, 60000);

    return () => {
      if (screenTimeRef.current) clearInterval(screenTimeRef.current);
    };
  }, [state.sessionStartTime]);

  const setScreen = useCallback((screen: GameScreen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const selectWorld = useCallback((worldId: number) => {
    setState(prev => ({ ...prev, currentWorld: worldId, screen: "levelSelect" }));
  }, []);

  const startLevel = useCallback((worldId: number, levelId: number) => {
    const gameType = getLevelGameType(worldId, levelId);
    const difficulty = getDifficulty(worldId, levelId);
    const character = getRandomCharacter();
    setState(prev => ({
      ...prev,
      currentWorld: worldId,
      currentLevel: levelId,
      currentGameType: gameType,
      currentDifficulty: difficulty,
      activeCharacter: character,
      score: 0,
      screen: "game",
    }));
  }, []);

  const completeLevel = useCallback((stars: number, score: number) => {
    setState(prev => {
      const levelKey = `${prev.currentWorld}-${prev.currentLevel}`;
      const prevStars = prev.levelStars[levelKey] || 0;
      const newStars = Math.max(prevStars, stars);
      const starsDiff = newStars - prevStars;

      return {
        ...prev,
        totalStars: prev.totalStars + starsDiff,
        totalHearts: prev.totalHearts + 1,
        score,
        levelStars: { ...prev.levelStars, [levelKey]: newStars },
        screen: "reward",
      };
    });
  }, []);

  const addHeart = useCallback(() => {
    setState(prev => ({ ...prev, totalHearts: prev.totalHearts + 1 }));
  }, []);

  const toggleSound = useCallback(() => {
    setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const setMusicStarted = useCallback(() => {
    setState(prev => ({ ...prev, musicStarted: true }));
  }, []);

  const resetGame = useCallback(() => {
    setState({ ...defaultState, sessionStartTime: Date.now() });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getStarsForLevel = useCallback((worldId: number, levelId: number) => {
    return state.levelStars[`${worldId}-${levelId}`] || 0;
  }, [state.levelStars]);

  // All levels unlocked
  const isLevelUnlocked = useCallback((_worldId: number, _levelId: number) => {
    if (ALL_LEVELS_UNLOCKED) return true;
    return true;
  }, []);

  const isWorldUnlocked = useCallback((_worldId: number) => {
    if (ALL_LEVELS_UNLOCKED) return true;
    return true;
  }, []);

  return (
    <GameContext.Provider value={{
      ...state,
      setScreen,
      selectWorld,
      startLevel,
      completeLevel,
      addHeart,
      toggleSound,
      resetGame,
      getStarsForLevel,
      isLevelUnlocked,
      isWorldUnlocked,
      setMusicStarted,
      isMobile,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

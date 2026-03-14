import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { SCREEN_TIME_REMINDER_MINUTES, WORLDS, LEVELS_PER_WORLD, type CharacterType, getRandomCharacter, type GameType, getLevelGameType, getDifficulty } from "@shared/gameConfig";

export type GameScreen = "welcome" | "worldMap" | "levelSelect" | "game" | "reward" | "screenTimeReminder";

interface GameState {
  screen: GameScreen;
  currentWorld: number;
  currentLevel: number;
  highestWorldUnlocked: number;
  highestLevelUnlocked: number;
  totalStars: number;
  totalHearts: number;
  activeCharacter: CharacterType;
  currentGameType: GameType;
  currentDifficulty: number;
  score: number;
  sessionStartTime: number;
  soundEnabled: boolean;
  levelStars: Record<string, number>; // "worldId-levelId" -> stars
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
}

const defaultState: GameState = {
  screen: "welcome",
  currentWorld: 1,
  currentLevel: 1,
  highestWorldUnlocked: 1,
  highestLevelUnlocked: 1,
  totalStars: 0,
  totalHearts: 0,
  activeCharacter: "both",
  currentGameType: "alphabet",
  currentDifficulty: 1,
  score: 0,
  sessionStartTime: Date.now(),
  soundEnabled: true,
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
      };
    }
  } catch (e) {
    // ignore
  }
  return { ...defaultState, sessionStartTime: Date.now() };
}

function saveState(state: GameState) {
  try {
    const { screen, sessionStartTime, ...toSave } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // ignore
  }
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(loadState);
  const screenTimeRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    }, 60000); // Check every minute

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

      let newHighestWorld = prev.highestWorldUnlocked;
      let newHighestLevel = prev.highestLevelUnlocked;

      // Unlock next level
      if (prev.currentWorld === prev.highestWorldUnlocked && prev.currentLevel >= prev.highestLevelUnlocked) {
        if (prev.currentLevel >= LEVELS_PER_WORLD) {
          // Unlock next world
          newHighestWorld = Math.min(prev.highestWorldUnlocked + 1, 5);
          newHighestLevel = 1;
        } else {
          newHighestLevel = prev.currentLevel + 1;
        }
      }

      return {
        ...prev,
        totalStars: prev.totalStars + starsDiff,
        totalHearts: prev.totalHearts + 1,
        score,
        levelStars: { ...prev.levelStars, [levelKey]: newStars },
        highestWorldUnlocked: newHighestWorld,
        highestLevelUnlocked: newHighestLevel,
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

  const resetGame = useCallback(() => {
    setState({ ...defaultState, sessionStartTime: Date.now() });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getStarsForLevel = useCallback((worldId: number, levelId: number) => {
    return state.levelStars[`${worldId}-${levelId}`] || 0;
  }, [state.levelStars]);

  const isLevelUnlocked = useCallback((worldId: number, levelId: number) => {
    if (worldId < state.highestWorldUnlocked) return true;
    if (worldId === state.highestWorldUnlocked && levelId <= state.highestLevelUnlocked) return true;
    return false;
  }, [state.highestWorldUnlocked, state.highestLevelUnlocked]);

  const isWorldUnlocked = useCallback((worldId: number) => {
    return worldId <= state.highestWorldUnlocked;
  }, [state.highestWorldUnlocked]);

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

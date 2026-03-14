import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { WORLDS, ASSETS } from "@shared/gameConfig";
import AlphabetGame from "./games/AlphabetGame";
import MathGame from "./games/MathGame";
import MotorGame from "./games/MotorGame";
import { Volume2, VolumeX } from "lucide-react";

export default function GameScreen() {
  const {
    currentWorld, currentLevel, currentGameType, currentDifficulty,
    activeCharacter, completeLevel, setScreen, soundEnabled, toggleSound,
  } = useGame();

  const world = WORLDS[currentWorld - 1];

  const handleComplete = (stars: number, score: number) => {
    completeLevel(stars, score);
  };

  const gameTypeLabel = {
    alphabet: "Letters & Words",
    math: "Numbers & Math",
    motor: "Catch Game",
  }[currentGameType];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${world.color}22 0%, #fce4ec 50%, #f8bbd0 100%)` }}>

      {/* Header */}
      <div className="p-3 flex items-center justify-between shrink-0">
        <motion.button
          onClick={() => setScreen("levelSelect")}
          className="bg-white/80 hover:bg-white rounded-full px-3 py-1.5 shadow-md text-game-pink-dark font-bold text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-xl">{world.icon}</span>
          <span className="font-bold text-game-pink-dark">
            Level {currentLevel}
          </span>
          <span className="text-foreground/40">|</span>
          <span className="text-foreground/60">{gameTypeLabel}</span>
        </div>

        <motion.button
          onClick={toggleSound}
          className="bg-white/80 hover:bg-white rounded-full p-2 shadow-md text-game-pink-dark"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Game content */}
      <div className="flex-1 flex items-center justify-center py-4">
        {currentGameType === "alphabet" && (
          <AlphabetGame
            difficulty={currentDifficulty}
            character={activeCharacter}
            onComplete={handleComplete}
          />
        )}
        {currentGameType === "math" && (
          <MathGame
            difficulty={currentDifficulty}
            character={activeCharacter}
            onComplete={handleComplete}
          />
        )}
        {currentGameType === "motor" && (
          <MotorGame
            difficulty={currentDifficulty}
            character={activeCharacter}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}

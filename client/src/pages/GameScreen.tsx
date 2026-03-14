import { motion } from "framer-motion";
import { useGame } from "@/contexts/GameContext";
import { WORLDS } from "@shared/gameConfig";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import AlphabetGame from "./games/AlphabetGame";
import MathGame from "./games/MathGame";
import MotorGame from "./games/MotorGame";

export default function GameScreen() {
  const {
    currentWorld, currentLevel, currentGameType, currentDifficulty,
    activeCharacter, completeLevel, setScreen, soundEnabled, toggleSound,
  } = useGame();
  const { playClick } = useSoundEffects();
  useBackgroundMusic();

  const world = WORLDS.find(w => w.id === currentWorld) || WORLDS[0];

  const handleComplete = (stars: number, score: number) => {
    completeLevel(stars, score);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${world.color}15 0%, #fce4ec33 50%, #f3e5f522 100%)` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3 shrink-0">
        <motion.button
          onClick={() => { playClick(); setScreen("levelSelect"); }}
          className="bg-white/80 hover:bg-white rounded-full px-3 py-1.5 md:px-4 md:py-2 shadow-md text-game-pink-dark font-bold text-xs md:text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>

        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl">{world.icon}</span>
          <span className="game-title text-sm md:text-lg text-game-pink-dark">
            Level {currentLevel}
          </span>
          <span className="text-xs md:text-sm text-foreground/40">
            ({currentGameType === "alphabet" ? "🔤" : currentGameType === "math" ? "🔢" : "🎮"})
          </span>
        </div>

        <button
          onClick={() => { playClick(); toggleSound(); }}
          className="text-lg md:text-xl p-1.5 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      {/* Game content */}
      <div className="flex-1 flex items-center justify-center py-2 md:py-4">
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

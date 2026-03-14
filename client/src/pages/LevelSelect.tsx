import { motion } from "framer-motion";
import { WORLDS, LEVELS_PER_WORLD, getLevelGameType } from "@shared/gameConfig";
import { useGame } from "@/contexts/GameContext";
import CharacterDisplay from "@/components/CharacterDisplay";
import { Lock, BookOpen, Calculator, Gamepad2 } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const gameTypeIcons: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  alphabet: { icon: <BookOpen className="w-4 h-4" />, label: "ABC", color: "bg-game-lavender" },
  math: { icon: <Calculator className="w-4 h-4" />, label: "123", color: "bg-game-mint" },
  motor: { icon: <Gamepad2 className="w-4 h-4" />, label: "Catch", color: "bg-game-peach" },
};

export default function LevelSelect() {
  const { currentWorld, startLevel, isLevelUnlocked, getStarsForLevel, setScreen } = useGame();
  const world = WORLDS[currentWorld - 1];
  const { playClick } = useSoundEffects();

  const handleStartLevel = (worldId: number, levelId: number) => {
    playClick();
    startLevel(worldId, levelId);
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${world.color}33 0%, #fce4ec 50%, #f8bbd0 100%)` }}>

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <motion.button
          onClick={() => { playClick(); setScreen("worldMap"); }}
          className="bg-white/80 hover:bg-white rounded-full px-4 py-2 shadow-md text-game-pink-dark font-bold text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">{world.icon}</span>
          <h1 className="game-title text-xl md:text-2xl text-game-pink-dark">{world.name}</h1>
        </div>

        <div className="w-20" />
      </div>

      {/* World description */}
      <motion.div
        className="text-center px-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-foreground/60">{world.description}</p>
        <p className="text-sm text-game-pink-dark/60 mt-1 italic">{world.encouragement}</p>
      </motion.div>

      {/* Character */}
      <div className="flex justify-center mb-4">
        <CharacterDisplay character={currentWorld % 2 === 0 ? "jellycat" : "penguin"} size="md" />
      </div>

      {/* Level Grid */}
      <div className="px-4 pb-8">
        <div className="max-w-2xl mx-auto grid grid-cols-5 gap-3">
          {Array.from({ length: LEVELS_PER_WORLD }, (_, i) => {
            const levelId = i + 1;
            const unlocked = isLevelUnlocked(currentWorld, levelId);
            const stars = getStarsForLevel(currentWorld, levelId);
            const gameType = getLevelGameType(currentWorld, levelId);
            const typeInfo = gameTypeIcons[gameType];

            return (
              <motion.button
                key={levelId}
                className={`relative rounded-2xl p-3 flex flex-col items-center gap-1 transition-all shadow-md border-2 ${
                  unlocked
                    ? "bg-white/90 border-game-pink/30 hover:border-game-pink hover:shadow-lg"
                    : "bg-white/40 border-gray-200/30 cursor-not-allowed"
                }`}
                onClick={() => unlocked && handleStartLevel(currentWorld, levelId)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={unlocked ? { scale: 1.08, y: -3 } : {}}
                whileTap={unlocked ? { scale: 0.95 } : {}}
              >
                {/* Level number */}
                <span className={`game-title text-xl ${unlocked ? "text-game-pink-dark" : "text-gray-400"}`}>
                  {levelId}
                </span>

                {/* Game type badge */}
                {unlocked ? (
                  <span className={`${typeInfo.color} text-xs font-bold px-2 py-0.5 rounded-full text-foreground/70 flex items-center gap-1`}>
                    {typeInfo.icon}
                    {typeInfo.label}
                  </span>
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}

                {/* Stars */}
                {stars > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3].map(s => (
                      <span key={s} className={`text-xs ${s <= stars ? "text-amber-400" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-6">
        <div className="max-w-2xl mx-auto flex justify-center gap-4 flex-wrap">
          {Object.entries(gameTypeIcons).map(([key, info]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-foreground/50">
              <span className={`${info.color} p-1 rounded-full`}>{info.icon}</span>
              <span>{key === "alphabet" ? "Letters & Words" : key === "math" ? "Numbers & Math" : "Catch Game"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

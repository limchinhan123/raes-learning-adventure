import { motion } from "framer-motion";
import { ASSETS, WORLDS, LEVELS_PER_WORLD } from "@shared/gameConfig";
import { useGame } from "@/contexts/GameContext";
import CharacterDisplay from "@/components/CharacterDisplay";
import { Lock } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function WorldMap() {
  const { selectWorld, isWorldUnlocked, isLevelUnlocked, getStarsForLevel, totalStars, totalHearts, setScreen } = useGame();
  const { playClick } = useSoundEffects();

  // Calculate progress for each world
  const getWorldProgress = (worldId: number) => {
    let completed = 0;
    for (let i = 1; i <= LEVELS_PER_WORLD; i++) {
      if (getStarsForLevel(worldId, i) > 0) completed++;
    }
    return (completed / LEVELS_PER_WORLD) * 100;
  };

  const handleSelectWorld = (worldId: number) => {
    playClick();
    selectWorld(worldId);
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${ASSETS.worldMapBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <motion.button
          onClick={() => { playClick(); setScreen("welcome"); }}
          className="bg-white/80 hover:bg-white rounded-full px-4 py-2 shadow-md text-game-pink-dark font-bold text-sm flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Home
        </motion.button>

        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
            <img src={ASSETS.starReward} alt="Stars" className="w-6 h-6" />
            <span className="font-bold text-amber-600">{totalStars}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-lg">💕</span>
            <span className="font-bold text-game-pink-dark">{totalHearts}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <motion.div
        className="relative z-10 text-center mt-2 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="game-title text-3xl md:text-4xl text-game-pink-dark drop-shadow-sm">
          Choose Your World!
        </h1>
      </motion.div>

      {/* Character guide */}
      <div className="relative z-10 flex justify-center mb-4">
        <CharacterDisplay character="both" size="sm" />
      </div>

      {/* World Cards */}
      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORLDS.map((world, index) => {
            const unlocked = isWorldUnlocked(world.id);
            const progress = getWorldProgress(world.id);
            return (
              <motion.button
                key={world.id}
                className={`relative rounded-3xl p-5 text-left transition-all duration-300 shadow-lg border-2 ${
                  unlocked
                    ? "bg-white/90 border-game-pink/30 hover:border-game-pink hover:shadow-xl cursor-pointer"
                    : "bg-white/50 border-gray-200/50 cursor-not-allowed opacity-70"
                }`}
                onClick={() => unlocked && handleSelectWorld(world.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={unlocked ? { scale: 1.03, y: -4 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
              >
                {/* World icon and number */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{world.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-game-pink-dark/50 uppercase tracking-wider">
                      World {world.id}
                    </div>
                    <h3 className="game-title text-lg text-game-pink-dark leading-tight">
                      {world.name}
                    </h3>
                  </div>
                  {!unlocked && (
                    <Lock className="w-5 h-5 text-gray-400 ml-auto" />
                  )}
                </div>

                <p className="text-sm text-foreground/60 mb-3">
                  {world.description}
                </p>

                {/* Progress bar */}
                {unlocked && (
                  <div className="w-full bg-game-pink-light/50 rounded-full h-2">
                    <motion.div
                      className="bg-game-pink rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(progress, 2)}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.6 }}
                    />
                  </div>
                )}

                {/* Decorative color bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-3xl"
                  style={{ backgroundColor: world.color }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

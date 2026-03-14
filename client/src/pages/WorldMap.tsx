import { motion } from "framer-motion";
import { ASSETS, WORLDS, LEVELS_PER_WORLD } from "@shared/gameConfig";
import { useGame } from "@/contexts/GameContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

export default function WorldMap() {
  const { selectWorld, getStarsForLevel, totalStars, totalHearts, soundEnabled, toggleSound, setScreen, isMobile } = useGame();
  const { playClick } = useSoundEffects();
  useBackgroundMusic();

  const getWorldStars = (worldId: number) => {
    let stars = 0;
    for (let i = 1; i <= LEVELS_PER_WORLD; i++) {
      stars += getStarsForLevel(worldId, i);
    }
    return stars;
  };

  const getWorldCompleted = (worldId: number) => {
    let completed = 0;
    for (let i = 1; i <= LEVELS_PER_WORLD; i++) {
      if (getStarsForLevel(worldId, i) > 0) completed++;
    }
    return completed;
  };

  const maxStarsPerWorld = LEVELS_PER_WORLD * 3;

  return (
    <div
      className="min-h-screen relative overflow-hidden px-4 py-4 md:py-6"
      style={{ background: "linear-gradient(180deg, #e8eaf6 0%, #f3e5f5 40%, #fce4ec 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between max-w-4xl mx-auto mb-3 md:mb-5">
        <motion.button
          onClick={() => { playClick(); setScreen("welcome"); }}
          className="bg-white/80 hover:bg-white rounded-full px-3 py-2 md:px-4 shadow-md text-game-pink-dark font-bold text-sm flex items-center gap-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Home
        </motion.button>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
            <img src={ASSETS.starReward} alt="Stars" className="w-5 h-5 md:w-6 md:h-6" />
            <span className="font-bold text-amber-600 text-sm md:text-base">{totalStars}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-base md:text-lg">💕</span>
            <span className="font-bold text-game-pink-dark text-sm md:text-base">{totalHearts}</span>
          </div>
          <button
            onClick={() => { playClick(); toggleSound(); }}
            className="text-xl md:text-2xl p-1.5 md:p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* Title */}
      <motion.h1
        className="game-title text-2xl md:text-3xl text-game-pink-dark text-center mb-3 md:mb-4"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Choose Your World!
      </motion.h1>

      {/* Wandering characters */}
      <div className="flex justify-center items-end gap-3 md:gap-6 mb-4 md:mb-6">
        <motion.img
          src={ASSETS.penguin}
          alt="Penguin"
          className="w-14 h-14 md:w-24 md:h-24 object-contain drop-shadow-lg"
          animate={{ x: [0, 20, -15, 8, 0], y: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={ASSETS.rae}
          alt="Rae"
          className="w-14 h-14 md:w-24 md:h-24 object-contain drop-shadow-lg"
          animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={ASSETS.jellycat}
          alt="Jelly Cat"
          className="w-14 h-14 md:w-24 md:h-24 object-contain drop-shadow-lg"
          animate={{ x: [0, -20, 15, -8, 0], y: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* World cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
        {WORLDS.map((world, idx) => {
          const worldStars = getWorldStars(world.id);
          const worldCompleted = getWorldCompleted(world.id);
          const progress = (worldStars / maxStarsPerWorld) * 100;

          return (
            <motion.button
              key={world.id}
              className="game-card text-left relative overflow-hidden group"
              onClick={() => { playClick(); selectWorld(world.id); }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* World color accent */}
              <div
                className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
                style={{ backgroundColor: world.color }}
              />

              <div className="pt-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl md:text-4xl">{world.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-game-pink-dark/50 uppercase tracking-wider">
                      World {world.id}
                    </div>
                    <h3 className="game-title text-base md:text-lg text-game-pink-dark leading-tight">
                      {world.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-foreground/50 mb-3">
                  {world.description}
                </p>

                {/* Progress bar */}
                <div className="bg-game-pink-light/30 rounded-full h-2.5 mb-2">
                  <motion.div
                    className="rounded-full h-2.5"
                    style={{ backgroundColor: world.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(progress, progress > 0 ? 3 : 0)}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 + 0.3 }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/40">
                    {worldCompleted}/{LEVELS_PER_WORLD} levels · {worldStars} ⭐
                  </span>
                  <span className="text-xs font-bold text-game-pink-dark/60 group-hover:text-game-pink-dark transition-colors">
                    Play →
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Encouragement */}
      <motion.p
        className="text-center text-xs md:text-sm text-foreground/40 mt-4 md:mt-6 max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        All worlds are open for you, Rae! Pick any one you like!
      </motion.p>
    </div>
  );
}

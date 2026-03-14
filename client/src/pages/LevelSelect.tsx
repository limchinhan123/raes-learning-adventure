import { motion } from "framer-motion";
import { ASSETS, WORLDS, LEVELS_PER_WORLD, getLevelGameType, type GameType } from "@shared/gameConfig";
import { useGame } from "@/contexts/GameContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const gameTypeInfo: Record<GameType, { icon: string; label: string; color: string }> = {
  alphabet: { icon: "🔤", label: "ABC", color: "bg-game-lavender" },
  math: { icon: "🔢", label: "123", color: "bg-game-mint" },
  motor: { icon: "🎮", label: "Catch", color: "bg-game-peach" },
};

export default function LevelSelect() {
  const { currentWorld, startLevel, getStarsForLevel, setScreen, isMobile } = useGame();
  const { playClick } = useSoundEffects();
  const world = WORLDS.find(w => w.id === currentWorld) || WORLDS[0];

  return (
    <div
      className="min-h-screen relative overflow-hidden px-4 py-4 md:py-6"
      style={{ background: `linear-gradient(180deg, ${world.color}22 0%, #fce4ec44 100%)` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mb-3 md:mb-5">
        <motion.button
          onClick={() => { playClick(); setScreen("worldMap"); }}
          className="bg-white/80 hover:bg-white rounded-full px-3 py-2 md:px-4 shadow-md text-game-pink-dark font-bold text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Worlds
        </motion.button>
        <h1 className="game-title text-lg md:text-2xl text-game-pink-dark flex items-center gap-2">
          <span className="text-2xl md:text-3xl">{world.icon}</span>
          <span className="hidden sm:inline">{world.name}</span>
        </h1>
        <div className="w-16" />
      </div>

      {/* Wandering characters */}
      <div className="flex justify-center items-end gap-2 md:gap-4 mb-3 md:mb-5">
        <motion.img
          src={ASSETS.penguin}
          alt="Penguin"
          className="w-12 h-12 md:w-20 md:h-20 object-contain drop-shadow-lg"
          animate={{ x: [0, 12, -8, 0], y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={ASSETS.rae}
          alt="Rae"
          className="w-12 h-12 md:w-20 md:h-20 object-contain drop-shadow-lg"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={ASSETS.jellycat}
          alt="Jelly Cat"
          className="w-12 h-12 md:w-20 md:h-20 object-contain drop-shadow-lg"
          animate={{ x: [0, -12, 8, 0], y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      {/* Level grid */}
      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: LEVELS_PER_WORLD }, (_, i) => {
          const levelId = i + 1;
          const gameType = getLevelGameType(currentWorld, levelId);
          const info = gameTypeInfo[gameType];
          const stars = getStarsForLevel(currentWorld, levelId);

          return (
            <motion.button
              key={levelId}
              className="relative rounded-2xl p-3 md:p-4 text-center shadow-md border-2 transition-all
                bg-white/90 border-game-pink/20 hover:border-game-pink hover:shadow-xl active:scale-95"
              onClick={() => { playClick(); startLevel(currentWorld, levelId); }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Game type badge */}
              <div className={`${info.color} rounded-full px-2 py-0.5 text-xs font-bold text-foreground/70 mb-1.5 inline-block`}>
                {info.icon} {info.label}
              </div>

              {/* Level number */}
              <div className="text-2xl md:text-3xl font-bold text-game-pink-dark mb-1">
                {levelId}
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3].map(s => (
                  <span key={s} className={`text-sm md:text-base ${s <= stars ? "opacity-100" : "opacity-20"}`}>
                    ⭐
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 md:gap-5 flex-wrap mt-4 md:mt-6">
        {Object.entries(gameTypeInfo).map(([key, info]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-foreground/50">
            <span className={`${info.color} px-2 py-0.5 rounded-full font-bold`}>{info.icon}</span>
            <span>{key === "alphabet" ? "Letters" : key === "math" ? "Math" : "Catch"}</span>
          </div>
        ))}
      </div>

      {/* World encouragement */}
      <motion.p
        className="text-center text-xs md:text-sm text-foreground/40 mt-3 md:mt-4 italic max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {world.encouragement}
      </motion.p>
    </div>
  );
}

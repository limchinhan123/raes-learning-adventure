import { motion } from "framer-motion";
import { ASSETS, getRandomMessage, CHARACTER_MESSAGES } from "@shared/gameConfig";
import { useGame } from "@/contexts/GameContext";
import { useState, useEffect } from "react";
import { useTTS } from "@/hooks/useTTS";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

export default function WelcomeScreen() {
  const { setScreen, totalStars, totalHearts, soundEnabled } = useGame();
  const [welcomeMsg] = useState(() => getRandomMessage(CHARACTER_MESSAGES.welcome));
  const [showContent, setShowContent] = useState(false);
  const { speakForCharacter } = useTTS();
  const { playClick } = useSoundEffects();
  const { startMusic } = useBackgroundMusic();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Speak welcome message after a delay
  useEffect(() => {
    if (showContent && soundEnabled) {
      const timer = setTimeout(() => {
        speakForCharacter(welcomeMsg, "both");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showContent, soundEnabled]);

  const handleStart = () => {
    playClick();
    startMusic("calm");
    setScreen("worldMap");
  };

  // Allow any key press to start
  useEffect(() => {
    if (!showContent) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || (e.key.length === 1 && e.key.match(/[a-zA-Z]/))) {
        handleStart();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showContent]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fce4ec 0%, #f8bbd0 30%, #f3e5f5 60%, #e8eaf6 100%)" }}>

      {/* Floating decorative elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {["✨", "🌸", "⭐", "💕", "🌈", "🦋", "🌺", "💫"][i]}
        </motion.div>
      ))}

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center gap-6 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Characters */}
        <motion.div
          className="flex items-end gap-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.img
            src={ASSETS.penguin}
            alt="Penguin"
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img
            src={ASSETS.jellycat}
            alt="Jelly Cat"
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h1 className="game-title text-4xl md:text-6xl text-game-pink-dark mb-2 drop-shadow-sm">
            Hi, Rae!
          </h1>
          <motion.p
            className="text-lg md:text-xl text-game-pink-dark/70 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {welcomeMsg}
          </motion.p>
        </motion.div>

        {/* Stats (if returning player) */}
        {(totalStars > 0 || totalHearts > 0) && (
          <motion.div
            className="flex gap-6 items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {totalStars > 0 && (
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 shadow-sm">
                <img src={ASSETS.starReward} alt="Stars" className="w-8 h-8" />
                <span className="text-lg font-bold text-amber-600">{totalStars}</span>
              </div>
            )}
            {totalHearts > 0 && (
              <div className="flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 shadow-sm">
                <span className="text-2xl">💕</span>
                <span className="text-lg font-bold text-game-pink-dark">{totalHearts}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Play Button */}
        {showContent && (
          <motion.button
            className="rounded-2xl font-bold text-2xl md:text-3xl px-12 py-5 mt-4 transition-all duration-200 shadow-md hover:shadow-lg bg-game-pink text-white hover:bg-game-pink-dark"
            onClick={handleStart}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            Let's Play!
          </motion.button>
        )}

        {/* Subtitle */}
        <motion.p
          className="text-sm text-game-pink-dark/50 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Press any key or click to start!
        </motion.p>
      </motion.div>
    </div>
  );
}

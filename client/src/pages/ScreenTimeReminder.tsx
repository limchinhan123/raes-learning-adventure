import { motion } from "framer-motion";
import { ASSETS, getRandomMessage, CHARACTER_MESSAGES } from "@shared/gameConfig";
import { useGame } from "@/contexts/GameContext";
import { useState, useEffect } from "react";
import { useTTS } from "@/hooks/useTTS";

export default function ScreenTimeReminder() {
  const { setScreen, isMobile } = useGame();
  const [message] = useState(() => getRandomMessage(CHARACTER_MESSAGES.screenTimeReminder));
  const { speakForCharacter } = useTTS();

  useEffect(() => {
    const timer = setTimeout(() => {
      speakForCharacter(message, "both");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
      style={{ background: "linear-gradient(180deg, #e8eaf6 0%, #f3e5f5 50%, #fce4ec 100%)" }}
    >
      {/* Sleepy stars */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl md:text-3xl pointer-events-none select-none"
          style={{ left: `${20 + i * 15}%`, top: `${20 + (i % 2) * 30}%` }}
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
        >
          💤
        </motion.div>
      ))}

      <motion.div
        className="flex flex-col items-center gap-6 md:gap-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Sleepy characters - trio with Rae */}
        <div className="flex items-end gap-3 md:gap-4">
          <motion.img
            src={ASSETS.penguin}
            alt="Sleepy Penguin"
            className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-md opacity-80"
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.img
            src={ASSETS.rae}
            alt="Sleepy Rae"
            className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-md opacity-80"
            animate={{ rotate: [2, -2, 2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.3 }}
          />
          <motion.img
            src={ASSETS.jellycat}
            alt="Sleepy Jelly Cat"
            className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-md opacity-80"
            animate={{ rotate: [3, -3, 3] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        {/* Message */}
        <div className="text-center max-w-md">
          <h2 className="game-title text-2xl md:text-3xl text-game-lavender mb-3 md:mb-4">
            Time for a Break!
          </h2>
          <p className="text-base md:text-lg text-foreground/60 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Moon */}
        <motion.div
          className="text-4xl md:text-5xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🌙
        </motion.div>

        {/* Continue button */}
        <motion.button
          className="rounded-2xl font-bold text-sm md:text-base px-6 py-3 md:px-8 md:py-4 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 bg-game-lavender/50 text-foreground/60 mt-2 md:mt-4"
          onClick={() => setScreen("worldMap")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue Playing
        </motion.button>
      </motion.div>
    </div>
  );
}

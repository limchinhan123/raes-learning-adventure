import { motion, AnimatePresence } from "framer-motion";
import { ASSETS, getRandomMessage, CHARACTER_MESSAGES, VEGGIE_MESSAGES } from "@shared/gameConfig";
import { useGame } from "@/contexts/GameContext";
import CharacterDisplay from "@/components/CharacterDisplay";
import { useState, useEffect } from "react";
import { useTTS } from "@/hooks/useTTS";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function RewardScreen() {
  const { setScreen, currentWorld, currentLevel, score, activeCharacter, totalStars } = useGame();
  const [showHearts, setShowHearts] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showVeggie, setShowVeggie] = useState(false);
  const { speakForCharacter } = useTTS();
  const { playCelebration } = useSoundEffects();

  const [bigBigLoveMsg] = useState(() => getRandomMessage(CHARACTER_MESSAGES.bigBigLove));
  const [veggieMsg] = useState(() => getRandomMessage(VEGGIE_MESSAGES));

  useEffect(() => {
    // Play celebration sound immediately
    playCelebration();

    const t1 = setTimeout(() => setShowHearts(true), 500);
    const t2 = setTimeout(() => {
      setShowMessage(true);
      // Speak the Big Big Love message
      speakForCharacter(bigBigLoveMsg, activeCharacter);
    }, 1200);
    const t3 = setTimeout(() => setShowVeggie(true), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fce4ec 0%, #f8bbd0 40%, #f3e5f5 100%)" }}>

      {/* Floating hearts */}
      <AnimatePresence>
        {showHearts && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl pointer-events-none select-none"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
              y: (typeof window !== "undefined" ? window.innerHeight : 600) + 50,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: -100,
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 0.8],
              rotate: [0, 20, -20, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            {["💕", "💗", "💖", "🩷", "✨", "⭐"][i % 6]}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center gap-6 z-10 px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Characters celebrating */}
        <CharacterDisplay character={activeCharacter} celebrating size="xl" />

        {/* Big Big Love Heart */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        >
          <img
            src={ASSETS.bigBigLoveHeart}
            alt="Big Big Love"
            className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-xl"
          />
        </motion.div>

        {/* Message */}
        {showMessage && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="game-title text-3xl md:text-4xl text-game-pink-dark mb-2">
              Big Big Love!
            </h2>
            <p className="text-lg text-game-pink-dark/70 font-medium max-w-md">
              {bigBigLoveMsg}
            </p>
          </motion.div>
        )}

        {/* Stars earned */}
        <motion.div
          className="flex gap-3 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[1, 2, 3].map(s => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.5 + s * 0.2, type: "spring" }}
            >
              <img
                src={ASSETS.starReward}
                alt="Star"
                className={`w-12 h-12 ${s <= Math.min(3, Math.ceil(score / 33)) ? "" : "opacity-30 grayscale"}`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Veggie encouragement */}
        {showVeggie && (
          <motion.div
            className="bg-white/70 rounded-2xl px-6 py-3 max-w-md text-center shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-game-pink-dark/60 italic">
              🥦 {veggieMsg}
            </p>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          className="flex gap-4 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.button
            className="rounded-2xl font-bold text-lg px-8 py-4 transition-all duration-200 shadow-md hover:shadow-lg bg-game-lavender text-foreground"
            onClick={() => setScreen("levelSelect")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            More Levels
          </motion.button>
          <motion.button
            className="rounded-2xl font-bold text-lg px-8 py-4 transition-all duration-200 shadow-md hover:shadow-lg bg-game-pink text-white hover:bg-game-pink-dark"
            onClick={() => setScreen("worldMap")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            World Map
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

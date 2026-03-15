import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { ASSETS, getRandomMessage, CHARACTER_MESSAGES, type CharacterType } from "@shared/gameConfig";
import CharacterDisplay from "@/components/CharacterDisplay";
import { useTTS } from "@/hooks/useTTS";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useGame } from "@/contexts/GameContext";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  content: string;
  emoji: string;
  speed: number;
  isGood: boolean;
}

interface MotorGameProps {
  difficulty: number;
  character: CharacterType;
  onComplete: (stars: number, score: number) => void;
}

const GOOD_ITEMS = [
  { content: "Broccoli", emoji: "🥦" },
  { content: "Carrot", emoji: "🥕" },
  { content: "Apple", emoji: "🍎" },
  { content: "Fish", emoji: "🐟" },
  { content: "Egg", emoji: "🥚" },
  { content: "Banana", emoji: "🍌" },
  { content: "Star", emoji: "⭐" },
  { content: "Heart", emoji: "💕" },
  { content: "A", emoji: "🅰️" },
  { content: "B", emoji: "🅱️" },
  { content: "1", emoji: "1️⃣" },
  { content: "2", emoji: "2️⃣" },
  { content: "Milk", emoji: "🥛" },
  { content: "Corn", emoji: "🌽" },
  { content: "Grape", emoji: "🍇" },
];

const PLAYER_WIDTH = 15;

export default function MotorGame({ difficulty, character, onComplete }: MotorGameProps) {
  const { isMobile } = useGame();
  const [playerX, setPlayerX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [totalItems] = useState(10 + difficulty * 2);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const touchDirRef = useRef<"left" | "right" | null>(null);
  const itemIdRef = useRef(0);
  const playerXRef = useRef(50);
  const { speakForCharacter } = useTTS();
  const { playCorrect, playClick } = useSoundEffects();

  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 800);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameActive) {
      setGameActive(true);
      const msg = isMobile
        ? "Catch the healthy food! Tap left or right!"
        : "Catch the healthy food! Use A and L keys!";
      speakForCharacter(msg, character);
    }
  }, [countdown, gameActive]);

  // Spawn items
  useEffect(() => {
    if (!gameActive || spawnedCount >= totalItems) return;

    const interval = setInterval(() => {
      setSpawnedCount(prev => {
        if (prev >= totalItems) return prev;

        const goodItem = GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)];
        const item: FallingItem = {
          id: itemIdRef.current++,
          x: 10 + Math.random() * 80,
          y: -10,
          content: goodItem.content,
          emoji: goodItem.emoji,
          speed: 0.35 + difficulty * 0.08 + Math.random() * 0.15,
          isGood: true,
        };

        setItems(prevItems => [...prevItems, item]);
        return prev + 1;
      });
    }, Math.max(1200, 2800 - difficulty * 120));

    return () => clearInterval(interval);
  }, [gameActive, spawnedCount, totalItems, difficulty]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.add(key);
      if (key === "a" || key === "l") playClick();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((dir: "left" | "right") => {
    touchDirRef.current = dir;
    playClick();
  }, [playClick]);

  const handleTouchEnd = useCallback(() => {
    touchDirRef.current = null;
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 16;
      lastTimeRef.current = timestamp;

      const moveSpeed = 3.5 + difficulty * 0.3;
      const moveLeft = keysRef.current.has("a") || keysRef.current.has("arrowleft") || touchDirRef.current === "left";
      const moveRight = keysRef.current.has("l") || keysRef.current.has("arrowright") || touchDirRef.current === "right";

      if (moveLeft) {
        setPlayerX(prev => Math.max(PLAYER_WIDTH / 2, prev - moveSpeed * delta));
      }
      if (moveRight) {
        setPlayerX(prev => Math.min(100 - PLAYER_WIDTH / 2, prev + moveSpeed * delta));
      }

      setItems(prevItems => {
        const remaining: FallingItem[] = [];
        let newMissed = 0;

        for (const item of prevItems) {
          const newY = item.y + item.speed * delta;
          if (newY > 100) {
            newMissed++;
            continue;
          }
          remaining.push({ ...item, y: newY });
        }

        if (newMissed > 0) {
          setMissed(prev => prev + newMissed);
        }

        return remaining;
      });

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameActive, difficulty]);

  // Collision detection
  useEffect(() => {
    if (!gameActive) return;

    const checkCollisions = setInterval(() => {
      setItems(prevItems => {
        const remaining: FallingItem[] = [];
        let caughtThisTick = 0;

        for (const item of prevItems) {
          if (item.y >= 78 && item.y <= 95) {
            const distance = Math.abs(item.x - playerXRef.current);
            if (distance < PLAYER_WIDTH / 2 + 5) {
              caughtThisTick++;
              continue;
            }
          }
          remaining.push(item);
        }

        if (caughtThisTick > 0) {
          setCaught(prev => prev + caughtThisTick);
          setScore(prev => prev + caughtThisTick * 10);
          playCorrect();
          setShowFeedback(getRandomMessage(CHARACTER_MESSAGES.correct));
          setTimeout(() => setShowFeedback(null), 800);
        }

        return remaining;
      });
    }, 100);

    return () => clearInterval(checkCollisions);
  }, [gameActive]);

  // Check completion
  useEffect(() => {
    if (spawnedCount >= totalItems && items.length === 0 && !isComplete && gameActive) {
      setGameActive(false);
      setIsComplete(true);
      const percentage = totalItems > 0 ? (caught / totalItems) * 100 : 0;
      const stars = percentage >= 70 ? 3 : percentage >= 40 ? 2 : 1;
      const msg = getRandomMessage(CHARACTER_MESSAGES.bigBigLove);
      speakForCharacter(msg, character);
      setTimeout(() => onComplete(stars, Math.round(percentage)), 1000);
    }
  }, [spawnedCount, items.length, totalItems, caught, isComplete, gameActive]);

  const displayChar = character === "both" ? "penguin" : character;

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto px-2 md:px-4">
      {/* Score bar */}
      <div className="w-full flex items-center justify-between">
        <span className="text-xs md:text-sm font-bold text-game-pink-dark/60">
          Caught: {caught}/{totalItems}
        </span>
        <div className="flex-1 mx-3 bg-game-pink-light/50 rounded-full h-2.5 md:h-3">
          <motion.div
            className="bg-game-peach rounded-full h-2.5 md:h-3"
            animate={{ width: `${(caught / totalItems) * 100}%` }}
          />
        </div>
        <span className="text-xs md:text-sm font-bold text-amber-600">Score: {score}</span>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="relative w-full rounded-3xl overflow-hidden shadow-inner border-2 border-game-pink/20"
        style={{
          height: isMobile ? "50vh" : "55vh",
          maxHeight: "500px",
          background: "linear-gradient(180deg, #e8f4fd 0%, #fce4ec 70%, #f8bbd0 100%)",
        }}
      >
        {/* Countdown overlay */}
        {countdown > 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-30 bg-white/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="text-center"
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <CharacterDisplay character={character} size="lg" showRae />
              <span className="game-title text-5xl md:text-6xl text-game-pink-dark block mt-4">
                {countdown}
              </span>
              <p className="text-base md:text-lg text-foreground/60 mt-2">Get ready!</p>
            </motion.div>
          </motion.div>
        )}

        {/* Falling items */}
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              className="absolute text-2xl md:text-3xl pointer-events-none select-none"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Player character */}
        <motion.div
          className="absolute bottom-2 flex flex-col items-center"
          style={{
            left: `${playerX}%`,
            transform: "translateX(-50%)",
            width: `${PLAYER_WIDTH}%`,
          }}
          animate={{ left: `${playerX}%` }}
          transition={{ duration: 0.05 }}
        >
          <div className="w-full h-3 bg-game-pink/60 rounded-full mb-1 shadow-sm" />
          <img
            src={displayChar === "penguin" ? ASSETS.penguin : ASSETS.jellycat}
            alt={displayChar === "penguin" ? "Penguin" : "Jelly Cat"}
            className="w-14 h-14 md:w-16 md:h-16 object-contain"
          />
        </motion.div>

        {/* Feedback popup */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-game-mint/90 rounded-2xl px-4 py-2 shadow-lg pointer-events-none z-20"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <span className="text-sm font-bold text-foreground/80">🌟 {showFeedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-game-pink/30" />
      </div>

      {/* Controls */}
      {isMobile ? (
        /* Mobile: tap left/right with arrow icons */
        <div className="w-full flex gap-3 mt-1">
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-white/80 border-2 border-game-pink/30 rounded-2xl py-4 md:py-5 shadow-md active:bg-game-pink-light active:scale-95 transition-all select-none"
            onTouchStart={() => handleTouchStart("left")}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart("left")}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            <span className="text-3xl md:text-4xl">⬅️</span>
            <span className="text-base md:text-lg font-bold text-game-pink-dark">Left</span>
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-white/80 border-2 border-game-pink/30 rounded-2xl py-4 md:py-5 shadow-md active:bg-game-pink-light active:scale-95 transition-all select-none"
            onTouchStart={() => handleTouchStart("right")}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart("right")}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            <span className="text-base md:text-lg font-bold text-game-pink-dark">Right</span>
            <span className="text-3xl md:text-4xl">➡️</span>
          </button>
        </div>
      ) : (
        /* Desktop: keyboard hints */
        <div className="flex items-center gap-6 text-sm text-foreground/50">
          <div className="flex items-center gap-2">
            <kbd className="bg-white/80 border border-game-pink/30 rounded-lg px-3 py-1.5 font-bold text-game-pink-dark shadow-sm">
              A
            </kbd>
            <span>Move Left</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-white/80 border border-game-pink/30 rounded-lg px-3 py-1.5 font-bold text-game-pink-dark shadow-sm">
              L
            </kbd>
            <span>Move Right</span>
          </div>
        </div>
      )}
    </div>
  );
}

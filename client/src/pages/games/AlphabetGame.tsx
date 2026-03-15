import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { getWordsForDifficulty, getRandomMessage, CHARACTER_MESSAGES, type CharacterType } from "@shared/gameConfig";
import CharacterDisplay from "@/components/CharacterDisplay";
import { trpc } from "@/lib/trpc";
import { useTTS } from "@/hooks/useTTS";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useGame } from "@/contexts/GameContext";

interface AlphabetGameProps {
  difficulty: number;
  character: CharacterType;
  onComplete: (stars: number, score: number) => void;
}

export default function AlphabetGame({ difficulty, character, onComplete }: AlphabetGameProps) {
  const { isMobile } = useGame();
  const [currentWord, setCurrentWord] = useState("");
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(Math.min(3 + Math.floor(difficulty / 3), 6));
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [hint, setHint] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { speakForCharacter } = useTTS();
  const { playCorrect, playWrong, playKeyPress } = useSoundEffects();

  const generateChallenge = trpc.game.generateAlphabetChallenge.useMutation();

  const aiWordsRef = useRef<Array<{ word: string; hint: string }>>([]);
  const usedWordsRef = useRef<Set<string>>(new Set());
  const fetchAIWord = useCallback(async () => {
    try {
      const result = await generateChallenge.mutateAsync({ difficulty });
      if (result.word && result.word.length > 0) {
        const w = result.word.toUpperCase();
        if (!usedWordsRef.current.has(w)) {
          aiWordsRef.current.push({ word: w, hint: result.hint || "" });
          usedWordsRef.current.add(w);
        }
      }
    } catch {
      // ignore
    }
  }, [difficulty]);

  useEffect(() => {
    const words = getWordsForDifficulty(difficulty);

    // Try AI word first (skip if already used)
    let chosen = "";
    let chosenHint = "";
    while (aiWordsRef.current.length > 0) {
      const aiData = aiWordsRef.current.shift()!;
      if (!usedWordsRef.current.has(aiData.word) || usedWordsRef.current.size > words.length) {
        chosen = aiData.word;
        chosenHint = aiData.hint;
        break;
      }
    }

    // Fallback: pick a random word not yet used
    if (!chosen) {
      const unused = words.filter(w => !usedWordsRef.current.has(w));
      const pool = unused.length > 0 ? unused : words;
      chosen = pool[Math.floor(Math.random() * pool.length)];
      chosenHint = "";
    }

    usedWordsRef.current.add(chosen);
    setCurrentWord(chosen);
    setHint(chosenHint);
    setTypedLetters([]);
    setCurrentIndex(0);
    setIsLoading(false);

    fetchAIWord();
  }, [round, difficulty]);

  useEffect(() => {
    if (currentWord && !isLoading) {
      const timer = setTimeout(() => {
        const charForVoice = character === "both" ? (Math.random() > 0.5 ? "penguin" : "jellycat") : character;
        speakForCharacter(`Can you spell ${currentWord}?`, charForVoice as any);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentWord, isLoading, round]);

  useEffect(() => {
    containerRef.current?.focus();
  }, [currentWord]);

  // Handle letter input (from keyboard or touch)
  const handleLetterInput = useCallback((key: string) => {
    if (!currentWord || isComplete || isLoading || showFeedback) return;

    const letter = key.toUpperCase();
    if (letter.length !== 1 || letter < "A" || letter > "Z") return;

    if (letter === currentWord[currentIndex]) {
      playKeyPress();
      const newTyped = [...typedLetters, letter];
      setTypedLetters(newTyped);
      setCurrentIndex(prev => prev + 1);

      if (newTyped.length === currentWord.length) {
        setCorrectCount(prev => prev + 1);
        setShowFeedback("correct");
        const msg = getRandomMessage(CHARACTER_MESSAGES.correct);
        setFeedbackMessage(msg);
        playCorrect();
        speakForCharacter(msg, character);

        setTimeout(() => {
          setShowFeedback(null);
          if (round >= totalRounds) {
            setIsComplete(true);
          } else {
            setRound(prev => prev + 1);
          }
        }, 1500);
      }
    } else {
      setShowFeedback("wrong");
      const msg = getRandomMessage(CHARACTER_MESSAGES.encouragement);
      setFeedbackMessage(msg);
      playWrong();
      setTimeout(() => setShowFeedback(null), 1200);
    }
  }, [currentWord, currentIndex, typedLetters, round, totalRounds, isComplete, showFeedback, isLoading, character]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleLetterInput(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLetterInput]);

  useEffect(() => {
    if (isComplete) {
      const percentage = (correctCount / totalRounds) * 100;
      const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1;
      setTimeout(() => onComplete(stars, Math.round(percentage)), 500);
    }
  }, [isComplete]);

  // On-screen keyboard for mobile
  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  // Highlight the next expected letter
  const nextLetter = currentWord && currentIndex < currentWord.length ? currentWord[currentIndex] : "";

  return (
    <div
      className="flex flex-col items-center gap-3 md:gap-5 w-full max-w-2xl mx-auto px-3 md:px-4 outline-none"
      ref={containerRef}
      tabIndex={0}
    >
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <span className="text-xs md:text-sm font-bold text-game-pink-dark/60">
          {round}/{totalRounds}
        </span>
        <div className="flex-1 bg-game-pink-light/50 rounded-full h-2.5 md:h-3">
          <motion.div
            className="bg-game-pink rounded-full h-2.5 md:h-3"
            animate={{ width: `${(round / totalRounds) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Character with Rae */}
      <CharacterDisplay character={character} celebrating={showFeedback === "correct"} size={isMobile ? "md" : "lg"} showRae />

      {/* Hint */}
      {hint && (
        <motion.p
          className="text-sm md:text-base text-foreground/50 italic text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {hint}
        </motion.p>
      )}

      {/* Loading state */}
      {isLoading ? (
        <motion.div
          className="flex items-center gap-2 text-game-pink-dark/60"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-2xl">✨</span>
          <span className="font-bold">Getting ready...</span>
        </motion.div>
      ) : (
        <>
          {/* Word display */}
          <div className="flex gap-1.5 md:gap-3 flex-wrap justify-center">
            {currentWord.split("").map((letter, i) => (
              <motion.div
                key={`${round}-${i}`}
                className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl font-bold shadow-md border-2 transition-all ${
                  i < currentIndex
                    ? "bg-game-pink text-white border-game-pink-dark"
                    : i === currentIndex
                    ? "bg-white border-game-pink animate-pulse-soft"
                    : "bg-white/60 border-game-pink-light/50"
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                {i < currentIndex ? (
                  <span>{typedLetters[i]}</span>
                ) : i === currentIndex ? (
                  <span className="text-game-pink/30 text-2xl md:text-3xl">{letter}</span>
                ) : (
                  <span className="text-game-pink-light/50">_</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Current letter prompt */}
          {currentWord && currentIndex < currentWord.length && (
            <motion.div
              className="text-center"
              key={`prompt-${round}-${currentIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-base md:text-xl text-foreground/60">
                {isMobile ? "Tap" : "Press"} the letter{" "}
                <span className="text-2xl md:text-3xl font-bold text-game-pink-dark">
                  {currentWord[currentIndex]}
                </span>
              </p>
            </motion.div>
          )}
        </>
      )}

      {/* Feedback overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`rounded-3xl px-6 py-5 md:px-8 md:py-6 text-center shadow-xl ${
                showFeedback === "correct" ? "bg-game-mint/95" : "bg-game-peach/95"
              }`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <CharacterDisplay character={character} celebrating={showFeedback === "correct"} size="sm" showRae />
              <span className="text-3xl md:text-4xl mb-2 block">
                {showFeedback === "correct" ? "🌟" : "💪"}
              </span>
              <p className="text-base md:text-lg font-bold text-foreground/80">
                {feedbackMessage}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* On-screen keyboard for mobile, keyboard hint for desktop */}
      {isMobile ? (
        <div className="w-full flex flex-col gap-1.5 mt-1">
          {keyboardRows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1">
              {row.map(letter => {
                const isNext = letter === nextLetter;
                return (
                  <motion.button
                    key={letter}
                    className={`rounded-lg font-bold text-sm py-2.5 shadow-sm border transition-all select-none ${
                      isNext
                        ? "bg-game-pink text-white border-game-pink-dark scale-110 shadow-md"
                        : "bg-white/90 text-game-pink-dark border-game-pink/20 active:bg-game-pink-light"
                    }`}
                    style={{ width: `${100 / (row.length + 1)}%`, maxWidth: "42px" }}
                    onClick={() => handleLetterInput(letter)}
                    whileTap={{ scale: 0.9 }}
                    animate={isNext ? { y: [0, -2, 0] } : {}}
                    transition={isNext ? { duration: 1, repeat: Infinity } : {}}
                  >
                    {letter}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="bg-white/50 rounded-2xl px-6 py-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-foreground/40">
            Find the letter on your keyboard and press it!
          </p>
        </motion.div>
      )}
    </div>
  );
}

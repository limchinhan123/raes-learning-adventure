import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { getRandomMessage, CHARACTER_MESSAGES, type CharacterType } from "@shared/gameConfig";
import CharacterDisplay from "@/components/CharacterDisplay";
import { useTTS } from "@/hooks/useTTS";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useGame } from "@/contexts/GameContext";

interface MathProblem {
  num1: number;
  num2: number;
  operator: "+" | "-";
  answer: number;
  display: string;
}

interface MathGameProps {
  difficulty: number;
  character: CharacterType;
  onComplete: (stars: number, score: number) => void;
}

function generateLocalProblem(difficulty: number): MathProblem {
  const maxNum = Math.min(2 + difficulty, 10);
  const isAddition = Math.random() > 0.4 || difficulty <= 2;

  if (isAddition) {
    const num1 = Math.floor(Math.random() * maxNum) + 1;
    const num2 = Math.floor(Math.random() * Math.max(1, maxNum - num1)) + 1;
    return {
      num1, num2, operator: "+",
      answer: num1 + num2,
      display: `${num1} + ${num2} = ?`,
    };
  } else {
    const answer = Math.floor(Math.random() * (maxNum - 1)) + 1;
    const num2 = Math.floor(Math.random() * answer) + 1;
    const num1 = answer + num2;
    return {
      num1, num2, operator: "-",
      answer,
      display: `${num1} - ${num2} = ?`,
    };
  }
}

function NumberBlocks({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex flex-wrap gap-1 justify-center max-w-[120px] md:max-w-[140px]">
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="w-6 h-6 md:w-8 md:h-8 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.08, type: "spring" }}
        >
          {i + 1}
        </motion.div>
      ))}
    </div>
  );
}

export default function MathGame({ difficulty, character, onComplete }: MathGameProps) {
  const { isMobile } = useGame();
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(Math.min(3 + Math.floor(difficulty / 3), 6));
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState<"correct" | "wrong" | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const { speakForCharacter } = useTTS();
  const { playCorrect, playWrong, playClick } = useSoundEffects();

  const generateProblemAndOptions = useCallback(() => {
    const prob = generateLocalProblem(difficulty);

    const opts = new Set<number>([prob.answer]);
    while (opts.size < 3) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const opt = Math.max(0, prob.answer + offset);
      if (opt !== prob.answer) opts.add(opt);
    }
    const shuffled = Array.from(opts).sort(() => Math.random() - 0.5);

    setProblem(prob);
    setOptions(shuffled);
    setSelectedAnswer(null);
  }, [difficulty]);

  useEffect(() => {
    generateProblemAndOptions();
  }, [round, generateProblemAndOptions]);

  useEffect(() => {
    if (problem) {
      const timer = setTimeout(() => {
        const opWord = problem.operator === "+" ? "plus" : "minus";
        speakForCharacter(`What is ${problem.num1} ${opWord} ${problem.num2}?`, character);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [problem, round]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || showFeedback || !problem) return;

      const num = parseInt(e.key);
      if (!isNaN(num) && options.includes(num)) {
        handleAnswer(num);
        return;
      }
      if (e.key >= "1" && e.key <= "3") {
        const idx = parseInt(e.key) - 1;
        if (idx < options.length) {
          handleAnswer(options[idx]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [problem, options, isComplete, showFeedback]);

  const handleAnswer = (answer: number) => {
    if (showFeedback || !problem) return;
    setSelectedAnswer(answer);
    playClick();

    if (answer === problem.answer) {
      setCorrectCount(prev => prev + 1);
      setShowFeedback("correct");
      const msg = getRandomMessage(CHARACTER_MESSAGES.correct);
      setFeedbackMessage(msg);
      playCorrect();
      speakForCharacter(msg, character);
    } else {
      setShowFeedback("wrong");
      const msg = getRandomMessage(CHARACTER_MESSAGES.encouragement);
      setFeedbackMessage(msg);
      playWrong();
    }

    setTimeout(() => {
      setShowFeedback(null);
      if (round >= totalRounds) {
        setIsComplete(true);
      } else {
        setRound(prev => prev + 1);
      }
    }, 1500);
  };

  useEffect(() => {
    if (isComplete) {
      const percentage = (correctCount / totalRounds) * 100;
      const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1;
      setTimeout(() => onComplete(stars, Math.round(percentage)), 500);
    }
  }, [isComplete]);

  if (!problem) return null;

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-2xl mx-auto px-3 md:px-4">
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <span className="text-xs md:text-sm font-bold text-game-pink-dark/60">{round}/{totalRounds}</span>
        <div className="flex-1 bg-game-pink-light/50 rounded-full h-2.5 md:h-3">
          <motion.div
            className="bg-game-mint rounded-full h-2.5 md:h-3"
            animate={{ width: `${(round / totalRounds) * 100}%` }}
          />
        </div>
      </div>

      {/* Character with Rae */}
      <CharacterDisplay character={character} celebrating={showFeedback === "correct"} size={isMobile ? "md" : "lg"} showRae />

      {/* Visual number blocks */}
      <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
        <NumberBlocks count={problem.num1} color="#f8a4b8" />
        <span className="text-3xl md:text-4xl font-bold text-game-pink-dark">
          {problem.operator}
        </span>
        <NumberBlocks count={problem.num2} color="#a8d8ea" />
        <span className="text-3xl md:text-4xl font-bold text-game-pink-dark">=</span>
        <span className="text-4xl md:text-5xl font-bold text-game-pink-dark">?</span>
      </div>

      {/* Problem text */}
      <motion.h2
        className="game-title text-2xl md:text-4xl text-game-pink-dark"
        key={round}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {problem.display}
      </motion.h2>

      {/* Answer options - bigger on mobile for easy tapping */}
      <div className="flex gap-3 md:gap-4">
        {options.map((opt, i) => (
          <motion.button
            key={`${round}-${i}-${opt}`}
            className={`w-18 h-18 md:w-20 md:h-20 rounded-2xl text-2xl md:text-3xl font-bold shadow-lg border-2 transition-all ${
              selectedAnswer === opt
                ? opt === problem.answer
                  ? "bg-game-mint border-green-400 text-white"
                  : "bg-game-coral border-red-300 text-white"
                : "bg-white border-game-pink/30 text-game-pink-dark hover:border-game-pink hover:shadow-xl active:scale-95"
            }`}
            style={{ width: isMobile ? "5rem" : undefined, height: isMobile ? "5rem" : undefined }}
            onClick={() => handleAnswer(opt)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs md:text-sm text-foreground/40">
        {isMobile ? "Tap the correct answer!" : "Press the number or tap the answer!"}
      </p>

      {/* Feedback */}
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
              <p className="text-base md:text-lg font-bold text-foreground/80">{feedbackMessage}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

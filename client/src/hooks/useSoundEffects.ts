import { useCallback, useRef } from "react";
import { useGame } from "@/contexts/GameContext";

// Generate simple sound effects using Web Audio API
function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

export function useSoundEffects() {
  const { soundEnabled } = useGame();
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) => {
    if (!soundEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    // Resume if suspended (autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, [soundEnabled, getContext]);

  // Gentle correct answer chime
  const playCorrect = useCallback(() => {
    playTone(523, 0.15, "sine", 0.12); // C5
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 100); // E5
    setTimeout(() => playTone(784, 0.3, "sine", 0.1), 200); // G5
  }, [playTone]);

  // Soft wrong answer sound
  const playWrong = useCallback(() => {
    playTone(330, 0.2, "sine", 0.08); // E4
    setTimeout(() => playTone(294, 0.3, "sine", 0.06), 150); // D4
  }, [playTone]);

  // Level complete celebration
  const playCelebration = useCallback(() => {
    const notes = [523, 587, 659, 784, 880, 1047]; // C5 to C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "sine", 0.1), i * 100);
    });
  }, [playTone]);

  // Catch item sound
  const playCatch = useCallback(() => {
    playTone(880, 0.1, "sine", 0.1);
  }, [playTone]);

  // Button click
  const playClick = useCallback(() => {
    playTone(440, 0.08, "sine", 0.06);
  }, [playTone]);

  // Key press
  const playKeyPress = useCallback(() => {
    playTone(600 + Math.random() * 200, 0.08, "sine", 0.05);
  }, [playTone]);

  return {
    playCorrect,
    playWrong,
    playCelebration,
    playCatch,
    playClick,
    playKeyPress,
  };
}

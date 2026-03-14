import { useCallback, useRef, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";

/**
 * Generates gentle ambient background music using Web Audio API.
 * The music is soft and soothing, with tempo that can adjust based on game state.
 */
export function useBackgroundMusic() {
  const { soundEnabled } = useGame();
  const ctxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainRef.current = ctxRef.current.createGain();
        gainRef.current.gain.setValueAtTime(0.04, ctxRef.current.currentTime);
        gainRef.current.connect(ctxRef.current.destination);
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  }, []);

  const playNote = useCallback((frequency: number, duration: number, delay: number = 0, volume: number = 0.04) => {
    const ctx = getContext();
    if (!ctx || !gainRef.current) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

    noteGain.gain.setValueAtTime(0, ctx.currentTime + delay);
    noteGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.1);
    noteGain.gain.linearRampToValueAtTime(volume * 0.6, ctx.currentTime + delay + duration * 0.7);
    noteGain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

    osc.connect(noteGain);
    noteGain.connect(gainRef.current);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  }, [getContext]);

  // Gentle pentatonic melody patterns
  const melodyPatterns = useRef([
    [523, 587, 659, 784, 880], // C5 pentatonic
    [392, 440, 523, 587, 659], // G4 pentatonic
    [330, 392, 440, 523, 587], // E4 pentatonic
  ]);

  const playAmbientLoop = useCallback((tempo: "calm" | "medium" | "upbeat" = "calm") => {
    const tempoMs = tempo === "calm" ? 2000 : tempo === "medium" ? 1500 : 1200;
    const volume = tempo === "calm" ? 0.025 : tempo === "medium" ? 0.03 : 0.035;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let noteIndex = 0;
    let patternIndex = 0;

    const playNextNote = () => {
      const pattern = melodyPatterns.current[patternIndex];
      const freq = pattern[noteIndex % pattern.length];

      // Play melody note
      playNote(freq, tempoMs / 1000 * 0.8, 0, volume);

      // Occasionally play a harmony note
      if (Math.random() > 0.6) {
        playNote(freq * 0.5, tempoMs / 1000 * 1.2, 0, volume * 0.4);
      }

      noteIndex++;
      if (noteIndex >= pattern.length) {
        noteIndex = 0;
        patternIndex = (patternIndex + 1) % melodyPatterns.current.length;
      }
    };

    playNextNote();
    intervalRef.current = setInterval(playNextNote, tempoMs);
    isPlayingRef.current = true;
  }, [playNote]);

  const stopMusic = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPlayingRef.current = false;
  }, []);

  const setTempo = useCallback((tempo: "calm" | "medium" | "upbeat") => {
    if (isPlayingRef.current) {
      playAmbientLoop(tempo);
    }
  }, [playAmbientLoop]);

  // Stop music when sound is disabled
  useEffect(() => {
    if (!soundEnabled) {
      stopMusic();
    }
  }, [soundEnabled, stopMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, [stopMusic]);

  return {
    startMusic: playAmbientLoop,
    stopMusic,
    setTempo,
    isPlaying: isPlayingRef.current,
  };
}

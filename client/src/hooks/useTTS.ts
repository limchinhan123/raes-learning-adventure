import { useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useGame } from "@/contexts/GameContext";
import type { CharacterType } from "@shared/gameConfig";

export function useTTS() {
  const { soundEnabled } = useGame();
  const speakMutation = trpc.game.speak.useMutation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const speak = useCallback(async (text: string, character: "penguin" | "jellycat" = "penguin") => {
    if (!soundEnabled) return;

    const cacheKey = `${character}-${text}`;
    let audioUrl = cacheRef.current.get(cacheKey);

    if (!audioUrl) {
      try {
        const result = await speakMutation.mutateAsync({ text, character });
        if (result.audioUrl) {
          audioUrl = result.audioUrl;
          cacheRef.current.set(cacheKey, audioUrl);
        }
      } catch (e) {
        console.error("TTS error:", e);
        return;
      }
    }

    if (audioUrl) {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      audioRef.current = audio;
      try {
        await audio.play();
      } catch (e) {
        // Autoplay may be blocked
        console.warn("Audio play blocked:", e);
      }
    }
  }, [soundEnabled, speakMutation]);

  const speakForCharacter = useCallback(async (text: string, characterType: CharacterType) => {
    if (characterType === "both") {
      // Alternate between characters
      await speak(text, Math.random() > 0.5 ? "penguin" : "jellycat");
    } else {
      await speak(text, characterType);
    }
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { speak, speakForCharacter, stopSpeaking, isSpeaking: speakMutation.isPending };
}

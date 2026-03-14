import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useCallback } from "react";
import { ASSETS } from "@shared/gameConfig";

interface WanderingCharacterProps {
  character: "penguin" | "jellycat" | "rae";
  celebrating?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  bounds?: { width: number; height: number };
  startPosition?: { x: number; y: number };
  className?: string;
}

const sizeMap = {
  sm: { class: "w-20 h-20", px: 80 },
  md: { class: "w-28 h-28", px: 112 },
  lg: { class: "w-36 h-36", px: 144 },
  xl: { class: "w-48 h-48", px: 192 },
};

function getImage(char: "penguin" | "jellycat" | "rae", celebrating: boolean) {
  if (char === "rae") {
    return celebrating ? ASSETS.raeCelebrating : ASSETS.rae;
  }
  if (celebrating) {
    return char === "penguin" ? ASSETS.penguinCelebrating : ASSETS.jellycatCelebrating;
  }
  return char === "penguin" ? ASSETS.penguin : ASSETS.jellycat;
}

function getAlt(char: "penguin" | "jellycat" | "rae") {
  if (char === "rae") return "Rae";
  return char === "penguin" ? "Penguin" : "Jelly Cat";
}

export default function WanderingCharacter({
  character,
  celebrating = false,
  size = "md",
  bounds,
  startPosition,
  className = "",
}: WanderingCharacterProps) {
  const controls = useAnimation();
  const posRef = useRef(startPosition || { x: 0, y: 0 });
  const sizeInfo = sizeMap[size];
  const wanderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wander = useCallback(async () => {
    if (celebrating) return;

    const maxX = bounds ? bounds.width - sizeInfo.px : 200;
    const maxY = bounds ? bounds.height - sizeInfo.px : 100;

    // Random new position within bounds
    const newX = Math.random() * maxX - maxX / 2;
    const newY = Math.random() * maxY * 0.4 - maxY * 0.2;

    posRef.current = { x: newX, y: newY };

    // Determine if character should flip (face direction of movement)
    const flipX = newX < 0 ? 1 : -1;

    await controls.start({
      x: newX,
      y: newY,
      scaleX: flipX,
      transition: {
        duration: 3 + Math.random() * 2,
        ease: "easeInOut",
      },
    });

    // Wait a bit then wander again
    wanderTimeoutRef.current = setTimeout(wander, 2000 + Math.random() * 3000);
  }, [controls, bounds, sizeInfo.px, celebrating]);

  useEffect(() => {
    if (celebrating) {
      controls.start({
        y: [0, -20, 0],
        rotate: [0, -8, 8, 0],
        transition: { duration: 0.6, repeat: Infinity },
      });
      return;
    }

    // Start wandering after a random delay
    const initialDelay = setTimeout(wander, 1000 + Math.random() * 2000);

    return () => {
      clearTimeout(initialDelay);
      if (wanderTimeoutRef.current) clearTimeout(wanderTimeoutRef.current);
    };
  }, [celebrating, wander, controls]);

  // Idle bobbing animation
  const bobVariants = {
    idle: {
      y: [0, -8, 0],
      transition: {
        duration: 2.5 + Math.random(),
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <motion.div
      className={`relative ${className}`}
      animate={controls}
      initial={startPosition || { x: 0, y: 0 }}
      style={{ display: "inline-block" }}
    >
      <motion.img
        src={getImage(character, celebrating)}
        alt={getAlt(character)}
        className={`${sizeInfo.class} object-contain drop-shadow-lg pointer-events-none select-none`}
        variants={bobVariants}
        animate="idle"
      />
    </motion.div>
  );
}

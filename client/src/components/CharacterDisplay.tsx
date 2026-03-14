import { motion } from "framer-motion";
import { ASSETS, type CharacterType } from "@shared/gameConfig";

interface CharacterDisplayProps {
  character: CharacterType;
  celebrating?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showRae?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16 md:w-20 md:h-20",
  md: "w-24 h-24 md:w-32 md:h-32",
  lg: "w-32 h-32 md:w-40 md:h-40",
  xl: "w-40 h-40 md:w-52 md:h-52",
};

function CharacterImage({
  src,
  alt,
  sizeClass,
  celebrating,
  delay = 0,
}: {
  src: string;
  alt: string;
  sizeClass: string;
  celebrating: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className="relative"
      animate={
        celebrating
          ? { y: [0, -15, 0], rotate: [0, -5, 5, 0] }
          : { y: [0, -6, 0] }
      }
      transition={
        celebrating
          ? { duration: 0.5, repeat: Infinity, delay }
          : { duration: 2.5 + delay, repeat: Infinity, ease: "easeInOut" as const }
      }
    >
      <motion.img
        src={src}
        alt={alt}
        className={`${sizeClass} object-contain drop-shadow-lg pointer-events-none select-none`}
      />
    </motion.div>
  );
}

export default function CharacterDisplay({
  character,
  celebrating = false,
  size = "md",
  showRae = false,
  className = "",
}: CharacterDisplayProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={`flex items-end justify-center gap-2 md:gap-4 ${className}`}>
      {(character === "penguin" || character === "both") && (
        <CharacterImage
          src={celebrating ? ASSETS.penguinCelebrating : ASSETS.penguin}
          alt="Penguin"
          sizeClass={sizeClass}
          celebrating={celebrating}
          delay={0}
        />
      )}

      {showRae && (
        <CharacterImage
          src={celebrating ? ASSETS.raeCelebrating : ASSETS.rae}
          alt="Rae"
          sizeClass={sizeClass}
          celebrating={celebrating}
          delay={0.15}
        />
      )}

      {(character === "jellycat" || character === "both") && (
        <CharacterImage
          src={celebrating ? ASSETS.jellycatCelebrating : ASSETS.jellycat}
          alt="Jelly Cat"
          sizeClass={sizeClass}
          celebrating={celebrating}
          delay={0.3}
        />
      )}
    </div>
  );
}

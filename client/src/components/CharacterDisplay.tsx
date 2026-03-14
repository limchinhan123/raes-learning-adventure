import { ASSETS, type CharacterType } from "@shared/gameConfig";
import { motion } from "framer-motion";

interface CharacterDisplayProps {
  character: CharacterType;
  celebrating?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

export default function CharacterDisplay({ character, celebrating = false, size = "md", className = "" }: CharacterDisplayProps) {
  const sizeClass = sizeMap[size];

  const getImage = (char: "penguin" | "jellycat") => {
    if (celebrating) {
      return char === "penguin" ? ASSETS.penguinCelebrating : ASSETS.jellycatCelebrating;
    }
    return char === "penguin" ? ASSETS.penguin : ASSETS.jellycat;
  };

  if (character === "both") {
    return (
      <div className={`flex items-end gap-2 ${className}`}>
        <motion.img
          src={getImage("penguin")}
          alt="Penguin"
          className={`${sizeClass} object-contain drop-shadow-md`}
          animate={celebrating ? { y: [0, -15, 0], rotate: [0, -5, 5, 0] } : { y: [0, -6, 0] }}
          transition={celebrating ? { duration: 0.6, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={getImage("jellycat")}
          alt="Jelly Cat"
          className={`${sizeClass} object-contain drop-shadow-md`}
          animate={celebrating ? { y: [0, -15, 0], rotate: [0, 5, -5, 0] } : { y: [0, -6, 0] }}
          transition={celebrating ? { duration: 0.6, repeat: Infinity, delay: 0.1 } : { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>
    );
  }

  const img = getImage(character);
  const alt = character === "penguin" ? "Penguin" : "Jelly Cat";

  return (
    <motion.img
      src={img}
      alt={alt}
      className={`${sizeClass} object-contain drop-shadow-md ${className}`}
      animate={celebrating ? { y: [0, -15, 0], rotate: [0, -5, 5, 0] } : { y: [0, -6, 0] }}
      transition={celebrating ? { duration: 0.6, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

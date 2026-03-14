// ===== ASSET URLS =====
export const ASSETS = {
  penguin: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/penguin-character-PDjMBJQEStp5jcnt4gNvfP.webp",
  jellycat: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/jellycat-character-kzBAEcdjstoBeyMKexxiZD.webp",
  penguinCelebrating: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/penguin-celebrating-VNBeFy2px4uZT5LVgHjjtV.webp",
  jellycatCelebrating: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/jellycat-celebrating-YPFd6ixx6J4bDCQ4XRgwNb.webp",
  bothTogether: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/both-characters-together-66FyGVXdqvXpgY4oiptmx2.webp",
  worldMapBg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/world-map-bg-mqHsPggvgGHgjWnBKcZtkA.webp",
  bigBigLoveHeart: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/big-big-love-heart-4UYsbBcUwPuGSnucynmzBV.webp",
  starReward: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/star-reward-95jttEzzhfjXQ8jXr2cWRw.webp",
  rae: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/rae-avatar-E5Gxhe2okLriXo5AqmUvNq.webp",
  raeCelebrating: "https://d2xsxph8kpxj0f.cloudfront.net/310519663046120931/ZWjdUE9NtbgjHKzQk7FVZm/rae-avatar-celebrating-EVk6gV45Nu6shxPZqGQuci.webp",
};

// ===== WORLD CONFIGURATION =====
export type WorldTheme = {
  id: number;
  name: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: string;
  encouragement: string;
};

export const WORLDS: WorldTheme[] = [
  {
    id: 1,
    name: "Penguin's Garden",
    description: "Learn about yummy healthy foods!",
    color: "#a8d8a8",
    bgGradient: "from-green-100 to-pink-50",
    icon: "🌱",
    encouragement: "Eating vegetables helps you grow big and strong!",
  },
  {
    id: 2,
    name: "Jelly Cat's Ocean",
    description: "Dive into letters and numbers!",
    color: "#a8c8e8",
    bgGradient: "from-blue-100 to-purple-50",
    icon: "🌊",
    encouragement: "Fish is brain food! It makes you super smart!",
  },
  {
    id: 3,
    name: "Friendly Forest",
    description: "Explore with animal friends!",
    color: "#c8e8a8",
    bgGradient: "from-green-50 to-yellow-50",
    icon: "🌳",
    encouragement: "Animals love eating their veggies too!",
  },
  {
    id: 4,
    name: "Cloud Kingdom",
    description: "Reach for the sky with big words!",
    color: "#d8c8e8",
    bgGradient: "from-purple-50 to-pink-50",
    icon: "☁️",
    encouragement: "Broccoli helps you jump as high as the clouds!",
  },
  {
    id: 5,
    name: "Cozy Village",
    description: "Be a kind and polite friend!",
    color: "#e8c8d8",
    bgGradient: "from-pink-100 to-rose-50",
    icon: "🏡",
    encouragement: "Good food and kind words make the world better!",
  },
];

// ===== GAME TYPES =====
export type GameType = "alphabet" | "math" | "motor";

export const GAME_TYPES: GameType[] = ["alphabet", "math", "motor"];

// ===== LEVEL CONFIGURATION =====
export const LEVELS_PER_WORLD = 10;
export const TOTAL_WORLDS = 5;
export const TOTAL_LEVELS = LEVELS_PER_WORLD * TOTAL_WORLDS;

// All levels are unlocked from the start
export const ALL_LEVELS_UNLOCKED = true;

// Each level has a game type that cycles
export function getLevelGameType(worldId: number, levelInWorld: number): GameType {
  const patterns: GameType[][] = [
    ["alphabet", "math", "motor", "alphabet", "math", "alphabet", "motor", "math", "alphabet", "motor"],
    ["math", "alphabet", "motor", "math", "alphabet", "motor", "math", "alphabet", "motor", "alphabet"],
    ["motor", "alphabet", "math", "motor", "alphabet", "math", "motor", "alphabet", "math", "motor"],
    ["alphabet", "motor", "math", "alphabet", "motor", "math", "alphabet", "motor", "math", "alphabet"],
    ["math", "motor", "alphabet", "math", "motor", "alphabet", "math", "motor", "alphabet", "motor"],
  ];
  return patterns[(worldId - 1) % 5][(levelInWorld - 1) % 10];
}

// ===== DIFFICULTY SCALING =====
export function getDifficulty(worldId: number, levelInWorld: number): number {
  const baseDifficulty = (worldId - 1) * 2;
  const levelBonus = Math.floor((levelInWorld - 1) / 3);
  return Math.min(10, baseDifficulty + levelBonus + 1);
}

// ===== WORD LIBRARY =====
export const WORD_CATEGORIES = {
  familyNames: ["RAE", "BRANDON", "STEFFI"],
  healthyFoods: [
    "CHICKEN", "TOFU", "BROCCOLI", "FISH", "EGG", "CARROT",
    "RICE", "APPLE", "BANANA", "MILK", "CORN", "PEAS",
    "BEAN", "GRAPE", "BERRY", "MELON", "PLUM", "PEAR",
  ],
  bodyParts: [
    "HAND", "FOOT", "EYE", "NOSE", "EAR", "ARM",
    "LEG", "HEAD", "TUMMY", "KNEE", "TOE", "CHIN",
  ],
  animals: [
    "CAT", "DOG", "FISH", "BIRD", "DUCK", "COW",
    "PIG", "HEN", "BEE", "ANT", "FOX", "OWL",
  ],
  politeWords: [
    "PLEASE", "THANK YOU", "SORRY", "HELLO", "BYE",
    "LOVE", "KIND", "SHARE", "HELP", "HUG",
  ],
  simpleWords: [
    "SUN", "MOON", "STAR", "TREE", "RAIN", "WIND",
    "RED", "BLUE", "PINK", "GREEN", "BIG", "SMALL",
  ],
};

export function getWordsForDifficulty(difficulty: number): string[] {
  if (difficulty <= 2) {
    return [
      ...WORD_CATEGORIES.familyNames,
      ...WORD_CATEGORIES.animals.filter(w => w.length <= 3),
      ...WORD_CATEGORIES.simpleWords.filter(w => w.length <= 3),
      ...WORD_CATEGORIES.bodyParts.filter(w => w.length <= 3),
    ];
  } else if (difficulty <= 4) {
    return [
      ...WORD_CATEGORIES.familyNames,
      ...WORD_CATEGORIES.animals.filter(w => w.length <= 4),
      ...WORD_CATEGORIES.healthyFoods.filter(w => w.length <= 4),
      ...WORD_CATEGORIES.simpleWords,
      ...WORD_CATEGORIES.bodyParts.filter(w => w.length <= 4),
    ];
  } else if (difficulty <= 6) {
    return [
      ...WORD_CATEGORIES.familyNames,
      ...WORD_CATEGORIES.animals,
      ...WORD_CATEGORIES.healthyFoods.filter(w => w.length <= 5),
      ...WORD_CATEGORIES.bodyParts,
      ...WORD_CATEGORIES.politeWords.filter(w => w.length <= 5),
    ];
  } else {
    return [
      ...WORD_CATEGORIES.familyNames,
      ...WORD_CATEGORIES.animals,
      ...WORD_CATEGORIES.healthyFoods,
      ...WORD_CATEGORIES.bodyParts,
      ...WORD_CATEGORIES.politeWords,
      ...WORD_CATEGORIES.simpleWords,
    ];
  }
}

// ===== VEGETABLE ENCOURAGEMENT MESSAGES =====
export const VEGGIE_MESSAGES = [
  "Jelly Cat ate her broccoli and now she can jump super high!",
  "Penguin loves fish and carrots — they make him swim faster!",
  "Did you know? Eating vegetables helps you grow big and strong!",
  "Jelly Cat's favorite snack is carrots — they make her eyes sparkle!",
  "Penguin says: Tofu gives me energy to play all day!",
  "Broccoli is like tiny trees you can eat! Yummy!",
  "Jelly Cat loves peas — they're like little green bouncy balls!",
  "Penguin eats fish every day to stay healthy and happy!",
  "Corn is golden and sweet, just like sunshine on your plate!",
  "Eating eggs makes Jelly Cat's fur extra soft and fluffy!",
];

// ===== CHARACTER MESSAGES =====
export const CHARACTER_MESSAGES = {
  correct: [
    "Great job, Rae!",
    "You're so smart, Rae!",
    "Wonderful, Rae!",
    "That's right, Rae!",
    "Amazing, Rae!",
    "You did it, Rae!",
    "Brilliant, Rae!",
    "Super star, Rae!",
  ],
  encouragement: [
    "You can do it, Rae!",
    "Try again, Rae! You're doing great!",
    "Almost there, Rae!",
    "Keep going, Rae!",
    "Don't give up, Rae!",
  ],
  bigBigLove: [
    "Great job, Rae! Here is a Big Big Love for you!",
    "You're amazing, Rae! Big Big Love!",
    "Wonderful work, Rae! Here's a Big Big Love!",
  ],
  welcome: [
    "Hi Rae! Ready to play?",
    "Welcome back, Rae! Let's learn together!",
    "Rae! We missed you! Let's have fun!",
  ],
  screenTimeReminder: [
    "Penguin and Jelly Cat are getting a little sleepy... Time for a break!",
    "You've been playing so well, Rae! Let's rest our eyes for a bit!",
    "Great playing, Rae! Penguin and Jelly Cat need a little nap. Come back soon!",
  ],
};

// ===== SCREEN TIME =====
export const SCREEN_TIME_REMINDER_MINUTES = 20;

// ===== CHARACTER SELECTION =====
export type CharacterType = "penguin" | "jellycat" | "both";

export function getRandomCharacter(): CharacterType {
  const rand = Math.random();
  if (rand < 0.25) return "penguin";
  if (rand < 0.5) return "jellycat";
  return "both";
}

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

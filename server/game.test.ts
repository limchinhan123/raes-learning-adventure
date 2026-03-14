import { describe, expect, it } from "vitest";
import {
  getWordsForDifficulty,
  getLevelGameType,
  getDifficulty,
  getRandomCharacter,
  getRandomMessage,
  CHARACTER_MESSAGES,
  VEGGIE_MESSAGES,
  WORLDS,
  LEVELS_PER_WORLD,
  TOTAL_WORLDS,
  TOTAL_LEVELS,
  WORD_CATEGORIES,
  ASSETS,
  ALL_LEVELS_UNLOCKED,
  SCREEN_TIME_REMINDER_MINUTES,
} from "../shared/gameConfig";

describe("Game Configuration", () => {
  describe("WORLDS", () => {
    it("has exactly 5 worlds", () => {
      expect(WORLDS).toHaveLength(5);
    });

    it("each world has required fields", () => {
      for (const world of WORLDS) {
        expect(world.id).toBeGreaterThan(0);
        expect(world.name).toBeTruthy();
        expect(world.description).toBeTruthy();
        expect(world.color).toBeTruthy();
        expect(world.icon).toBeTruthy();
        expect(world.encouragement).toBeTruthy();
      }
    });

    it("worlds have sequential IDs from 1 to 5", () => {
      WORLDS.forEach((world, index) => {
        expect(world.id).toBe(index + 1);
      });
    });

    it("includes Penguin's Garden and Jelly Cat's Ocean", () => {
      expect(WORLDS[0].name).toBe("Penguin's Garden");
      expect(WORLDS[1].name).toBe("Jelly Cat's Ocean");
    });
  });

  describe("ASSETS", () => {
    it("has all required asset URLs including Rae", () => {
      expect(ASSETS.penguin).toBeTruthy();
      expect(ASSETS.jellycat).toBeTruthy();
      expect(ASSETS.penguinCelebrating).toBeTruthy();
      expect(ASSETS.jellycatCelebrating).toBeTruthy();
      expect(ASSETS.bothTogether).toBeTruthy();
      expect(ASSETS.worldMapBg).toBeTruthy();
      expect(ASSETS.bigBigLoveHeart).toBeTruthy();
      expect(ASSETS.starReward).toBeTruthy();
      // New v2: Rae avatar assets
      expect(ASSETS.rae).toBeTruthy();
      expect(ASSETS.raeCelebrating).toBeTruthy();
    });

    it("all asset URLs are valid HTTPS URLs", () => {
      for (const [key, url] of Object.entries(ASSETS)) {
        expect(url).toMatch(/^https:\/\//);
      }
    });

    it("Rae avatar assets are distinct from other characters", () => {
      expect(ASSETS.rae).not.toBe(ASSETS.penguin);
      expect(ASSETS.rae).not.toBe(ASSETS.jellycat);
      expect(ASSETS.raeCelebrating).not.toBe(ASSETS.penguinCelebrating);
    });
  });

  describe("Constants", () => {
    it("has 10 levels per world", () => {
      expect(LEVELS_PER_WORLD).toBe(10);
    });

    it("has 5 total worlds", () => {
      expect(TOTAL_WORLDS).toBe(5);
    });

    it("has 50 total levels", () => {
      expect(TOTAL_LEVELS).toBe(50);
    });

    it("all levels are unlocked from the start", () => {
      expect(ALL_LEVELS_UNLOCKED).toBe(true);
    });

    it("screen time reminder is set to 20 minutes", () => {
      expect(SCREEN_TIME_REMINDER_MINUTES).toBe(20);
    });
  });

  describe("getLevelGameType", () => {
    it("returns valid game types for all levels", () => {
      const validTypes = ["alphabet", "math", "motor"];
      for (let world = 1; world <= 5; world++) {
        for (let level = 1; level <= 10; level++) {
          const type = getLevelGameType(world, level);
          expect(validTypes).toContain(type);
        }
      }
    });

    it("includes all three game types in each world", () => {
      for (let world = 1; world <= 5; world++) {
        const types = new Set<string>();
        for (let level = 1; level <= 10; level++) {
          types.add(getLevelGameType(world, level));
        }
        expect(types.has("alphabet")).toBe(true);
        expect(types.has("math")).toBe(true);
        expect(types.has("motor")).toBe(true);
      }
    });
  });

  describe("getDifficulty", () => {
    it("returns difficulty between 1 and 10", () => {
      for (let world = 1; world <= 5; world++) {
        for (let level = 1; level <= 10; level++) {
          const diff = getDifficulty(world, level);
          expect(diff).toBeGreaterThanOrEqual(1);
          expect(diff).toBeLessThanOrEqual(10);
        }
      }
    });

    it("difficulty increases with world number", () => {
      const world1Diff = getDifficulty(1, 1);
      const world3Diff = getDifficulty(3, 1);
      const world5Diff = getDifficulty(5, 1);
      expect(world3Diff).toBeGreaterThan(world1Diff);
      expect(world5Diff).toBeGreaterThan(world3Diff);
    });

    it("difficulty increases within a world", () => {
      const earlyDiff = getDifficulty(1, 1);
      const lateDiff = getDifficulty(1, 10);
      expect(lateDiff).toBeGreaterThanOrEqual(earlyDiff);
    });
  });

  describe("WORD_CATEGORIES", () => {
    it("includes family names Rae, Brandon, Steffi", () => {
      expect(WORD_CATEGORIES.familyNames).toContain("RAE");
      expect(WORD_CATEGORIES.familyNames).toContain("BRANDON");
      expect(WORD_CATEGORIES.familyNames).toContain("STEFFI");
    });

    it("includes healthy foods", () => {
      expect(WORD_CATEGORIES.healthyFoods).toContain("BROCCOLI");
      expect(WORD_CATEGORIES.healthyFoods).toContain("TOFU");
      expect(WORD_CATEGORIES.healthyFoods).toContain("FISH");
      expect(WORD_CATEGORIES.healthyFoods).toContain("CHICKEN");
      expect(WORD_CATEGORIES.healthyFoods).toContain("EGG");
    });

    it("includes body parts", () => {
      expect(WORD_CATEGORIES.bodyParts.length).toBeGreaterThan(0);
    });

    it("includes animals", () => {
      expect(WORD_CATEGORIES.animals.length).toBeGreaterThan(0);
    });

    it("includes polite words", () => {
      expect(WORD_CATEGORIES.politeWords.length).toBeGreaterThan(0);
    });

    it("all words are uppercase", () => {
      for (const category of Object.values(WORD_CATEGORIES)) {
        for (const word of category) {
          expect(word).toBe(word.toUpperCase());
        }
      }
    });
  });

  describe("getWordsForDifficulty", () => {
    it("returns words for all difficulty levels", () => {
      for (let d = 1; d <= 10; d++) {
        const words = getWordsForDifficulty(d);
        expect(words.length).toBeGreaterThan(0);
      }
    });

    it("easy difficulty returns shorter words", () => {
      const easyWords = getWordsForDifficulty(1);
      const maxLen = Math.max(...easyWords.map(w => w.length));
      expect(maxLen).toBeLessThanOrEqual(7);
    });

    it("always includes family names", () => {
      for (let d = 1; d <= 10; d++) {
        const words = getWordsForDifficulty(d);
        expect(words).toContain("RAE");
      }
    });
  });

  describe("getRandomCharacter", () => {
    it("returns valid character types", () => {
      const validTypes = ["penguin", "jellycat", "both"];
      for (let i = 0; i < 50; i++) {
        const char = getRandomCharacter();
        expect(validTypes).toContain(char);
      }
    });

    it("returns all character types over many iterations", () => {
      const seen = new Set<string>();
      for (let i = 0; i < 200; i++) {
        seen.add(getRandomCharacter());
      }
      expect(seen.has("penguin")).toBe(true);
      expect(seen.has("jellycat")).toBe(true);
      expect(seen.has("both")).toBe(true);
    });
  });

  describe("getRandomMessage", () => {
    it("returns a message from the provided array", () => {
      const messages = ["Hello", "World", "Test"];
      for (let i = 0; i < 20; i++) {
        const msg = getRandomMessage(messages);
        expect(messages).toContain(msg);
      }
    });
  });

  describe("CHARACTER_MESSAGES", () => {
    it("has correct, encouragement, bigBigLove, welcome, and screenTimeReminder messages", () => {
      expect(CHARACTER_MESSAGES.correct.length).toBeGreaterThan(0);
      expect(CHARACTER_MESSAGES.encouragement.length).toBeGreaterThan(0);
      expect(CHARACTER_MESSAGES.bigBigLove.length).toBeGreaterThan(0);
      expect(CHARACTER_MESSAGES.welcome.length).toBeGreaterThan(0);
      expect(CHARACTER_MESSAGES.screenTimeReminder.length).toBeGreaterThan(0);
    });

    it("all messages mention Rae by name", () => {
      for (const msg of CHARACTER_MESSAGES.correct) {
        expect(msg).toContain("Rae");
      }
      for (const msg of CHARACTER_MESSAGES.bigBigLove) {
        expect(msg).toContain("Rae");
      }
    });

    it("bigBigLove messages contain 'Big Big Love'", () => {
      for (const msg of CHARACTER_MESSAGES.bigBigLove) {
        expect(msg).toContain("Big Big Love");
      }
    });
  });

  describe("VEGGIE_MESSAGES", () => {
    it("has multiple veggie encouragement messages", () => {
      expect(VEGGIE_MESSAGES.length).toBeGreaterThan(5);
    });

    it("messages mention vegetables or healthy food", () => {
      const foodKeywords = ["broccoli", "carrot", "fish", "tofu", "vegetable", "peas", "corn", "egg", "food"];
      for (const msg of VEGGIE_MESSAGES) {
        const lower = msg.toLowerCase();
        const hasFood = foodKeywords.some(kw => lower.includes(kw));
        expect(hasFood).toBe(true);
      }
    });
  });
});

describe("Game Router", () => {
  it("appRouter has game namespace", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    expect(appRouter._def.procedures).toBeDefined();
  });
});

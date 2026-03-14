import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getWordsForDifficulty, WORD_CATEGORIES, VEGGIE_MESSAGES } from "../shared/gameConfig";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  game: router({
    // AI-generated alphabet challenge
    generateAlphabetChallenge: publicProcedure
      .input(z.object({ difficulty: z.number().min(1).max(10) }))
      .mutation(async ({ input }) => {
        try {
          const maxLen = Math.min(3 + input.difficulty, 8);
          const categories = input.difficulty <= 3
            ? "simple 2-3 letter words, family names (Rae, Brandon, Steffi), animals, colors"
            : input.difficulty <= 6
            ? "4-5 letter words about healthy foods (broccoli, carrot, tofu, fish, chicken), body parts, animals, polite words"
            : "5-7 letter words about healthy foods, science, being kind, body parts, animals";

          const result = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a children's educational game assistant. Generate a single word for a toddler (age 2-4) to type. The word should be from these categories: ${categories}. Max length: ${maxLen} letters. Respond with JSON only.`
              },
              {
                role: "user",
                content: `Generate a word for difficulty level ${input.difficulty}/10. Include a short, fun hint that a toddler would understand. Subtly encourage eating vegetables when possible. Respond with: {"word": "WORD", "hint": "A fun hint"}`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "alphabet_challenge",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    word: { type: "string", description: "The word to type" },
                    hint: { type: "string", description: "A fun hint for the word" },
                  },
                  required: ["word", "hint"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = result.choices[0]?.message?.content;
          if (typeof content === "string") {
            const parsed = JSON.parse(content);
            return {
              word: (parsed.word as string).toUpperCase().replace(/[^A-Z]/g, ""),
              hint: parsed.hint as string,
            };
          }
        } catch (e) {
          console.error("AI alphabet challenge failed:", e);
        }

        // Fallback
        const words = getWordsForDifficulty(input.difficulty);
        const word = words[Math.floor(Math.random() * words.length)];
        return { word, hint: "" };
      }),

    // AI-generated math challenge
    generateMathChallenge: publicProcedure
      .input(z.object({ difficulty: z.number().min(1).max(10) }))
      .mutation(async ({ input }) => {
        try {
          const maxNum = Math.min(2 + input.difficulty, 10);
          const result = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a children's math game assistant. Generate a simple addition or subtraction problem for a toddler (age 2-4). Numbers should be between 1 and ${maxNum}. The answer must be a positive integer. For lower difficulty, prefer addition. Respond with JSON only.`
              },
              {
                role: "user",
                content: `Generate a math problem for difficulty ${input.difficulty}/10. Respond with: {"num1": 3, "num2": 2, "operator": "+", "answer": 5}`
              }
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "math_challenge",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    num1: { type: "integer", description: "First number" },
                    num2: { type: "integer", description: "Second number" },
                    operator: { type: "string", description: "Plus or minus" },
                    answer: { type: "integer", description: "Correct answer" },
                  },
                  required: ["num1", "num2", "operator", "answer"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = result.choices[0]?.message?.content;
          if (typeof content === "string") {
            const parsed = JSON.parse(content);
            // Validate the answer
            const expected = parsed.operator === "+"
              ? parsed.num1 + parsed.num2
              : parsed.num1 - parsed.num2;
            if (expected === parsed.answer && parsed.answer >= 0) {
              return parsed as { num1: number; num2: number; operator: string; answer: number };
            }
          }
        } catch (e) {
          console.error("AI math challenge failed:", e);
        }

        // Fallback
        const maxNum = Math.min(2 + input.difficulty, 10);
        const isAdd = Math.random() > 0.4 || input.difficulty <= 2;
        if (isAdd) {
          const n1 = Math.floor(Math.random() * maxNum) + 1;
          const n2 = Math.floor(Math.random() * (maxNum - n1)) + 1;
          return { num1: n1, num2: n2, operator: "+", answer: n1 + n2 };
        }
        const ans = Math.floor(Math.random() * (maxNum - 1)) + 1;
        const n2 = Math.floor(Math.random() * ans) + 1;
        return { num1: ans + n2, num2: n2, operator: "-", answer: ans };
      }),

    // TTS endpoint - generates speech for character voices
    speak: publicProcedure
      .input(z.object({
        text: z.string(),
        character: z.enum(["penguin", "jellycat"]),
      }))
      .mutation(async ({ input }) => {
        try {
          // Use the Forge API for TTS
          const forgeUrl = process.env.BUILT_IN_FORGE_API_URL || "";
          const forgeKey = process.env.BUILT_IN_FORGE_API_KEY || "";

          if (!forgeUrl || !forgeKey) {
            return { audioUrl: null };
          }

          // Use different voice settings for each character
          const voice = input.character === "penguin" ? "alloy" : "nova";

          const response = await fetch(`${forgeUrl.replace(/\/$/, "")}/v1/audio/speech`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${forgeKey}`,
            },
            body: JSON.stringify({
              model: "tts-1",
              input: input.text,
              voice,
              speed: 0.9, // Slightly slower for toddlers
            }),
          });

          if (response.ok) {
            // Convert audio to base64 data URL
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            return { audioUrl: `data:audio/mp3;base64,${base64}` };
          }
        } catch (e) {
          console.error("TTS failed:", e);
        }

        return { audioUrl: null };
      }),
  }),
});

export type AppRouter = typeof appRouter;

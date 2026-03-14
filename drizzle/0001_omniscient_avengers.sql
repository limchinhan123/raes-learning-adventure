CREATE TABLE `levelCompletions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`worldId` int NOT NULL,
	`levelId` int NOT NULL,
	`gameType` enum('alphabet','math','motor') NOT NULL,
	`starsEarned` int NOT NULL DEFAULT 0,
	`score` int NOT NULL DEFAULT 0,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `levelCompletions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playerProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentWorld` int NOT NULL DEFAULT 1,
	`currentLevel` int NOT NULL DEFAULT 1,
	`totalStars` int NOT NULL DEFAULT 0,
	`totalHearts` int NOT NULL DEFAULT 0,
	`totalPlayTimeMinutes` int NOT NULL DEFAULT 0,
	`foodsCollected` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playerProgress_id` PRIMARY KEY(`id`)
);

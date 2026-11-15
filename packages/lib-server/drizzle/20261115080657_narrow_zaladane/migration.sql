ALTER TYPE "assistants" RENAME TO "user_key_type";--> statement-breakpoint
ALTER TABLE "user_assistants" RENAME TO "user_keys";--> statement-breakpoint
ALTER TABLE "user_keys" RENAME COLUMN "assistant" TO "type";--> statement-breakpoint
ALTER TABLE "user_keys" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "user_key_type";--> statement-breakpoint
CREATE TYPE "user_key_type" AS ENUM('Claude', 'Gemini', 'GitHub', 'OpenAPI');--> statement-breakpoint
ALTER TABLE "user_keys" ALTER COLUMN "type" SET DATA TYPE "user_key_type" USING "type"::"user_key_type";
ALTER TABLE "user_keys" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "user_key_type";--> statement-breakpoint
CREATE TYPE "user_key_type" AS ENUM('Anthropic', 'Google AI', 'GitHub', 'OpenAI');--> statement-breakpoint
ALTER TABLE "user_keys" ALTER COLUMN "type" SET DATA TYPE "user_key_type" USING "type"::"user_key_type";
CREATE TYPE "assistants" AS ENUM('gemini', 'claude', 'openapi');--> statement-breakpoint
CREATE TABLE "user_assistants" (
	"user_id" integer NOT NULL,
	"assistant" "assistants" NOT NULL,
	"key" varchar(512),
	CONSTRAINT "user_assistants_user_id_assistant_unique" UNIQUE("user_id","assistant")
);
--> statement-breakpoint
ALTER TABLE "user_assistants" ADD CONSTRAINT "user_assistants_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
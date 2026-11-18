CREATE TYPE "user_handle_type" AS ENUM('GitHub');--> statement-breakpoint
CREATE TABLE "user_handles" (
	"user_id" integer NOT NULL,
	"type" "user_handle_type" NOT NULL,
	"handle" varchar(256),
	CONSTRAINT "user_handles_user_id_type_unique" UNIQUE("user_id","type")
);
--> statement-breakpoint
ALTER TABLE "user_handles" ADD CONSTRAINT "user_handles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "connects" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "connects" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "connects" ADD COLUMN "deleted_at" timestamp;
CREATE TABLE "llm_config_model" (
	"config" uuid,
	"provider" varchar(128),
	"model" varchar(128),
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "llm_config_model_pkey" PRIMARY KEY("config","provider","model")
);
--> statement-breakpoint
CREATE TABLE "llm_config_providers" (
	"config" uuid,
	"provider" varchar(128),
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "llm_config_providers_pkey" PRIMARY KEY("config","provider")
);
--> statement-breakpoint
CREATE TABLE "llm_configs" (
	"user_id" integer,
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"label" varchar(128) DEFAULT 'None' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"temperature" real,
	"max_input_tokens" integer,
	"max_output_tokens" integer,
	"inputs" jsonb DEFAULT '[]',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "llm_provider" (
	"id" varchar(128) PRIMARY KEY,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "llms" (
	"provider" varchar(128),
	"id" varchar(128),
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "llms_pkey" PRIMARY KEY("provider","id")
);
--> statement-breakpoint
ALTER TABLE "llm_config_model" ADD CONSTRAINT "llm_config_model_Z3FYNczv4Em8_fkey" FOREIGN KEY ("config","provider") REFERENCES "llm_config_providers"("config","provider") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "llm_config_model" ADD CONSTRAINT "llm_config_model_provider_model_llms_provider_id_fkey" FOREIGN KEY ("provider","model") REFERENCES "llms"("provider","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "llm_config_providers" ADD CONSTRAINT "llm_config_providers_config_llm_configs_uuid_fkey" FOREIGN KEY ("config") REFERENCES "llm_configs"("uuid") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "llm_config_providers" ADD CONSTRAINT "llm_config_providers_provider_llm_provider_id_fkey" FOREIGN KEY ("provider") REFERENCES "llm_provider"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "llm_configs" ADD CONSTRAINT "llm_configs_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "llms" ADD CONSTRAINT "llms_provider_llm_provider_id_fkey" FOREIGN KEY ("provider") REFERENCES "llm_provider"("id") ON DELETE CASCADE;
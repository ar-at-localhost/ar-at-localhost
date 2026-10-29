CREATE TABLE "connects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "connects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firstName" varchar(128) NOT NULL,
	"lastName" varchar(128),
	"email" varchar(255) NOT NULL,
	"message" text NOT NULL
);

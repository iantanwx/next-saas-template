DO $$ BEGIN
 CREATE TYPE "public"."integration_types" AS ENUM('slack', 'github');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "installations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"type" "integration_types" NOT NULL,
	"external_id" text NOT NULL,
	"external_name" text NOT NULL,
	"credentials" text NOT NULL,
	"metadata" text,
	"organization_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "installations" ADD CONSTRAINT "installations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "installations_type_external_id_organization_id_index" ON "installations" USING btree (type,external_id,organization_id);
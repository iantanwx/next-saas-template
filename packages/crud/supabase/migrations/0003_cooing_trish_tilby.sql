DROP INDEX IF EXISTS "unique_email";--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "completed_onboarding" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_email" ON "users" USING btree (email);
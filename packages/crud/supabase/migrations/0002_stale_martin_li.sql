ALTER TABLE "organizations" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_invitations" ALTER COLUMN "created_by_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_invitations" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_invitations" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_invitations" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "completed_onboarding" boolean DEFAULT false;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organization_members_organization_id_user_id_index" ON "organization_members" USING btree (organization_id,user_id);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_slug" ON "organizations" USING btree (lower("slug"));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_name" ON "organizations" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_idx" ON "user_invitations" USING btree (organization_id);--> statement-breakpoint
ALTER TABLE "user_invitations" ADD CONSTRAINT "organization_email_idx" UNIQUE("organization_id","email");
DO $$ BEGIN
 CREATE TYPE "public"."organization_roles" AS ENUM('owner', 'admin', 'member');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_members" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"role" "organization_roles" NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"completed_onboarding" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"created_by_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "organization_roles" NOT NULL,
	"organization_id" text NOT NULL,
	CONSTRAINT "organization_email_idx" UNIQUE("organization_id","email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"name" text,
	"email" text,
	"avatar_url" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organization_members_organization_id_user_id_index" ON "organization_members" USING btree (organization_id,user_id);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_slug" ON "organizations" USING btree (lower("slug"));--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_name" ON "organizations" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_idx" ON "user_invitations" USING btree (organization_id);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_email" ON "users" USING btree (email);
--> statement-breakpoint

-- Create trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, created_at, updated_at, email, name, avatar_url)
  VALUES (new.id, new.created_at, new.updated_at, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
--> statement-breakpoint
-- Create trigger to automatically create public user when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();


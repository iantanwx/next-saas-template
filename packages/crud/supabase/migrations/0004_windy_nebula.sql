CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" text NOT NULL,
	"color" text,
	"organization_id" text NOT NULL,
	CONSTRAINT "tags_org_name_unique" UNIQUE("organization_id","name")
);
--> statement-breakpoint
CREATE TABLE "todo_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"todo_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "todo_tags_unique" UNIQUE("todo_id","tag_id")
);
--> statement-breakpoint
CREATE INDEX "tags_organization_idx" ON "tags" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "todo_tags_todo_idx" ON "todo_tags" USING btree ("todo_id");--> statement-breakpoint
CREATE INDEX "todo_tags_tag_idx" ON "todo_tags" USING btree ("tag_id");--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN "tags";
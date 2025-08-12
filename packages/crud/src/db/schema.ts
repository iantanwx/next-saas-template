import { init } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  index,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const cuid = init();

const authSchema = pgSchema('auth');

export const lower = (field: AnyPgColumn) => sql`lower(${field})`;

// This table is only used to establish a foreign key to the Supabase auth.users table.
// It is _not_ used in the application.
// See https://github.com/supabase/supabase/issues/19883 and https://supabase.com/docs/guides/auth/managing-user-data
const _users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

// This is the application users table, and is inserted using a trigger
// when a user is created in Supabase.
export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => _users.id, {
        onDelete: 'cascade',
      }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
    name: text('name'),
    email: text('email'),
    avatarUrl: text('avatar_url'),
  },
  (table) => ({
    uniqueEmail: uniqueIndex('unique_email').on(table.email),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(organizationMembers),
  todos: many(todos),
}));

export const organizations = pgTable(
  'organizations',
  {
    id: text('id').primaryKey().$defaultFn(cuid),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    completedOnboarding: boolean('completed_onboarding')
      .notNull()
      .default(false),
  },
  (table) => ({
    uniqueSlug: uniqueIndex('unique_slug').on(lower(table.slug)),
    uniqueName: uniqueIndex('unique_name').on(lower(table.name)),
  })
);

export const organizationRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  invitations: many(userInvitations),
}));

export const organizationRoles = pgEnum('organization_roles', [
  'owner',
  'admin',
  'member',
]);

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: text('id').primaryKey().$defaultFn(cuid),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    role: organizationRoles('role').notNull(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
      }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => ({
    uniqueOrganizationUser: uniqueIndex().on(
      table.organizationId,
      table.userId
    ),
  })
);

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  })
);

export const userInvitations = pgTable(
  'user_invitations',
  {
    id: text('id').primaryKey().$defaultFn(cuid),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    email: text('email').notNull(),
    role: organizationRoles('role').notNull(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => ({
    organizationIdx: index('organization_idx').on(table.organizationId),
    organizationEmailIdx: unique('organization_email_idx').on(
      table.organizationId,
      table.email
    ),
  })
);

export const userInvitationsRelations = relations(
  userInvitations,
  ({ one }) => ({
    createdBy: one(users, {
      fields: [userInvitations.createdById],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [userInvitations.organizationId],
      references: [organizations.id],
    }),
  })
);

export const integrationTypes = pgEnum('integration_types', [
  'slack',
  'github',
]);

export const installations = pgTable(
  'installations',
  {
    id: text('id').primaryKey().$defaultFn(cuid),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    type: integrationTypes('type').notNull(),
    // External IDs (e.g., Slack team ID, GitHub org name)
    externalId: text('external_id').notNull(),
    externalName: text('external_name').notNull(),
    // Integration-specific credentials and metadata stored as JSONB
    credentials: text('credentials').notNull(),
    metadata: text('metadata'),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
      }),
  },
  (table) => ({
    uniqueIntegration: uniqueIndex().on(
      table.type,
      table.externalId,
      table.organizationId
    ),
  })
);

export const installationsRelations = relations(installations, ({ one }) => ({
  organization: one(organizations, {
    fields: [installations.organizationId],
    references: [organizations.id],
  }),
}));

export const todoPriority = pgEnum('todo_priority', ['low', 'medium', 'high']);

export const todoStatus = pgEnum('todo_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]);

export const todos = pgTable(
  'todos',
  {
    id: text('id').primaryKey().$defaultFn(cuid),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    title: text('title').notNull(),
    description: text('description'),
    completed: boolean('completed').notNull().default(false),
    dueDate: timestamp('due_date'),
    priority: todoPriority('priority').notNull().default('medium'),
    status: todoStatus('status').notNull().default('pending'),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, {
        onDelete: 'cascade',
      }),
    // For optimistic locking and conflict resolution
    version: text('version').notNull().default('1'),
    // For real-time collaboration
    lastEditedBy: uuid('last_edited_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    lastEditedAt: timestamp('last_edited_at'),
  },
  (table) => [
    index('todos_user_idx').on(table.userId),
    index('todos_organization_idx').on(table.organizationId),
    index('todos_status_idx').on(table.status),
    index('todos_due_date_idx').on(table.dueDate),
    index('todos_priority_idx').on(table.priority),
    index('todos_completed_idx').on(table.completed),
    // Composite FK intentionally omitted to allow deleting org memberships without blocking on todos
  ]
);

export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey().$defaultFn(cuid),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
    name: text('name').notNull(),
    color: text('color'), // Optional hex color for UI
    organizationId: text('organization_id').notNull(),
  },
  (table) => [
    index('tags_organization_idx').on(table.organizationId),
    unique('tags_org_name_unique').on(table.organizationId, table.name),
  ]
);

export const todoTags = pgTable(
  'todo_tags',
  {
    id: text('id').primaryKey().$defaultFn(cuid),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    todoId: text('todo_id').notNull(),
    tagId: text('tag_id').notNull(),
  },
  (table) => [
    index('todo_tags_todo_idx').on(table.todoId),
    index('todo_tags_tag_idx').on(table.tagId),
    unique('todo_tags_unique').on(table.todoId, table.tagId),
  ]
);

export const todosRelations = relations(todos, ({ one, many }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [todos.organizationId],
    references: [organizations.id],
  }),
  lastEditedByUser: one(users, {
    fields: [todos.lastEditedBy],
    references: [users.id],
  }),
  todoTags: many(todoTags),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tags.organizationId],
    references: [organizations.id],
  }),
  todoTags: many(todoTags),
}));

export const todoTagsRelations = relations(todoTags, ({ one }) => ({
  todo: one(todos, {
    fields: [todoTags.todoId],
    references: [todos.id],
  }),
  tag: one(tags, {
    fields: [todoTags.tagId],
    references: [tags.id],
  }),
}));

import { and, desc, eq, sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { db } from './db/connection';
import { todos, todoPriority, todoStatus, tags, todoTags } from './db/schema';

export type Todo = InferSelectModel<typeof todos>;
export type InsertTodo = InferInsertModel<typeof todos>;
export type UpdateTodoData = Partial<Omit<InsertTodo, 'id' | 'createdAt'>>;

export type Tag = InferSelectModel<typeof tags>;
export type InsertTag = InferInsertModel<typeof tags>;
export type TodoTag = InferSelectModel<typeof todoTags>;

// Extended todo type with tags included
export type TodoWithTags = Todo & {
  todoTags?: Array<{
    tag: Tag;
  }>;
};

export async function create(data: InsertTodo): Promise<Todo> {
  const [todo] = await db
    .insert(todos)
    .values({
      ...data,
      updatedAt: new Date(),
      lastEditedAt: new Date(),
      lastEditedBy: data.userId,
    })
    .returning();
  
  if (!todo) {
    throw new Error('Failed to create todo');
  }
  
  return todo;
}

export async function findById(id: string): Promise<TodoWithTags | null> {
  const todo = await db.query.todos.findFirst({
    where: and(eq(todos.id, id), sql`${todos.deletedAt} IS NULL`),
    with: {
      user: true,
      organization: true,
      lastEditedByUser: true,
      todoTags: {
        with: {
          tag: true,
        },
      },
    },
  });
  
  return todo || null;
}

export async function findByUser(userId: string, organizationId: string): Promise<TodoWithTags[]> {
  return await db.query.todos.findMany({
    where: and(
      eq(todos.userId, userId),
      eq(todos.organizationId, organizationId),
      sql`${todos.deletedAt} IS NULL`
    ),
    orderBy: [desc(todos.updatedAt)],
    with: {
      user: true,
      organization: true,
      lastEditedByUser: true,
      todoTags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

export async function findByOrganization(organizationId: string): Promise<TodoWithTags[]> {
  return await db.query.todos.findMany({
    where: and(
      eq(todos.organizationId, organizationId),
      sql`${todos.deletedAt} IS NULL`
    ),
    orderBy: [desc(todos.updatedAt)],
    with: {
      user: true,
      organization: true,
      lastEditedByUser: true,
      todoTags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

export async function findByStatus(
  organizationId: string,
  status: (typeof todoStatus.enumValues)[number]
): Promise<TodoWithTags[]> {
  return await db.query.todos.findMany({
    where: and(
      eq(todos.organizationId, organizationId),
      eq(todos.status, status),
      sql`${todos.deletedAt} IS NULL`
    ),
    orderBy: [desc(todos.updatedAt)],
    with: {
      user: true,
      organization: true,
      lastEditedByUser: true,
      todoTags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

export async function update(
  id: string,
  data: UpdateTodoData,
  version: string,
  lastEditedBy: string
): Promise<Todo> {
  const [todo] = await db
    .update(todos)
    .set({
      ...data,
      updatedAt: new Date(),
      lastEditedAt: new Date(),
      lastEditedBy,
      version: sql`${todos.version}::integer + 1`,
    })
    .where(
      and(
        eq(todos.id, id),
        eq(todos.version, version),
        sql`${todos.deletedAt} IS NULL`
      )
    )
    .returning();

  if (!todo) {
    throw new Error('Failed to update todo - version conflict or todo not found');
  }

  return todo;
}

export async function markComplete(
  id: string,
  version: string,
  lastEditedBy: string
): Promise<Todo> {
  return update(
    id,
    { completed: true, status: 'completed' },
    version,
    lastEditedBy
  );
}

export async function markIncomplete(
  id: string,
  version: string,
  lastEditedBy: string
): Promise<Todo> {
  return update(
    id,
    { completed: false, status: 'pending' },
    version,
    lastEditedBy
  );
}

export async function updateStatus(
  id: string,
  status: (typeof todoStatus.enumValues)[number],
  version: string,
  lastEditedBy: string
): Promise<Todo> {
  const completed = status === 'completed';
  return update(id, { status, completed }, version, lastEditedBy);
}

export async function updatePriority(
  id: string,
  priority: (typeof todoPriority.enumValues)[number],
  version: string,
  lastEditedBy: string
): Promise<Todo> {
  return update(id, { priority }, version, lastEditedBy);
}

// Tag management functions
export async function findOrCreateTag(
  name: string,
  organizationId: string,
  color?: string
): Promise<Tag> {
  // Try to find existing tag
  const existingTag = await db.query.tags.findFirst({
    where: and(
      eq(tags.name, name),
      eq(tags.organizationId, organizationId),
      sql`${tags.deletedAt} IS NULL`
    ),
  });

  if (existingTag) {
    return existingTag;
  }

  // Create new tag
  const [newTag] = await db
    .insert(tags)
    .values({
      name,
      organizationId,
      color,
      updatedAt: new Date(),
    })
    .returning();

  if (!newTag) {
    throw new Error('Failed to create tag');
  }

  return newTag;
}

export async function addTagToTodo(
  todoId: string,
  tagName: string,
  organizationId: string,
  tagColor?: string
): Promise<TodoWithTags> {
  // Find or create the tag
  const tag = await findOrCreateTag(tagName, organizationId, tagColor);

  // Check if the todo-tag relationship already exists
  const existingTodoTag = await db.query.todoTags.findFirst({
    where: and(
      eq(todoTags.todoId, todoId),
      eq(todoTags.tagId, tag.id)
    ),
  });

  if (!existingTodoTag) {
    // Create the todo-tag relationship
    await db
      .insert(todoTags)
      .values({
        todoId,
        tagId: tag.id,
        createdAt: new Date(),
      });
  }

  // Return the updated todo with tags
  const updatedTodo = await findById(todoId);
  if (!updatedTodo) {
    throw new Error('Todo not found after adding tag');
  }

  return updatedTodo;
}

export async function removeTagFromTodo(
  todoId: string,
  tagId: string
): Promise<TodoWithTags> {
  // Remove the todo-tag relationship
  await db
    .delete(todoTags)
    .where(
      and(
        eq(todoTags.todoId, todoId),
        eq(todoTags.tagId, tagId)
      )
    );

  // Return the updated todo with tags
  const updatedTodo = await findById(todoId);
  if (!updatedTodo) {
    throw new Error('Todo not found after removing tag');
  }

  return updatedTodo;
}

export async function getTagsByOrganization(organizationId: string): Promise<Tag[]> {
  return await db.query.tags.findMany({
    where: and(
      eq(tags.organizationId, organizationId),
      sql`${tags.deletedAt} IS NULL`
    ),
    orderBy: [desc(tags.createdAt)],
  });
}

export async function softDelete(
  id: string,
  version: string,
  lastEditedBy: string
): Promise<void> {
  const [todo] = await db
    .update(todos)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
      lastEditedAt: new Date(),
      lastEditedBy,
    })
    .where(
      and(
        eq(todos.id, id),
        eq(todos.version, version),
        sql`${todos.deletedAt} IS NULL`
      )
    )
    .returning();

  if (!todo) {
    throw new Error('Failed to delete todo - version conflict or todo not found');
  }
}

export async function hardDelete(id: string): Promise<void> {
  await db.delete(todos).where(eq(todos.id, id));
}

export async function getStats(organizationId: string): Promise<{
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
}> {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)`,
      completed: sql<number>`count(*) filter (where ${todos.status} = 'completed')`,
      pending: sql<number>`count(*) filter (where ${todos.status} = 'pending')`,
      inProgress: sql<number>`count(*) filter (where ${todos.status} = 'in_progress')`,
      cancelled: sql<number>`count(*) filter (where ${todos.status} = 'cancelled')`,
    })
    .from(todos)
    .where(
      and(
        eq(todos.organizationId, organizationId),
        sql`${todos.deletedAt} IS NULL`
      )
    );

  return {
    total: Number(stats?.total || 0),
    completed: Number(stats?.completed || 0),
    pending: Number(stats?.pending || 0),
    inProgress: Number(stats?.inProgress || 0),
    cancelled: Number(stats?.cancelled || 0),
  };
}
import { and, desc, eq, sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { db } from './db/connection';
import { todos, todoPriority, todoStatus } from './db/schema';

export type Todo = InferSelectModel<typeof todos>;
export type InsertTodo = InferInsertModel<typeof todos>;
export type UpdateTodoData = Partial<Omit<InsertTodo, 'id' | 'createdAt'>>;

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

export async function findById(id: string): Promise<Todo | null> {
  const todo = await db.query.todos.findFirst({
    where: and(eq(todos.id, id), sql`${todos.deletedAt} IS NULL`),
    with: {
      user: true,
      organization: true,
      lastEditedByUser: true,
    },
  });
  
  return todo || null;
}

export async function findByUser(userId: string, organizationId: string): Promise<Todo[]> {
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
    },
  });
}

export async function findByOrganization(organizationId: string): Promise<Todo[]> {
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
    },
  });
}

export async function findByStatus(
  organizationId: string,
  status: (typeof todoStatus.enumValues)[number]
): Promise<Todo[]> {
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

export async function addTag(
  id: string,
  tag: string,
  version: string,
  lastEditedBy: string
): Promise<Todo> {
  // First get the current todo to access its tags
  const currentTodo = await findById(id);
  if (!currentTodo) {
    throw new Error('Todo not found');
  }

  const currentTags = currentTodo.tags || [];
  if (currentTags.includes(tag)) {
    return currentTodo; // Tag already exists
  }

  const newTags = [...currentTags, tag];
  return update(id, { tags: newTags }, version, lastEditedBy);
}

export async function removeTag(
  id: string,
  tag: string,
  version: string,
  lastEditedBy: string
): Promise<Todo> {
  // First get the current todo to access its tags
  const currentTodo = await findById(id);
  if (!currentTodo) {
    throw new Error('Todo not found');
  }

  const currentTags = currentTodo.tags || [];
  const newTags = currentTags.filter(t => t !== tag);
  return update(id, { tags: newTags }, version, lastEditedBy);
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
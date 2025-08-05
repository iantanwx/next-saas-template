import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import { db } from '../src/db/connection';
import { todos, users, organizations } from '../src/db/schema';
import * as todoService from '../src/todo';

// Test data
const testUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test User',
  email: 'test@example.com',
};

const testOrg = {
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
  completedOnboarding: false,
};

const testTodo = {
  title: 'Test Todo',
  description: 'This is a test todo',
  userId: testUser.id,
  organizationId: testOrg.id,
  priority: 'medium' as const,
  status: 'pending' as const,
  tags: ['test', 'vitest'],
};

describe('Todo CRUD Operations', () => {
  beforeEach(async () => {
    // Clean up any existing test data
    await db.delete(todos).where(eq(todos.organizationId, testOrg.id));
    
    // Create auth user first (required for foreign key constraint)
    await db.execute(sql`
      INSERT INTO auth.users (id, email) 
      VALUES (${testUser.id}, ${testUser.email})
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Insert test user and organization if they don't exist
    await db.insert(users).values(testUser).onConflictDoNothing();
    await db.insert(organizations).values(testOrg).onConflictDoNothing();
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(todos).where(eq(todos.organizationId, testOrg.id));
    
    // Clean up auth user
    await db.execute(sql`
      DELETE FROM auth.users WHERE id = ${testUser.id}
    `);
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const todo = await todoService.create(testTodo);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(testTodo.title);
      expect(todo.description).toBe(testTodo.description);
      expect(todo.userId).toBe(testTodo.userId);
      expect(todo.organizationId).toBe(testTodo.organizationId);
      expect(todo.priority).toBe('medium');
      expect(todo.status).toBe('pending');
      expect(todo.completed).toBe(false);
      expect(todo.tags).toEqual(['test', 'vitest']);
      expect(todo.version).toBe('1');
      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
      expect(todo.lastEditedBy).toBe(testTodo.userId);
      expect(todo.lastEditedAt).toBeDefined();
    });

    it('should create a todo with default values', async () => {
      const minimalTodo = {
        title: 'Minimal Todo',
        userId: testUser.id,
        organizationId: testOrg.id,
      };

      const todo = await todoService.create(minimalTodo);

      expect(todo.priority).toBe('medium');
      expect(todo.status).toBe('pending');
      expect(todo.completed).toBe(false);
      expect(todo.tags).toEqual([]);
      expect(todo.version).toBe('1');
    });
  });

  describe('findById', () => {
    it('should find a todo by id', async () => {
      const createdTodo = await todoService.create(testTodo);
      const foundTodo = await todoService.findById(createdTodo.id);

      expect(foundTodo).toBeDefined();
      expect(foundTodo?.id).toBe(createdTodo.id);
      expect(foundTodo?.title).toBe(testTodo.title);
    });

    it('should return null for non-existent todo', async () => {
      const foundTodo = await todoService.findById('non-existent-id');
      expect(foundTodo).toBeNull();
    });

    it('should not find soft deleted todos', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      // Soft delete the todo
      await db.update(todos)
        .set({ deletedAt: new Date() })
        .where(eq(todos.id, createdTodo.id));

      const foundTodo = await todoService.findById(createdTodo.id);
      expect(foundTodo).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should find todos by user and organization', async () => {
      await todoService.create(testTodo);
      await todoService.create({
        ...testTodo,
        title: 'Second Todo',
      });

      const userTodos = await todoService.findByUser(testUser.id, testOrg.id);

      expect(userTodos).toHaveLength(2);
      expect(userTodos[0].title).toBe('Second Todo'); // Should be ordered by updatedAt desc
      expect(userTodos[1].title).toBe('Test Todo');
    });

    it('should return empty array for user with no todos', async () => {
      const userTodos = await todoService.findByUser('550e8400-e29b-41d4-a716-446655440001', testOrg.id);
      expect(userTodos).toHaveLength(0);
    });
  });

  describe('findByOrganization', () => {
    it('should find all todos for an organization', async () => {
      await todoService.create(testTodo);
      await todoService.create({
        ...testTodo,
        title: 'Org Todo 2',
      });

      const orgTodos = await todoService.findByOrganization(testOrg.id);

      expect(orgTodos).toHaveLength(2);
      expect(orgTodos.every(todo => todo.organizationId === testOrg.id)).toBe(true);
    });
  });

  describe('findByStatus', () => {
    it('should find todos by status', async () => {
      await todoService.create(testTodo);
      await todoService.create({
        ...testTodo,
        title: 'Completed Todo',
        status: 'completed',
        completed: true,
      });

      const pendingTodos = await todoService.findByStatus(testOrg.id, 'pending');
      const completedTodos = await todoService.findByStatus(testOrg.id, 'completed');

      expect(pendingTodos).toHaveLength(1);
      expect(pendingTodos[0].status).toBe('pending');
      
      expect(completedTodos).toHaveLength(1);
      expect(completedTodos[0].status).toBe('completed');
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const updatedTodo = await todoService.update(
        createdTodo.id,
        { title: 'Updated Title', description: 'Updated Description' },
        createdTodo.version,
        testUser.id
      );

      expect(updatedTodo.title).toBe('Updated Title');
      expect(updatedTodo.description).toBe('Updated Description');
      expect(updatedTodo.version).toBe('2');
      expect(updatedTodo.lastEditedBy).toBe(testUser.id);
      expect(updatedTodo.updatedAt.getTime()).toBeGreaterThan(createdTodo.updatedAt.getTime());
    });

    it('should fail with version conflict', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      await expect(
        todoService.update(
          createdTodo.id,
          { title: 'Updated Title' },
          'wrong-version',
          testUser.id
        )
      ).rejects.toThrow('Failed to update todo - version conflict or todo not found');
    });

    it('should fail for non-existent todo', async () => {
      await expect(
        todoService.update(
          'non-existent-id',
          { title: 'Updated Title' },
          '1',
          testUser.id
        )
      ).rejects.toThrow('Failed to update todo - version conflict or todo not found');
    });
  });

  describe('markComplete and markIncomplete', () => {
    it('should mark a todo as complete', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const completedTodo = await todoService.markComplete(
        createdTodo.id,
        createdTodo.version,
        testUser.id
      );

      expect(completedTodo.completed).toBe(true);
      expect(completedTodo.status).toBe('completed');
    });

    it('should mark a todo as incomplete', async () => {
      const createdTodo = await todoService.create({
        ...testTodo,
        completed: true,
        status: 'completed',
      });
      
      const incompleteTodo = await todoService.markIncomplete(
        createdTodo.id,
        createdTodo.version,
        testUser.id
      );

      expect(incompleteTodo.completed).toBe(false);
      expect(incompleteTodo.status).toBe('pending');
    });
  });

  describe('updateStatus', () => {
    it('should update todo status', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const updatedTodo = await todoService.updateStatus(
        createdTodo.id,
        'in_progress',
        createdTodo.version,
        testUser.id
      );

      expect(updatedTodo.status).toBe('in_progress');
      expect(updatedTodo.completed).toBe(false);
    });

    it('should update completed flag when status is completed', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const updatedTodo = await todoService.updateStatus(
        createdTodo.id,
        'completed',
        createdTodo.version,
        testUser.id
      );

      expect(updatedTodo.status).toBe('completed');
      expect(updatedTodo.completed).toBe(true);
    });
  });

  describe('updatePriority', () => {
    it('should update todo priority', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const updatedTodo = await todoService.updatePriority(
        createdTodo.id,
        'high',
        createdTodo.version,
        testUser.id
      );

      expect(updatedTodo.priority).toBe('high');
    });
  });

  describe('tag management', () => {
    it('should add a tag to a todo', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const updatedTodo = await todoService.addTag(
        createdTodo.id,
        'new-tag',
        createdTodo.version,
        testUser.id
      );

      expect(updatedTodo.tags).toContain('new-tag');
      expect(updatedTodo.tags).toEqual(['test', 'vitest', 'new-tag']);
    });

    it('should not add duplicate tags', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const updatedTodo = await todoService.addTag(
        createdTodo.id,
        'test', // Already exists
        createdTodo.version,
        testUser.id
      );

      expect(updatedTodo.tags).toEqual(['test', 'vitest']);
    });

    it('should remove a tag from a todo', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const updatedTodo = await todoService.removeTag(
        createdTodo.id,
        'test',
        createdTodo.version,
        testUser.id
      );

      expect(updatedTodo.tags).not.toContain('test');
      expect(updatedTodo.tags).toEqual(['vitest']);
    });

    it('should handle removing non-existent tag', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      const updatedTodo = await todoService.removeTag(
        createdTodo.id,
        'non-existent-tag',
        createdTodo.version,
        testUser.id
      );

      expect(updatedTodo.tags).toEqual(['test', 'vitest']);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a todo', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      await todoService.softDelete(
        createdTodo.id,
        createdTodo.version,
        testUser.id
      );

      const foundTodo = await todoService.findById(createdTodo.id);
      expect(foundTodo).toBeNull();

      // Verify it still exists in database but with deletedAt set
      const [deletedTodo] = await db
        .select()
        .from(todos)
        .where(eq(todos.id, createdTodo.id));
      
      expect(deletedTodo.deletedAt).toBeDefined();
    });

    it('should fail with version conflict', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      await expect(
        todoService.softDelete(
          createdTodo.id,
          'wrong-version',
          testUser.id
        )
      ).rejects.toThrow('Failed to delete todo - version conflict or todo not found');
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a todo', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      await todoService.hardDelete(createdTodo.id);

      const foundTodo = await todoService.findById(createdTodo.id);
      expect(foundTodo).toBeNull();

      // Verify it doesn't exist in database at all
      const [deletedTodo] = await db
        .select()
        .from(todos)
        .where(eq(todos.id, createdTodo.id));
      
      expect(deletedTodo).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      // Create todos with different statuses
      await todoService.create(testTodo); // pending
      await todoService.create({
        ...testTodo,
        title: 'Todo 2',
        status: 'completed',
        completed: true,
      });
      await todoService.create({
        ...testTodo,
        title: 'Todo 3',
        status: 'in_progress',
      });
      await todoService.create({
        ...testTodo,
        title: 'Todo 4',
        status: 'cancelled',
      });

      const stats = await todoService.getStats(testOrg.id);

      expect(stats.total).toBe(4);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.cancelled).toBe(1);
    });

    it('should return zero stats for empty organization', async () => {
      const stats = await todoService.getStats('empty-org-id');

      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.inProgress).toBe(0);
      expect(stats.cancelled).toBe(0);
    });

    it('should not count soft deleted todos', async () => {
      const createdTodo = await todoService.create(testTodo);
      
      // Soft delete the todo
      await todoService.softDelete(
        createdTodo.id,
        createdTodo.version,
        testUser.id
      );

      const stats = await todoService.getStats(testOrg.id);

      expect(stats.total).toBe(0);
    });
  });
});
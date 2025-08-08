import { todoPriority, todoStatus, todos } from '@superscale/crud/schema';

// Export the local schema for Electric SQL
export const schema = {
  todos,
  todoPriority,
  todoStatus,
};

// Export individual items for convenience
export { todos, todoPriority, todoStatus };


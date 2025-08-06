// Re-export the todos table and related types from the schema only (no Node.js deps)
import {
  todos,
  todoPriority,
  todoStatus,
} from '@superscale/crud/schema';

// Export the local schema for Electric SQL
export const schema = {
  todos,
  todoPriority,
  todoStatus,
};

// Export individual items for convenience
export { todos, todoPriority, todoStatus };
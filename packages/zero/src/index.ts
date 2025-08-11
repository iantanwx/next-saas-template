export { Z } from './provider';
export type { ZeroProviderProps } from './provider';

export { schema, permissions } from './schema';
export type {
  Schema,
  AuthData,
  Todo,
  User,
  Organization,
  OrganizationMember,
  Tag,
} from './schema';

// Drizzle adapter for custom mutators
export {
  DrizzleConnection,
  createDrizzleConnectionProvider,
} from './drizzle-adapter';
export type { DrizzleTransaction } from './drizzle-adapter';

// Custom mutators
export { createMutators } from './mutators';
export type {
  CreateTodoInput,
  UpdateTodoInput,
  DeleteTodoInput,
  AddTagToTodoInput,
  RemoveTagFromTodoInput,
} from './mutators';

// Also export the generated schema for reference
export { schema as generatedSchema } from './schema.gen';

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

// Also export the generated schema for reference
export { schema as generatedSchema } from './schema.gen';

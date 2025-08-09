import {
  definePermissions,
  type ExpressionBuilder,
  type PermissionsConfig,
  type Row,
} from '@rocicorp/zero';
import { type Schema, schema } from './schema.gen';

export { schema, type Schema };

// Export row types for convenience
export type Todo = Row<typeof schema.tables.todos>;
export type User = Row<typeof schema.tables.users>;
export type Organization = Row<typeof schema.tables.organizations>;
export type OrganizationMember = Row<typeof schema.tables.organizationMembers>;
export type Tag = Row<typeof schema.tables.tags>;

// Auth data structure - matches your Supabase JWT
export type AuthData = {
  // The logged-in user ID
  sub: string;
  // Additional auth data can be added here
  email?: string;
};

// Simple permission functions following the exact pattern from Zero docs
const allowIfTodoCreator = (
  authData: AuthData,
  { cmp }: ExpressionBuilder<Schema, 'todos'>
) => cmp('userId', authData.sub);

const allowIfSelfMember = (
  authData: AuthData,
  { cmp }: ExpressionBuilder<Schema, 'organizationMembers'>
) => cmp('userId', authData.sub);

const allowIfSelfUser = (
  authData: AuthData,
  { cmp }: ExpressionBuilder<Schema, 'users'>
) => cmp('id', authData.sub);

// Organization membership check using exists
const allowIfInOrganization = (
  authData: AuthData,
  eb: ExpressionBuilder<Schema, 'todos'>
) => {
  return eb.exists('organization', (orgQ) =>
    orgQ.whereExists('members', (memberQ) =>
      memberQ.where('userId', authData.sub).where('deletedAt', 'IS', null)
    )
  );
};

const allowIfOrgMember = (
  authData: AuthData,
  eb: ExpressionBuilder<Schema, 'organizationMembers'>
) => {
  return eb.exists('organization', (orgQ) =>
    orgQ.whereExists('members', (memberQ) =>
      memberQ.where('userId', authData.sub).where('deletedAt', 'IS', null)
    )
  );
};

const allowIfOrgMemberForOrg = (
  authData: AuthData,
  eb: ExpressionBuilder<Schema, 'organizations'>
) => {
  return eb.exists('members', (memberQ) =>
    memberQ.where('userId', authData.sub).where('deletedAt', 'IS', null)
  );
};

const allowIfInTagOrganization = (
  authData: AuthData,
  eb: ExpressionBuilder<Schema, 'tags'>
) => {
  return eb.exists('organization', (orgQ) =>
    orgQ.whereExists('members', (memberQ) =>
      memberQ.where('userId', authData.sub).where('deletedAt', 'IS', null)
    )
  );
};

// TodoTags junction table permissions - verify user is member of the organization that owns the todo
const allowIfTodoTagOrganizationMember = (
  authData: AuthData,
  eb: ExpressionBuilder<Schema, 'todoTags'>
) => {
  // User must be a member of the organization that owns the todo
  return eb.exists('todo', (todoQ) =>
    todoQ.whereExists('organization', (orgQ) =>
      orgQ.whereExists('members', (memberQ) =>
        memberQ.where('userId', authData.sub).where('deletedAt', 'IS', null)
      )
    )
  );
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  return {
    todos: {
      row: {
        select: [allowIfInOrganization],
        insert: [allowIfInOrganization],
        update: {
          preMutation: [allowIfTodoCreator],
          postMutation: [allowIfTodoCreator],
        },
        delete: [allowIfTodoCreator],
      },
    },
    organizationMembers: {
      row: {
        select: [allowIfOrgMember],
        delete: [allowIfSelfMember],
      },
    },
    organizations: {
      row: {
        select: [allowIfOrgMemberForOrg],
      },
    },
    tags: {
      row: {
        select: [allowIfInTagOrganization],
        insert: [allowIfInTagOrganization],
        update: {
          preMutation: [allowIfInTagOrganization],
          postMutation: [allowIfInTagOrganization],
        },
        delete: [allowIfInTagOrganization],
      },
    },
    users: {
      row: {
        select: [allowIfSelfUser],
        update: {
          preMutation: [allowIfSelfUser],
          postMutation: [allowIfSelfUser],
        },
      },
    },
    // todoTags junction table - secure organization-based permissions
    todoTags: {
      row: {
        select: [allowIfTodoTagOrganizationMember],
        insert: [allowIfTodoTagOrganizationMember],
        delete: [allowIfTodoTagOrganizationMember],
      },
    },
  } satisfies PermissionsConfig<AuthData, Schema>;
});

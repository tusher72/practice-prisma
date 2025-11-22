# Code Guidelines and Conventions

This document outlines the coding standards, naming conventions, and best practices to be followed throughout the codebase. Adherence to these guidelines ensures consistency, maintainability, and readability.

## Table of Contents

1. [File Naming Conventions](#file-naming-conventions)
2. [Folder/Directory Naming Conventions](#folderdirectory-naming-conventions)
3. [Variable Naming Conventions](#variable-naming-conventions)
4. [Function Naming Conventions](#function-naming-conventions)
5. [Class Naming Conventions](#class-naming-conventions)
6. [Enum Naming Conventions](#enum-naming-conventions)
7. [Constant Naming Conventions](#constant-naming-conventions)
8. [Type/Interface Naming Conventions](#typeinterface-naming-conventions)
9. [Comments and Documentation](#comments-and-documentation)
10. [Code Organization](#code-organization)
11. [Import/Export Conventions](#importexport-conventions)
12. [Error Handling Conventions](#error-handling-conventions)
13. [API Conventions](#api-conventions)
14. [Database Conventions](#database-conventions)
15. [Testing Conventions](#testing-conventions)

---

## File Naming Conventions

### General Rules

- Use **kebab-case** for all file names
- Use descriptive names that clearly indicate the file's purpose
- Match the file name to the primary export (if applicable)

### Specific File Types

#### TypeScript Files

- **Services**: `*.service.ts` (e.g., `user.service.ts`, `todo.service.ts`)
- **Routes**: `*.routes.ts` (e.g., `users.routes.ts`, `todos.routes.ts`)
- **Middleware**: `*.middleware.ts` or descriptive name (e.g., `errorHandler.middleware.ts`, `validateRequest.middleware.ts`)
- **Validators**: `*.validator.ts` (e.g., `user.validator.ts`, `todo.validator.ts`)
- **Types**: `*.types.ts` or `*.types.ts` (e.g., `errors.types.ts`, `api.types.ts`)
- **Utils**: `*.util.ts` or descriptive name (e.g., `logger.util.ts`, `helpers.util.ts`)
- **Config**: `*.config.ts` or descriptive name (e.g., `env.config.ts`, `database.config.ts`)
- **Constants**: `*.constants.ts` or descriptive name (e.g., `httpStatus.constants.ts`, `environment.constants.ts`)
- **Enums**: `*.enum.ts` or descriptive name (e.g., `httpStatus.enum.ts`, `environment.enum.ts`)
- **Main entry**: `server.ts`, `index.ts`, `app.ts`

#### Configuration Files

- Use standard names: `package.json`, `tsconfig.json`, `.env`, `.gitignore`
- Docker: `Dockerfile`, `docker-compose.yaml`
- Documentation: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`

#### Test Files

- Unit tests: `*.test.ts` or `*.spec.ts`
- Integration tests: `*.integration.test.ts`
- Test files should mirror source structure

### Examples

```
✅ Good:
- user.service.ts
- todos.routes.ts
- errorHandler.ts
- user.validator.ts
- httpStatus.ts

❌ Bad:
- UserService.ts (PascalCase)
- todos_routes.ts (snake_case)
- error-handler.ts (unnecessary hyphen for single word)
- userValidator.ts (missing dot separator)
```

---

## Folder/Directory Naming Conventions

### General Rules

- Use **kebab-case** for all directory names
- Use plural names for directories containing multiple related files
- Use singular names for directories containing a single concept or module

### Directory Structure

```
src/
├── config/          # Configuration files
├── constants/       # Constant definitions
├── enums/           # Enum definitions
├── middleware/      # Express middleware
├── routes/          # Route handlers
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── validators/      # Validation schemas
```

### Examples

```
✅ Good:
- src/services/
- src/middleware/
- src/routes/
- src/validators/

❌ Bad:
- src/Services/ (PascalCase)
- src/middlewares/ (unnecessary plural)
- src/route/ (should be plural for multiple routes)
```

---

## Variable Naming Conventions

### General Rules

- Use **camelCase** for variable names
- Use descriptive names that indicate purpose
- Avoid abbreviations unless widely understood
- Use meaningful names, not single letters (except for loop counters)

### Variable Types

#### Regular Variables

```typescript
✅ Good:
const userName = "John";
const todoList = [];
const isCompleted = true;
const userCount = 10;

❌ Bad:
const un = "John"; // abbreviation
const data = []; // too generic
const flag = true; // unclear purpose
const cnt = 10; // abbreviation
```

#### Constants (Immutable)

- Use **UPPER_SNAKE_CASE** for module-level constants
- Use **camelCase** for const variables that are not truly constant

```typescript
✅ Good:
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = "https://api.example.com";

const user = await getUser(); // const for immutability, but not a constant value

❌ Bad:
const maxRetryAttempts = 3; // should be UPPER_SNAKE_CASE
const defaultTimeout = 5000; // should be UPPER_SNAKE_CASE
```

#### Private/Internal Variables

- Prefix with underscore `_` for truly private variables (rarely needed in TypeScript)
- Prefer `private` keyword in classes

```typescript
✅ Good:
class UserService {
    private prisma: PrismaClient;
    private readonly cache: Map<string, User>;
}

❌ Bad:
class UserService {
    private _prisma: PrismaClient; // underscore not needed with private keyword
}
```

#### Boolean Variables

- Use prefixes: `is`, `has`, `should`, `can`, `will`
- Make the boolean nature clear

```typescript
✅ Good:
const isActive = true;
const hasPermission = false;
const shouldRetry = true;
const canEdit = false;
const willExpire = true;

❌ Bad:
const active = true; // unclear if boolean
const permission = false; // unclear if boolean
```

---

## Function Naming Conventions

### General Rules

- Use **camelCase** for function names
- Use verb-noun pattern for action functions
- Use descriptive names that indicate what the function does
- Use consistent prefixes for related functions

### Function Types

#### Action Functions (Verbs)

```typescript
✅ Good:
function getUserById(id: number): User { }
function createUser(data: UserData): User { }
function updateUser(id: number, data: Partial<User>): User { }
function deleteUser(id: number): void { }
function validateEmail(email: string): boolean { }
function calculateTotal(items: Item[]): number { }

❌ Bad:
function user(id: number): User { } // missing verb
function get(id: number): User { } // too generic
function process(data: any): any { } // too vague
```

#### Boolean Functions

- Use `is`, `has`, `should`, `can`, `will` prefixes

```typescript
✅ Good:
function isValidEmail(email: string): boolean { }
function hasPermission(user: User, action: string): boolean { }
function shouldRetry(error: Error): boolean { }
function canEdit(user: User, resource: Resource): boolean { }

❌ Bad:
function validEmail(email: string): boolean { } // missing 'is' prefix
function permission(user: User): boolean { } // unclear
```

#### Event Handlers

- Use `handle` or `on` prefix

```typescript
✅ Good:
function handleError(error: Error): void { }
function onUserCreated(user: User): void { }
function handleRequest(req: Request, res: Response): void { }

❌ Bad:
function error(error: Error): void { } // missing prefix
function userCreated(user: User): void { } // should use 'on' prefix
```

#### Factory Functions

- Use `create` prefix

```typescript
✅ Good:
function createUserRouter(prisma: PrismaClient): Router { }
function createLogger(config: LoggerConfig): Logger { }
function createDatabaseConnection(): Connection { }

❌ Bad:
function userRouter(prisma: PrismaClient): Router { } // missing 'create' prefix
function makeLogger(config: LoggerConfig): Logger { } // inconsistent prefix
```

#### Async Functions

- No special naming required, but make async nature clear in documentation

```typescript
✅ Good:
async function fetchUser(id: number): Promise<User> { }
async function saveUser(user: User): Promise<void> { }

❌ Bad:
function fetchUser(id: number): Promise<User> { } // missing async keyword
```

---

## Class Naming Conventions

### General Rules

- Use **PascalCase** for class names
- Use descriptive nouns
- Use singular form for class names
- Suffix with type when appropriate (e.g., `Service`, `Controller`, `Manager`)

### Class Types

#### Services

```typescript
✅ Good:
class UserService { }
class TodoService { }
class EmailService { }

❌ Bad:
class User { } // conflicts with model/entity
class userService { } // camelCase
class UsersService { } // plural
```

#### Controllers/Handlers

```typescript
✅ Good:
class UserController { }
class AuthHandler { }
class RequestHandler { }

❌ Bad:
class userController { } // camelCase
class UsersController { } // plural
```

#### Models/Entities

```typescript
✅ Good:
class User { }
class Todo { }
class Product { }

❌ Bad:
class UserModel { } // redundant 'Model' suffix
class user { } // camelCase
```

#### Utilities/Helpers

```typescript
✅ Good:
class Logger { }
class Validator { }
class Formatter { }

❌ Bad:
class logger { } // camelCase
class LoggerUtil { } // redundant 'Util' suffix
```

---

## Enum Naming Conventions

### General Rules

- Use **<PascalCaseName>Enum** for enum names
- Use **UPPER_SNAKE_CASE** for enum values
- Use singular form for enum names
- Use descriptive names that indicate the enum's purpose

### Examples

```typescript
✅ Good:
enum HttpStatusEnum {
    OK = 200,
    CREATED = 201,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

enum EnvironmentEnum {
    DEVELOPMENT = "development",
    PRODUCTION = "production",
    TEST = "test",
}

enum UserRoleEnum {
    ADMIN = "admin",
    USER = "user",
    GUEST = "guest",
}

❌ Bad:
enum httpStatus { } // camelCase
enum HttpStatuses { } // plural
enum HttpStatus {
    ok = 200, // camelCase for values
    Created = 201, // PascalCase for values
}
```

### Enum File Naming

- Use kebab-case for enum file names
- Match the enum name (lowercase, kebab-case)
- Use `.enum.ts` as sub-extention (e.g.: http-status.enum.ts)

```typescript
✅ Good:
// http-status.enum.ts
export enum HttpStatus { }

// environment.ts
export enum Environment { }

❌ Bad:
// HttpStatus.ts (PascalCase)
// http_status.ts (snake_case)
```

---

## Constant Naming Conventions

### General Rules

- Use **UPPER_SNAKE_CASE** for true constants (immutable, module-level)
- Use **camelCase** for const variables (immutable reference, but value may vary)
- Group related constants in objects or enums when appropriate

### Examples

```typescript
✅ Good:
// True constants (never change)
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = "https://api.example.com";
const DATABASE_CONNECTION_POOL_SIZE = 20;

// Const variables (immutable reference, but value varies)
const user = await getUser();
const currentTime = Date.now();
const config = loadConfig();

// Grouped constants
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NOT_FOUND: 404,
} as const;

❌ Bad:
const maxRetryAttempts = 3; // should be UPPER_SNAKE_CASE
const DEFAULT_TIMEOUT = getTimeout(); // not a true constant
const user = getUser(); // if reassigned, use let
```

---

## Type/Interface Naming Conventions

### General Rules

- Use **PascalCase** for type and interface names
- Use descriptive names
- Use `I` prefix for interfaces (optional, but be consistent)
- Use `T` prefix for generic types (optional)

### Examples

```typescript
✅ Good:
// Interfaces
interface User {
    id: number;
    name: string;
    email: string;
}

interface IUserService {
    findById(id: number): Promise<User>;
}

// Types
type UserData = {
    name: string;
    email: string;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
};

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Generic types
type Repository<T> = {
    findById(id: number): Promise<T>;
    save(entity: T): Promise<T>;
};

❌ Bad:
interface user { } // camelCase
interface Iuser { } // incorrect prefix capitalization
type userData = { } // camelCase
type apiResponse = { } // camelCase
```

---

## Comments and Documentation

### General Rules

- Write self-documenting code first; comments should explain "why", not "what"
- Use JSDoc for public APIs, functions, classes, and modules
- Keep comments up-to-date with code changes
- Use clear, concise language
- Avoid redundant comments

### Comment Types

#### JSDoc Comments

- Use for all exported functions, classes, interfaces, and modules
- Include description, parameters, return types, and examples when helpful

````typescript
✅ Good:
/**
 * Retrieves a user by their unique ID.
 *
 * @param {number} id - The unique identifier of the user
 * @returns {Promise<User>} A promise that resolves to the user object
 * @throws {NotFoundError} If no user is found with the given ID
 *
 * @example
 * ```typescript
 * const user = await userService.findById(1);
 * ```
 */
async findById(id: number): Promise<User> {
    // Implementation
}

❌ Bad:
// Gets user by id
async findById(id: number): Promise<User> {
    // Implementation
}
````

#### Inline Comments

- Use sparingly for complex logic
- Explain "why", not "what"

```typescript
✅ Good:
// Use connection pooling to improve performance under high load
const pool = new Pool({ max: 20 });

// Skip validation for admin users to allow bulk operations
if (user.role !== UserRole.ADMIN) {
    await validateRequest(data);
}

❌ Bad:
// Create a new pool
const pool = new Pool({ max: 20 }); // redundant

// Check if user is not admin
if (user.role !== UserRole.ADMIN) { // obvious from code
    await validateRequest(data);
}
```

#### TODO Comments

- Use for temporary code or future improvements
- Include context and ticket number if applicable

```typescript
✅ Good:
// TODO: Implement caching layer to reduce database queries
// TODO: Refactor to use dependency injection (ticket #123)
// FIXME: Handle edge case when userId is null

❌ Bad:
// TODO: fix this
// TODO: improve
```

#### Block Comments

- Use for multi-line explanations
- Use `/* */` for block comments

```typescript
✅ Good:
/*
 * This function handles complex business logic that requires
 * multiple database queries and transformations. The order
 * of operations is critical for data consistency.
 */
async processOrder(order: Order): Promise<void> {
    // Implementation
}
```

---

## Code Organization

### File Structure

- One main export per file (when possible)
- Group related functionality
- Order: imports, types, constants, functions, classes, exports

```typescript
✅ Good:
// 1. Imports
import { Request, Response } from "express";
import { UserService } from "../services/user.service";

// 2. Types/Interfaces
type UserResponse = {
    id: number;
    name: string;
};

// 3. Constants
const DEFAULT_LIMIT = 10;

// 4. Functions/Classes
export function createUserRouter(prisma: PrismaClient): Router {
    // Implementation
}

// 5. Exports
export default createUserRouter;
```

### Function Organization

- Keep functions focused and single-purpose
- Limit function length (ideally < 50 lines)
- Extract complex logic into helper functions

### Class Organization

```typescript
✅ Good:
class UserService {
    // 1. Properties
    private readonly prisma: PrismaClient;

    // 2. Constructor
    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    // 3. Public methods
    async findById(id: number): Promise<User> {
        // Implementation
    }

    // 4. Private methods
    private validateUser(user: User): void {
        // Implementation
    }
}
```

---

## Import/Export Conventions

### Import Order

1. External dependencies (Node.js, npm packages)
2. Internal modules (relative imports)
3. Type-only imports (use `import type`)

```typescript
✅ Good:
// External
import express from "express";
import { PrismaClient } from "@prisma/client";

// Internal
import { UserService } from "../services/user.service";
import { validateRequest } from "../middleware/validateRequest";

// Types
import type { User } from "../types/user";

❌ Bad:
import { UserService } from "../services/user.service";
import express from "express"; // wrong order
```

### Export Conventions

- Use named exports for utilities and functions
- Use default exports for main module exports
- Be consistent within a module

```typescript
✅ Good:
// Named exports
export function createUserRouter(): Router { }
export class UserService { }
export const DEFAULT_LIMIT = 10;

// Default export (main export)
export default createUserRouter;

❌ Bad:
// Mixing styles inconsistently
export default function createUserRouter() { }
export const createUserRouter = () => { }; // same file
```

---

## Error Handling Conventions

### Error Classes

- Extend base `AppError` class
- Use descriptive error messages
- Include relevant context

```typescript
✅ Good:
throw new NotFoundError("User", userId);
throw new ValidationError("Email is required", { field: "email" });
throw new ConflictError("User with this email already exists");

❌ Bad:
throw new Error("Error");
throw new Error("User not found"); // use specific error class
```

### Error Messages

- Use clear, user-friendly messages
- Include actionable information when possible
- Avoid exposing internal implementation details

```typescript
✅ Good:
"User with id 123 not found"
"Email is required"
"Invalid email format"

❌ Bad:
"Error 404"
"Failed"
"null pointer exception" // too technical
```

---

## API Conventions

### Route Naming

- Use **kebab-case** for route paths
- Use RESTful conventions
- Use plural nouns for resources

```typescript
✅ Good:
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id

GET    /todos
GET    /todos/:id
POST   /todos
PATCH  /todos/:id
DELETE /todos/:id

❌ Bad:
GET    /user (singular)
GET    /getUser/:id (verb in path)
POST   /createUser (verb in path)
GET    /users_list (snake_case)
```

### Response Format

- Use consistent response structure
- Include success flag
- Use appropriate HTTP status codes

```typescript
✅ Good:
// Success
{
    "success": true,
    "data": { ... }
}

// Error
{
    "success": false,
    "error": {
        "message": "Error message"
    }
}

❌ Bad:
// Inconsistent structure
{ "user": { ... } }
{ "error": "Error message" }
{ "status": "ok", "result": { ... } }
```

---

## Database Conventions

### Table/Model Naming

- Use **snake_case** for database tables
- Use singular form for table names
- Use descriptive names

```sql
✅ Good:
users
todos
user_profiles
order_items

❌ Bad:
Users (PascalCase)
todos_list (redundant)
userProfiles (camelCase)
```

### Column Naming

- Use **snake_case** for column names
- Use descriptive names
- Use consistent naming patterns

```sql
✅ Good:
id
user_id
created_at
updated_at
is_active
email_address

❌ Bad:
ID (uppercase)
userId (camelCase)
createdAt (camelCase)
isActive (camelCase)
```

### Prisma Schema

- Use **PascalCase** for model names
- Use **camelCase** for field names
- Match database conventions in `@@map`

```prisma
✅ Good:
model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    createdAt DateTime @default(now()) @map("created_at")
    @@map("users")
}

❌ Bad:
model user {
    id Int @id
    Email String
}
```

---

## Testing Conventions

### Test File Naming

- Mirror source file structure
- Use `.test.ts` or `.spec.ts` suffix

```
✅ Good:
src/services/user.service.ts
src/services/user.service.test.ts

src/routes/users.routes.ts
src/routes/users.routes.test.ts
```

### Test Function Naming

- Use descriptive test names
- Follow pattern: `should [expected behavior] when [condition]`

```typescript
✅ Good:
describe("UserService", () => {
    it("should return user when valid id is provided", async () => {
        // Test
    });

    it("should throw NotFoundError when user does not exist", async () => {
        // Test
    });
});

❌ Bad:
describe("UserService", () => {
    it("test 1", () => { });
    it("findById", () => { });
});
```

---

## Additional Best Practices

### TypeScript Specific

- Always use explicit types for function parameters and return types
- Avoid `any` type; use `unknown` when type is truly unknown
- Use `const` assertions for literal types
- Prefer interfaces for object shapes, types for unions/intersections

### Performance

- Avoid premature optimization
- Use async/await consistently
- Implement proper error handling
- Use connection pooling for databases

### Security

- Never commit secrets or API keys
- Validate and sanitize all user input
- Use parameterized queries (Prisma handles this)
- Implement rate limiting
- Use HTTPS in production

### Git Conventions

- Use conventional commit messages
- Keep commits focused and atomic
- Write meaningful commit messages

```
✅ Good:
feat: add user authentication
fix: resolve database connection timeout
docs: update API documentation
refactor: simplify error handling logic

❌ Bad:
update
fix bug
changes
```

---

## Summary Checklist

When writing code, ensure:

- [ ] Files use kebab-case naming
- [ ] Variables use camelCase
- [ ] Constants use UPPER_SNAKE_CASE
- [ ] Classes use PascalCase
- [ ] Enums use PascalCase with UPPER_SNAKE_CASE values
- [ ] Functions are descriptive and use verb-noun pattern
- [ ] JSDoc comments for public APIs
- [ ] Consistent import ordering
- [ ] Proper error handling
- [ ] TypeScript types are explicit
- [ ] Code is organized logically
- [ ] No hardcoded values (use constants/enums)
- [ ] RESTful API conventions followed

---

## References

- [TypeScript Style Guide](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Last Updated**: 2024-11-23
**Version**: 1.0.0

# Practice Prisma - Production-Ready Backend API

A robust, production-ready RESTful API built with Node.js, Express, TypeScript, and Prisma. This application demonstrates industry best practices including proper error handling, security, logging, validation, and code organization.

## ✨ Features

- **RESTful API** - Clean, well-structured REST endpoints for Users and Todos
- **Type Safety** - Full TypeScript support with strict type checking
- **Input Validation** - Zod schema validation for all requests
- **Error Handling** - Centralized error handling with custom error classes
- **Security** - Helmet.js, CORS, rate limiting, and input sanitization
- **Logging** - Winston-based structured logging with file and console outputs
- **Database** - PostgreSQL with Prisma ORM and connection pooling
- **Health Checks** - Health monitoring endpoints for application and database
- **Pagination & Filtering** - Advanced query capabilities for list endpoints
- **Graceful Shutdown** - Proper resource cleanup on application termination
- **CLI Tool** - Command-line interface for testing API endpoints

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.8.2
- **Database**: PostgreSQL 15
- **ORM**: Prisma 7.0.0

### Key Dependencies
- **Validation**: Zod 3.24.1
- **Logging**: Winston 3.15.0
- **Security**: Helmet 8.0.0, express-rate-limit 7.4.1
- **Database**: @prisma/adapter-pg 7.0.0, pg 8.16.3
- **CLI**: Commander 12.1.0, Axios 1.7.9, Chalk 5.3.0

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **PostgreSQL** 15 or higher
- **Docker** and **Docker Compose** (optional, for containerized setup)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd practice-prisma
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public

# Or use individual database variables
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secret
DB_DATABASE=practice_prisma

# CORS
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Run Prisma migrations
- Seed the database with sample data
- Start the development server

#### Option B: Manual Setup

1. **Create Database**:
   ```bash
   createdb practice_prisma
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

3. **Run Migrations**:
   ```bash
   npm run prisma:migrate
   ```

4. **Seed Database**:
   ```bash
   npm run prisma:seed
   ```

### 5. Start the Application

**Development Mode**:
```bash
npm run dev
```

**Production Mode**:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## 📜 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create and apply database migrations |
| `npm run prisma:migrate:deploy` | Apply migrations in production |
| `npm run prisma:seed` | Seed database with sample data |
| `npm run format` | Format code with Prettier |
| `npm run cli` | Run CLI tool for API testing |

## 🔌 API Endpoints

### Health Checks

- `GET /health` - Full health check with database status
- `GET /health/ping` - Simple ping endpoint

### Users

- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Todos

- `GET /todos` - List todos with pagination and filtering
  - Query params: `userId`, `completed`, `page`, `limit`
- `GET /todos/:id` - Get todo by ID
- `POST /todos` - Create a new todo
- `PATCH /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

### Example Requests

**Create User**:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

**List Todos with Filters**:
```bash
curl "http://localhost:3000/todos?userId=1&completed=false&page=1&limit=10"
```

## 📁 Project Structure

```
practice-prisma/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.config.ts
│   │   └── env.config.ts
│   ├── enums/           # Enum definitions
│   │   ├── environment.enum.ts
│   │   └── http-status.enum.ts
│   ├── middleware/      # Express middleware
│   │   ├── async-handler.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── not-found-handler.middleware.ts
│   │   ├── request-logger.middleware.ts
│   │   └── validate-request.middleware.ts
│   ├── routes/          # Route handlers
│   │   ├── health.routes.ts
│   │   ├── todos.routes.ts
│   │   └── users.routes.ts
│   ├── services/        # Business logic
│   │   ├── todo.service.ts
│   │   └── user.service.ts
│   ├── types/           # TypeScript types
│   │   └── errors.types.ts
│   ├── utils/           # Utility functions
│   │   └── logger.util.ts
│   ├── validators/      # Validation schemas
│   │   ├── todo.validator.ts
│   │   └── user.validator.ts
│   └── server.ts        # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Database seeding
│   └── migrations/      # Database migrations
├── logs/                # Application logs
├── docker-compose.yaml  # Docker configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Features

### 1. **Helmet.js**
- Sets secure HTTP headers
- Protects against XSS attacks
- Content Security Policy
- Prevents clickjacking

### 2. **Rate Limiting**
- Configurable request limits per IP
- Default: 100 requests per 15 minutes
- Prevents abuse and DDoS attacks

### 3. **CORS Configuration**
- Configurable allowed origins
- Supports multiple origins
- Credentials support

### 4. **Input Validation**
- Zod schema validation for all endpoints
- Type-safe request handling
- Prevents SQL injection and invalid data
- Email format validation
- String length limits

### 5. **Error Sanitization**
- Detailed errors in development
- Sanitized errors in production
- No sensitive information leakage

## 🛡️ Error Handling

### Custom Error Classes

- **AppError** - Base error class with HTTP status codes
- **ValidationError** - 400 Bad Request for validation failures
- **NotFoundError** - 404 Not Found for missing resources
- **ConflictError** - 409 Conflict for duplicate entries

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": [...]
  }
}
```

### Prisma Error Handling

- **P2002** - Unique constraint violation → 409 Conflict
- **P2025** - Record not found → 404 Not Found
- **Validation Errors** → 400 Bad Request

## 📊 Logging

### Winston Logger Configuration

- **File Logging**:
  - `logs/error.log` - Error-level logs only
  - `logs/combined.log` - All logs

- **Console Logging**:
  - Colorized output in development
  - JSON format in production

- **Log Levels**:
  - Production: `info`
  - Development: `debug`

### Logged Information

- HTTP requests (method, path, status, duration)
- Database queries (query, duration)
- Errors (message, stack trace, context)
- Application events (startup, shutdown)

## 🧪 Testing with CLI

The project includes a CLI tool for testing API endpoints:

```bash
# Health checks
npm run cli health:ping
npm run cli health:check

# User operations
npm run cli users:list
npm run cli users:get <id>
npm run cli users:create --name "John" --email "john@example.com"
npm run cli users:update <id> --name "Jane"
npm run cli users:delete <id>

# Todo operations
npm run cli todos:list
npm run cli todos:list --userId 1 --completed false
npm run cli todos:get <id>
npm run cli todos:create --title "Task" --userId 1
npm run cli todos:update <id> --completed true
npm run cli todos:delete <id>

# Run full test suite
npm run cli test:all
```

## 🏗️ Architecture

### Service Layer Pattern

Business logic is separated from route handlers:
- **Routes** - Handle HTTP requests/responses
- **Services** - Contain business logic
- **Validators** - Validate input data
- **Middleware** - Cross-cutting concerns

### Code Organization

- **Separation of Concerns** - Each module has a single responsibility
- **DRY Principle** - No code duplication
- **Type Safety** - Full TypeScript coverage
- **Error Handling** - Centralized and consistent

## ⚙️ Configuration

### Environment Variables

All configuration is managed through environment variables with Zod validation:

- **NODE_ENV** - Application environment (development/production/test)
- **PORT** - Server port (default: 3000)
- **DATABASE_URL** - PostgreSQL connection string
- **CORS_ORIGIN** - Allowed CORS origins
- **RATE_LIMIT_WINDOW_MS** - Rate limit window in milliseconds
- **RATE_LIMIT_MAX_REQUESTS** - Maximum requests per window

### Database Configuration

- **Connection Pooling** - Max 20 connections
- **Idle Timeout** - 30 seconds
- **Connection Timeout** - 2 seconds
- **Health Checks** - Automatic connection monitoring

## 🚀 Performance

- **Connection Pooling** - Efficient database connection management
- **Parallel Queries** - Optimized database queries
- **Request Logging** - Performance monitoring
- **Graceful Shutdown** - Clean resource cleanup

## 📝 Code Quality

- **TypeScript** - Strict type checking enabled
- **ESLint/Prettier** - Code formatting and linting
- **Naming Conventions** - Consistent naming throughout
- **JSDoc Comments** - Comprehensive documentation
- **Error Handling** - Proper error propagation

## 🔄 Database Migrations

### Create Migration

```bash
npm run prisma:migrate
```

### Apply Migrations (Production)

```bash
npm run prisma:migrate:deploy
```

### Reset Database

```bash
npx prisma migrate reset
```

## 📦 Docker Support

The project includes Docker Compose configuration for easy setup:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 🤝 Contributing

1. Follow the coding guidelines in `guidelines.md`
2. Ensure all code follows TypeScript best practices
3. Add appropriate error handling
4. Include JSDoc comments for public APIs
5. Test your changes thoroughly

## 📄 License

This project is private and for practice purposes.

## 🎯 Roadmap & Future Goals

### Short-term Goals

- [ ] **Unit Testing**
  - Add unit tests for services
  - Test coverage for business logic
  - Mock database operations

- [ ] **Integration Testing**
  - API endpoint testing
  - Database integration tests
  - End-to-end test scenarios

- [ ] **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API explorer
  - Request/response examples

### Medium-term Goals

- [ ] **Authentication & Authorization**
  - JWT-based authentication
  - Refresh token mechanism
  - Role-based access control (RBAC)
  - Password hashing with bcrypt

- [ ] **API Versioning**
  - Version management strategy
  - Backward compatibility
  - Deprecation handling

- [ ] **Caching**
  - Redis integration
  - Query result caching
  - Response caching middleware

### Long-term Goals

- [ ] **Monitoring & Observability**
  - Application Performance Monitoring (APM)
  - Error tracking (Sentry integration)
  - Metrics collection (Prometheus)
  - Distributed tracing

- [ ] **CI/CD Pipeline**
  - GitHub Actions workflows
  - Automated testing
  - Code quality checks
  - Deployment automation

- [ ] **Advanced Features**
  - WebSocket support
  - Real-time notifications
  - File upload handling
  - Background job processing

- [ ] **Documentation**
  - API documentation site
  - Architecture diagrams
  - Deployment guides
  - Contributing guidelines

## 📞 Support

For questions or issues, please refer to the project documentation or create an issue in the repository.

---

**Built with ❤️ using TypeScript, Express, and Prisma**


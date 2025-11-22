# Practice Prisma - Production-Ready Backend API

A robust, production-ready RESTful API built with Node.js, Express, TypeScript, and Prisma. This application demonstrates industry best practices including proper error handling, security, logging, validation, and code organization.

## ✨ Features

- **RESTful API** - Clean, well-structured REST endpoints following industry standards
- **Type Safety** - Full TypeScript support with strict type checking
- **Input Validation** - Zod schema validation for all requests
- **Error Handling** - Centralized error handling with custom error classes
- **Security** - Helmet.js, CORS, rate limiting, and input sanitization
- **Logging** - Winston-based structured logging with file and console outputs
- **Database** - PostgreSQL with Prisma ORM and connection pooling
- **Health Checks** - Health monitoring endpoints for application and database
- **Pagination & Filtering** - Advanced query capabilities for list endpoints
- **Graceful Shutdown** - Proper resource cleanup on application termination

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
NODE_ENV=development                    # Application environment (development/production/test)
PORT=3000                               # Server port number

# Database
# Option 1: Use DATABASE_URL directly
DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public

# Option 2: Use individual database variables (DATABASE_URL will be constructed automatically)
DB_HOST=localhost                       # Database host (default: localhost)
DB_PORT=5432                            # Database port (default: 5432)
FORWARD_DB_PORT=5432                    # Forwarded database port for Docker (optional, takes precedence over DB_PORT)
DB_USERNAME=postgres                    # Database username (optional, default: postgres)
DB_PASSWORD=secret                      # Database password (optional, default: secret)
DB_DATABASE=practice_prisma             # Database name (optional, default: postgres)

# CORS
CORS_ORIGIN=*                           # Allowed CORS origins (default: *)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000             # Rate limit window in milliseconds (default: 900000 = 15 minutes)
RATE_LIMIT_MAX_REQUESTS=100             # Maximum requests per window (default: 100)
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

| Command                         | Description                              |
| ------------------------------- | ---------------------------------------- |
| `npm run dev`                   | Start development server with hot reload |
| `npm run build`                 | Compile TypeScript to JavaScript         |
| `npm start`                     | Start production server                  |
| `npm run prisma:generate`       | Generate Prisma Client                   |
| `npm run prisma:migrate`        | Create and apply database migrations     |
| `npm run prisma:migrate:deploy` | Apply migrations in production           |
| `npm run prisma:seed`           | Seed database with sample data           |
| `npm run format`                | Format code with Prettier                |

## 🔌 API Endpoints

### Health Checks

- `GET /health` - Full health check with database status
- `GET /health/ping` - Simple ping endpoint

### RESTful Resources

The API follows RESTful conventions with standard CRUD operations:

- `GET /resources` - List all resources with optional pagination and filtering
- `GET /resources/:id` - Get a specific resource by ID
- `POST /resources` - Create a new resource
- `PATCH /resources/:id` - Update an existing resource
- `DELETE /resources/:id` - Delete a resource

### Example Requests

**Create Resource**:

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{"field1": "value1", "field2": "value2"}'
```

**List Resources with Filters**:

```bash
curl "http://localhost:3000/resources?filter=value&page=1&limit=10"
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
│   │   └── *.routes.ts
│   ├── services/        # Business logic
│   │   └── *.service.ts
│   ├── types/           # TypeScript types
│   │   └── errors.types.ts
│   ├── utils/           # Utility functions
│   │   └── logger.util.ts
│   ├── validators/      # Validation schemas
│   │   └── *.validator.ts
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

The application uses a hierarchy of custom error classes for consistent error handling:

- **AppError** - Base error class with HTTP status codes
- **ValidationError** - 400 Bad Request for validation failures
- **NotFoundError** - 404 Not Found for missing resources
- **ConflictError** - 409 Conflict for duplicate entries or constraint violations

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

## 🏗️ Architecture

### Service Layer Pattern

Business logic is separated from route handlers following clean architecture principles:

- **Routes** - Handle HTTP requests/responses and route definitions
- **Services** - Contain business logic and data access operations
- **Validators** - Validate and sanitize input data
- **Middleware** - Handle cross-cutting concerns (logging, error handling, authentication)

### Code Organization

- **Separation of Concerns** - Each module has a single responsibility
- **DRY Principle** - No code duplication
- **Type Safety** - Full TypeScript coverage
- **Error Handling** - Centralized and consistent

## ⚙️ Configuration

### Environment Variables

All configuration is managed through environment variables with Zod validation:

#### Application Variables

- **NODE_ENV** - Application environment (development/production/test), default: `development`
- **PORT** - Server port number, default: `3000`

#### Database Variables

- **DATABASE_URL** - PostgreSQL connection string (optional). If provided, takes precedence over individual DB_* variables
- **DB_HOST** - Database host address, default: `localhost`
- **DB_PORT** - Database port number, default: `5432`
- **FORWARD_DB_PORT** - Forwarded database port for Docker (optional). Takes precedence over DB_PORT when provided
- **DB_USERNAME** - Database username (optional), default: `postgres`
- **DB_PASSWORD** - Database password (optional), default: `secret`
- **DB_DATABASE** - Database name (optional), default: `postgres`

**Note**: If `DATABASE_URL` is provided, it will be used directly. Otherwise, the connection string will be constructed from the individual `DB_*` variables.

#### Security Variables

- **CORS_ORIGIN** - Allowed CORS origins (comma-separated for multiple origins), default: `*`
- **RATE_LIMIT_WINDOW_MS** - Rate limit window in milliseconds, default: `900000` (15 minutes)
- **RATE_LIMIT_MAX_REQUESTS** - Maximum requests per IP per window, default: `100`

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

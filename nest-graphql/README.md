# 🎬 NestJS GraphQL Movie API

A production-ready GraphQL API server built with NestJS, Apollo Server 4, and Prisma. Demonstrates code-first GraphQL schema generation, type-safe database access, and modern API development practices.

## 📋 Overview

This project showcases a complete GraphQL API implementation with:
- Code-first GraphQL schema using decorators
- Prisma ORM for type-safe database access
- PostgreSQL database with Docker Compose
- Apollo Server 4 integration
- Movie domain with full CRUD operations
- Comprehensive documentation and examples

## ✨ Features

- **Code-First GraphQL**: Define schema using TypeScript decorators
- **Type Safety**: Full TypeScript support with Prisma
- **CRUD Operations**: Create, read, update, delete movies
- **Computed Fields**: Example of field resolvers
- **Docker Setup**: Easy database setup with Docker Compose
- **Prisma Migrations**: Database version control
- **Seed Data**: Sample data for testing

## 🏗 Architecture

```
nest-graphql/
├── server/                 # NestJS GraphQL server
│   ├── src/
│   │   ├── main.ts        # Application entry point
│   │   ├── app.module.ts  # Root module
│   │   ├── prisma.service.ts  # Prisma client service
│   │   └── movie/         # Movie feature module
│   │       ├── movie.model.ts      # GraphQL object type
│   │       ├── movie.input.ts      # GraphQL input types
│   │       ├── movie.resolver.ts   # GraphQL resolvers
│   │       ├── movie.service.ts    # Business logic
│   │       └── movie.module.ts    # Movie module
│   ├── prisma/
│   │   ├── schema.prisma  # Prisma schema
│   │   ├── migrations/    # Database migrations
│   │   └── seeds.ts       # Seed data script
│   ├── docker-compose.yml # PostgreSQL + pgAdmin
│   └── package.json
│
└── client/                 # React client (optional)
    └── ...
```

## 🛠 Technology Stack

- **NestJS 11** - Enterprise Node.js framework
- **@nestjs/graphql** - GraphQL integration
- **Apollo Server 4** - GraphQL server
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe development
- **Docker Compose** - Database containerization

## 📦 Installation

### Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose

### Setup Steps

1. **Navigate to server directory**:
   ```bash
   cd nest-graphql/server
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Start PostgreSQL and pgAdmin**:
   ```bash
   docker compose up -d
   ```
   This starts:
   - PostgreSQL on port `5433`
   - pgAdmin on port `5555`

4. **Apply Prisma migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Seed sample data** (optional):
   ```bash
   npx ts-node prisma/seeds.ts
   ```

6. **Start the server**:
   ```bash
   yarn start:dev
   ```

The GraphQL endpoint will be available at `http://localhost:3000/graphql`.

## 🚀 Quick Start

### Start Development Server

```bash
yarn start:dev
```

### Access GraphQL Playground

If you enable the landing page plugin (see below), visit:
```
http://localhost:3000/graphql
```

### Test with curl

```bash
# Get all movies
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
    "query": "{ getAllMovies { id title description createdAt updatedAt } }"
  }'
```

## 📡 GraphQL API

### Schema Overview

The API provides the following operations:

#### Queries
- `getAllMovies(): [Movie!]!` - Get all movies
- `getMovieById(id: Int!): Movie!` - Get movie by ID

#### Mutations
- `createMovie(movieInputCreate: MovieInputCreate!): Movie!` - Create a new movie

#### Types

**Movie**:
```graphql
type Movie {
  id: Int!
  title: String
  description: String
  createdAt: DateTime!
  updatedAt: DateTime!
  movieComment: [String!]!
}
```

**MovieInputCreate**:
```graphql
input MovieInputCreate {
  title: String
  description: String
}
```

### Example Queries

#### Get All Movies
```graphql
query {
  getAllMovies {
    id
    title
    description
    createdAt
    updatedAt
    movieComment
  }
}
```

#### Get Movie by ID
```graphql
query GetMovie($id: Int!) {
  getMovieById(id: $id) {
    id
    title
    description
    createdAt
    updatedAt
  }
}
```

**Variables**:
```json
{
  "id": 1
}
```

#### Create Movie
```graphql
mutation CreateMovie($input: MovieInputCreate!) {
  createMovie(movieInputCreate: $input) {
    id
    title
    description
  }
}
```

**Variables**:
```json
{
  "input": {
    "title": "Inception",
    "description": "Mind-bending sci-fi"
  }
}
```

## 📁 Project Structure

### `src/movie/` - Movie Feature Module

#### `movie.model.ts`
Defines the GraphQL `Movie` object type:
- Uses `@ObjectType()` decorator
- Fields with `@Field()` decorator
- Computed field `movieComment` with resolver

#### `movie.input.ts`
Defines GraphQL input types:
- `MovieInputCreate` - For creating movies
- `MovieInputEdit` - For updating movies (internal use)

#### `movie.resolver.ts`
GraphQL resolvers:
- `@Query()` decorators for queries
- `@Mutation()` decorator for mutations
- `@ResolveField()` for computed fields

#### `movie.service.ts`
Business logic layer:
- Prisma database operations
- `findMany()` - Get all movies
- `findFirstOrThrow()` - Get by ID
- `create()` - Create new movie

#### `movie.module.ts`
NestJS module configuration:
- Imports PrismaModule
- Provides MovieService
- Exports MovieResolver

### `prisma/schema.prisma`

Prisma schema definition:
```prisma
model Movie {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  description String?  @default("")
  updatedAt   DateTime @updatedAt
  title       String?
  movieComment MovieComment[]
}
```

## 🔧 Configuration

### Database Connection

Configured in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:postgres@localhost:5433/graphql_example"
}
```

### GraphQL Configuration

In `app.module.ts`:
```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,  // Generates schema automatically
  // plugins: [ApolloServerPluginLandingPageLocalDefault()],  // Enable browser IDE
});
```

### Enable Browser IDE

To enable GraphQL Playground in browser:

1. Install plugin:
   ```bash
   yarn add @apollo/server/plugin/landingPage/default
   ```

2. Update `app.module.ts`:
   ```typescript
   import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

   GraphQLModule.forRoot<ApolloDriverConfig>({
     driver: ApolloDriver,
     autoSchemaFile: true,
     plugins: [ApolloServerPluginLandingPageLocalDefault()],
   });
   ```

3. Restart server and visit `http://localhost:3000/graphql`

## 🧪 Testing

### Using GraphQL Playground

1. Enable browser IDE (see above)
2. Visit `http://localhost:3000/graphql`
3. Use the interactive interface to test queries

### Using curl

See examples in [Quick Start](#-quick-start) section.

### Using Postman/Insomnia

1. Set method to POST
2. URL: `http://localhost:3000/graphql`
3. Headers: `Content-Type: application/json`
4. Body: JSON with `query` and optional `variables`

### Using Apollo Client

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
});

const GET_MOVIES = gql`
  query {
    getAllMovies {
      id
      title
      description
    }
  }
`;

client.query({ query: GET_MOVIES }).then(result => console.log(result));
```

## 🗄 Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Accessing Database

**Via psql**:
```bash
psql -U postgres -d graphql_example -h localhost -p 5433
```

**Via pgAdmin**:
- URL: `http://localhost:5555`
- Email: `admin@admin.com`
- Password: `admin`
- Server: `postgres` (host: `postgres`, port: `5432`)

## 🐛 Troubleshooting

### Database Connection Error
- Ensure Docker containers are running: `docker compose ps`
- Check database URL in `schema.prisma`
- Verify PostgreSQL is accessible on port 5433

### Schema Generation Issues
- Run `npx prisma generate` after schema changes
- Clear `.prisma` cache if needed

### Migration Errors
- Check migration files in `prisma/migrations/`
- Use `npx prisma migrate reset` to start fresh (⚠️ deletes data)

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)

## 🔒 Security Considerations

1. **Input Validation**: Add class-validator decorators
2. **Authentication**: Implement JWT or OAuth
3. **Rate Limiting**: Add rate limiting middleware
4. **Error Handling**: Don't expose internal errors
5. **CORS**: Configure CORS properly for production

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Movie reviews and ratings
- [ ] Search and filtering
- [ ] Pagination
- [ ] File uploads (posters, trailers)
- [ ] Real-time subscriptions
- [ ] Caching layer (Redis)
- [ ] API rate limiting
- [ ] GraphQL federation

## 📝 License

UNLICENSED

---

**Demonstrating modern GraphQL API development with NestJS and Prisma**


## Nest GraphQL Server

A simple NestJS + GraphQL + Prisma server with a Movie domain. Uses Apollo Server 4, code-first GraphQL schema generation, and PostgreSQL (via Docker Compose).

### Tech stack
- **NestJS 11** with **@nestjs/graphql** and **Apollo Driver**
- **GraphQL 16** (code-first using decorators)
- **Prisma** ORM (PostgreSQL)
- **Docker Compose** for local Postgres + pgAdmin

---

## What is `@/movie` (the Movie module)?
`@/movie` refers to the Movie feature located in `src/movie`. It encapsulates the GraphQL schema, resolver, and service for movies.

- `src/movie/movie.model.ts`:
  - GraphQL object type `Movie` exposed in the schema
  - Fields: `id`, `title` (nullable), `description` (nullable), `createdAt`, `updatedAt`, and a computed field `movieComment` (example data)
- `src/movie/movie.input.ts`:
  - GraphQL input types
  - `MovieInputCreate` for creating a movie
  - `MovieInputEdit` (currently used by the service only)
- `src/movie/movie.resolver.ts`:
  - GraphQL Resolver that exposes operations:
    - `getAllMovies(): [Movie]`
    - `getMovieById(id: Int!): Movie`
    - `createMovie(movieInputCreate: MovieInputCreate!): Movie`
    - `movieComment(movie: Movie): [String]` as a sample resolve field
- `src/movie/movie.service.ts`:
  - Business logic and Prisma calls (`findMany`, `findFirstOrThrow`, `create`, etc.)
- `src/movie/movie.module.ts`:
  - Wires the resolver and service together and is imported by `AppModule`

Prisma model lives in `prisma/schema.prisma` and looks like:
```prisma
model Movie {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  description String?  @default("")
  updatedAt   DateTime @default(now())
  title       String?
  movieComment MovieComment[]
}
```

---

## Prerequisites
- Node.js 18+ and Yarn
- Docker + Docker Compose

---

## Getting started

### 1) Install dependencies
```bash
yarn install
```

### 2) Start Postgres and pgAdmin
```bash
docker compose up -d
```
This starts Postgres on port `5433` and pgAdmin on `5555`. The Prisma datasource in `prisma/schema.prisma` already points to `postgresql://postgres:postgres@localhost:5433/graphql_example`.

### 3) Apply Prisma migrations and generate client
```bash
npx prisma generate
npx prisma migrate deploy
```

### 4) Seed sample data (optional but recommended)
```bash
npx ts-node prisma/seeds.ts
```

### 5) Run the server
```bash
yarn start:dev
```
You should see logs indicating the GraphQL route is mapped: `Mapped {/graphql, POST}`. The server listens on `http://localhost:3000`.

---

## How to test on localhost:3000
The GraphQL endpoint is available at `http://localhost:3000/graphql`.

If you don’t see a browser IDE at that URL, that’s expected with Apollo Server 4 unless a landing page plugin is enabled. You can still test via any GraphQL client (Insomnia, Postman, Altair, Apollo Sandbox) or curl.

### Option A: Use curl
- List movies
```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
    "query": "{ getAllMovies { id title description createdAt updatedAt movieComment } }"
  }'
```

- Get a movie by id (e.g., 1)
```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
    "query": "query($id: Int!) { getMovieById(id: $id) { id title description createdAt updatedAt movieComment } }",
    "variables": { "id": 1 }
  }'
```

- Create a movie
```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
    "query": "mutation($input: MovieInputCreate!) { createMovie(movieInputCreate: $input) { id title description } }",
    "variables": { "input": { "title": "Inception", "description": "Mind-bending sci-fi" } }
  }'
```

### Option B: Use a GraphQL client
Point your client to `http://localhost:3000/graphql` and use these sample operations:

- Query all movies
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

- Query by id
```graphql
query GetMovie($id: Int!) {
  getMovieById(id: $id) {
    id
    title
    description
    createdAt
    updatedAt
    movieComment
  }
}
```

- Create a movie
```graphql
mutation CreateMovie($input: MovieInputCreate!) {
  createMovie(movieInputCreate: $input) {
    id
    title
    description
  }
}
```

- Variables example
```json
{
  "id": 1,
  "input": {
    "title": "Inception",
    "description": "Mind-bending sci-fi"
  }
}
```

---

## Enabling a browser IDE (optional)
If you want a built-in IDE at `GET /graphql`, enable Apollo’s local landing page plugin in `AppModule`:
```ts
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
});
```
Restart the server and open `http://localhost:3000/graphql` in the browser.

---

## Project scripts
```bash
# build
yarn build

# dev
yarn start:dev

# lint
yarn lint

# tests
yarn test
```

---

## Folder structure (high-level)
```
src/
  app.module.ts
  main.ts
  movie/
    movie.model.ts
    movie.input.ts
    movie.resolver.ts
    movie.service.ts
    movie.module.ts
prisma/
  schema.prisma
  migrations/
  seeds.ts
```

---

## Troubleshooting
- Ensure Docker containers are up: `docker compose ps`
- Apply migrations before running: `npx prisma migrate deploy`
- Regenerate Prisma client if schema changed: `npx prisma generate`
- GraphQL endpoint is `/graphql` (POST). If you want a browser IDE, enable the landing page plugin (see above).

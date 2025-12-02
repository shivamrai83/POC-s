# POC-s: Proof of Concepts Collection

A comprehensive collection of proof-of-concept projects demonstrating various cloud infrastructure, automation, and full-stack development capabilities. This repository contains multiple independent projects, each showcasing different technologies and use cases.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Projects](#projects)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Roadmap](#project-roadmap)
- [Architecture Overview](#architecture-overview)
- [Contributing](#contributing)

---

## 🎯 Overview

This repository contains five distinct proof-of-concept projects:

1. **Bot** - Instagram Business messaging bot for e-commerce
2. **CI-CD** - Full-stack Todo app with CI/CD pipeline
3. **nest-graphql** - GraphQL API server with NestJS and Prisma
4. **resource-optimizer-monorepo** - AWS resource optimization service (monorepo)
5. **s3-rightsizeing** - S3 storage cost optimization tool

Each project is self-contained and can be run independently.

---

## 📦 Projects

### 1. 🤖 Bot - Instagram E-commerce Bot

**Location**: `/Bot`  
**Type**: Node.js/Express Webhook Server  
**Purpose**: Instagram Business messaging bot for product catalog browsing and order management

**Key Features**:
- Instagram Business API integration
- Product catalog management
- Order tracking
- Interactive messaging with quick replies
- Retail store locator

**Tech Stack**: Express.js, Meta Graph API, Node.js ES Modules

**Quick Start**: See [Bot/README.md](./Bot/README.md)

---

### 2. 🚀 CI-CD - Todo App with CI/CD

**Location**: `/CI-CD`  
**Type**: Full-Stack Application  
**Purpose**: Demonstrates modern CI/CD practices with React frontend and Express backend

**Key Features**:
- React frontend with modern UI
- Express.js REST API backend
- SQLite database
- GitHub Actions CI/CD pipeline
- Render.com deployment configuration
- Automated testing and deployment

**Tech Stack**: React, Express.js, SQLite, GitHub Actions, Render.com

**Quick Start**: See [CI-CD/README.md](./CI-CD/README.md)

---

### 3. 🎬 nest-graphql - GraphQL Movie API

**Location**: `/nest-graphql`  
**Type**: GraphQL API Server  
**Purpose**: Code-first GraphQL API using NestJS and Prisma

**Key Features**:
- Apollo Server 4 integration
- Code-first GraphQL schema
- Prisma ORM with PostgreSQL
- Movie domain with CRUD operations
- Docker Compose setup for database

**Tech Stack**: NestJS, GraphQL, Prisma, PostgreSQL, Apollo Server

**Quick Start**: See [nest-graphql/README.md](./nest-graphql/README.md)

---

### 4. ☁️ resource-optimizer-monorepo - AWS IR Module

**Location**: `/resource-optimizer-monorepo`  
**Type**: NestJS Monorepo  
**Purpose**: AWS infrastructure resource optimization and idle resource detection

**Key Features**:
- EC2 idle instance detection (stopped/low CPU)
- ECS, RDS, S3 resource analysis modules
- CloudWatch metrics integration
- PostgreSQL database for resource tracking
- Modular monorepo architecture
- RESTful API endpoints

**Tech Stack**: NestJS, TypeORM, AWS SDK, PostgreSQL, TypeScript

**Quick Start**: See [resource-optimizer-monorepo/README.md](./resource-optimizer-monorepo/README.md)

---

### 5. 💰 s3-rightsizeing - S3 Cost Optimizer

**Location**: `/s3-rightsizeing`  
**Type**: Node.js CLI Tool  
**Purpose**: Analyzes S3 buckets and recommends storage class transitions for cost savings

**Key Features**:
- PostgreSQL database integration
- S3 bucket analysis and recommendations
- Storage class transition suggestions
- Cost savings calculations
- Lifecycle policy recommendations
- Read-only analysis (no changes made)

**Tech Stack**: Node.js, PostgreSQL, AWS SDK (S3), SQL

**Quick Start**: See [s3-rightsizeing/README.md](./s3-rightsizeing/README.md)

---

## 🛠 Technology Stack

### Backend Technologies
- **Node.js** - Runtime environment
- **NestJS** - Enterprise Node.js framework
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **GraphQL** - Query language for APIs
- **Prisma** - Next-generation ORM

### Frontend Technologies
- **React** - UI library
- **Modern CSS** - Styling

### Databases
- **PostgreSQL** - Relational database
- **SQLite** - Lightweight database

### Cloud & Infrastructure
- **AWS SDK** - AWS service integration
- **Docker Compose** - Container orchestration
- **GitHub Actions** - CI/CD automation
- **Render.com** - Cloud hosting platform

### APIs & Integrations
- **Meta Graph API** - Instagram/Facebook integration
- **AWS CloudWatch** - Metrics and monitoring
- **AWS S3** - Object storage

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **PostgreSQL** 12+ (for projects using it)
- **Docker** and Docker Compose (for nest-graphql)
- **AWS Account** (for AWS-related projects)
- **Meta Developer Account** (for Bot project)

### Quick Setup

Each project has its own setup instructions. Navigate to the project directory and follow the README:

```bash
# Bot
cd Bot && npm install && npm start

# CI-CD
cd CI-CD/backend && npm install && npm start
cd CI-CD/frontend && npm install && npm start

# nest-graphql
cd nest-graphql/server && yarn install && yarn start:dev

# resource-optimizer-monorepo
cd resource-optimizer-monorepo && pnpm install && pnpm start:dev

# s3-rightsizeing
cd s3-rightsizeing && npm install && npm start
```

---

## 🗺 Project Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Bot - Instagram messaging integration
- [x] CI-CD - Full-stack app with deployment pipeline
- [x] nest-graphql - GraphQL API foundation
- [x] resource-optimizer-monorepo - AWS resource detection
- [x] s3-rightsizeing - S3 cost optimization

### Phase 2: Enhancement & Integration 🚧
- [ ] Enhanced Bot features (payment integration, analytics)
- [ ] CI-CD - Add authentication and user management
- [ ] nest-graphql - Add subscriptions and real-time features
- [ ] resource-optimizer-monorepo - Complete ECS, RDS, S3 modules
- [ ] s3-rightsizeing - Automated lifecycle policy generation

### Phase 3: Advanced Features 📋
- [ ] Multi-account AWS support
- [ ] Dashboard and visualization tools
- [ ] Notification systems (email, Slack, Teams)
- [ ] Cost analytics and reporting
- [ ] Machine learning for resource prediction

### Phase 4: Production Readiness 🎯
- [ ] Comprehensive testing suites
- [ ] Security hardening
- [ ] Performance optimization
- [ ] Documentation and API specs
- [ ] Monitoring and alerting

---

## 🏗 Architecture Overview

### Project Structure

```
POC-s/
├── Bot/                          # Instagram Bot
│   ├── controllers/             # Message handlers
│   ├── services/                # Meta API integration
│   └── data/                    # Product catalog
│
├── CI-CD/                       # Todo App with CI/CD
│   ├── backend/                # Express API
│   ├── frontend/                # React app
│   └── .github/                # GitHub Actions
│
├── nest-graphql/                # GraphQL Server
│   ├── server/                 # NestJS server
│   └── client/                 # React client (optional)
│
├── resource-optimizer-monorepo/ # AWS IR Module
│   ├── apps/                   # Applications
│   │   ├── aws-ir-module/     # Main service
│   │   └── publisher/         # Publisher service
│   └── libs/                   # Shared libraries
│       ├── entities/          # Database entities
│       ├── database/          # Database modules
│       └── aws-clients/       # AWS SDK wrappers
│
└── s3-rightsizeing/            # S3 Optimizer
    ├── src/                    # Source code
    ├── database/               # Schema files
    └── scripts/                # Utility scripts
```

### Design Patterns

- **Monorepo Architecture**: resource-optimizer-monorepo uses NestJS monorepo pattern
- **Microservices**: Modular services with shared libraries
- **RESTful APIs**: Standard REST endpoints
- **GraphQL**: Code-first schema generation
- **Event-Driven**: RabbitMQ integration (in monorepo)

---

## 📚 Documentation

Each project contains detailed documentation:

- **[Bot/README.md](./Bot/README.md)** - Instagram bot setup and usage
- **[CI-CD/README.md](./CI-CD/README.md)** - Todo app and CI/CD guide
- **[nest-graphql/README.md](./nest-graphql/README.md)** - GraphQL API documentation
- **[resource-optimizer-monorepo/README.md](./resource-optimizer-monorepo/README.md)** - AWS IR module guide
- **[s3-rightsizeing/README.md](./s3-rightsizeing/README.md)** - S3 optimization tool

---

## 🔧 Common Commands

### Development
```bash
# Install dependencies (project-specific)
npm install / yarn install / pnpm install

# Run development server
npm start / yarn start:dev / pnpm start:dev

# Run tests
npm test / yarn test / pnpm test
```

### Database
```bash
# PostgreSQL (if using)
psql -U postgres -d database_name

# Prisma (nest-graphql)
npx prisma migrate dev
npx prisma generate
```

### Docker
```bash
# Start services
docker compose up -d

# Stop services
docker compose down
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

Each project may have its own license. Check individual project directories for license information.

---

## 🆘 Support

For issues or questions:
- Check individual project README files
- Review project-specific documentation
- Open an issue in the repository

---

## 🎓 Learning Resources

### Technologies Used
- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 📊 Project Status

| Project | Status | Version | Last Updated |
|---------|--------|---------|--------------|
| Bot | ✅ Active | 1.0.0 | 2024 |
| CI-CD | ✅ Active | 1.0.0 | 2024 |
| nest-graphql | ✅ Active | 0.0.1 | 2024 |
| resource-optimizer-monorepo | 🚧 In Development | 0.0.1 | 2024 |
| s3-rightsizeing | ✅ Active | 1.0.0 | 2024 |

---

**Made with ❤️ for cloud infrastructure and automation**

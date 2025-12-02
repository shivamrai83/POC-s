# ☁️ AWS Infrastructure Resource Optimizer

A NestJS monorepo application for detecting and analyzing idle AWS resources to optimize cloud costs. Provides modular services for EC2, ECS, RDS, and S3 resource analysis with CloudWatch integration.

## 📋 Overview

This monorepo contains a comprehensive AWS resource optimization system that:
- Detects idle EC2 instances (stopped/low CPU)
- Analyzes ECS, RDS, and S3 resources
- Integrates with AWS CloudWatch for metrics
- Stores findings in PostgreSQL database
- Provides RESTful API endpoints
- Uses modular monorepo architecture

## ✨ Features

### Current Implementation
- ✅ **EC2 Module**: Full implementation
  - Detects stopped instances (>30 days)
  - Detects running instances with low CPU (<5%)
  - CloudWatch CPU metrics integration
  - Database persistence

### Planned Implementation
- 🚧 **ECS Module**: Service/task utilization analysis
- 🚧 **RDS Module**: Connection and CPU analysis
- 🚧 **S3 Module**: Bucket access pattern analysis

### Core Features
- 🔍 Automated resource detection
- 📊 CloudWatch metrics integration
- 💾 PostgreSQL database storage
- 🔌 RESTful API endpoints
- 🏗️ Modular monorepo architecture
- 📈 Cost optimization recommendations

## 🏗 Architecture

```
resource-optimizer-monorepo/
├── apps/
│   ├── aws-ir-module/        # Main AWS IR service
│   │   ├── src/
│   │   │   ├── main.ts       # Application entry
│   │   │   ├── aws-ir.module.ts  # Root module
│   │   │   ├── lib/
│   │   │   │   └── aws/      # AWS service wrapper
│   │   │   └── modules/
│   │   │       ├── ec2/      # EC2 detection module
│   │   │       ├── ecs/      # ECS module (placeholder)
│   │   │       ├── rds/      # RDS module (placeholder)
│   │   │       └── s3/       # S3 module (placeholder)
│   │   └── tsconfig.app.json
│   │
│   └── publisher/            # Publisher service
│       └── src/
│
├── libs/                      # Shared libraries
│   ├── entities/             # Database entities
│   │   └── src/
│   │       ├── ec2-instance-details.entity.ts
│   │       └── idle-ec2-instance-details.entity.ts
│   │
│   ├── database/              # Database modules
│   │   └── src/
│   │       └── modules/
│   │
│   ├── aws-clients/           # AWS SDK wrappers
│   │   └── src/
│   │
│   ├── helpers/               # Utility functions
│   │   └── src/
│   │
│   └── rabbitmq/              # RabbitMQ integration
│       └── src/
│
├── nest-cli.json              # NestJS CLI config
├── package.json               # Root dependencies
└── tsconfig.json              # TypeScript config
```

## 🛠 Technology Stack

- **NestJS 9** - Enterprise Node.js framework
- **TypeORM** - Object-relational mapping
- **PostgreSQL** - Relational database
- **AWS SDK v3** - AWS service clients
- **TypeScript** - Type-safe development
- **pnpm** - Package manager

### AWS Services Used
- EC2 (Elastic Compute Cloud)
- CloudWatch (Metrics)
- ECS (Elastic Container Service)
- RDS (Relational Database Service)
- S3 (Simple Storage Service)

## 📦 Installation

### Prerequisites

- Node.js 18+
- pnpm (package manager)
- PostgreSQL 12+
- AWS Account with appropriate IAM permissions

### Setup Steps

1. **Install dependencies**:
   ```bash
   cd resource-optimizer-monorepo
   pnpm install
   ```

2. **Configure environment variables**:
   Create `.env` file:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=postgres
   DB_NAME=aws_ir
   DB_SYNC=false
   DB_LOGGING=false

   # AWS
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key

   # Application
   PORT=3001
   NODE_ENV=development

   # Thresholds
   EC2_STOPPED_DAYS_THRESHOLD=30
   EC2_CPU_THRESHOLD=5
   ```

3. **Create PostgreSQL database**:
   ```bash
   createdb aws_ir
   ```

4. **Run database migrations** (if using TypeORM migrations):
   ```bash
   pnpm run migration:run
   ```

5. **Start the application**:
   ```bash
   pnpm start:dev
   ```

The API will be available at `http://localhost:3001`.

## 🚀 Quick Start

### Start Development Server

```bash
pnpm start:dev
```

### Build for Production

```bash
pnpm build
pnpm start:prod
```

### Run Specific Service

```bash
# AWS IR Module
pnpm start:aws-ir

# Publisher (if implemented)
pnpm start:publisher
```

## 📡 API Endpoints

### EC2 Module

#### `POST /ec2/detect`
Trigger EC2 idle resource detection.

**Response**:
```json
[
  {
    "Id": 1,
    "InstanceId": "i-1234567890abcdef0",
    "InstanceName": "my-instance",
    "InstanceType": "t2.micro",
    "Region": "us-east-1",
    "CPUUtil": 2.5,
    "IdleReason": "LOW_CPU",
    "StoppedDays": 0,
    "InstanceStatus": "running",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### `GET /ec2/idle-resources`
Get all detected idle EC2 resources.

**Response**: Array of idle instance details

#### `GET /ec2/instances`
Get all EC2 instances (active and idle).

**Response**: Array of instance details

### ECS Module (Placeholder)

#### `POST /ecs/detect`
Trigger ECS idle resource detection.

#### `GET /ecs/resources`
Get all ECS resources.

### RDS Module (Placeholder)

#### `POST /rds/detect`
Trigger RDS idle resource detection.

#### `GET /rds/resources`
Get all RDS resources.

### S3 Module (Placeholder)

#### `POST /s3/detect`
Trigger S3 idle resource detection.

#### `GET /s3/resources`
Get all S3 resources.

## 📁 Project Structure

### `apps/aws-ir-module/`

Main application for AWS infrastructure resource analysis.

#### `src/main.ts`
Application entry point:
- Creates NestJS application
- Sets up global validation pipes
- Starts HTTP server

#### `src/aws-ir.module.ts`
Root module:
- Configures TypeORM with PostgreSQL
- Imports all service modules (EC2, ECS, RDS, S3)
- Sets up global ConfigModule

#### `src/lib/aws/`
AWS service wrapper:
- `aws.service.ts`: Centralized AWS SDK clients
- `aws.module.ts`: Global AWS module

#### `src/modules/ec2/`
EC2 detection module:
- `ec2.service.ts`: Business logic for EC2 analysis
- `ec2.controller.ts`: REST API endpoints
- `ec2.module.ts`: Module configuration

### `libs/entities/`

Shared database entities:
- `ec2-instance-details.entity.ts`: EC2 instance details
- `idle-ec2-instance-details.entity.ts`: Idle instance records

### `libs/database/`

Database configuration modules:
- Shared database connections
- TypeORM configuration
- Database service providers

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASS` | Database password | `postgres` |
| `DB_NAME` | Database name | `aws_ir` |
| `DB_SYNC` | Auto-sync schema | `false` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `PORT` | Application port | `3001` |
| `EC2_STOPPED_DAYS_THRESHOLD` | Days before stopped instance is idle | `30` |
| `EC2_CPU_THRESHOLD` | CPU % threshold for idle | `5` |

### AWS IAM Permissions

Required permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "cloudwatch:GetMetricStatistics",
        "rds:DescribeDBInstances",
        "ecs:ListClusters",
        "ecs:DescribeServices",
        "s3:ListBuckets",
        "s3:GetBucketLocation"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🧪 Testing

### Manual Testing

1. **Start the server**:
   ```bash
   pnpm start:dev
   ```

2. **Trigger EC2 detection**:
   ```bash
   curl -X POST http://localhost:3001/ec2/detect
   ```

3. **Get idle resources**:
   ```bash
   curl http://localhost:3001/ec2/idle-resources
   ```

### Unit Testing

```bash
pnpm test
```

### E2E Testing

```bash
pnpm test:e2e
```

## 🗄 Database Schema

### `InstanceDetails` Table

Stores all EC2 instance information:
- Instance metadata (ID, name, type, status)
- Network information (VPC, subnet, IPs)
- Resource details (CPU, memory, disk)
- Cost and usage metrics

### `IdleInstanceDetails` Table

Stores detected idle resources:
- Instance identification
- Idle reason (STOPPED, LOW_CPU)
- Metrics (CPU utilization, stopped days)
- Cost information

## 🔄 Development Workflow

### Adding a New Module

1. **Create module structure**:
   ```bash
   cd apps/aws-ir-module/src/modules
   mkdir new-module
   ```

2. **Create files**:
   - `new-module.service.ts`
   - `new-module.controller.ts`
   - `new-module.module.ts`

3. **Register in root module**:
   ```typescript
   // aws-ir.module.ts
   import { NewModule } from './modules/new-module/new-module.module';
   
   @Module({
     imports: [NewModule, ...],
   })
   ```

### Adding Shared Libraries

1. **Create library**:
   ```bash
   nest generate library libs/new-lib
   ```

2. **Export from library**:
   ```typescript
   // libs/new-lib/src/index.ts
   export * from './new-lib.service';
   ```

3. **Use in apps**:
   ```typescript
   import { NewLibService } from '@libs/new-lib';
   ```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists

### AWS Authentication Errors
- Verify AWS credentials are correct
- Check IAM permissions
- Verify region is correct

### CloudWatch Metrics Not Found
- Ensure CloudWatch is enabled for region
- Check instance IDs are correct
- Verify time range for metrics

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [CloudWatch Metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html)

## 🔒 Security Best Practices

1. **Never commit `.env` file**
2. **Use IAM roles** instead of access keys when possible
3. **Rotate credentials** regularly
4. **Limit IAM permissions** to minimum required
5. **Enable database encryption**
6. **Use HTTPS** in production

## 📈 Roadmap

### Phase 1: Core Modules ✅
- [x] EC2 module implementation
- [x] Database entities
- [x] AWS service integration
- [x] REST API endpoints

### Phase 2: Additional Modules 🚧
- [ ] Complete ECS module
- [ ] Complete RDS module
- [ ] Complete S3 module
- [ ] Load Balancer module
- [ ] Elastic IP module

### Phase 3: Advanced Features 📋
- [ ] Scheduled jobs (cron)
- [ ] Cost calculation
- [ ] Notification system
- [ ] Dashboard API
- [ ] Multi-region support

### Phase 4: Production Ready 🎯
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Monitoring and alerting
- [ ] Documentation
- [ ] Security hardening

## 📝 License

UNLICENSED

---

**Optimizing AWS infrastructure costs through intelligent resource analysis**


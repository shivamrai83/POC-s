# S3 Bucket Right-Sizing Tool

A comprehensive Node.js application that automatically analyzes S3 buckets stored in PostgreSQL, identifies large buckets, and performs intelligent right-sizing by transitioning objects to cost-effective storage classes.

## 🎯 Features

- **Database Integration**: Fetches bucket information from PostgreSQL database
- **Large Bucket Identification**: Identifies buckets above configurable size thresholds
- **Intelligent Analysis**: Analyzes object age, size, and current storage classes
- **Cost Optimization**: Recommends and applies appropriate storage class transitions:
  - STANDARD → STANDARD_IA (30+ days old)
  - STANDARD_IA → GLACIER_IR (90+ days old)
  - GLACIER_IR → GLACIER (180+ days old)
  - GLACIER → DEEP_ARCHIVE (365+ days old)
- **Savings Calculator**: Estimates monthly and annual cost savings
- **Batch Processing**: Processes objects in configurable batches to avoid throttling
- **Dry Run Mode**: Test mode to simulate changes without modifying actual data
- **Operation Logging**: Records all operations in the database for audit trail
- **Lifecycle Policy Generation**: Creates automated lifecycle policies for future right-sizing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- AWS Account with S3 access
- AWS IAM credentials with S3 permissions:
  - `s3:ListBucket`
  - `s3:GetObject`
  - `s3:PutObject` (for storage class transitions)
  - `s3:GetObjectAttributes`

## 🚀 Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd /home/shivam/cfx/s3-rightsizeing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database:**
   ```bash
   psql -U postgres -d your_database -f database/schema.sql
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

## ⚙️ Configuration

Edit the `.env` file with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=s3_management
DB_USER=postgres
DB_PASSWORD=your_password

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Right-Sizing Configuration
SIZE_THRESHOLD_GB=100          # Minimum bucket size to process
DRY_RUN=true                   # Set to false for actual changes
MAX_BUCKETS_TO_PROCESS=10      # Limit buckets per run
MIN_SAVINGS_THRESHOLD=1.0      # Minimum savings in USD to transition
BATCH_SIZE=100                 # Objects per batch
```

## 📊 Database Schema

The tool requires two main tables:

### `s3_buckets`
Stores bucket information:
- `bucket_name`: Unique bucket identifier
- `region`: AWS region
- `total_size_bytes`: Total bucket size
- `object_count`: Number of objects
- `last_analyzed`: Last analysis timestamp
- `metadata`: JSONB field for additional data
- `is_active`: Boolean flag for active buckets

### `rightsizing_operations`
Logs all right-sizing operations:
- `bucket_name`: Reference to s3_buckets
- `operation_timestamp`: When operation occurred
- `successful_transitions`: Count of successful transitions
- `failed_transitions`: Count of failed transitions
- `estimated_monthly_savings`: Calculated savings
- `details`: JSONB field for operation details

## 🎮 Usage

### Run in Dry-Run Mode (Recommended First)

```bash
npm start
```

This will:
1. Fetch buckets from PostgreSQL
2. Identify large buckets (>100GB by default)
3. Analyze object storage classes and ages
4. Calculate potential savings
5. **Simulate** transitions without making changes

### Run in Live Mode

Edit `.env` and set:
```env
DRY_RUN=false
```

Then run:
```bash
npm start
```

This will perform actual storage class transitions.

### Development Mode (with auto-reload)

```bash
npm run dev
```

## 📈 Output Example

```
================================================================================
S3 Bucket Right-Sizing Tool
================================================================================

Configuration: {
  sizeThresholdGB: 100,
  dryRun: true,
  maxBucketsToProcess: 10,
  minSavingsThreshold: 1,
  batchSize: 100
}

Step 1: Fetching buckets from database...
Found 45 active buckets

Step 2: Identifying buckets larger than 100GB...
Identified 12 large buckets

Top 5 largest buckets:
  1. my-large-bucket-1: 465.66 GB
  2. my-large-bucket-2: 279.40 GB
  3. my-medium-bucket: 139.70 GB
  4. backup-bucket: 125.00 GB
  5. logs-bucket: 108.50 GB

[1/10] Processing bucket: my-large-bucket-1
--------------------------------------------------------------------------------
  → Analyzing bucket objects...
  → Total objects: 50000
  → Total size: 465.66 GB
  → Objects needing right-sizing: 12500
  → Recommendations:
    - [HIGH] 12500 objects (25.0%) can be moved to more cost-effective storage classes
      Potential savings: $8,542.50/month
    - [MEDIUM] Consider setting up lifecycle policies to automatically transition objects older than 90 days
  → Potential monthly savings: $8,542.50
  → Potential annual savings: $102,510.00
  → Starting right-sizing (DRY RUN)...
  → Generated lifecycle policy for automated future right-sizing

================================================================================
SUMMARY REPORT
================================================================================

Buckets analyzed: 10
Buckets optimized: 10
Total potential monthly savings: $45,234.75
Total potential annual savings: $542,817.00

⚠️  This was a DRY RUN. No actual changes were made.
   Set DRY_RUN=false in your .env file to perform actual right-sizing.

================================================================================
```

## 🏗️ Project Structure

```
s3-rightsizeing/
├── src/
│   ├── config/
│   │   ├── database.js      # PostgreSQL connection
│   │   └── aws.js           # AWS S3 client configuration
│   ├── services/
│   │   ├── bucketFetcher.js # Database queries for buckets
│   │   ├── bucketAnalyzer.js # Bucket analysis and recommendations
│   │   └── rightSizer.js    # Storage class transitions
│   └── index.js             # Main orchestration
├── database/
│   └── schema.sql           # Database schema
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 💰 Cost Savings Logic

The tool uses the following storage class pricing (approximate, us-east-1):

| Storage Class | Price per GB/month | Use Case |
|--------------|-------------------|----------|
| STANDARD | $0.023 | Frequently accessed |
| STANDARD_IA | $0.0125 | Infrequently accessed (30+ days) |
| GLACIER_IR | $0.004 | Archive with instant retrieval (90+ days) |
| GLACIER | $0.0036 | Long-term archive (180+ days) |
| DEEP_ARCHIVE | $0.00099 | Rarely accessed archive (365+ days) |

**Note**: Actual savings may vary based on region, retrieval costs, and access patterns.

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use IAM roles** when running on EC2/ECS instead of access keys
3. **Restrict database access** to specific IPs
4. **Use read-only AWS credentials** for dry-run mode
5. **Enable CloudTrail** to audit S3 API calls
6. **Rotate credentials** regularly

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and credentials in `.env` are correct.

### AWS Credentials Error
```
Error: The security token included in the request is invalid
```
**Solution**: Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in `.env`.

### Throttling Errors
```
Error: SlowDown: Please reduce your request rate
```
**Solution**: Increase `BATCH_SIZE` and add delays between batches (already implemented).

### Minimum Object Size Error
```
The object size is less than the minimum allowed size for this storage class
```
**Solution**: The tool automatically skips objects smaller than 128KB.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

ISC License

## 📧 Support

For issues, questions, or feature requests, please open an issue in the repository.

## 🔄 Future Enhancements

- [ ] Support for multiple AWS accounts
- [ ] Email notifications for completed operations
- [ ] Web dashboard for visualization
- [ ] Advanced cost analytics
- [ ] Integration with AWS Cost Explorer
- [ ] Support for S3 Glacier Flexible Retrieval
- [ ] Object tagging based on storage class
- [ ] Automated lifecycle policy application

## ⚠️ Important Notes

- **Test in dry-run mode first** before performing actual transitions
- **Monitor your AWS costs** after implementing changes
- **Consider retrieval costs** for archived data
- **Some storage classes have minimum storage durations** (30/90/180 days)
- **Transitions are one-way** - moving back to STANDARD incurs costs
- **Small objects** (<128KB) are not transitioned to IA or Glacier classes

---

Made with ❤️ for cloud cost optimization


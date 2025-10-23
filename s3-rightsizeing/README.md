# S3 Storage Cost Savings Recommendation Tool

A comprehensive Node.js application that analyzes S3 buckets stored in PostgreSQL, identifies optimization opportunities, and **recommends** cost-effective storage class transitions. This tool **ONLY generates recommendations** and does **NOT make any actual changes** to your S3 buckets.

## 🎯 Features

- **Database Integration**: Fetches bucket information from PostgreSQL database
- **Large Bucket Identification**: Identifies buckets above configurable size thresholds
- **Intelligent Analysis**: Analyzes object age, size, and current storage classes
- **Cost Savings Recommendations**: Suggests appropriate storage class transitions:
  - STANDARD → STANDARD_IA (30+ days old)
  - STANDARD_IA → GLACIER_IR (90+ days old)
  - GLACIER_IR → GLACIER (180+ days old)
  - GLACIER → DEEP_ARCHIVE (365+ days old)
- **Savings Calculator**: Estimates monthly and annual cost savings potential
- **Detailed Reports**: Generates comprehensive savings reports by bucket
- **No Changes Made**: 100% read-only - analyzes and recommends without modifying data
- **Recommendation Logging**: Records all recommendations in the database for tracking
- **Lifecycle Policy Recommendations**: Suggests lifecycle policies for automatic future optimization

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- AWS Account with S3 access
- AWS IAM credentials with **read-only** S3 permissions:
  - `s3:ListBucket`
  - `s3:GetObject`
  - `s3:GetObjectAttributes`
  
**Note**: `s3:PutObject` is NOT required as this tool only reads and analyzes data.

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

# Recommendation Configuration
SIZE_THRESHOLD_GB=100          # Minimum bucket size to analyze
MAX_BUCKETS_TO_PROCESS=10      # Limit buckets per run
MIN_SAVINGS_THRESHOLD=1.0      # Minimum savings in USD to include in recommendations
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

### `savings_recommendations`
Stores all cost savings recommendations:
- `bucket_name`: Reference to s3_buckets
- `recommendation_timestamp`: When recommendation was generated
- `total_objects`: Total objects analyzed
- `eligible_objects`: Objects eligible for optimization
- `estimated_monthly_savings`: Potential monthly savings
- `estimated_annual_savings`: Potential annual savings
- `details`: JSONB field for detailed recommendations

## 🎮 Usage

### Generate Savings Recommendations

```bash
npm start
```

This will:
1. Fetch buckets from PostgreSQL
2. Identify large buckets (>100GB by default)
3. Analyze object storage classes and ages
4. Calculate potential savings
5. Generate detailed cost savings recommendations
6. Save recommendations to database
7. Display comprehensive savings report

**Important**: This tool is **read-only** and will **NOT make any changes** to your S3 buckets. It only analyzes and recommends.

### Development Mode (with auto-reload)

```bash
npm run dev
```

### View Saved Recommendations

Query the database to view historical recommendations:

```sql
-- View latest recommendations for all buckets
SELECT * FROM bucket_statistics ORDER BY latest_monthly_savings DESC;

-- View detailed recommendations for a specific bucket
SELECT * FROM savings_recommendations 
WHERE bucket_name = 'your-bucket-name' 
ORDER BY recommendation_timestamp DESC;
```

## 📈 Output Example

```
================================================================================
S3 Storage Cost Savings Recommendation Tool
================================================================================

Configuration: { sizeThresholdGB: 100, maxBucketsToProcess: 10, minSavingsThreshold: 1 }
Mode: RECOMMENDATION ONLY (No actual changes will be made)

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

[1/10] Analyzing bucket: my-large-bucket-1
--------------------------------------------------------------------------------
  → Analyzing bucket objects and storage patterns...
  → Total objects: 50000
  → Total size: 465.66 GB
  → Objects with optimization potential: 12500
  → Potential monthly savings: $8,542.50
  → Potential annual savings: $102,510.00
  → Generating detailed savings recommendations...
  → Top optimization opportunities:
    • STANDARD → STANDARD_IA: 8000 objects, $5,200.00/month
    • STANDARD → GLACIER_IR: 3500 objects, $2,800.00/month
    • STANDARD_IA → GLACIER: 1000 objects, $542.50/month
  → Lifecycle policy recommendations:
    • Move infrequently accessed objects to STANDARD_IA (8000 objects)
    • Archive rarely accessed objects to GLACIER_IR (3500 objects)

================================================================================
COST SAVINGS SUMMARY REPORT
================================================================================

Buckets analyzed: 10
Buckets with savings opportunities: 10

💰 TOTAL POTENTIAL SAVINGS:
   Monthly: $45,234.75
   Annual:  $542,817.00

SAVINGS BREAKDOWN BY BUCKET:
--------------------------------------------------------------------------------
1. my-large-bucket-1
   Monthly Savings: $8,542.50 | Annual Savings: $102,510.00
   Eligible Objects: 12,500
   Data Size: 385.20 GB

2. my-large-bucket-2
   Monthly Savings: $6,890.25 | Annual Savings: $82,683.00
   Eligible Objects: 9,800
   Data Size: 245.30 GB

[... more buckets ...]

================================================================================
NEXT STEPS FOR IMPLEMENTATION
================================================================================

1. Review the detailed recommendations above
2. Prioritize buckets with highest savings potential
3. Implement AWS S3 Lifecycle policies (recommended approach):
   - Go to AWS S3 Console → Select Bucket → Management → Lifecycle
   - Create rules based on the recommendations
4. Alternatively, manually transition objects using AWS CLI or Console
5. Monitor cost savings in AWS Cost Explorer after 30-60 days
6. Adjust policies based on actual access patterns and needs

📊 All recommendations have been saved to the database.
💡 This tool analyzes and recommends - it does NOT make any changes to your S3 buckets.

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
│   │   └── rightSizer.js    # Savings calculation and recommendations
│   └── index.js             # Main orchestration
├── database/
│   └── schema.sql           # Database schema
├── scripts/
│   ├── add-buckets.js       # Helper to add buckets to database
│   └── list-buckets.js      # Helper to list buckets
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
4. **Use read-only AWS credentials** - This tool only needs read permissions
5. **Enable CloudTrail** to audit S3 API calls
6. **Rotate credentials** regularly
7. **Principle of least privilege** - Only grant necessary S3 read permissions

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
**Solution**: The tool processes buckets sequentially. If you experience throttling, reduce MAX_BUCKETS_TO_PROCESS or analyze buckets during off-peak hours.

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
- [ ] Email notifications with savings reports
- [ ] Web dashboard for visualization
- [ ] Advanced cost analytics with historical trends
- [ ] Integration with AWS Cost Explorer API
- [ ] Support for S3 Glacier Flexible Retrieval
- [ ] Export recommendations to CSV/PDF
- [ ] Automated lifecycle policy JSON generation
- [ ] S3 access pattern analysis using CloudWatch metrics
- [ ] Slack/Teams integration for notifications

## ⚠️ Important Notes

- **This tool ONLY provides recommendations** - it does NOT make any changes to your S3 buckets
- **You must manually implement** the recommendations via AWS Console, CLI, or lifecycle policies
- **Monitor your AWS costs** after implementing recommendations
- **Consider retrieval costs** for archived data when implementing transitions
- **Some storage classes have minimum storage durations** (30/90/180 days)
- **Transitions are one-way** - moving back to STANDARD incurs costs
- **Small objects** (<128KB) should not be moved to IA or Glacier classes (tool accounts for this)
- **Test with lifecycle policies** on a small subset before applying broadly
- **Pricing may vary by region** - recommendations use us-east-1 pricing as baseline

---

Made with ❤️ for cloud cost optimization


# Quick Setup Guide

## S3 Storage Cost Savings Recommendation Tool

This tool **analyzes your S3 buckets** and **generates cost savings recommendations**. It does **NOT make any changes** to your S3 buckets - it only reads and analyzes.

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up PostgreSQL Database

Create a new database:
```bash
createdb s3_management
```

Or using psql:
```sql
CREATE DATABASE s3_management;
```

Run the schema:
```bash
psql -U postgres -d s3_management -f database/schema.sql
```

### 3. Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
nano .env
# or
vim .env
```

Required values:
- `DB_PASSWORD` - Your PostgreSQL password
- `AWS_ACCESS_KEY_ID` - Your AWS access key (read-only permissions sufficient)
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

**Note**: Only read permissions are needed: `s3:ListBucket`, `s3:GetObject`, `s3:GetObjectAttributes`

### 4. Add Your Buckets to Database

You can add buckets manually or import them. Here's a manual example:

```sql
INSERT INTO s3_buckets (bucket_name, region, total_size_bytes, object_count, is_active)
VALUES 
  ('your-bucket-name', 'us-east-1', 0, 0, true),
  ('another-bucket', 'us-west-2', 0, 0, true);
```

Or use a script to import from AWS (you'll need to create this based on your needs).

### 5. Generate Savings Recommendations

Run the tool:
```bash
npm start
```

This will:
- Analyze your S3 buckets
- Calculate potential cost savings
- Generate detailed recommendations
- Save recommendations to database
- Display comprehensive savings report

**Important**: This tool is read-only and will NOT make any changes to your S3 buckets.

### 6. Review the Recommendations

Check the output for:
- Which buckets were analyzed
- Objects with optimization potential
- Potential monthly and annual savings
- Storage class transition recommendations
- Lifecycle policy suggestions

### 7. Implement Recommendations (Manual)

After reviewing recommendations:
1. Go to AWS S3 Console
2. Select a bucket from the recommendations
3. Navigate to Management → Lifecycle
4. Create lifecycle rules based on the tool's suggestions
5. Monitor cost savings in AWS Cost Explorer

## Common Commands

```bash
# Install dependencies
npm install

# Generate savings recommendations
npm start

# Run with auto-reload (development)
npm run dev

# Check database connection
psql -U postgres -d s3_management -c "SELECT COUNT(*) FROM s3_buckets;"

# View bucket statistics with savings
psql -U postgres -d s3_management -c "SELECT * FROM bucket_statistics ORDER BY latest_monthly_savings DESC;"

# View recent recommendations
psql -U postgres -d s3_management -c "SELECT bucket_name, estimated_monthly_savings, estimated_annual_savings, recommendation_timestamp FROM savings_recommendations ORDER BY recommendation_timestamp DESC LIMIT 10;"

# View detailed recommendations for a bucket
psql -U postgres -d s3_management -c "SELECT bucket_name, estimated_monthly_savings, details FROM savings_recommendations WHERE bucket_name = 'your-bucket-name' ORDER BY recommendation_timestamp DESC LIMIT 1;"
```

## Verification Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running (`pg_isready`)
- [ ] Database created and schema loaded
- [ ] `.env` file configured with correct credentials
- [ ] AWS credentials have S3 read permissions
- [ ] At least one bucket added to `s3_buckets` table
- [ ] Tool runs successfully and generates recommendations

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d s3_management
```

### AWS Credential Issues
```bash
# Test AWS credentials (requires AWS CLI)
aws s3 ls --region us-east-1

# Check environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.AWS_REGION)"
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

After successful setup:

1. **Schedule Regular Analysis**: Set up a cron job or scheduled task
   ```bash
   # Example cron: Run weekly on Monday at 2 AM
   0 2 * * 1 cd /home/shivam/POC-s/s3-rightsizeing && npm start >> logs/recommendations.log 2>&1
   ```

2. **Track Savings Potential**: Query the database regularly
   ```sql
   SELECT 
     bucket_name,
     estimated_monthly_savings,
     estimated_annual_savings,
     recommendation_timestamp
   FROM savings_recommendations 
   ORDER BY recommendation_timestamp DESC, estimated_monthly_savings DESC
   LIMIT 10;
   ```

3. **Review and Optimize**: Adjust thresholds in `.env` based on your needs

4. **Implement Recommendations**: Manually apply lifecycle policies in AWS Console
   - Start with buckets showing highest savings potential
   - Test policies on smaller buckets first
   - Monitor costs after implementation

5. **Track Actual Savings**: After implementing recommendations
   - Monitor AWS Cost Explorer
   - Compare with recommendation predictions
   - Adjust policies as needed

6. **Re-run Periodically**: Generate new recommendations monthly to catch new optimization opportunities

## Support

For issues or questions, refer to the main README.md or open an issue.


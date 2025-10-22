# Quick Setup Guide

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
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

### 4. Add Your Buckets to Database

You can add buckets manually or import them. Here's a manual example:

```sql
INSERT INTO s3_buckets (bucket_name, region, total_size_bytes, object_count, is_active)
VALUES 
  ('your-bucket-name', 'us-east-1', 0, 0, true),
  ('another-bucket', 'us-west-2', 0, 0, true);
```

Or use a script to import from AWS (you'll need to create this based on your needs).

### 5. Run in Dry-Run Mode First

Always test first:
```bash
npm start
```

This will analyze buckets and show potential savings without making changes.

### 6. Review the Output

Check:
- Which buckets were analyzed
- How many objects need right-sizing
- Potential cost savings
- Any errors or warnings

### 7. Run in Live Mode (Optional)

If satisfied with dry-run results:
1. Edit `.env` and set `DRY_RUN=false`
2. Run: `npm start`

## Common Commands

```bash
# Install dependencies
npm install

# Run in dry-run mode
npm start

# Run with auto-reload (development)
npm run dev

# Check database connection
psql -U postgres -d s3_management -c "SELECT COUNT(*) FROM s3_buckets;"

# View bucket statistics
psql -U postgres -d s3_management -c "SELECT * FROM bucket_statistics;"

# View recent operations
psql -U postgres -d s3_management -c "SELECT * FROM rightsizing_operations ORDER BY operation_timestamp DESC LIMIT 10;"
```

## Verification Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running (`pg_isready`)
- [ ] Database created and schema loaded
- [ ] `.env` file configured with correct credentials
- [ ] AWS credentials have S3 permissions
- [ ] At least one bucket added to `s3_buckets` table
- [ ] `DRY_RUN=true` for first run

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

1. **Schedule Regular Runs**: Set up a cron job or scheduled task
   ```bash
   # Example cron: Run daily at 2 AM
   0 2 * * * cd /home/shivam/cfx/s3-rightsizeing && npm start >> logs/rightsizing.log 2>&1
   ```

2. **Monitor Savings**: Query the database regularly
   ```sql
   SELECT 
     SUM(estimated_monthly_savings) as total_monthly_savings,
     SUM(successful_transitions) as total_transitions
   FROM rightsizing_operations;
   ```

3. **Review and Optimize**: Adjust thresholds in `.env` based on results

4. **Set Up Alerts**: Create notifications for failed operations

5. **Implement Lifecycle Policies**: Apply the generated policies to automate future right-sizing

## Support

For issues or questions, refer to the main README.md or open an issue.


-- S3 Storage Cost Savings Recommendation Database Schema

-- Note: This schema works with your existing S3BucketDetails table
-- We only need to create the savings_recommendations table

-- Drop recommendations table if it exists (for clean setup)
DROP TABLE IF EXISTS savings_recommendations CASCADE;

-- Table to store savings recommendations
-- This table references your existing S3BucketDetails table
CREATE TABLE savings_recommendations (
    id SERIAL PRIMARY KEY,
    bucket_name VARCHAR(255) NOT NULL,
    recommendation_timestamp TIMESTAMP DEFAULT NOW(),
    total_objects INTEGER NOT NULL,
    eligible_objects INTEGER DEFAULT 0,
    estimated_monthly_savings DECIMAL(10, 2) DEFAULT 0,
    estimated_annual_savings DECIMAL(10, 2) DEFAULT 0,
    details JSONB DEFAULT '{}',
    -- Reference to your S3BucketDetails table
    CONSTRAINT fk_bucket_name FOREIGN KEY (bucket_name) 
        REFERENCES public."S3BucketDetails"("StorageName") ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_recommendation_timestamp ON savings_recommendations(recommendation_timestamp DESC);
CREATE INDEX idx_recommendation_bucket ON savings_recommendations(bucket_name);
CREATE INDEX idx_estimated_savings ON savings_recommendations(estimated_monthly_savings DESC);

-- Create a view for bucket statistics with latest savings recommendations
-- This view joins with your existing S3BucketDetails table
CREATE OR REPLACE VIEW bucket_statistics AS
SELECT 
    s."StorageName" as bucket_name,
    s."Region",
    s."Size" as total_size_bytes,
    s."StorageOwner",
    s."AccountId",
    s."CreatedOn",
    s."IsActive",
    s."IsDisabled",
    COUNT(sr.id) as total_recommendations,
    MAX(sr.recommendation_timestamp) as latest_recommendation_date,
    (SELECT estimated_monthly_savings 
     FROM savings_recommendations 
     WHERE bucket_name = s."StorageName" 
     ORDER BY recommendation_timestamp DESC 
     LIMIT 1) as latest_monthly_savings,
    (SELECT estimated_annual_savings 
     FROM savings_recommendations 
     WHERE bucket_name = s."StorageName" 
     ORDER BY recommendation_timestamp DESC 
     LIMIT 1) as latest_annual_savings
FROM public."S3BucketDetails" s
LEFT JOIN savings_recommendations sr ON s."StorageName" = sr.bucket_name
WHERE s."IsActive" = 1 AND s."IsDisabled" = 0
GROUP BY s."Id", s."StorageName", s."Region", s."Size", s."StorageOwner", s."AccountId", s."CreatedOn", s."IsActive", s."IsDisabled"
ORDER BY latest_monthly_savings DESC NULLS LAST;

-- Comments for documentation
COMMENT ON TABLE savings_recommendations IS 'Stores cost savings recommendations for S3 buckets';
COMMENT ON COLUMN savings_recommendations.bucket_name IS 'References StorageName from S3BucketDetails table';
COMMENT ON COLUMN savings_recommendations.details IS 'Detailed savings recommendations including storage class transitions';
COMMENT ON COLUMN savings_recommendations.eligible_objects IS 'Number of objects eligible for cost optimization';
COMMENT ON COLUMN savings_recommendations.estimated_monthly_savings IS 'Estimated monthly cost savings in USD';
COMMENT ON COLUMN savings_recommendations.estimated_annual_savings IS 'Estimated annual cost savings in USD';

-- Grant permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;


-- S3 Right-Sizing Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS savings_recommendations CASCADE;
DROP TABLE IF EXISTS s3_buckets CASCADE;

-- Table to store S3 bucket information
CREATE TABLE s3_buckets (
    id SERIAL PRIMARY KEY,
    bucket_name VARCHAR(255) UNIQUE NOT NULL,
    region VARCHAR(50) NOT NULL DEFAULT 'us-east-1',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_analyzed TIMESTAMP,
    total_size_bytes BIGINT DEFAULT 0,
    object_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    CONSTRAINT bucket_name_check CHECK (bucket_name <> '')
);

-- Table to store savings recommendations
CREATE TABLE savings_recommendations (
    id SERIAL PRIMARY KEY,
    bucket_name VARCHAR(255) NOT NULL,
    recommendation_timestamp TIMESTAMP DEFAULT NOW(),
    total_objects INTEGER NOT NULL,
    eligible_objects INTEGER DEFAULT 0,
    estimated_monthly_savings DECIMAL(10, 2) DEFAULT 0,
    estimated_annual_savings DECIMAL(10, 2) DEFAULT 0,
    details JSONB DEFAULT '{}',
    FOREIGN KEY (bucket_name) REFERENCES s3_buckets(bucket_name) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_bucket_name ON s3_buckets(bucket_name);
CREATE INDEX idx_total_size_bytes ON s3_buckets(total_size_bytes DESC);
CREATE INDEX idx_is_active ON s3_buckets(is_active);
CREATE INDEX idx_last_analyzed ON s3_buckets(last_analyzed);
CREATE INDEX idx_recommendation_timestamp ON savings_recommendations(recommendation_timestamp DESC);
CREATE INDEX idx_recommendation_bucket ON savings_recommendations(bucket_name);
CREATE INDEX idx_estimated_savings ON savings_recommendations(estimated_monthly_savings DESC);

-- Create a view for bucket statistics with latest savings recommendations
CREATE OR REPLACE VIEW bucket_statistics AS
SELECT 
    b.bucket_name,
    b.region,
    b.total_size_bytes,
    b.object_count,
    b.last_analyzed,
    COUNT(sr.id) as total_recommendations,
    MAX(sr.recommendation_timestamp) as latest_recommendation_date,
    (SELECT estimated_monthly_savings 
     FROM savings_recommendations 
     WHERE bucket_name = b.bucket_name 
     ORDER BY recommendation_timestamp DESC 
     LIMIT 1) as latest_monthly_savings,
    (SELECT estimated_annual_savings 
     FROM savings_recommendations 
     WHERE bucket_name = b.bucket_name 
     ORDER BY recommendation_timestamp DESC 
     LIMIT 1) as latest_annual_savings
FROM s3_buckets b
LEFT JOIN savings_recommendations sr ON b.bucket_name = sr.bucket_name
WHERE b.is_active = true
GROUP BY b.id, b.bucket_name, b.region, b.total_size_bytes, b.object_count, b.last_analyzed
ORDER BY latest_monthly_savings DESC NULLS LAST;

-- Sample data insertion (optional - for testing)
INSERT INTO s3_buckets (bucket_name, region, total_size_bytes, object_count, is_active) VALUES
('my-large-bucket-1', 'us-east-1', 500000000000, 50000, true),
('my-large-bucket-2', 'us-west-2', 300000000000, 30000, true),
('my-medium-bucket', 'eu-west-1', 150000000000, 15000, true),
('my-small-bucket', 'ap-southeast-1', 50000000000, 5000, true);

-- Comments for documentation
COMMENT ON TABLE s3_buckets IS 'Stores information about S3 buckets tracked for cost optimization';
COMMENT ON TABLE savings_recommendations IS 'Stores cost savings recommendations for S3 buckets';
COMMENT ON COLUMN s3_buckets.total_size_bytes IS 'Total size of all objects in the bucket in bytes';
COMMENT ON COLUMN s3_buckets.object_count IS 'Total number of objects in the bucket';
COMMENT ON COLUMN s3_buckets.metadata IS 'Additional metadata about the bucket (storage class distribution, etc.)';
COMMENT ON COLUMN savings_recommendations.details IS 'Detailed savings recommendations including storage class transitions';
COMMENT ON COLUMN savings_recommendations.eligible_objects IS 'Number of objects eligible for cost optimization';
COMMENT ON COLUMN savings_recommendations.estimated_monthly_savings IS 'Estimated monthly cost savings in USD';
COMMENT ON COLUMN savings_recommendations.estimated_annual_savings IS 'Estimated annual cost savings in USD';

-- Grant permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;


-- S3 Right-Sizing Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS rightsizing_operations CASCADE;
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

-- Table to store right-sizing operation logs
CREATE TABLE rightsizing_operations (
    id SERIAL PRIMARY KEY,
    bucket_name VARCHAR(255) NOT NULL,
    operation_timestamp TIMESTAMP DEFAULT NOW(),
    total_objects INTEGER NOT NULL,
    successful_transitions INTEGER DEFAULT 0,
    failed_transitions INTEGER DEFAULT 0,
    estimated_monthly_savings DECIMAL(10, 2) DEFAULT 0,
    details JSONB DEFAULT '{}',
    FOREIGN KEY (bucket_name) REFERENCES s3_buckets(bucket_name) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_bucket_name ON s3_buckets(bucket_name);
CREATE INDEX idx_total_size_bytes ON s3_buckets(total_size_bytes DESC);
CREATE INDEX idx_is_active ON s3_buckets(is_active);
CREATE INDEX idx_last_analyzed ON s3_buckets(last_analyzed);
CREATE INDEX idx_operation_timestamp ON rightsizing_operations(operation_timestamp DESC);
CREATE INDEX idx_operation_bucket ON rightsizing_operations(bucket_name);

-- Create a view for bucket statistics
CREATE OR REPLACE VIEW bucket_statistics AS
SELECT 
    b.bucket_name,
    b.region,
    b.total_size_bytes,
    b.object_count,
    b.last_analyzed,
    COUNT(ro.id) as total_operations,
    SUM(ro.successful_transitions) as total_successful_transitions,
    SUM(ro.estimated_monthly_savings) as total_estimated_savings
FROM s3_buckets b
LEFT JOIN rightsizing_operations ro ON b.bucket_name = ro.bucket_name
WHERE b.is_active = true
GROUP BY b.id, b.bucket_name, b.region, b.total_size_bytes, b.object_count, b.last_analyzed
ORDER BY b.total_size_bytes DESC;

-- Sample data insertion (optional - for testing)
INSERT INTO s3_buckets (bucket_name, region, total_size_bytes, object_count, is_active) VALUES
('my-large-bucket-1', 'us-east-1', 500000000000, 50000, true),
('my-large-bucket-2', 'us-west-2', 300000000000, 30000, true),
('my-medium-bucket', 'eu-west-1', 150000000000, 15000, true),
('my-small-bucket', 'ap-southeast-1', 50000000000, 5000, true);

-- Comments for documentation
COMMENT ON TABLE s3_buckets IS 'Stores information about S3 buckets tracked for right-sizing';
COMMENT ON TABLE rightsizing_operations IS 'Logs all right-sizing operations performed on buckets';
COMMENT ON COLUMN s3_buckets.total_size_bytes IS 'Total size of all objects in the bucket in bytes';
COMMENT ON COLUMN s3_buckets.object_count IS 'Total number of objects in the bucket';
COMMENT ON COLUMN s3_buckets.metadata IS 'Additional metadata about the bucket (storage class distribution, etc.)';
COMMENT ON COLUMN rightsizing_operations.details IS 'Detailed information about the operation (errors, sample transitions, etc.)';

-- Grant permissions (adjust as needed for your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;


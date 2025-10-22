import { query } from '../config/database.js';

/**
 * Fetch all S3 buckets from the PostgreSQL database
 * @returns {Promise<Array>} Array of bucket objects
 */
export async function fetchBucketsFromDB() {
  try {
    const result = await query(
      `SELECT 
        id,
        bucket_name,
        region,
        created_at,
        last_analyzed,
        total_size_bytes,
        object_count,
        metadata
      FROM s3_buckets 
      WHERE is_active = true
      ORDER BY total_size_bytes DESC NULLS LAST`
    );

    console.log(`Fetched ${result.rows.length} active buckets from database`);
    return result.rows;
  } catch (error) {
    console.error('Error fetching buckets from database:', error);
    throw error;
  }
}

/**
 * Fetch buckets above a certain size threshold
 * @param {number} sizeThresholdGB - Size threshold in GB
 * @returns {Promise<Array>} Array of large bucket objects
 */
export async function fetchLargeBuckets(sizeThresholdGB = 100) {
  const sizeThresholdBytes = sizeThresholdGB * 1024 * 1024 * 1024;

  try {
    const result = await query(
      `SELECT 
        id,
        bucket_name,
        region,
        created_at,
        last_analyzed,
        total_size_bytes,
        object_count,
        metadata
      FROM s3_buckets 
      WHERE is_active = true 
        AND total_size_bytes > $1
      ORDER BY total_size_bytes DESC`,
      [sizeThresholdBytes]
    );

    console.log(`Fetched ${result.rows.length} buckets larger than ${sizeThresholdGB}GB`);
    return result.rows;
  } catch (error) {
    console.error('Error fetching large buckets:', error);
    throw error;
  }
}

/**
 * Update bucket information in the database
 * @param {string} bucketName - Name of the bucket
 * @param {object} data - Data to update
 * @returns {Promise<object>} Updated bucket
 */
export async function updateBucketInfo(bucketName, data) {
  const { totalSizeBytes, objectCount, lastAnalyzed, metadata } = data;

  try {
    const result = await query(
      `UPDATE s3_buckets 
      SET 
        total_size_bytes = COALESCE($1, total_size_bytes),
        object_count = COALESCE($2, object_count),
        last_analyzed = COALESCE($3, last_analyzed),
        metadata = COALESCE($4, metadata),
        updated_at = NOW()
      WHERE bucket_name = $5
      RETURNING *`,
      [totalSizeBytes, objectCount, lastAnalyzed, metadata, bucketName]
    );

    return result.rows[0];
  } catch (error) {
    console.error(`Error updating bucket ${bucketName}:`, error);
    throw error;
  }
}

/**
 * Get bucket by name
 * @param {string} bucketName - Name of the bucket
 * @returns {Promise<object>} Bucket object
 */
export async function getBucketByName(bucketName) {
  try {
    const result = await query(
      'SELECT * FROM s3_buckets WHERE bucket_name = $1',
      [bucketName]
    );

    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching bucket ${bucketName}:`, error);
    throw error;
  }
}

export default {
  fetchBucketsFromDB,
  fetchLargeBuckets,
  updateBucketInfo,
  getBucketByName,
};


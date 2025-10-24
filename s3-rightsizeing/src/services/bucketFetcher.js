import { query } from '../config/database.js';

/**
 * Fetch all S3 buckets from the PostgreSQL database
 * @returns {Promise<Array>} Array of bucket objects
 */
export async function fetchBucketsFromDB() {
  try {
    const result = await query(
      `SELECT 
        "Id",
        "StorageName" as bucket_name,
        "StorageOwner",
        "CreatedOn",
        "Region" as region,
        "IsActive",
        "IsDisabled",
        "createdAt",
        "updatedAt",
        "Size" as total_size_bytes,
        "AccountId",
        "Unit",
        "PricePerHour",
        "CurrencyCode",
        "StoragePricePerMonth",
        "CreatedBy",
        "UpdatedBy",
        "IpAddress"
      FROM public."S3BucketDetails" 
      WHERE "IsActive" = 1 AND "IsDisabled" = 0 AND "AccountId" = '425964170654' 
      ORDER BY "Size" DESC NULLS LAST`
    );

    console.log(`Fetched ${result.rows.length} active buckets from S3BucketDetails`);
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
        "Id",
        "StorageName" as bucket_name,
        "StorageOwner",
        "CreatedOn",
        "Region" as region,
        "IsActive",
        "IsDisabled",
        "createdAt",
        "updatedAt",
        "Size" as total_size_bytes,
        "AccountId",
        "Unit",
        "PricePerHour",
        "CurrencyCode",
        "StoragePricePerMonth",
        "CreatedBy",
        "UpdatedBy",
        "IpAddress"
      FROM public."S3BucketDetails" 
      WHERE "IsActive" = 1 
        AND "IsDisabled" = 0
        AND "Size" > $1
      ORDER BY "Size" DESC`,
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
    // For now, we'll just log the update since we don't want to modify your S3BucketDetails table
    console.log(`Would update bucket ${bucketName} with size: ${totalSizeBytes} bytes`);
    
    // If you want to actually update the Size field, uncomment the query below:
    /*
    const result = await query(
      `UPDATE public."S3BucketDetails" 
      SET 
        "Size" = COALESCE($1, "Size"),
        "updatedAt" = NOW()
      WHERE "StorageName" = $2
      RETURNING *`,
      [totalSizeBytes, bucketName]
    );
    return result.rows[0];
    */
    
    return null; // Return null since we're not updating
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
      'SELECT * FROM public."S3BucketDetails" WHERE "StorageName" = $1',
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


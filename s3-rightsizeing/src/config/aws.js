import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import dotenv from 'dotenv';

dotenv.config();

// Create S3 client factory function for different regions
export function createS3Client(region = 'us-east-1') {
  const roleArn = process.env.ASSUME_ROLE_ARN;
  
  // If role ARN is provided, use temporary credentials
  if (roleArn) {
    const tempCredentialsProvider = fromTemporaryCredentials({
      params: {
        RoleArn: roleArn,
        RoleSessionName: `s3-rightsizing-session-${Date.now()}`,
        DurationSeconds: 3600,
      },
      clientConfig: {
        region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      },
    });

    return new S3Client({
      region,
      credentials: tempCredentialsProvider,
      maxAttempts: 3,
      forcePathStyle: false,
    });
  }

  // Fallback to default credentials (environment, profile, etc.)
  return new S3Client({
    region,
    maxAttempts: 3,
    forcePathStyle: false,
  });
}

// Default S3 client for us-east-1
export const s3Client = createS3Client(process.env.AWS_REGION || 'us-east-1');

/**
 * List all objects in a bucket with pagination
 * @param {string} bucketName - Name of the S3 bucket
 * @param {string} region - AWS region for the bucket
 * @param {string} prefix - Optional prefix to filter objects
 * @returns {Promise<Array>} Array of objects
 */
export async function listAllObjects(bucketName, region = 'us-east-1', prefix = '') {
  const objects = [];
  let continuationToken = undefined;

  try {
    // Create S3 client for the specific region
    const s3Client = createS3Client(region);

    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);
      
      if (response.Contents) {
        objects.push(...response.Contents);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  } catch (error) {
    console.error(`Error listing objects in bucket ${bucketName}:`, error);
    throw error;
  }
}

/**
 * Get object metadata
 * @param {string} bucketName - Name of the S3 bucket
 * @param {string} objectKey - Object key
 * @param {string} region - AWS region for the bucket
 * @returns {Promise<object>} Object metadata
 */
export async function getObjectMetadata(bucketName, objectKey, region = 'us-east-1') {
  try {
    // Create S3 client for the specific region
    const s3Client = createS3Client(region);

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const response = await s3Client.send(command);
    return {
      storageClass: response.StorageClass,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error(`Error getting metadata for ${objectKey}:`, error);
    throw error;
  }
}

export default {
  s3Client,
  createS3Client,
  listAllObjects,
  getObjectMetadata,
};


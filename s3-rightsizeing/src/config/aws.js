import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Create S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  maxAttempts: 3, // Retry failed requests
});

/**
 * List all objects in a bucket with pagination
 * @param {string} bucketName - Name of the S3 bucket
 * @param {string} prefix - Optional prefix to filter objects
 * @returns {Promise<Array>} Array of objects
 */
export async function listAllObjects(bucketName, prefix = '') {
  const objects = [];
  let continuationToken = undefined;

  try {
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
 * Copy object to a different storage class
 * @param {string} bucketName - Name of the S3 bucket
 * @param {string} objectKey - Object key
 * @param {string} storageClass - Target storage class
 * @returns {Promise<object>} Copy result
 */
export async function changeStorageClass(bucketName, objectKey, storageClass) {
  try {
    const command = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${objectKey}`,
      Key: objectKey,
      StorageClass: storageClass,
      MetadataDirective: 'COPY',
    });

    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error(`Error changing storage class for ${objectKey}:`, error);
    throw error;
  }
}

export default {
  s3Client,
  listAllObjects,
  changeStorageClass,
};


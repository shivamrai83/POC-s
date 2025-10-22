#!/usr/bin/env node

/**
 * Utility script to add S3 buckets to the database
 * Usage: node scripts/add-buckets.js bucket1 bucket2 bucket3 [region]
 */

import { query, closePool } from '../src/config/database.js';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node scripts/add-buckets.js <bucket-name-1> [bucket-name-2] [...] [--region=us-east-1]');
  console.log('\nExample:');
  console.log('  node scripts/add-buckets.js my-bucket-1 my-bucket-2 --region=us-west-2');
  process.exit(1);
}

// Parse region argument
let region = 'us-east-1';
const bucketNames = [];

for (const arg of args) {
  if (arg.startsWith('--region=')) {
    region = arg.split('=')[1];
  } else {
    bucketNames.push(arg);
  }
}

if (bucketNames.length === 0) {
  console.error('Error: No bucket names provided');
  process.exit(1);
}

async function addBuckets() {
  console.log(`Adding ${bucketNames.length} bucket(s) to database...`);
  console.log(`Region: ${region}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const bucketName of bucketNames) {
    try {
      await query(
        `INSERT INTO s3_buckets (bucket_name, region, is_active)
         VALUES ($1, $2, true)
         ON CONFLICT (bucket_name) 
         DO UPDATE SET 
           region = EXCLUDED.region,
           is_active = true,
           updated_at = NOW()`,
        [bucketName, region]
      );

      console.log(`✓ Added bucket: ${bucketName}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to add bucket ${bucketName}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);

  await closePool();
}

addBuckets().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


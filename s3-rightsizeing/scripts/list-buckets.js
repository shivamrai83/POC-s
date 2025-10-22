#!/usr/bin/env node

/**
 * Utility script to list all buckets in the database
 * Usage: node scripts/list-buckets.js [--show-inactive]
 */

import { query, closePool } from '../src/config/database.js';

const args = process.argv.slice(2);
const showInactive = args.includes('--show-inactive');

async function listBuckets() {
  try {
    const whereClause = showInactive ? '' : 'WHERE is_active = true';
    
    const result = await query(
      `SELECT 
        bucket_name,
        region,
        total_size_bytes,
        object_count,
        last_analyzed,
        is_active
      FROM s3_buckets
      ${whereClause}
      ORDER BY total_size_bytes DESC NULLS LAST`
    );

    if (result.rows.length === 0) {
      console.log('No buckets found in database.');
      return;
    }

    console.log(`\nFound ${result.rows.length} bucket(s):\n`);
    console.log('Bucket Name'.padEnd(40) + 'Region'.padEnd(15) + 'Size (GB)'.padEnd(15) + 'Objects'.padEnd(12) + 'Active');
    console.log('-'.repeat(95));

    for (const bucket of result.rows) {
      const sizeGB = bucket.total_size_bytes 
        ? (bucket.total_size_bytes / (1024 ** 3)).toFixed(2)
        : 'N/A';
      
      const objectCount = bucket.object_count || 'N/A';
      const active = bucket.is_active ? '✓' : '✗';

      console.log(
        bucket.bucket_name.padEnd(40) +
        bucket.region.padEnd(15) +
        String(sizeGB).padEnd(15) +
        String(objectCount).padEnd(12) +
        active
      );
    }

    console.log();

  } catch (error) {
    console.error('Error listing buckets:', error);
  } finally {
    await closePool();
  }
}

listBuckets();


#!/usr/bin/env node

import dotenv from 'dotenv';
import { fetchBucketsFromDB, fetchLargeBuckets, updateBucketInfo } from './services/bucketFetcher.js';
import { analyzeBucket, identifyLargeBuckets } from './services/bucketAnalyzer.js';
import { rightSizeBucket, calculateTotalSavings, generateLifecyclePolicy } from './services/rightSizer.js';
import { closePool } from './config/database.js';

dotenv.config();

/**
 * Main orchestration function for S3 right-sizing
 */
async function main() {
  console.log('='.repeat(80));
  console.log('S3 Bucket Right-Sizing Tool');
  console.log('='.repeat(80));
  console.log();

  try {
    // Configuration
    const config = {
      sizeThresholdGB: parseInt(process.env.SIZE_THRESHOLD_GB || '100'),
      dryRun: process.env.DRY_RUN === 'true',
      maxBucketsToProcess: parseInt(process.env.MAX_BUCKETS_TO_PROCESS || '10'),
      minSavingsThreshold: parseFloat(process.env.MIN_SAVINGS_THRESHOLD || '1.0'),
      batchSize: parseInt(process.env.BATCH_SIZE || '100'),
    };

    console.log('Configuration:', config);
    console.log();

    // Step 1: Fetch buckets from PostgreSQL database
    console.log('Step 1: Fetching buckets from database...');
    const allBuckets = await fetchBucketsFromDB();
    
    if (allBuckets.length === 0) {
      console.log('No active buckets found in database. Exiting.');
      return;
    }

    console.log(`Found ${allBuckets.length} active buckets`);
    console.log();

    // Step 2: Identify large buckets
    console.log(`Step 2: Identifying buckets larger than ${config.sizeThresholdGB}GB...`);
    const largeBuckets = identifyLargeBuckets(allBuckets, config.sizeThresholdGB);
    
    if (largeBuckets.length === 0) {
      console.log(`No buckets found above ${config.sizeThresholdGB}GB threshold. Exiting.`);
      return;
    }

    console.log(`Identified ${largeBuckets.length} large buckets`);
    
    // Display top buckets
    console.log('\nTop 5 largest buckets:');
    largeBuckets.slice(0, 5).forEach((bucket, index) => {
      const sizeGB = (bucket.total_size_bytes / (1024 ** 3)).toFixed(2);
      console.log(`  ${index + 1}. ${bucket.bucket_name}: ${sizeGB} GB`);
    });
    console.log();

    // Limit buckets to process
    const bucketsToProcess = largeBuckets.slice(0, config.maxBucketsToProcess);
    console.log(`Processing ${bucketsToProcess.length} buckets...`);
    console.log();

    // Step 3: Analyze and right-size each bucket
    const allResults = [];
    let totalSavingsAcrossAllBuckets = 0;

    for (let i = 0; i < bucketsToProcess.length; i++) {
      const bucket = bucketsToProcess[i];
      const bucketNum = i + 1;
      
      console.log(`\n[${ bucketNum}/${bucketsToProcess.length}] Processing bucket: ${bucket.bucket_name}`);
      console.log('-'.repeat(80));

      try {
        // Analyze bucket
        console.log('  → Analyzing bucket objects...');
        const analysis = await analyzeBucket(bucket.bucket_name);

        // Update bucket info in database
        await updateBucketInfo(bucket.bucket_name, {
          totalSizeBytes: analysis.totalSize,
          objectCount: analysis.totalObjects,
          lastAnalyzed: new Date(),
          metadata: {
            storageClassDistribution: analysis.storageClassDistribution,
            ageDistribution: analysis.ageDistribution,
          },
        });

        if (analysis.isEmpty) {
          console.log('  → Bucket is empty, skipping...');
          continue;
        }

        // Display analysis results
        const sizeGB = (analysis.totalSize / (1024 ** 3)).toFixed(2);
        console.log(`  → Total objects: ${analysis.totalObjects}`);
        console.log(`  → Total size: ${sizeGB} GB`);
        console.log(`  → Objects needing right-sizing: ${analysis.objectsNeedingRightSizing.length}`);

        if (analysis.recommendations.length > 0) {
          console.log('  → Recommendations:');
          analysis.recommendations.forEach(rec => {
            console.log(`    - [${rec.priority}] ${rec.message}`);
            if (rec.potentialMonthlySavings) {
              console.log(`      Potential savings: $${rec.potentialMonthlySavings}/month`);
            }
          });
        }

        // Calculate savings
        if (analysis.objectsNeedingRightSizing.length > 0) {
          const savingsSummary = calculateTotalSavings(analysis.objectsNeedingRightSizing);
          console.log(`  → Potential monthly savings: $${savingsSummary.totalPotentialMonthlySavings.toFixed(2)}`);
          console.log(`  → Potential annual savings: $${savingsSummary.totalPotentialAnnualSavings.toFixed(2)}`);

          // Right-size bucket
          console.log(`  → Starting right-sizing (${config.dryRun ? 'DRY RUN' : 'LIVE'})...`);
          const rightSizeResults = await rightSizeBucket(
            bucket.bucket_name,
            analysis.objectsNeedingRightSizing,
            {
              dryRun: config.dryRun,
              batchSize: config.batchSize,
              minSavings: config.minSavingsThreshold,
            }
          );

          allResults.push({
            bucketName: bucket.bucket_name,
            analysis,
            rightSizeResults,
            savingsSummary,
          });

          totalSavingsAcrossAllBuckets += savingsSummary.totalPotentialMonthlySavings;

          // Generate lifecycle policy recommendation
          const lifecyclePolicy = generateLifecyclePolicy(bucket.bucket_name);
          console.log('  → Generated lifecycle policy for automated future right-sizing');
        } else {
          console.log('  → No right-sizing needed. Bucket is already optimized!');
        }

      } catch (error) {
        console.error(`  ✗ Error processing bucket ${bucket.bucket_name}:`, error.message);
        continue;
      }
    }

    // Step 4: Summary report
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY REPORT');
    console.log('='.repeat(80));
    console.log();
    console.log(`Buckets analyzed: ${bucketsToProcess.length}`);
    console.log(`Buckets optimized: ${allResults.length}`);
    console.log(`Total potential monthly savings: $${totalSavingsAcrossAllBuckets.toFixed(2)}`);
    console.log(`Total potential annual savings: $${(totalSavingsAcrossAllBuckets * 12).toFixed(2)}`);
    console.log();

    if (config.dryRun) {
      console.log('⚠️  This was a DRY RUN. No actual changes were made.');
      console.log('   Set DRY_RUN=false in your .env file to perform actual right-sizing.');
    } else {
      console.log('✓ Right-sizing completed successfully!');
    }

    console.log();
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    // Clean up database connection
    await closePool();
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});


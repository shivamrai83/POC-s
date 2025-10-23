#!/usr/bin/env node

import dotenv from 'dotenv';
import { fetchBucketsFromDB, fetchLargeBuckets, updateBucketInfo } from './services/bucketFetcher.js';
import { analyzeBucket, identifyLargeBuckets } from './services/bucketAnalyzer.js';
import { 
  generateSavingsRecommendations, 
  calculateTotalSavings, 
  generateLifecyclePolicyRecommendation,
  formatSavingsReport 
} from './services/rightSizer.js';
import { closePool } from './config/database.js';

dotenv.config();

/**
 * Main orchestration function for S3 cost savings recommendations
 */
async function main() {
  console.log('='.repeat(80));
  console.log('S3 Storage Cost Savings Recommendation Tool');
  console.log('='.repeat(80));
  console.log();

  try {
    // Configuration
    const config = {
      sizeThresholdGB: parseInt(process.env.SIZE_THRESHOLD_GB || '100'),
      maxBucketsToProcess: parseInt(process.env.MAX_BUCKETS_TO_PROCESS || '10'),
      minSavingsThreshold: parseFloat(process.env.MIN_SAVINGS_THRESHOLD || '1.0'),
    };

    console.log('Configuration:', config);
    console.log('Mode: RECOMMENDATION ONLY (No actual changes will be made)');
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

    // Step 3: Analyze buckets and generate savings recommendations
    const allRecommendations = [];
    let totalSavingsAcrossAllBuckets = 0;

    for (let i = 0; i < bucketsToProcess.length; i++) {
      const bucket = bucketsToProcess[i];
      const bucketNum = i + 1;
      
      console.log(`\n[${bucketNum}/${bucketsToProcess.length}] Analyzing bucket: ${bucket.bucket_name}`);
      console.log('-'.repeat(80));

      try {
        // Analyze bucket
        console.log('  → Analyzing bucket objects and storage patterns...');
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
        console.log(`  → Objects with optimization potential: ${analysis.objectsNeedingRightSizing.length}`);

        // Generate savings recommendations
        if (analysis.objectsNeedingRightSizing.length > 0) {
          const savingsSummary = calculateTotalSavings(analysis.objectsNeedingRightSizing);
          console.log(`  → Potential monthly savings: $${savingsSummary.totalPotentialMonthlySavings.toFixed(2)}`);
          console.log(`  → Potential annual savings: $${savingsSummary.totalPotentialAnnualSavings.toFixed(2)}`);

          // Generate detailed recommendations
          console.log('  → Generating detailed savings recommendations...');
          const recommendation = await generateSavingsRecommendations(
            bucket.bucket_name,
            analysis.objectsNeedingRightSizing,
            {
              minSavings: config.minSavingsThreshold,
            }
          );

          // Generate lifecycle policy recommendation
          const lifecycleRecommendation = generateLifecyclePolicyRecommendation(
            bucket.bucket_name,
            analysis.objectsNeedingRightSizing
          );

          allRecommendations.push({
            bucketName: bucket.bucket_name,
            analysis,
            recommendation,
            lifecycleRecommendation,
            savingsSummary,
          });

          totalSavingsAcrossAllBuckets += savingsSummary.totalPotentialMonthlySavings;

          // Display top optimization opportunities
          if (recommendation.recommendations.length > 0) {
            console.log('  → Top optimization opportunities:');
            recommendation.recommendations.slice(0, 3).forEach(rec => {
              console.log(`    • ${rec.fromClass} → ${rec.toClass}: ${rec.objectCount} objects, $${rec.monthlySavings}/month`);
            });
          }

          // Display lifecycle policy recommendations
          if (lifecycleRecommendation.suggestedRules.length > 0) {
            console.log('  → Lifecycle policy recommendations:');
            lifecycleRecommendation.suggestedRules.forEach(rule => {
              console.log(`    • ${rule.description} (${rule.impact.affectedObjects} objects)`);
            });
          }
        } else {
          console.log('  ✓ Bucket is already optimized! No savings opportunities found.');
        }

      } catch (error) {
        console.error(`  ✗ Error analyzing bucket ${bucket.bucket_name}:`, error.message);
        continue;
      }
    }

    // Step 4: Generate comprehensive summary report
    console.log('\n' + '='.repeat(80));
    console.log('COST SAVINGS SUMMARY REPORT');
    console.log('='.repeat(80));
    console.log();
    console.log(`Buckets analyzed: ${bucketsToProcess.length}`);
    console.log(`Buckets with savings opportunities: ${allRecommendations.length}`);
    console.log();
    console.log('💰 TOTAL POTENTIAL SAVINGS:');
    console.log(`   Monthly: $${totalSavingsAcrossAllBuckets.toFixed(2)}`);
    console.log(`   Annual:  $${(totalSavingsAcrossAllBuckets * 12).toFixed(2)}`);
    console.log();

    // Display breakdown by bucket
    if (allRecommendations.length > 0) {
      console.log('SAVINGS BREAKDOWN BY BUCKET:');
      console.log('-'.repeat(80));
      
      // Sort recommendations by savings (highest first)
      const sortedRecommendations = allRecommendations.sort((a, b) => 
        b.savingsSummary.totalPotentialMonthlySavings - a.savingsSummary.totalPotentialMonthlySavings
      );

      sortedRecommendations.forEach((rec, index) => {
        const monthly = rec.savingsSummary.totalPotentialMonthlySavings.toFixed(2);
        const annual = rec.savingsSummary.totalPotentialAnnualSavings.toFixed(2);
        console.log(`${index + 1}. ${rec.bucketName}`);
        console.log(`   Monthly Savings: $${monthly} | Annual Savings: $${annual}`);
        console.log(`   Eligible Objects: ${rec.recommendation.eligibleObjects.toLocaleString()}`);
        console.log(`   Data Size: ${rec.recommendation.summary.totalDataSizeGB} GB`);
        console.log();
      });

      // Generate detailed reports for top buckets
      console.log('='.repeat(80));
      console.log('DETAILED RECOMMENDATIONS (Top 3 Buckets)');
      console.log('='.repeat(80));
      
      for (let i = 0; i < Math.min(3, sortedRecommendations.length); i++) {
        const rec = sortedRecommendations[i];
        const report = formatSavingsReport(rec.recommendation);
        console.log(report);
      }
    }

    console.log('='.repeat(80));
    console.log('NEXT STEPS FOR IMPLEMENTATION');
    console.log('='.repeat(80));
    console.log();
    console.log('1. Review the detailed recommendations above');
    console.log('2. Prioritize buckets with highest savings potential');
    console.log('3. Implement AWS S3 Lifecycle policies (recommended approach):');
    console.log('   - Go to AWS S3 Console → Select Bucket → Management → Lifecycle');
    console.log('   - Create rules based on the recommendations');
    console.log('4. Alternatively, manually transition objects using AWS CLI or Console');
    console.log('5. Monitor cost savings in AWS Cost Explorer after 30-60 days');
    console.log('6. Adjust policies based on actual access patterns and needs');
    console.log();
    console.log('📊 All recommendations have been saved to the database.');
    console.log('💡 This tool analyzes and recommends - it does NOT make any changes to your S3 buckets.');
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


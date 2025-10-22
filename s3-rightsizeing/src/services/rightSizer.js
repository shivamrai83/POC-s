import { changeStorageClass } from '../config/aws.js';
import { query } from '../config/database.js';

/**
 * Right-size a bucket by transitioning objects to appropriate storage classes
 * @param {string} bucketName - Name of the S3 bucket
 * @param {Array} objectsToRightSize - Array of objects with recommendations
 * @param {object} options - Right-sizing options
 * @returns {Promise<object>} Right-sizing results
 */
export async function rightSizeBucket(bucketName, objectsToRightSize, options = {}) {
  const {
    dryRun = false,
    batchSize = 100,
    minSavings = 0,
    maxObjectsToProcess = null,
  } = options;

  console.log(`Starting right-sizing for bucket: ${bucketName}`, {
    dryRun,
    objectsToProcess: objectsToRightSize.length,
  });

  const results = {
    bucketName,
    dryRun,
    totalObjects: objectsToRightSize.length,
    processedObjects: 0,
    successfulTransitions: 0,
    failedTransitions: 0,
    skippedObjects: 0,
    totalSavings: 0,
    errors: [],
    transitions: [],
  };

  // Filter objects by minimum savings threshold
  let objectsToProcess = objectsToRightSize.filter(
    obj => obj.potentialSavings >= minSavings
  );

  // Limit number of objects to process if specified
  if (maxObjectsToProcess && objectsToProcess.length > maxObjectsToProcess) {
    console.log(`Limiting processing to ${maxObjectsToProcess} objects`);
    objectsToProcess = objectsToProcess.slice(0, maxObjectsToProcess);
  }

  // Process objects in batches
  for (let i = 0; i < objectsToProcess.length; i += batchSize) {
    const batch = objectsToProcess.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} objects)`);

    const batchPromises = batch.map(obj => 
      processObject(bucketName, obj, dryRun, results)
    );

    await Promise.allSettled(batchPromises);

    // Add a small delay between batches to avoid throttling
    if (i + batchSize < objectsToProcess.length) {
      await sleep(1000);
    }
  }

  // Log results to database
  if (!dryRun) {
    await logRightSizingOperation(results);
  }

  console.log(`Right-sizing complete for ${bucketName}:`, {
    processed: results.processedObjects,
    successful: results.successfulTransitions,
    failed: results.failedTransitions,
    skipped: results.skippedObjects,
    estimatedMonthlySavings: results.totalSavings.toFixed(2),
  });

  return results;
}

/**
 * Process a single object transition
 * @param {string} bucketName - Bucket name
 * @param {object} obj - Object with recommendation
 * @param {boolean} dryRun - Whether to simulate only
 * @param {object} results - Results object to update
 */
async function processObject(bucketName, obj, dryRun, results) {
  try {
    const transition = {
      key: obj.key,
      currentClass: obj.currentClass,
      recommendedClass: obj.recommendedClass,
      size: obj.size,
      potentialSavings: obj.potentialSavings,
      timestamp: new Date().toISOString(),
    };

    if (dryRun) {
      transition.status = 'SIMULATED';
      results.transitions.push(transition);
      results.processedObjects++;
      results.successfulTransitions++;
      results.totalSavings += obj.potentialSavings;
    } else {
      // Perform actual storage class transition
      await changeStorageClass(bucketName, obj.key, obj.recommendedClass);
      
      transition.status = 'SUCCESS';
      results.transitions.push(transition);
      results.processedObjects++;
      results.successfulTransitions++;
      results.totalSavings += obj.potentialSavings;

      console.log(`✓ Transitioned ${obj.key} from ${obj.currentClass} to ${obj.recommendedClass}`);
    }
  } catch (error) {
    console.error(`✗ Failed to transition ${obj.key}:`, error.message);
    
    results.processedObjects++;
    results.failedTransitions++;
    results.errors.push({
      key: obj.key,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Log right-sizing operation to database
 * @param {object} results - Right-sizing results
 */
async function logRightSizingOperation(results) {
  try {
    await query(
      `INSERT INTO rightsizing_operations 
      (bucket_name, total_objects, successful_transitions, failed_transitions, 
       estimated_monthly_savings, operation_timestamp, details)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
      [
        results.bucketName,
        results.totalObjects,
        results.successfulTransitions,
        results.failedTransitions,
        results.totalSavings,
        JSON.stringify({
          dryRun: results.dryRun,
          errors: results.errors,
          sampleTransitions: results.transitions.slice(0, 10), // Store sample
        }),
      ]
    );

    console.log(`Logged right-sizing operation for ${results.bucketName} to database`);
  } catch (error) {
    console.error('Error logging right-sizing operation:', error);
    // Don't throw - logging failure shouldn't fail the operation
  }
}

/**
 * Create lifecycle policy for automated right-sizing
 * @param {string} bucketName - Name of the S3 bucket
 * @param {object} rules - Lifecycle rules configuration
 * @returns {object} Lifecycle policy
 */
export function generateLifecyclePolicy(bucketName, rules = {}) {
  const {
    transitionToIADays = 30,
    transitionToGlacierDays = 90,
    transitionToDeepArchiveDays = 365,
  } = rules;

  const lifecyclePolicy = {
    bucketName,
    rules: [
      {
        id: 'auto-transition-to-ia',
        status: 'Enabled',
        transitions: [
          {
            days: transitionToIADays,
            storageClass: 'STANDARD_IA',
          },
        ],
      },
      {
        id: 'auto-transition-to-glacier',
        status: 'Enabled',
        transitions: [
          {
            days: transitionToGlacierDays,
            storageClass: 'GLACIER_IR',
          },
        ],
      },
      {
        id: 'auto-transition-to-deep-archive',
        status: 'Enabled',
        transitions: [
          {
            days: transitionToDeepArchiveDays,
            storageClass: 'DEEP_ARCHIVE',
          },
        ],
      },
    ],
  };

  return lifecyclePolicy;
}

/**
 * Calculate total potential savings for a bucket
 * @param {Array} objectsToRightSize - Array of objects with recommendations
 * @returns {object} Savings summary
 */
export function calculateTotalSavings(objectsToRightSize) {
  const summary = {
    totalObjects: objectsToRightSize.length,
    totalPotentialMonthlySavings: 0,
    totalPotentialAnnualSavings: 0,
    byStorageClass: {},
  };

  for (const obj of objectsToRightSize) {
    summary.totalPotentialMonthlySavings += obj.potentialSavings;
    
    const targetClass = obj.recommendedClass;
    if (!summary.byStorageClass[targetClass]) {
      summary.byStorageClass[targetClass] = {
        objectCount: 0,
        monthlySavings: 0,
      };
    }
    
    summary.byStorageClass[targetClass].objectCount++;
    summary.byStorageClass[targetClass].monthlySavings += obj.potentialSavings;
  }

  summary.totalPotentialAnnualSavings = summary.totalPotentialMonthlySavings * 12;

  return summary;
}

/**
 * Utility function to sleep
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  rightSizeBucket,
  generateLifecyclePolicy,
  calculateTotalSavings,
};


import { listAllObjects } from '../config/aws.js';

/**
 * Storage class recommendations based on object age and access patterns
 */
const STORAGE_CLASS_RULES = {
  STANDARD: {
    name: 'STANDARD',
    description: 'Frequently accessed data',
    minDays: 0,
    maxDays: 30,
  },
  STANDARD_IA: {
    name: 'STANDARD_IA',
    description: 'Infrequently accessed data',
    minDays: 30,
    maxDays: 90,
  },
  INTELLIGENT_TIERING: {
    name: 'INTELLIGENT_TIERING',
    description: 'Unknown or changing access patterns',
    minDays: 0,
    maxDays: Infinity,
  },
  GLACIER_IR: {
    name: 'GLACIER_IR',
    description: 'Archive data with instant retrieval',
    minDays: 90,
    maxDays: 180,
  },
  GLACIER: {
    name: 'GLACIER',
    description: 'Long-term archive',
    minDays: 180,
    maxDays: 365,
  },
  DEEP_ARCHIVE: {
    name: 'DEEP_ARCHIVE',
    description: 'Long-term archive with rare access',
    minDays: 365,
    maxDays: Infinity,
  },
};

/**
 * Analyze a bucket and categorize its objects
 * @param {string} bucketName - Name of the S3 bucket
 * @returns {Promise<object>} Analysis results
 */
export async function analyzeBucket(bucketName) {
  console.log(`Starting analysis for bucket: ${bucketName}`);
  
  try {
    const objects = await listAllObjects(bucketName);
    
    if (!objects || objects.length === 0) {
      console.log(`Bucket ${bucketName} is empty`);
      return {
        bucketName,
        totalObjects: 0,
        totalSize: 0,
        isEmpty: true,
      };
    }

    const analysis = {
      bucketName,
      totalObjects: objects.length,
      totalSize: 0,
      storageClassDistribution: {},
      ageDistribution: {},
      recommendations: [],
      objectsNeedingRightSizing: [],
    };

    const now = new Date();

    // Analyze each object
    for (const obj of objects) {
      const sizeBytes = obj.Size || 0;
      analysis.totalSize += sizeBytes;

      // Track current storage class distribution
      const currentStorageClass = obj.StorageClass || 'STANDARD';
      analysis.storageClassDistribution[currentStorageClass] = 
        (analysis.storageClassDistribution[currentStorageClass] || 0) + 1;

      // Calculate object age in days
      const lastModified = new Date(obj.LastModified);
      const ageInDays = Math.floor((now - lastModified) / (1000 * 60 * 60 * 24));

      // Track age distribution
      const ageCategory = getAgeCategory(ageInDays);
      analysis.ageDistribution[ageCategory] = 
        (analysis.ageDistribution[ageCategory] || 0) + 1;

      // Check if object needs right-sizing
      const recommendedClass = recommendStorageClass(ageInDays, currentStorageClass, sizeBytes);
      
      if (recommendedClass !== currentStorageClass) {
        analysis.objectsNeedingRightSizing.push({
          key: obj.Key,
          size: sizeBytes,
          currentClass: currentStorageClass,
          recommendedClass,
          ageInDays,
          lastModified: obj.LastModified,
          potentialSavings: calculateSavings(sizeBytes, currentStorageClass, recommendedClass),
        });
      }
    }

    // Generate summary recommendations
    analysis.recommendations = generateRecommendations(analysis);

    console.log(`Analysis complete for ${bucketName}:`, {
      totalObjects: analysis.totalObjects,
      totalSizeGB: (analysis.totalSize / (1024 ** 3)).toFixed(2),
      objectsNeedingRightSizing: analysis.objectsNeedingRightSizing.length,
    });

    return analysis;
  } catch (error) {
    console.error(`Error analyzing bucket ${bucketName}:`, error);
    throw error;
  }
}

/**
 * Categorize object age
 * @param {number} ageInDays - Age of object in days
 * @returns {string} Age category
 */
function getAgeCategory(ageInDays) {
  if (ageInDays < 30) return '0-30 days';
  if (ageInDays < 90) return '30-90 days';
  if (ageInDays < 180) return '90-180 days';
  if (ageInDays < 365) return '180-365 days';
  return '365+ days';
}

/**
 * Recommend storage class based on object age and size
 * @param {number} ageInDays - Age of object in days
 * @param {string} currentClass - Current storage class
 * @param {number} sizeBytes - Object size in bytes
 * @returns {string} Recommended storage class
 */
function recommendStorageClass(ageInDays, currentClass, sizeBytes) {
  // Minimum size for IA and Glacier classes (128KB)
  const MIN_SIZE_FOR_IA = 128 * 1024;

  // Very small objects should stay in STANDARD
  if (sizeBytes < MIN_SIZE_FOR_IA) {
    return 'STANDARD';
  }

  // Recommend based on age
  if (ageInDays >= 365) {
    return 'DEEP_ARCHIVE';
  } else if (ageInDays >= 180) {
    return 'GLACIER';
  } else if (ageInDays >= 90) {
    return 'GLACIER_IR';
  } else if (ageInDays >= 30) {
    return 'STANDARD_IA';
  }

  return 'STANDARD';
}

/**
 * Calculate potential savings from storage class change
 * @param {number} sizeBytes - Object size in bytes
 * @param {string} currentClass - Current storage class
 * @param {string} recommendedClass - Recommended storage class
 * @returns {number} Estimated monthly savings in USD
 */
function calculateSavings(sizeBytes, currentClass, recommendedClass) {
  // Approximate AWS pricing per GB per month (us-east-1)
  const pricing = {
    STANDARD: 0.023,
    STANDARD_IA: 0.0125,
    INTELLIGENT_TIERING: 0.023,
    GLACIER_IR: 0.004,
    GLACIER: 0.0036,
    DEEP_ARCHIVE: 0.00099,
  };

  const sizeGB = sizeBytes / (1024 ** 3);
  const currentCost = sizeGB * (pricing[currentClass] || pricing.STANDARD);
  const recommendedCost = sizeGB * (pricing[recommendedClass] || pricing.STANDARD);

  return Math.max(0, currentCost - recommendedCost);
}

/**
 * Generate summary recommendations for the bucket
 * @param {object} analysis - Bucket analysis data
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(analysis) {
  const recommendations = [];

  const totalSizeGB = analysis.totalSize / (1024 ** 3);
  const objectsToRightSize = analysis.objectsNeedingRightSizing.length;
  const totalPotentialSavings = analysis.objectsNeedingRightSizing.reduce(
    (sum, obj) => sum + obj.potentialSavings,
    0
  );

  if (objectsToRightSize > 0) {
    recommendations.push({
      type: 'RIGHT_SIZING',
      priority: 'HIGH',
      message: `${objectsToRightSize} objects (${((objectsToRightSize / analysis.totalObjects) * 100).toFixed(1)}%) can be moved to more cost-effective storage classes`,
      potentialMonthlySavings: totalPotentialSavings.toFixed(2),
    });
  }

  // Check for buckets with old objects in STANDARD
  const oldObjectsInStandard = analysis.objectsNeedingRightSizing.filter(
    obj => obj.currentClass === 'STANDARD' && obj.ageInDays > 90
  ).length;

  if (oldObjectsInStandard > 0) {
    recommendations.push({
      type: 'LIFECYCLE_POLICY',
      priority: 'MEDIUM',
      message: `Consider setting up lifecycle policies to automatically transition objects older than 90 days`,
      affectedObjects: oldObjectsInStandard,
    });
  }

  return recommendations;
}

/**
 * Identify large buckets from a list
 * @param {Array} buckets - Array of bucket objects from database
 * @param {number} thresholdGB - Size threshold in GB (default: 100GB)
 * @returns {Array} Filtered array of large buckets
 */
export function identifyLargeBuckets(buckets, thresholdGB = 100) {
  const thresholdBytes = thresholdGB * 1024 * 1024 * 1024;
  
  const largeBuckets = buckets.filter(
    bucket => bucket.total_size_bytes && bucket.total_size_bytes > thresholdBytes
  );

  console.log(`Identified ${largeBuckets.length} buckets larger than ${thresholdGB}GB`);
  
  return largeBuckets.sort((a, b) => b.total_size_bytes - a.total_size_bytes);
}

export default {
  analyzeBucket,
  identifyLargeBuckets,
  recommendStorageClass,
  calculateSavings,
};


import { listAllObjects } from '../config/aws.js';

/**
 * Analyze a bucket and categorize its objects
 * @param {string} bucketName - Name of the S3 bucket
 * @param {string} region - AWS region of the bucket
 * @returns {Promise<object>} Analysis results
 */
export async function analyzeBucket(bucketName, region = 'us-east-1') {
  console.log(`Starting analysis for bucket: ${bucketName} (region: ${region})`);
  // const dummy = [
  //   {
  //     Key: 'debug/929aeb2d-4038-4930-91b5-d2ad1b42400d.json',
  //     LastModified: 2025 -08-01T08: 33:02.000Z,
  //     ETag: '"bb7632dc5c1764afcd43bc7a78d2f79d"',
  //     ChecksumAlgorithm: ['CRC64NVME'],
  //     ChecksumType: 'FULL_OBJECT',
  //     Size: 495,
  //     StorageClass: 'STANDARD'
  //   }
  // ]
  try {
    const objects = await listAllObjects(bucketName, region); //breaking here
    console.log('Objects:allobjects', objects);
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
      const currentStorageClass = obj.StorageClass || 'NA';
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
      console.log('currentStorageClass, recommendedClass', currentStorageClass, recommendedClass);
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
    return 'DEEP_ARCHIVE'; //GET $0.0004 per GB POST $0.05 per GB
  } else if (ageInDays >= 180) {
    return 'GLACIER'; //GET $0.0004 per GB POST $0.03 per GB
  } else if (ageInDays >= 90) {
    return 'GLACIER_IR'; //GET $0.01 per GB POST $0.02 per GB
  } else if (ageInDays >= 30) {
    return 'STANDARD_IA'; //GET $0.001 per GB POST $0.01 per GB
  }

  return 'STANDARD'; //GET $0.0004 per GB POST $0.005 per GB
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


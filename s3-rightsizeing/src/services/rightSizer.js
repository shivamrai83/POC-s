import { query } from '../config/database.js';

/**
 * Generate savings recommendations for a bucket
 * @param {string} bucketName - Name of the S3 bucket
 * @param {Array} objectsWithRecommendations - Array of objects with recommendations
 * @param {object} options - Recommendation options
 * @returns {Promise<object>} Savings recommendation report
 */
export async function generateSavingsRecommendations(bucketName, objectsWithRecommendations, options = {}) {
  const {
    minSavings = 0,
    groupByStorageClass = true,
  } = options;

  console.log(`Generating savings recommendations for bucket: ${bucketName}`);

  // Filter objects by minimum savings threshold
  const eligibleObjects = objectsWithRecommendations.filter(
    obj => obj.potentialSavings >= minSavings
  );

  const recommendation = {
    bucketName,
    generatedAt: new Date().toISOString(),
    totalObjectsAnalyzed: objectsWithRecommendations.length,
    eligibleObjects: eligibleObjects.length,
    recommendations: [],
    summary: {
      totalMonthlySavings: 0,
      totalAnnualSavings: 0,
      totalDataSizeGB: 0,
    },
  };

  // Group recommendations by current and target storage class
  const grouped = {};
  
  for (const obj of eligibleObjects) {
    const key = `${obj.currentClass}_to_${obj.recommendedClass}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        fromClass: obj.currentClass,
        toClass: obj.recommendedClass,
        objectCount: 0,
        totalSizeBytes: 0,
        monthlySavings: 0,
        sampleObjects: [],
      };
    }
    
    grouped[key].objectCount++;
    grouped[key].totalSizeBytes += obj.size;
    grouped[key].monthlySavings += obj.potentialSavings;
    recommendation.summary.totalMonthlySavings += obj.potentialSavings;
    
    // Store top 5 sample objects
    if (grouped[key].sampleObjects.length < 5) {
      grouped[key].sampleObjects.push({
        key: obj.key,
        size: obj.size,
        ageInDays: obj.ageInDays,
        monthlySavings: obj.potentialSavings,
      });
    }
  }

  // Convert grouped recommendations to array
  recommendation.recommendations = Object.values(grouped).map(rec => ({
    ...rec,
    totalSizeGB: (rec.totalSizeBytes / (1024 ** 3)).toFixed(2),
    annualSavings: (rec.monthlySavings * 12).toFixed(2),
    monthlySavings: rec.monthlySavings.toFixed(2),
    percentageOfBucket: ((rec.objectCount / recommendation.totalObjectsAnalyzed) * 100).toFixed(1),
  }));

  // Sort by savings (highest first)
  recommendation.recommendations.sort((a, b) => 
    parseFloat(b.monthlySavings) - parseFloat(a.monthlySavings)
  );

  // Calculate total summary
  recommendation.summary.totalAnnualSavings = (recommendation.summary.totalMonthlySavings * 12).toFixed(2);
  recommendation.summary.totalMonthlySavings = recommendation.summary.totalMonthlySavings.toFixed(2);
  recommendation.summary.totalDataSizeGB = (
    eligibleObjects.reduce((sum, obj) => sum + obj.size, 0) / (1024 ** 3)
  ).toFixed(2);

  // Log recommendations to database
  await logSavingsRecommendation(recommendation);

  console.log(`Generated savings recommendations for ${bucketName}:`, {
    eligibleObjects: recommendation.eligibleObjects,
    monthlySavings: `$${recommendation.summary.totalMonthlySavings}`,
    annualSavings: `$${recommendation.summary.totalAnnualSavings}`,
  });

  return recommendation;
}

/**
 * Log savings recommendation to database
 * @param {object} recommendation - Savings recommendation
 */
async function logSavingsRecommendation(recommendation) {
  try {
    await query(
      `INSERT INTO savings_recommendations 
      (bucket_name, recommendation_timestamp, total_objects, eligible_objects, 
       estimated_monthly_savings, estimated_annual_savings, details)
      VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
      [
        recommendation.bucketName,
        recommendation.totalObjectsAnalyzed,
        recommendation.eligibleObjects,
        recommendation.summary.totalMonthlySavings,
        recommendation.summary.totalAnnualSavings,
        JSON.stringify({
          recommendations: recommendation.recommendations,
          generatedAt: recommendation.generatedAt,
        }),
      ]
    );

    console.log(`Logged savings recommendation for ${recommendation.bucketName} to database`);
  } catch (error) {
    console.error('Error logging savings recommendation:', error);
    // Don't throw - logging failure shouldn't fail the operation
  }
}

/**
 * Generate lifecycle policy recommendations for automated right-sizing
 * @param {string} bucketName - Name of the S3 bucket
 * @param {Array} objectsWithRecommendations - Objects analyzed
 * @param {object} rules - Lifecycle rules configuration
 * @returns {object} Lifecycle policy recommendation
 */
export function generateLifecyclePolicyRecommendation(bucketName, objectsWithRecommendations, rules = {}) {
  const {
    transitionToIADays = 30,
    transitionToGlacierDays = 90,
    transitionToDeepArchiveDays = 365,
  } = rules;

  // Calculate average age of objects that should move to each class
  const classAges = {
    STANDARD_IA: [],
    GLACIER_IR: [],
    GLACIER: [],
    DEEP_ARCHIVE: [],
  };

  for (const obj of objectsWithRecommendations) {
    if (classAges[obj.recommendedClass]) {
      classAges[obj.recommendedClass].push(obj.ageInDays);
    }
  }

  const lifecycleRecommendation = {
    bucketName,
    recommendation: 'Implement lifecycle policies for automatic cost optimization',
    suggestedRules: [
      {
        id: 'auto-transition-to-ia',
        status: 'Recommended',
        description: 'Move infrequently accessed objects to STANDARD_IA',
        transitions: [
          {
            days: transitionToIADays,
            storageClass: 'STANDARD_IA',
          },
        ],
        impact: {
          affectedObjects: classAges.STANDARD_IA.length,
          avgAgeOfObjects: classAges.STANDARD_IA.length > 0 
            ? Math.round(classAges.STANDARD_IA.reduce((a, b) => a + b, 0) / classAges.STANDARD_IA.length)
            : 0,
        },
      },
      {
        id: 'auto-transition-to-glacier',
        status: 'Recommended',
        description: 'Archive rarely accessed objects to GLACIER_IR',
        transitions: [
          {
            days: transitionToGlacierDays,
            storageClass: 'GLACIER_IR',
          },
        ],
        impact: {
          affectedObjects: classAges.GLACIER_IR.length,
          avgAgeOfObjects: classAges.GLACIER_IR.length > 0
            ? Math.round(classAges.GLACIER_IR.reduce((a, b) => a + b, 0) / classAges.GLACIER_IR.length)
            : 0,
        },
      },
      {
        id: 'auto-transition-to-deep-archive',
        status: 'Recommended',
        description: 'Move long-term archive data to DEEP_ARCHIVE',
        transitions: [
          {
            days: transitionToDeepArchiveDays,
            storageClass: 'DEEP_ARCHIVE',
          },
        ],
        impact: {
          affectedObjects: classAges.DEEP_ARCHIVE.length,
          avgAgeOfObjects: classAges.DEEP_ARCHIVE.length > 0
            ? Math.round(classAges.DEEP_ARCHIVE.reduce((a, b) => a + b, 0) / classAges.DEEP_ARCHIVE.length)
            : 0,
        },
      },
    ],
    implementationNote: 'These lifecycle rules will automatically transition objects to optimize costs without manual intervention.',
  };

  // Filter out rules with no impact
  lifecycleRecommendation.suggestedRules = lifecycleRecommendation.suggestedRules.filter(
    rule => rule.impact.affectedObjects > 0
  );

  return lifecycleRecommendation;
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
    byCurrentClass: {},
  };

  for (const obj of objectsToRightSize) {
    summary.totalPotentialMonthlySavings += obj.potentialSavings;
    
    const targetClass = obj.recommendedClass;
    const currentClass = obj.currentClass;
    
    // Group by recommended storage class
    if (!summary.byStorageClass[targetClass]) {
      summary.byStorageClass[targetClass] = {
        objectCount: 0,
        monthlySavings: 0,
        annualSavings: 0,
      };
    }
    
    summary.byStorageClass[targetClass].objectCount++;
    summary.byStorageClass[targetClass].monthlySavings += obj.potentialSavings;
    summary.byStorageClass[targetClass].annualSavings = summary.byStorageClass[targetClass].monthlySavings * 12;

    // Group by current storage class
    if (!summary.byCurrentClass[currentClass]) {
      summary.byCurrentClass[currentClass] = {
        objectCount: 0,
        monthlySavings: 0,
        annualSavings: 0,
      };
    }
    
    summary.byCurrentClass[currentClass].objectCount++;
    summary.byCurrentClass[currentClass].monthlySavings += obj.potentialSavings;
    summary.byCurrentClass[currentClass].annualSavings = summary.byCurrentClass[currentClass].monthlySavings * 12;
  }

  summary.totalPotentialAnnualSavings = summary.totalPotentialMonthlySavings * 12;

  return summary;
}

/**
 * Format savings report as text
 * @param {object} recommendation - Savings recommendation object
 * @returns {string} Formatted text report
 */
export function formatSavingsReport(recommendation) {
  let report = '\n';
  report += '╔════════════════════════════════════════════════════════════════════════════╗\n';
  report += '║                        COST SAVINGS RECOMMENDATION                         ║\n';
  report += '╚════════════════════════════════════════════════════════════════════════════╝\n';
  report += `\nBucket: ${recommendation.bucketName}\n`;
  report += `Generated: ${new Date(recommendation.generatedAt).toLocaleString()}\n`;
  report += '\n';
  report += '─────────────────────────────────────────────────────────────────────────────\n';
  report += '                              SAVINGS SUMMARY                                 \n';
  report += '─────────────────────────────────────────────────────────────────────────────\n';
  report += `Total Objects Analyzed:    ${recommendation.totalObjectsAnalyzed.toLocaleString()}\n`;
  report += `Eligible for Optimization: ${recommendation.eligibleObjects.toLocaleString()}\n`;
  report += `Data Size:                 ${recommendation.summary.totalDataSizeGB} GB\n`;
  report += '\n';
  report += `💰 Estimated Monthly Savings:  $${recommendation.summary.totalMonthlySavings}\n`;
  report += `💰 Estimated Annual Savings:   $${recommendation.summary.totalAnnualSavings}\n`;
  report += '\n';

  if (recommendation.recommendations.length > 0) {
    report += '─────────────────────────────────────────────────────────────────────────────\n';
    report += '                           OPTIMIZATION OPPORTUNITIES                        \n';
    report += '─────────────────────────────────────────────────────────────────────────────\n';
    
    for (const rec of recommendation.recommendations) {
      report += `\n${rec.fromClass} → ${rec.toClass}\n`;
      report += `  • Objects: ${rec.objectCount.toLocaleString()} (${rec.percentageOfBucket}% of bucket)\n`;
      report += `  • Data Size: ${rec.totalSizeGB} GB\n`;
      report += `  • Monthly Savings: $${rec.monthlySavings}\n`;
      report += `  • Annual Savings: $${rec.annualSavings}\n`;
      
      if (rec.sampleObjects && rec.sampleObjects.length > 0) {
        report += `  • Sample Objects:\n`;
        rec.sampleObjects.forEach((obj, idx) => {
          report += `    ${idx + 1}. ${obj.key.substring(0, 60)}${obj.key.length > 60 ? '...' : ''}\n`;
          report += `       Age: ${obj.ageInDays} days, Savings: $${obj.monthlySavings.toFixed(2)}/mo\n`;
        });
      }
    }
  }

  report += '\n';
  report += '─────────────────────────────────────────────────────────────────────────────\n';
  report += '                            NEXT STEPS                                        \n';
  report += '─────────────────────────────────────────────────────────────────────────────\n';
  report += '1. Review the recommendations above\n';
  report += '2. Implement lifecycle policies for automatic optimization\n';
  report += '3. Monitor cost savings in AWS Cost Explorer\n';
  report += '4. Adjust policies based on access patterns\n';
  report += '\n';

  return report;
}

export default {
  generateSavingsRecommendations,
  generateLifecyclePolicyRecommendation,
  calculateTotalSavings,
  formatSavingsReport,
};


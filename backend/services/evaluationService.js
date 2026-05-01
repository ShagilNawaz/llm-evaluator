import Evaluation from '../models/Evaluation.js';

const DIMENSION_KEYS = [
  'instructionFollowing',
  'quality',
  'accuracy',
  'naturalness',
  'completeness',
  'helpfulness',
];

const DIMENSION_LABELS = {
  instructionFollowing: 'Instruction Following',
  quality:              'Quality',
  accuracy:             'Accuracy',
  naturalness:          'Naturalness',
  completeness:         'Completeness',
  helpfulness:          'Helpfulness',
};

const DIMENSION_SHORT = {
  instructionFollowing: 'Instr.',
  quality:              'Quality',
  accuracy:             'Accuracy',
  naturalness:          'Natural.',
  completeness:         'Complete.',
  helpfulness:          'Helpful.',
};

/**
 * Save a new evaluation to MongoDB.
 */
export async function createEvaluation(data) {
  const evaluation = new Evaluation(data);
  return evaluation.save();
}

/**
 * Paginated fetch of all evaluations, newest first.
 */
export async function getEvaluations({ page = 1, limit = 10 } = {}) {
  const skip = (page - 1) * limit;
  const [evaluations, total] = await Promise.all([
    Evaluation.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Evaluation.countDocuments(),
  ]);

  return {
    evaluations,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Fetch all evaluations (for export, no pagination).
 */
export async function getAllEvaluations() {
  return Evaluation.find().sort({ createdAt: -1 }).lean();
}

/**
 * Compute analytics aggregates:
 * - Average score per dimension for A and B
 * - Overall averages
 * - Verdict distribution
 */
export async function getAnalytics() {
  const totalEvaluations = await Evaluation.countDocuments();

  if (totalEvaluations === 0) {
    return {
      totalEvaluations: 0,
      overallAvgA: 0,
      overallAvgB: 0,
      dimensionAverages: [],
      verdictDistribution: {},
    };
  }

  // Build $group stage dynamically for all 6 dimensions
  const groupStage = { _id: null };
  DIMENSION_KEYS.forEach(key => {
    groupStage[`avgA_${key}`] = { $avg: `$scoresA.${key}` };
    groupStage[`avgB_${key}`] = { $avg: `$scoresB.${key}` };
  });

  const [avgResult, verdictResult] = await Promise.all([
    Evaluation.aggregate([{ $group: groupStage }]),
    Evaluation.aggregate([
      { $group: { _id: '$verdict', count: { $sum: 1 } } },
    ]),
  ]);

  const agg = avgResult[0] || {};

  // Shape dimension averages
  const dimensionAverages = DIMENSION_KEYS.map(key => ({
    dimension:  DIMENSION_LABELS[key],
    shortLabel: DIMENSION_SHORT[key],
    avgA: agg[`avgA_${key}`] || 0,
    avgB: agg[`avgB_${key}`] || 0,
  }));

  // Overall averages across all dimensions
  const allAvgA = dimensionAverages.map(d => d.avgA);
  const allAvgB = dimensionAverages.map(d => d.avgB);
  const overallAvgA = allAvgA.reduce((a, b) => a + b, 0) / allAvgA.length;
  const overallAvgB = allAvgB.reduce((a, b) => a + b, 0) / allAvgB.length;

  // Verdict distribution map
  const verdictDistribution = {};
  verdictResult.forEach(({ _id, count }) => {
    if (_id) verdictDistribution[_id] = count;
  });

  return {
    totalEvaluations,
    overallAvgA,
    overallAvgB,
    dimensionAverages,
    verdictDistribution,
  };
}

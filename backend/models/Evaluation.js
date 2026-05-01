import mongoose from 'mongoose';

const ScoresSchema = new mongoose.Schema(
  {
    instructionFollowing: { type: Number, min: 1, max: 5, required: true },
    quality:              { type: Number, min: 1, max: 5, required: true },
    accuracy:             { type: Number, min: 1, max: 5, required: true },
    naturalness:          { type: Number, min: 1, max: 5, required: true },
    completeness:         { type: Number, min: 1, max: 5, required: true },
    helpfulness:          { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const EvaluationSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      trim: true,
      minlength: [10, 'Prompt must be at least 10 characters'],
      maxlength: [5000, 'Prompt must be under 5000 characters'],
    },
    responseA: {
      type: String,
      required: [true, 'Response A is required'],
    },
    responseB: {
      type: String,
      required: [true, 'Response B is required'],
    },
    scoresA: {
      type: ScoresSchema,
      required: [true, 'Scores for Response A are required'],
    },
    scoresB: {
      type: ScoresSchema,
      required: [true, 'Scores for Response B are required'],
    },
    verdict: {
      type: String,
      required: [true, 'Verdict is required'],
      enum: {
        values: ['response_a_better', 'response_b_better', 'tie', 'both_good', 'both_bad'],
        message: 'Invalid verdict value',
      },
    },
    justification: {
      type: String,
      required: [true, 'Justification is required'],
      trim: true,
      minlength: [20, 'Justification must be at least 20 characters'],
    },
    evaluatorName: {
      type: String,
      required: [true, 'Evaluator name is required'],
      trim: true,
      maxlength: [100, 'Evaluator name too long'],
    },
  },
  {
    timestamps: true,        // adds createdAt, updatedAt
    versionKey: false,
  }
);

// Indexes for common queries
EvaluationSchema.index({ createdAt: -1 });
EvaluationSchema.index({ verdict: 1 });
EvaluationSchema.index({ evaluatorName: 1 });

export default mongoose.model('Evaluation', EvaluationSchema);

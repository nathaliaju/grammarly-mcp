import type { GrammarlyScores } from "../../src/grammarlyOptimizer";

type GrammarlyScoresFixture = GrammarlyScores & { notes: string };

/**
 * Mock Grammarly score responses for different scenarios.
 */

/**
 * Baseline scores - typical starting point.
 */
export const baselineScores: GrammarlyScoresFixture = {
	aiDetectionPercent: 45,
	plagiarismPercent: 12,
	notes: "Initial baseline scores from Grammarly.",
};

/**
 * Scores after successful optimization.
 */
export const optimizedScores: GrammarlyScoresFixture = {
	aiDetectionPercent: 8,
	plagiarismPercent: 2,
	notes: "Scores improved after optimization pass.",
};

/**
 * Scores that meet thresholds.
 */
export const passingScores: GrammarlyScoresFixture = {
	aiDetectionPercent: 5,
	plagiarismPercent: 3,
	notes: "Text passes all thresholds.",
};

/**
 * Scores with null AI detection (Premium feature unavailable).
 */
export const nullAiScores: GrammarlyScoresFixture = {
	aiDetectionPercent: null,
	plagiarismPercent: 8,
	notes: "AI detection not available - Grammarly Premium required.",
};

/**
 * Scores with null plagiarism (feature unavailable).
 */
export const nullPlagiarismScores: GrammarlyScoresFixture = {
	aiDetectionPercent: 25,
	plagiarismPercent: null,
	notes: "Plagiarism check not available.",
};

/**
 * Both scores null (no Premium features).
 */
export const allNullScores: GrammarlyScoresFixture = {
	aiDetectionPercent: null,
	plagiarismPercent: null,
	notes: "Neither AI detection nor plagiarism check available.",
};

/**
 * Boundary scores at exact thresholds.
 */
export const boundaryScores: GrammarlyScoresFixture = {
	aiDetectionPercent: 10,
	plagiarismPercent: 5,
	notes: "Scores at exact threshold boundaries.",
};

/**
 * Scores just above thresholds.
 */
export const aboveThresholdScores: GrammarlyScoresFixture = {
	aiDetectionPercent: 11,
	plagiarismPercent: 6,
	notes: "Scores just above thresholds - optimization needed.",
};

/**
 * High AI detection score.
 */
export const highAiScores: GrammarlyScoresFixture = {
	aiDetectionPercent: 85,
	plagiarismPercent: 0,
	notes: "Very high AI detection - significant rewriting needed.",
};

/**
 * High plagiarism score.
 */
export const highPlagiarismScores: GrammarlyScoresFixture = {
	aiDetectionPercent: 5,
	plagiarismPercent: 65,
	notes: "High plagiarism detected - substantial changes required.",
};

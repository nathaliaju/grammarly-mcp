import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	type GrammarlyScores,
	thresholdsMet,
	withRetry,
} from "../../src/grammarlyOptimizer";

describe("thresholdsMet", () => {
	describe("both scores available", () => {
		it.each<[string, GrammarlyScores, number, number, boolean]>([
			["both below thresholds", { aiDetectionPercent: 5, plagiarismPercent: 2 }, 10, 5, true],
			["both at thresholds", { aiDetectionPercent: 10, plagiarismPercent: 5 }, 10, 5, true],
			["ai above threshold", { aiDetectionPercent: 15, plagiarismPercent: 2 }, 10, 5, false],
			["plagiarism above threshold", { aiDetectionPercent: 5, plagiarismPercent: 10 }, 10, 5, false],
			["both above thresholds", { aiDetectionPercent: 15, plagiarismPercent: 10 }, 10, 5, false],
			["zero scores", { aiDetectionPercent: 0, plagiarismPercent: 0 }, 10, 5, true],
			["max thresholds", { aiDetectionPercent: 100, plagiarismPercent: 100 }, 100, 100, true],
		])("%s", (_, scores, maxAi, maxPlag, expected) => {
			expect(thresholdsMet(scores, maxAi, maxPlag)).toBe(expected);
		});
	});

	describe("null scores", () => {
		it("treats null AI score as passing", () => {
			const scores: GrammarlyScores = { aiDetectionPercent: null, plagiarismPercent: 2 };
			expect(thresholdsMet(scores, 10, 5)).toBe(true);
		});

		it("treats null plagiarism score as passing", () => {
			const scores: GrammarlyScores = { aiDetectionPercent: 5, plagiarismPercent: null };
			expect(thresholdsMet(scores, 10, 5)).toBe(true);
		});

		it("returns false when both scores are null", () => {
			const scores: GrammarlyScores = { aiDetectionPercent: null, plagiarismPercent: null };
			expect(thresholdsMet(scores, 10, 5)).toBe(false);
		});

		it("still checks available score when other is null", () => {
			const scoresAiFailing: GrammarlyScores = { aiDetectionPercent: 15, plagiarismPercent: null };
			expect(thresholdsMet(scoresAiFailing, 10, 5)).toBe(false);

			const scoresPlagFailing: GrammarlyScores = { aiDetectionPercent: null, plagiarismPercent: 10 };
			expect(thresholdsMet(scoresPlagFailing, 10, 5)).toBe(false);
		});
	});
});

describe("withRetry", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns immediately on success", async () => {
		const fn = vi.fn().mockResolvedValue("success");

		const resultPromise = withRetry(fn, { maxRetries: 3, backoffMs: 100 });
		const result = await resultPromise;

		expect(result).toBe("success");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("retries on failure then succeeds", async () => {
		const fn = vi.fn()
			.mockRejectedValueOnce(new Error("fail"))
			.mockResolvedValue("success");

		const resultPromise = withRetry(fn, { maxRetries: 3, backoffMs: 100 });

		// Advance past the first backoff delay
		await vi.advanceTimersByTimeAsync(100);

		const result = await resultPromise;
		expect(result).toBe("success");
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("uses exponential backoff", async () => {
		const fn = vi.fn()
			.mockRejectedValueOnce(new Error("fail 1"))
			.mockRejectedValueOnce(new Error("fail 2"))
			.mockResolvedValue("success");

		const resultPromise = withRetry(fn, { maxRetries: 3, backoffMs: 100 });

		// First retry: 100ms
		await vi.advanceTimersByTimeAsync(100);
		expect(fn).toHaveBeenCalledTimes(2);

		// Second retry: 200ms (100 * 2^1)
		await vi.advanceTimersByTimeAsync(200);
		expect(fn).toHaveBeenCalledTimes(3);

		const result = await resultPromise;
		expect(result).toBe("success");
	});

	it("throws after max retries exhausted", async () => {
		const error = new Error("persistent failure");
		const fn = vi.fn().mockImplementation(() => Promise.reject(error));

		// We need to ensure the promise rejection is handled before timers advance
		let caughtError: Error | undefined;

		const resultPromise = withRetry(fn, { maxRetries: 2, backoffMs: 100 })
			.catch((e: Error) => {
				caughtError = e;
			});

		// Advance all timers to complete all retries
		await vi.runAllTimersAsync();

		// Wait for the catch handler to execute
		await resultPromise;

		expect(caughtError).toBeDefined();
		expect(caughtError?.message).toBe("persistent failure");
		expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
	});

	it("preserves error type from non-Error throws", async () => {
		const fn = vi.fn().mockRejectedValue("string error");

		const resultPromise = withRetry(fn, { maxRetries: 0, backoffMs: 100 });

		await expect(resultPromise).rejects.toBe("string error");
	});

	it("works with zero retries", async () => {
		const fn = vi.fn().mockRejectedValue(new Error("fail"));

		const resultPromise = withRetry(fn, { maxRetries: 0, backoffMs: 100 });

		await expect(resultPromise).rejects.toThrow("fail");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("accepts optional label for debugging", async () => {
		const fn = vi.fn()
			.mockRejectedValueOnce(new Error("fail"))
			.mockResolvedValue("success");

		const resultPromise = withRetry(fn, {
			maxRetries: 1,
			backoffMs: 100,
			label: "testOperation",
		});

		await vi.advanceTimersByTimeAsync(100);
		const result = await resultPromise;

		expect(result).toBe("success");
	});
});

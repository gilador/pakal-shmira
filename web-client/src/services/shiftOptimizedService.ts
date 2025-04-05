import { OptimizeShiftSolution } from "../models";

export const shiftOptimizedService = {
  async optimizeShift(
    constraints: boolean[][][]
  ): Promise<OptimizeShiftSolution> {
    try {
      const response = await fetch("http://localhost:8190/api/optimizeShift", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ constraints }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error in shiftOptimizedService:", error);
      throw error;
    }
  },
};

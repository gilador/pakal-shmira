/**
 * Shift Hour Helper Service - Minimum shift calculation
 * Provides modular, stateless functions for shift scheduling calculations
 */

// ==================== PUBLIC TYPES ====================

export interface ShiftCalculationInput {
  startTime: string;
  endTime: string;
  postCount: number;
  staffCount: number;
  minimumTotalRestTime?: number;
}

export interface ShiftCalculationResult {
  shiftStartTimes: string[];
  minimumShiftsNeeded: number;
  shiftDuration: number;
  isFeasible: boolean;
  message?: string;
}

export interface FeasibilityResult {
  isFeasible: boolean;
  message?: string;
}

// ==================== PUBLIC MAIN FUNCTIONS ====================

/**
 * Calculates minimum shifts needed using iterative approach
 */
export function calculateMinimumShifts(
  input: ShiftCalculationInput
): ShiftCalculationResult {
  try {
    const operationTime = calculateOperationTime(
      input.startTime,
      input.endTime
    );
    const minimumTotalRestTime = input.minimumTotalRestTime || 0;

    // Run all feasibility checks
    const basicCheck = validateBasicFeasibility(
      input.staffCount,
      input.postCount
    );
    if (!basicCheck.isFeasible) {
      return {
        shiftStartTimes: [],
        minimumShiftsNeeded: 0,
        shiftDuration: 0,
        isFeasible: false,
        message: basicCheck.message,
      };
    }

    const restCheck = validateRestFeasibility(
      operationTime,
      minimumTotalRestTime
    );
    if (!restCheck.isFeasible) {
      return {
        shiftStartTimes: [],
        minimumShiftsNeeded: 0,
        shiftDuration: 0,
        isFeasible: false,
        message: restCheck.message,
      };
    }

    const capacityCheck = validateWorkCapacity(
      input.staffCount,
      operationTime,
      input.postCount,
      minimumTotalRestTime
    );
    if (!capacityCheck.isFeasible) {
      return {
        shiftStartTimes: [],
        minimumShiftsNeeded: 0,
        shiftDuration: 0,
        isFeasible: false,
        message: capacityCheck.message,
      };
    }

    // Find minimum shifts needed
    const minimumShiftsNeeded = findMinimumShifts(
      operationTime,
      input.staffCount,
      input.postCount,
      minimumTotalRestTime
    );

    if (minimumShiftsNeeded === 0) {
      return {
        shiftStartTimes: [],
        minimumShiftsNeeded: 0,
        shiftDuration: 0,
        isFeasible: false,
        message: "Could not find feasible shift configuration",
      };
    }

    // Generate shift times
    const shiftDuration = operationTime / minimumShiftsNeeded;
    const shiftStartTimes = generateShiftTimes(
      input.startTime,
      minimumShiftsNeeded,
      operationTime
    );

    return {
      shiftStartTimes,
      minimumShiftsNeeded,
      shiftDuration,
      isFeasible: true,
      message: `${minimumShiftsNeeded} shifts needed with ${shiftDuration.toFixed(
        1
      )}h duration each`,
    };
  } catch (error) {
    return {
      shiftStartTimes: [],
      minimumShiftsNeeded: 0,
      shiftDuration: 0,
      isFeasible: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// ==================== PUBLIC HELPER FUNCTIONS ====================

/**
 * Simple stateless helper that returns just the shift start times
 */
export function getShiftTimes(
  startTime: string,
  endTime: string,
  postCount: number,
  staffCount: number,
  minimumTotalRestTime: number = 0
): string[] {
  const result = calculateMinimumShifts({
    startTime,
    endTime,
    postCount,
    staffCount,
    minimumTotalRestTime,
  });
  return result.isFeasible ? result.shiftStartTimes : [];
}

/**
 * Stateless helper to check if a shift configuration is feasible
 */
export function isShiftConfigurationFeasible(
  startTime: string,
  endTime: string,
  postCount: number,
  staffCount: number,
  minimumTotalRestTime: number = 0
): boolean {
  try {
    const operationTime = calculateOperationTime(startTime, endTime);

    const basicCheck = validateBasicFeasibility(staffCount, postCount);
    if (!basicCheck.isFeasible) return false;

    const restCheck = validateRestFeasibility(
      operationTime,
      minimumTotalRestTime
    );
    if (!restCheck.isFeasible) return false;

    const capacityCheck = validateWorkCapacity(
      staffCount,
      operationTime,
      postCount,
      minimumTotalRestTime
    );
    if (!capacityCheck.isFeasible) return false;

    const minimumShifts = findMinimumShifts(
      operationTime,
      staffCount,
      postCount,
      minimumTotalRestTime
    );
    return minimumShifts > 0;
  } catch {
    return false;
  }
}

/**
 * Stateless helper to get minimum staff needed for a configuration
 */
export function getMinimumStaffNeeded(
  startTime: string,
  endTime: string,
  postCount: number,
  minimumTotalRestTime: number = 0
): number {
  try {
    const operationTime = calculateOperationTime(startTime, endTime);
    const maxWorkTimePerPerson = operationTime - minimumTotalRestTime;

    if (maxWorkTimePerPerson <= 0) return Infinity;

    const totalWorkNeeded = operationTime * postCount;
    return Math.max(
      postCount,
      Math.ceil(totalWorkNeeded / maxWorkTimePerPerson)
    );
  } catch {
    return Infinity;
  }
}

/**
 * Stateless helper to get shift duration for minimum shifts
 */
export function getOptimalShiftDuration(
  startTime: string,
  endTime: string,
  postCount: number,
  staffCount: number,
  minimumTotalRestTime: number = 0
): number {
  const result = calculateMinimumShifts({
    startTime,
    endTime,
    postCount,
    staffCount,
    minimumTotalRestTime,
  });
  return result.isFeasible ? result.shiftDuration : 0;
}

// ==================== PRIVATE IMPLEMENTATION ====================

// Time utilities
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(
      `Invalid time format: ${timeStr}. Expected format: "HH:MM"`
    );
  }
  return hours + minutes / 60;
}

function formatTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function calculateOperationTime(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (end <= start) {
    throw new Error("End time must be after start time");
  }
  return end - start;
}

// Validation functions
function validateBasicFeasibility(
  staffCount: number,
  postCount: number
): FeasibilityResult {
  if (staffCount < postCount) {
    return {
      isFeasible: false,
      message: `Need at least ${postCount} staff for ${postCount} posts, but only have ${staffCount}`,
    };
  }
  return { isFeasible: true };
}

function validateRestFeasibility(
  operationTime: number,
  minimumTotalRestTime: number
): FeasibilityResult {
  const maxWorkTimePerPerson = operationTime - minimumTotalRestTime;
  if (maxWorkTimePerPerson <= 0) {
    return {
      isFeasible: false,
      message: "Minimum rest time exceeds operation time",
    };
  }
  return { isFeasible: true };
}

function validateWorkCapacity(
  staffCount: number,
  operationTime: number,
  postCount: number,
  minimumTotalRestTime: number
): FeasibilityResult {
  const maxWorkTimePerPerson = operationTime - minimumTotalRestTime;
  const totalWorkCapacity = staffCount * maxWorkTimePerPerson;
  const totalWorkNeeded = operationTime * postCount;

  if (totalWorkCapacity < totalWorkNeeded) {
    return {
      isFeasible: false,
      message: `Need ${totalWorkNeeded} work-hours but only have ${totalWorkCapacity} available`,
    };
  }
  return { isFeasible: true };
}

// Core calculation functions
function findMinimumShifts(
  operationTime: number,
  staffCount: number,
  postCount: number,
  minimumTotalRestTime: number
): number {
  const maxWorkTimePerPerson = operationTime - minimumTotalRestTime;

  for (let N = 1; N <= operationTime; N++) {
    const shiftDuration = operationTime / N;
    const maxShiftsPerPerson = Math.floor(maxWorkTimePerPerson / shiftDuration);
    const availableAssignments = staffCount * maxShiftsPerPerson;
    const requiredAssignments = N * postCount;

    if (availableAssignments >= requiredAssignments) {
      return N;
    }
  }
  return 0;
}

function generateShiftTimes(
  startTime: string,
  shiftsCount: number,
  operationTime: number
): string[] {
  const shiftStartTimes: string[] = [];
  const startHour = parseTime(startTime);
  const shiftInterval = operationTime / shiftsCount;

  for (let i = 0; i < shiftsCount; i++) {
    const shiftTime = startHour + i * shiftInterval;
    shiftStartTimes.push(formatTime(shiftTime));
  }

  return shiftStartTimes;
}

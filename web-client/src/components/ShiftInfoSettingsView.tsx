import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { IconX } from "@tabler/icons-react";
import { getOptimalShiftDuration } from "../service/shiftHourHelperService";
import { DEFAULT_STAFF_COUNT } from "../constants/shiftManagerConstants";
import { UniqueString } from "../models/index";
import { calculateFeasibleIntensityRange } from "../service/intensityRangeHelper";
import { shiftState } from "../stores/shiftStore";

export interface ShiftInfoSettingsViewProps {
  restTime: number;
  startHour: string;
  endHour: string;
  className?: string;
  onStartTimeChange?: (startTime: string) => void;
  onEndTimeChange?: (endTime: string) => void;
  onIntensityChange?: (intensity: number) => void;
  posts?: UniqueString[];
  staffCount?: number;
  onClose?: () => void;
}

export function ShiftInfoSettingsView({
  restTime,
  startHour,
  endHour,
  className = "",
  onStartTimeChange,
  onEndTimeChange,
  onIntensityChange,
  posts = [],
  staffCount = DEFAULT_STAFF_COUNT,
  onClose,
}: ShiftInfoSettingsViewProps) {
  const [shiftData, setShiftData] = useRecoilState(shiftState);

  // ALWAYS use global state values - never fall back to props
  const localStartTime = shiftData.startTime || startHour;
  const localEndTime = shiftData.endTime || endHour;
  const intensity = shiftData.restTime ?? restTime;

  // Debug current state values
  console.log("🔍 [ShiftInfoSettingsView] Current state values:", {
    localStartTime,
    localEndTime,
    intensity,
    "shiftData.startTime": shiftData.startTime,
    "shiftData.endTime": shiftData.endTime,
    "shiftData.restTime": shiftData.restTime,
    "shiftData.hours": shiftData.hours?.map((h) => h.value) || [],
  });
  const [intensityOptions, setIntensityOptions] = useState([1, 2, 4, 6, 8]);
  const [intensityDurationMap, setIntensityDurationMap] = useState<{
    [intensity: number]: number;
  }>({});

  // Calculate feasible intensity range based on current parameters
  useEffect(() => {
    console.log(
      "🔄 [ShiftInfoSettingsView] Recalculating feasible intensity range for:",
      { localStartTime, localEndTime, postsCount: posts.length, staffCount }
    );
    const result = calculateFeasibleIntensityRange(
      localStartTime,
      localEndTime,
      posts.length,
      staffCount
    );

    setIntensityOptions(result.feasibleIntensities);
    setIntensityDurationMap(result.intensityDurationMap);

    console.log("🎯 [ShiftInfoSettingsView] Intensity options updated:", {
      "current intensity": intensity,
      "new options": result.feasibleIntensities,
      "current options": intensityOptions,
      "intensity in options": result.feasibleIntensities.includes(intensity),
      "slider will show index": getSliderIndex(intensity),
    });

    // NEVER override user's intensity - just log what we found
    if (!result.feasibleIntensities.includes(intensity)) {
      console.log(
        `⚠️ [ShiftInfoSettingsView] Current intensity ${intensity} not in feasible list BUT keeping user's choice`,
        {
          "current intensity": intensity,
          "feasible intensities": result.feasibleIntensities,
          "user's choice preserved": true,
        }
      );
    } else {
      console.log(
        "✅ [ShiftInfoSettingsView] Current intensity is in feasible list:",
        intensity
      );
    }
  }, [localStartTime, localEndTime, posts.length, staffCount, intensity]);

  // Map intensity value to slider index and vice versa
  // Inverted mapping: left (index 0) = highest intensity, right (max index) = lowest intensity
  const getSliderIndex = (intensity: number) => {
    const index = intensityOptions.indexOf(intensity);
    if (index === -1) {
      // If current intensity is not in options, find the closest match
      const closestIndex = intensityOptions.reduce((closest, option, i) => {
        const currentDiff = Math.abs(option - intensity);
        const closestDiff = Math.abs(intensityOptions[closest] - intensity);
        return currentDiff < closestDiff ? i : closest;
      }, 0);

      console.log(
        `🎯 [ShiftInfoSettingsView] Intensity ${intensity} not in options [${intensityOptions.join(
          ", "
        )}], using closest match at index ${closestIndex} (${
          intensityOptions[closestIndex]
        })`
      );
      // Invert the index: if we found index 0, return max index, etc.
      return intensityOptions.length - 1 - closestIndex;
    }
    // Invert the index: if intensity is at index 0, return max index, etc.
    return intensityOptions.length - 1 - index;
  };

  const getIntensityFromIndex = (index: number) => {
    // Invert the index: if slider is at index 0, get the last (highest) intensity
    const invertedIndex = intensityOptions.length - 1 - index;
    return intensityOptions[invertedIndex];
  };

  // Calculate shift starting times for logging
  const calculateShiftStartingTimes = (
    startTime: string,
    endTime: string,
    shiftDuration: number
  ) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const operationDurationMinutes = endTotalMinutes - startTotalMinutes;

    if (operationDurationMinutes <= 0 || shiftDuration <= 0) {
      return [];
    }

    const shiftDurationMinutes = shiftDuration * 60;
    const shiftStartTimes: string[] = [];

    let currentStartMinutes = startTotalMinutes;

    while (currentStartMinutes < endTotalMinutes) {
      const hours = Math.floor(currentStartMinutes / 60);
      const minutes = currentStartMinutes % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      shiftStartTimes.push(timeString);

      currentStartMinutes += shiftDurationMinutes;
    }

    return shiftStartTimes;
  };

  // Calculate optimal shift duration using sophisticated calculation that considers intensity
  const calculateOptimalShiftDuration = (
    start: string,
    end: string,
    intensity: number,
    postCount: number,
    workers: number
  ) => {
    console.log(
      "🔍 [ShiftInfoSettingsView] calculateOptimalShiftDuration called with:",
      {
        start,
        end,
        intensity,
        postCount,
        workers,
      }
    );

    // First, try to use cached duration from intensityDurationMap
    if (intensityDurationMap[intensity] !== undefined) {
      console.log(
        "🚀 [ShiftInfoSettingsView] Using cached duration:",
        intensityDurationMap[intensity]
      );
      return intensityDurationMap[intensity];
    }

    if (postCount === 0 || workers === 0) {
      console.log(
        "⚠️ [ShiftInfoSettingsView] Using fallback calculation - postCount or workers is 0"
      );
      // Fallback to simple calculation if no data available
      const [startHours, startMinutes] = start.split(":").map(Number);
      const [endHours, endMinutes] = end.split(":").map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      let durationMinutes = endTotalMinutes - startTotalMinutes;

      // Handle overnight shifts
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }

      const fallbackDuration = Math.round((durationMinutes / 60) * 10) / 10;
      console.log(
        "📊 [ShiftInfoSettingsView] Fallback duration calculated:",
        fallbackDuration
      );
      return fallbackDuration;
    }

    console.log(
      "⚠️ [ShiftInfoSettingsView] Cache miss, falling back to live calculation"
    );

    const optimizedDuration = getOptimalShiftDuration(
      start,
      end,
      postCount,
      workers,
      intensity
    );
    console.log(
      "🎯 [ShiftInfoSettingsView] Optimized duration from service:",
      optimizedDuration
    );

    if (optimizedDuration === 0) {
      console.warn(
        "❌ [ShiftInfoSettingsView] Optimized duration is 0! Falling back to simple calculation"
      );
      // If optimized calculation fails, use fallback
      const [startHours, startMinutes] = start.split(":").map(Number);
      const [endHours, endMinutes] = end.split(":").map(Number);

      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      let durationMinutes = endTotalMinutes - startTotalMinutes;

      // Handle overnight shifts
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60;
      }

      const fallbackDuration = Math.round((durationMinutes / 60) * 10) / 10;
      console.log(
        "📊 [ShiftInfoSettingsView] Using fallback duration due to 0 result:",
        fallbackDuration
      );
      return fallbackDuration;
    }

    return optimizedDuration;
  };

  // Always calculate current values for display
  const shiftDuration = calculateOptimalShiftDuration(
    localStartTime,
    localEndTime,
    intensity,
    posts.length,
    staffCount
  );

  // Calculate shift starting times for display
  const shiftStartTimes = calculateShiftStartingTimes(
    localStartTime,
    localEndTime,
    shiftDuration
  );

  // Log final calculated hours after any parameter change
  console.log(
    "🎯 [ShiftInfoSettingsView] ===== FINAL CALCULATION RESULT ====="
  );
  console.log("📊 [ShiftInfoSettingsView] Input Parameters:", {
    startTime: localStartTime,
    endTime: localEndTime,
    intensity: intensity,
    posts: posts.length,
    staff: staffCount,
  });
  console.log(
    `⏰ [ShiftInfoSettingsView] FINAL HOURS: ${shiftDuration.toFixed(2)}h`
  );
  console.log(
    `📅 [ShiftInfoSettingsView] SHIFT START TIMES: [${shiftStartTimes.join(
      ", "
    )}]`
  );
  console.log(
    `🔢 [ShiftInfoSettingsView] TOTAL SHIFTS: ${shiftStartTimes.length}`
  );
  console.log(
    "🎯 [ShiftInfoSettingsView] ====================================="
  );

  // Helper to update shift state with new parameters
  const updateShiftStateWithNewHours = (
    newStartTime: string,
    newEndTime: string,
    newIntensity: number
  ) => {
    // Calculate new shift duration and hours
    const newDuration = calculateOptimalShiftDuration(
      newStartTime,
      newEndTime,
      newIntensity,
      posts.length,
      staffCount
    );

    const newShiftStartTimes = calculateShiftStartingTimes(
      newStartTime,
      newEndTime,
      newDuration
    );

    // Update hours in global state
    const newHours: UniqueString[] = newShiftStartTimes.map((time, index) => ({
      id: `shift-${index}-${time}`,
      value: time,
    }));

    setShiftData((prev) => {
      // CRITICAL FIX: Update user constraints to match new hours structure
      const updatedUserShiftData = (prev.userShiftData || []).map(
        (userData) => {
          const updatedConstraints = (prev.posts || []).map((post) => {
            // For each post, ensure we have constraints for all new hours
            return newHours.map((hour, hourIndex) => {
              // Try to preserve existing constraint if it exists, otherwise create new one
              const existingConstraint =
                userData.constraints?.[prev.posts?.indexOf(post) || 0]?.[
                  hourIndex
                ];
              return (
                existingConstraint || {
                  postID: post.id,
                  hourID: hour.id,
                  availability: true, // Default to available
                }
              );
            });
          });

          return {
            ...userData,
            constraints: updatedConstraints,
          };
        }
      );

      console.log(
        "🔄 [ShiftInfoSettingsView] Updated user constraints to match new hours:",
        {
          oldHoursCount: prev.hours?.length || 0,
          newHoursCount: newHours.length,
          usersUpdated: updatedUserShiftData.length,
          sampleConstraints:
            updatedUserShiftData[0]?.constraints?.map((post) => post.length) ||
            [],
          sampleAvailability:
            updatedUserShiftData[0]?.constraints?.[0]?.map(
              (slot) => slot.availability
            ) || [],
          warning:
            "IMPORTANT: User constraints updated - optimization cache should be invalidated",
        }
      );

      // CRITICAL FIX: Clear assignments when hours structure changes
      // This invalidates the optimization cache and forces re-optimization
      const shouldClearAssignments = prev.hours?.length !== newHours.length;
      const clearedAssignments = shouldClearAssignments
        ? (prev.posts || []).map(() => newHours.map(() => null))
        : prev.assignments;

      if (shouldClearAssignments) {
        console.log(
          "🔄 [ShiftInfoSettingsView] Clearing assignments due to hours structure change"
        );
      }

      return {
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime,
        restTime: newIntensity,
        hours: newHours,
        userShiftData: updatedUserShiftData,
        assignments: clearedAssignments,
      };
    });

    return { newDuration, newShiftStartTimes };
  };

  const handleStartTimeChange = (time: string) => {
    console.log(
      `🕐 [ShiftInfoSettingsView] Start time changed: ${localStartTime} → ${time}`
    );

    const { newDuration, newShiftStartTimes } = updateShiftStateWithNewHours(
      time,
      localEndTime,
      intensity
    );

    onStartTimeChange?.(time);

    console.log(
      `⏰ [ShiftInfoSettingsView] Duration after start time change: ${newDuration.toFixed(
        2
      )}h`
    );
    console.log(
      `📅 [ShiftInfoSettingsView] New shift start times: [${newShiftStartTimes.join(
        ", "
      )}]`
    );
  };

  const handleEndTimeChange = (time: string) => {
    console.log(
      `🕕 [ShiftInfoSettingsView] End time changed: ${localEndTime} → ${time}`
    );

    const { newDuration, newShiftStartTimes } = updateShiftStateWithNewHours(
      localStartTime,
      time,
      intensity
    );

    onEndTimeChange?.(time);

    console.log(
      `⏰ [ShiftInfoSettingsView] Duration after end time change: ${newDuration.toFixed(
        2
      )}h`
    );
    console.log(
      `📅 [ShiftInfoSettingsView] New shift start times: [${newShiftStartTimes.join(
        ", "
      )}]`
    );
  };

  const handleIntensityChange = (newIntensity: number) => {
    console.log(
      `🔄 [ShiftInfoSettingsView] Intensity changed: ${intensity} → ${newIntensity}`
    );

    const { newDuration, newShiftStartTimes } = updateShiftStateWithNewHours(
      localStartTime,
      localEndTime,
      newIntensity
    );

    onIntensityChange?.(newIntensity);

    console.log(
      `⏰ [ShiftInfoSettingsView] Duration after intensity change: ${newDuration.toFixed(
        2
      )}h`
    );
    console.log(
      `📅 [ShiftInfoSettingsView] New shift start times: [${newShiftStartTimes.join(
        ", "
      )}]`
    );
  };

  // NEVER initialize from props - always respect existing global state
  useEffect(() => {
    console.log(
      "✅ [ShiftInfoSettingsView] Component mounted with global state:",
      {
        "global startTime": shiftData.startTime,
        "global endTime": shiftData.endTime,
        "global restTime": shiftData.restTime,
        "global hours": shiftData.hours?.map((h) => h.value) || [],
        "props startHour": startHour,
        "props endHour": endHour,
        "props restTime": restTime,
      }
    );
  }, [
    shiftData.startTime,
    shiftData.endTime,
    shiftData.restTime,
    shiftData.hours,
    startHour,
    endHour,
    restTime,
  ]);

  // NEVER override user's intensity - just ensure options are available
  useEffect(() => {
    if (intensityOptions.length === 0) {
      console.log(
        "⚠️ [ShiftInfoSettingsView] No intensity options available, this might cause issues"
      );
    } else {
      console.log(
        "✅ [ShiftInfoSettingsView] Intensity options available:",
        intensityOptions
      );
    }
  }, [intensityOptions]);

  return (
    <div
      className={`w-full h-full pt-2 p-1 rounded-lg flex flex-col bg-white/90 backdrop-blur-md shadow-xl min-h-0 max-w-full overflow-hidden border-2 border-black ${className}`}
    >
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-base font-semibold text-left">Shift Adjustment</h4>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close shift adjustment"
            title="Close shift adjustment"
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <IconX size={16} />
          </button>
        )}
      </div>

      {/* Top row - Range and Information */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start mb-2 flex-shrink-0 min-w-0">
        {/* Shifts Range Section */}
        <div className="flex-1 min-w-[280px] w-full sm:w-auto">
          <div className="border border-gray-300 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-medium text-gray-700 text-left">
                Shift Input
              </div>
              <div className="text-xs font-medium text-primary">
                {(() => {
                  const [startHours, startMinutes] = localStartTime
                    .split(":")
                    .map(Number);
                  const [endHours, endMinutes] = localEndTime
                    .split(":")
                    .map(Number);
                  const startTotalMinutes = startHours * 60 + startMinutes;
                  const endTotalMinutes = endHours * 60 + endMinutes;
                  let durationMinutes = endTotalMinutes - startTotalMinutes;
                  if (durationMinutes <= 0) durationMinutes += 24 * 60; // Handle overnight
                  const hours = Math.round(durationMinutes / 60);
                  return `${hours}hr`;
                })()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center flex-1 min-w-[90px] max-w-[160px]">
                <label className="text-xs text-gray-600 mb-2">Start</label>
                <input
                  type="time"
                  value={localStartTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm"
                />
              </div>
              <div className="flex items-center px-1">
                <span className="text-gray-400 font-medium">→</span>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[90px] max-w-[160px]">
                <label className="text-xs text-gray-600 mb-2">End</label>
                <input
                  type="time"
                  value={localEndTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shift Information Section */}
        <div className="flex-1 min-w-[280px] w-full sm:w-auto">
          <div className="border border-gray-300 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-700 mb-2 text-left">
              Shift Information
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center flex-1 min-w-[100px] max-w-[140px]">
                <label className="text-xs text-gray-600 mb-2">Rest</label>
                <div className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm bg-gray-50">
                  {intensity.toFixed(1)}h
                </div>
              </div>
              <div className="flex items-center px-1">
                <span className="text-gray-400 font-medium">→</span>
              </div>
              <div className="flex flex-col items-center flex-1 min-w-[100px] max-w-[140px]">
                <label className="text-xs text-gray-600 mb-2">Duration</label>
                <div className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm bg-gray-50 text-primary font-medium">
                  {shiftDuration.toFixed(2)}h
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push intensity to bottom */}
      <div className="flex-1"></div>

      {/* Intensity Section - Below the top row */}
      <div className="flex-shrink-0">
        <div className="border border-gray-300 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Intense</span>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={intensityOptions.length - 1}
                step="1"
                value={getSliderIndex(intensity)}
                onChange={(e) => {
                  const newIntensity = getIntensityFromIndex(
                    parseInt(e.target.value)
                  );
                  handleIntensityChange(newIntensity);
                }}
                className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer slider
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:w-3 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-primary
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:border-none"
              />
            </div>
            <span className="text-xs text-gray-500">Relaxed</span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-shrink-0 mt-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <p className="text-xs text-gray-700 text-left">
            <span className="font-semibold">How it works:</span> {posts.length} posts × {staffCount} staff members = {shiftStartTimes.length} shifts with {shiftDuration.toFixed(1)}h duration (rounded to hour/half-hour).
          </p>
        </div>
      </div>
    </div>
  );
}

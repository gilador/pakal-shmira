import { Card, CardContent } from "@/components/elements/card";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { getOptimalShiftDuration } from "../service/shiftHourHelperService";
import { DEFAULT_STAFF_COUNT } from "../constants/shiftManagerConstants";
import { UniqueString } from "../models/index";
import { calculateFeasibleIntensityRange } from "../service/intensityRangeHelper";
import { shiftState } from "../stores/shiftStore";
import { ShiftsRange } from "./ShiftsRange";
import { ShiftInformation } from "./ShiftInformation";
import { ShiftHours } from "./ShiftHours";

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
      return closestIndex;
    }
    return index;
  };

  const getIntensityFromIndex = (index: number) => intensityOptions[index];

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

  const handleStartTimeChange = (time: string) => {
    console.log(
      `🕐 [ShiftInfoSettingsView] Start time changed: ${localStartTime} → ${time}`
    );

    // Update start time in global state
    setShiftData((prev) => ({
      ...prev,
      startTime: time,
    }));

    // Calculate new shift duration and hours
    const newDuration = calculateOptimalShiftDuration(
      time,
      localEndTime,
      intensity,
      posts.length,
      staffCount
    );

    const newShiftStartTimes = calculateShiftStartingTimes(
      time,
      localEndTime,
      newDuration
    );

    // Update hours in global state
    const newHours: UniqueString[] = newShiftStartTimes.map((time, index) => ({
      id: `shift-${index}-${time}`,
      value: time,
    }));

    setShiftData((prev) => ({
      ...prev,
      hours: newHours,
    }));

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

    // Update end time in global state
    setShiftData((prev) => ({
      ...prev,
      endTime: time,
    }));

    // Calculate new shift duration and hours
    const newDuration = calculateOptimalShiftDuration(
      localStartTime,
      time,
      intensity,
      posts.length,
      staffCount
    );

    const newShiftStartTimes = calculateShiftStartingTimes(
      localStartTime,
      time,
      newDuration
    );

    // Update hours in global state
    const newHours: UniqueString[] = newShiftStartTimes.map((time, index) => ({
      id: `shift-${index}-${time}`,
      value: time,
    }));

    setShiftData((prev) => ({
      ...prev,
      hours: newHours,
    }));

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

    // Update rest time in global state
    setShiftData((prev) => ({
      ...prev,
      restTime: newIntensity,
    }));

    // Calculate new shift duration and hours
    const newDuration = calculateOptimalShiftDuration(
      localStartTime,
      localEndTime,
      newIntensity,
      posts.length,
      staffCount
    );

    const newShiftStartTimes = calculateShiftStartingTimes(
      localStartTime,
      localEndTime,
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
        hours: newHours,
        userShiftData: updatedUserShiftData,
        assignments: clearedAssignments,
      };
    });

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
      className={`flex flex-col gap-4 p-4 border-2 border-dashed border-primary rounded-lg max-w-[500px] mx-auto ${className}`}
    >
      <h4 className="text-lg font-semibold text-center">Shift Settings</h4>

      <div className="flex flex-col gap-4">
        {/* Unified Shifts Range */}
        <ShiftsRange
          startTime={localStartTime}
          endTime={localEndTime}
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
        />

        {/* Intensity Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <span className="font-medium text-gray-700 mb-2">Intensity:</span>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-500">Relaxed</span>
                  <span className="text-xs text-gray-400">
                    {intensityDurationMap[intensityOptions[0]]?.toFixed(1) ||
                      "—"}
                    h
                  </span>
                </div>
                <div className="flex items-center h-9 w-full rounded-md bg-transparent px-3 py-1">
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
                    className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer slider
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:h-4 
                      [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-primary
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-primary
                      [&::-moz-range-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:border-none"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-500">Intense</span>
                  <span className="text-xs text-gray-400">
                    {intensityDurationMap[
                      intensityOptions[intensityOptions.length - 1]
                    ]?.toFixed(1) || "—"}
                    h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shift Information Display */}
        <ShiftInformation
          shiftDuration={shiftDuration}
          restTime={intensity}
          className="mb-4"
        />

        {/* Shift Hours Display */}
        <ShiftHours shiftStartTimes={shiftStartTimes} />
      </div>
    </div>
  );
}

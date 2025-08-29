import { useState, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { shiftState } from "../stores/shiftStore";
import { optimizeShift } from "../service/shiftOptimizedService";
import { defaultHours } from "../constants/shiftManagerConstants";

export interface OptimizationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning";
}

export function useShiftOptimization(
  isEditing: boolean,
  lastAppliedConstraintsSignature: React.MutableRefObject<string | null>
) {
  const [recoilState, setRecoilState] = useRecoilState(shiftState);
  const [isOptimizeDisabled, setIsOptimizeDisabled] = useState(true);
  const [optimizeButtonTitle, setOptimizeButtonTitle] = useState(
    "Optimize shift assignments"
  );
  const [optimizationDialog, setOptimizationDialog] =
    useState<OptimizationDialog>({
      isOpen: false,
      title: "",
      message: "",
      type: "success",
    });

  // Update optimization button state based on conditions
  useEffect(() => {
    const currentSyncStatus = recoilState.syncStatus;
    const currentAssignments = recoilState.assignments;
    const currentUserShiftData = recoilState.userShiftData;
    let newTitle = "Optimize shift assignments"; // Default title

    // Condition 1: Edit mode is active
    if (isEditing) {
      setIsOptimizeDisabled(true);
      newTitle = "Cannot optimize: Currently in edit mode.";
      setOptimizeButtonTitle(newTitle);
      return;
    }

    // Condition 2: Sync status is problematic
    if (
      currentSyncStatus === "syncing" ||
      currentSyncStatus === "out-of-sync"
    ) {
      setIsOptimizeDisabled(true);
      newTitle =
        currentSyncStatus === "syncing"
          ? "Cannot optimize: Data is currently syncing."
          : "Cannot optimize: Data is out of sync.";
      setOptimizeButtonTitle(newTitle);
      return;
    }

    // Condition 3: No actual assignments currently exist in the state.
    const hasAnyActualAssignments =
      currentAssignments &&
      currentAssignments.flat().some((userId) => userId !== null);
    if (!hasAnyActualAssignments) {
      if (currentUserShiftData && currentUserShiftData.length > 0) {
        setIsOptimizeDisabled(false);
        newTitle = "Generate initial shift assignments.";
      } else {
        setIsOptimizeDisabled(true);
        newTitle = "Cannot optimize: No users or constraints available.";
      }
      setOptimizeButtonTitle(newTitle);
      return;
    }

    // Condition 4: Assignments exist. Button disabled if current constraints match those that produced these assignments.
    if (lastAppliedConstraintsSignature.current === null) {
      console.warn(
        "[isOptimizeDisabled] lastAppliedConstraintsSignature.current is null, but assignments exist. Enabling button."
      );
      setIsOptimizeDisabled(false);
      newTitle =
        "Optimize current assignments with potentially new constraints.";
      setOptimizeButtonTitle(newTitle);
      return;
    }

    const currentConstraintsSignature = JSON.stringify({
      userShiftData: currentUserShiftData,
      posts: recoilState.posts,
      hours: recoilState.hours,
    });

    if (
      currentConstraintsSignature === lastAppliedConstraintsSignature.current
    ) {
      setIsOptimizeDisabled(true);
      newTitle =
        "Cannot optimize: Constraints have not changed since last optimization.";
    } else {
      setIsOptimizeDisabled(false);
      newTitle = "Optimize with updated constraints.";
    }
    setOptimizeButtonTitle(newTitle);
  }, [
    isEditing,
    recoilState.syncStatus,
    recoilState.assignments,
    recoilState.userShiftData,
    recoilState.posts,
    recoilState.hours,
    lastAppliedConstraintsSignature,
  ]);

  const handleOptimize = async () => {
    console.log("Optimization process started.");
    if (isOptimizeDisabled) {
      console.log("Optimization skipped: button is disabled.");
      return;
    }

    console.log("Starting optimization process...");
    console.log("Current state:", {
      posts: recoilState.posts,
      hours: recoilState.hours,
      userShiftData: recoilState.userShiftData,
    });

    try {
      const optimizedResult = await optimizeShift(
        recoilState.userShiftData || []
      );

      if (!optimizedResult.isOptim) {
        // Handle infeasible optimization
        console.warn(
          "Optimization failed: Problem is infeasible - some shifts have no available users"
        );
        // Clear assignments since no valid solution exists
        setRecoilState((prev) => ({
          ...prev,
          assignments: (recoilState.posts || []).map(() =>
            (recoilState.hours || defaultHours).map(() => null)
          ),
          manuallyEditedSlots: prev.manuallyEditedSlots || {},
          customCellDisplayNames: prev.customCellDisplayNames || {},
        }));

        // Show user-friendly feedback
        setOptimizationDialog({
          isOpen: true,
          title: "Optimization Not Possible",
          message:
            "Some shifts have no available users. Please check that all shifts have at least one person available before trying to optimize.",
          type: "warning",
        });
        return; // Early return for infeasible problems
      }

      // Handle successful optimization
      let newAssignments: (string | null)[][] = (recoilState.posts || []).map(
        () => (recoilState.hours || defaultHours).map(() => null)
      );

      optimizedResult.result.forEach((postAssignments, postIndex) => {
        // Ensure we don't try to access postAssignments out of bounds of newAssignments
        if (postIndex < newAssignments.length) {
          postAssignments.forEach((shiftAssignments, shiftIndex) => {
            if (shiftIndex < newAssignments[postIndex].length) {
              const assignedUserIndex = shiftAssignments.findIndex(
                (isAssigned) => isAssigned
              );

              if (
                assignedUserIndex >= 0 &&
                assignedUserIndex < (recoilState.userShiftData?.length || 0)
              ) {
                const userId =
                  recoilState.userShiftData?.[assignedUserIndex]?.user.id ||
                  null;
                newAssignments[postIndex][shiftIndex] = userId;
              } else {
                newAssignments[postIndex][shiftIndex] = null;
              }
            }
          });
        }
      });

      setRecoilState((prev) => ({
        ...prev,
        assignments: newAssignments,
        manuallyEditedSlots: prev.manuallyEditedSlots || {},
        customCellDisplayNames: prev.customCellDisplayNames || {},
      }));

      // Capture the signature of constraints that led to THIS successful optimization
      lastAppliedConstraintsSignature.current = JSON.stringify({
        userShiftData: recoilState.userShiftData, // Constraints used for this optimization
        posts: recoilState.posts,
        hours: recoilState.hours,
      });

      console.log("Optimization successful, new assignments applied.");

      // Show success feedback
      setOptimizationDialog({
        isOpen: true,
        title: "Optimization Successful",
        message: "Shift assignments have been optimized successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error during optimization:", error);
      setRecoilState((prev) => ({
        ...prev,
        assignments: (recoilState.posts || []).map(() =>
          (recoilState.hours || defaultHours).map(() => null)
        ),
        manuallyEditedSlots: prev.manuallyEditedSlots || {},
        customCellDisplayNames: prev.customCellDisplayNames || {},
      }));

      // Show error feedback
      setOptimizationDialog({
        isOpen: true,
        title: "Optimization Error",
        message:
          "An unexpected error occurred during optimization. Please try again.",
        type: "error",
      });
    }
  };

  return {
    isOptimizeDisabled,
    optimizeButtonTitle,
    optimizationDialog,
    setOptimizationDialog,
    handleOptimize,
  };
}

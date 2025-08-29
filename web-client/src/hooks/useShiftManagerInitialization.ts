import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { shiftState, PersistedShiftData } from "../stores/shiftStore";
import {
  loadStateFromLocalStorage,
  LOCAL_STORAGE_KEY,
} from "../lib/localStorageUtils";
import { UserShiftData } from "../models";
import {
  defaultPosts,
  OPERATION_START_TIME,
  OPERATION_END_TIME,
  MINIMUM_REST_TIME,
  DEFAULT_STAFF_COUNT,
} from "../constants/shiftManagerConstants";
import {
  generateDynamicHours,
  getDefaultConstraints,
} from "../service/shiftManagerUtils";

export function useShiftManagerInitialization() {
  const [recoilState, setRecoilState] = useRecoilState(shiftState);
  const lastAppliedConstraintsSignature = useRef<string | null>(null);

  // Effect for initial loading from localStorage AND setting default workers if needed
  useEffect(() => {
    const isMounted = { current: true };
    console.log(
      "[ShiftManager useEffect] Initial data setup. Current recoilState:",
      recoilState
    );

    const setupInitialData = async () => {
      console.log("[ShiftManager useEffect] setupInitialData: Starting.");
      // 1. Set to syncing
      if (isMounted.current) {
        setRecoilState((prev) => {
          console.log(
            "[ShiftManager useEffect] setupInitialData: Setting syncStatus to 'syncing'. Prev state:",
            prev
          );
          // Ensure assignments is initialized here if not already, based on defaultPosts/Hours
          const initialAssignments =
            prev.assignments && prev.assignments.length > 0
              ? prev.assignments
              : defaultPosts.map(() => [].map(() => null));
          return {
            ...prev,
            syncStatus: "syncing",
            assignments: initialAssignments,
            manuallyEditedSlots: prev.manuallyEditedSlots || {},
            customCellDisplayNames: prev.customCellDisplayNames || {},
          };
        });
      }

      try {
        // 2. Try loading from localStorage
        const savedData = await loadStateFromLocalStorage<PersistedShiftData>(
          LOCAL_STORAGE_KEY
        );

        if (!isMounted.current) return;

        // Generate dynamic hours based on operation parameters
        const dynamicHours = generateDynamicHours(
          OPERATION_START_TIME,
          OPERATION_END_TIME,
          defaultPosts.length,
          DEFAULT_STAFF_COUNT,
          MINIMUM_REST_TIME
        );

        if (savedData && savedData.hasInitialized) {
          console.log(
            `[ShiftManager useEffect] setupInitialData: Found saved data. Setting state.`,
            savedData
          );
          setRecoilState((prev) => ({
            ...prev,
            posts: savedData.posts || [],
            hours: savedData.hours || dynamicHours,
            userShiftData: savedData.userShiftData || [],
            assignments:
              savedData.assignments ||
              savedData.posts.map(() => dynamicHours.map(() => null)),
            hasInitialized: true,
            syncStatus: "syncing",
            manuallyEditedSlots: savedData.manuallyEditedSlots || {},
            customCellDisplayNames: savedData.customCellDisplayNames || {},
          }));
          // Set initial signature based on loaded data
          lastAppliedConstraintsSignature.current = JSON.stringify({
            userShiftData: savedData.userShiftData || [],
            posts: savedData.posts || [],
            hours: savedData.hours || dynamicHours,
          });
        } else {
          // 3. No saved data, so set default workers and initial assignments
          const defaultWorkers: UserShiftData[] = [
            {
              user: { id: "worker-1", name: "John Doe" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-2", name: "Jane Smith" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-3", name: "Bob Johnson" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-4", name: "Alice Brown" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-5", name: "Charlie Wilson" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-6", name: "David Miller" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-7", name: "Emma Davis" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-8", name: "Frank Wilson" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-9", name: "Grace Taylor" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-10", name: "Henry Anderson" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-11", name: "Isabella Martinez" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-12", name: "Jack Thompson" },
              constraints: getDefaultConstraints(defaultPosts, dynamicHours),
              totalAssignments: 0,
            },
          ];
          const initialAssignments = recoilState.posts.map(() =>
            dynamicHours.map(() => null)
          );
          setRecoilState({
            hours: dynamicHours,
            posts: defaultPosts,
            userShiftData: defaultWorkers,
            hasInitialized: true,
            syncStatus: "syncing",
            assignments: initialAssignments,
            manuallyEditedSlots: {},
            customCellDisplayNames: {},
          });
          // Set initial signature for default state
          lastAppliedConstraintsSignature.current = JSON.stringify({
            userShiftData: defaultWorkers,
            posts: defaultPosts,
            hours: dynamicHours,
          });
        }
      } catch (error) {
        console.error(
          "[ShiftManager useEffect] setupInitialData: Error during initial data setup:",
          error
        );
        if (isMounted.current) {
          // Generate fallback hours for error case
          const fallbackHours = generateDynamicHours(
            OPERATION_START_TIME,
            OPERATION_END_TIME,
            defaultPosts.length,
            DEFAULT_STAFF_COUNT,
            MINIMUM_REST_TIME
          );
          const errorAssignments = defaultPosts.map(() =>
            fallbackHours.map(() => null)
          );
          setRecoilState((prev) => ({
            ...prev,
            hasInitialized: true,
            syncStatus: "out-of-sync",
            assignments:
              prev.assignments && prev.assignments.length > 0
                ? prev.assignments
                : errorAssignments, // Keep existing or fallback
            manuallyEditedSlots: prev.manuallyEditedSlots || {},
            customCellDisplayNames: prev.customCellDisplayNames || {},
          }));
        }
      }
    };

    if (!recoilState.hasInitialized) {
      setupInitialData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [
    recoilState.hasInitialized,
    recoilState.posts,
    recoilState.hours,
    setRecoilState,
  ]);

  return {
    lastAppliedConstraintsSignature,
  };
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { optimizeShift } from "@/service/shiftOptimizedService";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import tumbleweedIcon from "../../assets/tumbleweed.svg";
import {
  loadStateFromLocalStorage,
  LOCAL_STORAGE_KEY,
} from "../lib/localStorageUtils";
import { Constraint, ShiftMap, UserShiftData } from "../models";
import { UniqueString } from "../models/index";
import { PersistedShiftData, shiftState } from "../stores/shiftStore";
import { AvailabilityTableView } from "./AvailabilityTableView";
import { EditButton } from "./EditButton";
import { PostListActions } from "./PostListActions";
import { SplitScreen } from "./SplitScreen";
import { SyncStatusIcon } from "./ui/SyncStatusIcon";
import { VerticalActionGroup } from "./ui/VerticalActionGroup";
import { WorkerList } from "./WorkerList";

const defaultHours: UniqueString[] = [
  { id: "hour-1", value: "08:00" },
  { id: "hour-2", value: "09:00" },
  { id: "hour-3", value: "10:00" },
  { id: "hour-4", value: "11:00" },
  { id: "hour-5", value: "12:00" },
];

const defaultPosts: UniqueString[] = [
  { id: "post-1", value: "Post 1" },
  { id: "post-2", value: "Post 2" },
  { id: "post-3", value: "Post 3" },
];

export function ShiftManager() {
  const [shiftMap, setShiftMap] = useState<ShiftMap>(new ShiftMap()); //FIXME seems redundant due to recoil state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [recoilState, setRecoilState] = useRecoilState(shiftState);
  const [isEditing, setIsEditing] = useState(false);
  const [completeShiftData, setCompleteShiftData] = useState<Constraint[][]>(
    getDefaultConstraints(defaultPosts, defaultHours)
  );
  const [newPostName, setNewPostName] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostName, setEditingPostName] = useState("");
  const [checkedPostIds, setCheckedPostIds] = useState<string[]>([]);
  const [isOptimizeDisabled, setIsOptimizeDisabled] = useState(true);
  const [optimizeButtonTitle, setOptimizeButtonTitle] = useState(
    "Optimize shift assignments"
  );
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
              : defaultPosts.map(() => defaultHours.map(() => null));
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
        // console.log(
        //   "[ShiftManager useEffect] setupInitialData: Attempting to load from localStorage."
        // );
        const savedData = await loadStateFromLocalStorage<PersistedShiftData>(
          LOCAL_STORAGE_KEY
        );
        // console.log(
        //   "[ShiftManager useEffect] setupInitialData: Data from localStorage:",
        //   savedData
        // );

        if (!isMounted.current) return;

        if (savedData && savedData.hasInitialized) {
          console.log(
            `[ShiftManager useEffect] setupInitialData: Found saved data. Setting state.`,
            savedData
          );
          setRecoilState((prev) => ({
            ...prev,
            posts: savedData.posts || [],
            hours: savedData.hours || defaultHours,
            userShiftData: savedData.userShiftData || [],
            assignments:
              savedData.assignments ||
              savedData.posts.map(() => defaultHours.map(() => null)),
            hasInitialized: true,
            syncStatus: "syncing",
            manuallyEditedSlots: savedData.manuallyEditedSlots || {},
            customCellDisplayNames: savedData.customCellDisplayNames || {},
          }));
          // Set initial signature based on loaded data
          lastAppliedConstraintsSignature.current = JSON.stringify({
            userShiftData: savedData.userShiftData || [],
            posts: savedData.posts || [],
            hours: savedData.hours || defaultHours,
          });
        } else {
          // 3. No saved data, so set default workers and initial assignments
          // console.log(
          //   "[ShiftManager useEffect] setupInitialData: No saved data. Setting default workers and assignments."
          // );
          const defaultWorkers: UserShiftData[] = [
            {
              user: { id: "worker-1", name: "John Doe" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-2", name: "Jane Smith" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-3", name: "Bob Johnson" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-4", name: "Alice Brown" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-5", name: "Charlie Wilson" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-6", name: "David Miller" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-7", name: "Emma Davis" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-8", name: "Frank Wilson" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-9", name: "Grace Taylor" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-10", name: "Henry Anderson" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-11", name: "Isabella Martinez" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
            {
              user: { id: "worker-12", name: "Jack Thompson" },
              constraints: getDefaultConstraints(defaultPosts, defaultHours),
              totalAssignments: 0,
            },
          ];
          const initialAssignments = recoilState.posts.map(() =>
            defaultHours.map(() => null)
          );
          setRecoilState({
            hours: defaultHours,
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
            hours: defaultHours,
          });
          // console.log(
          //   "[ShiftManager useEffect] setupInitialData: Default workers and assignments set. State updated."
          // );
        }
      } catch (error) {
        console.error(
          "[ShiftManager useEffect] setupInitialData: Error during initial data setup:",
          error
        );
        if (isMounted.current) {
          const errorAssignments = defaultPosts.map(() =>
            defaultHours.map(() => null)
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
      // console.log(
      //   "[ShiftManager useEffect] Initial data setup: hasInitialized is false. Running setup."
      // );
      setupInitialData();
    }

    return () => {
      isMounted.current = false;
    };
    // Key dependency: recoilState.hasInitialized.
    // setRecoilState is stable and doesn't need to be a dependency.
    // defaultPosts and defaultHours are used for default data but should be stable or memoized.
    // If they change and we want to re-init, this logic would need adjustment, but for initial load this is fine.
  }, [
    recoilState.hasInitialized,
    recoilState.posts,
    recoilState.hours,
    setRecoilState,
  ]); // Removed recoilState.assignments to prevent infinite loop

  // Separate useEffect to handle assignments consistency when posts change
  useEffect(() => {
    if (recoilState.hasInitialized && recoilState.posts) {
      // Ensure assignments are consistent with posts if already initialized
      if (
        recoilState.assignments &&
        recoilState.assignments.length !== (recoilState.posts?.length || 0)
      ) {
        const adjustedAssignments = (recoilState.posts || []).map((_, i) =>
          recoilState.assignments[i] &&
          recoilState.assignments[i].length ===
            (recoilState.hours?.length || defaultHours.length)
            ? recoilState.assignments[i]
            : (recoilState.hours || defaultHours).map(() => null)
        );
        // Ensure new posts get new assignment rows
        const currentAssignmentsLength = recoilState.assignments
          ? recoilState.assignments.length
          : 0;
        for (
          let i = currentAssignmentsLength;
          i < (recoilState.posts?.length || 0);
          i++
        ) {
          adjustedAssignments.push(
            (recoilState.hours || defaultHours).map(() => null)
          );
        }
        setRecoilState((prev) => ({
          ...prev,
          assignments: adjustedAssignments.slice(
            0,
            recoilState.posts?.length || 0
          ),
          manuallyEditedSlots: prev.manuallyEditedSlots || {},
          customCellDisplayNames: prev.customCellDisplayNames || {},
        }));
      } else if (
        !recoilState.assignments &&
        (recoilState.posts?.length || 0) > 0
      ) {
        // Case: assignments is null/undefined but posts exist (e.g. initial state before full init)
        const initialAssignments = (recoilState.posts || []).map(() =>
          (recoilState.hours || defaultHours).map(() => null)
        );
        setRecoilState((prev) => ({
          ...prev,
          assignments: initialAssignments,
          manuallyEditedSlots: prev.manuallyEditedSlots || {},
          customCellDisplayNames: prev.customCellDisplayNames || {},
        }));
      }
    }
  }, [
    recoilState.hasInitialized,
    recoilState.posts,
    recoilState.hours,
    setRecoilState,
  ]);

  useEffect(() => {
    const currentSyncStatus = recoilState.syncStatus;
    const currentAssignments = recoilState.assignments;
    const currentUserShiftData = recoilState.userShiftData;
    let newTitle = "Optimize shift assignments"; // Default title

    // Condition 1: Sync status is problematic
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

    // Condition 2: No actual assignments currently exist in the state.
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

    // Condition 3: Assignments exist. Button disabled if current constraints match those that produced these assignments.
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
    recoilState.syncStatus,
    recoilState.assignments,
    recoilState.userShiftData,
    recoilState.posts,
    recoilState.hours,
  ]);

  const defaultConstraints = useMemo(
    () =>
      getDefaultConstraints(
        recoilState.posts || [],
        recoilState.hours || defaultHours
      ),
    [recoilState.posts, recoilState.hours] // Added recoilState.hours
  );

  const assignments =
    recoilState.assignments ||
    (recoilState.posts || []).map(() =>
      (recoilState.hours || defaultHours).map(() => null)
    );

  // Extract syncStatus from recoilState for convenience
  const syncStatus = recoilState.syncStatus;
  console.log(
    "[ShiftManager Render] Current syncStatus:",
    syncStatus,
    "Full recoilState:",
    recoilState
  );

  useEffect(() => {
    setShiftMap((oldMap) =>
      deriveUserDataMap(recoilState.userShiftData, defaultConstraints, oldMap)
    );
  }, [recoilState.userShiftData, defaultConstraints]);

  const selectedUser = useMemo(() => {
    return selectedUserId
      ? recoilState.userShiftData?.find(
          (userData) => userData.user.id === selectedUserId
        )
      : undefined;
  }, [selectedUserId, recoilState.userShiftData]);

  const addUser = () => {
    const newUser: UserShiftData = {
      user: {
        id: `worker-${(recoilState.userShiftData?.length || 0) + 1}`,
        name: "New User",
      },
      constraints: getDefaultConstraints(
        recoilState.posts || [],
        recoilState.hours || defaultHours
      ),
      totalAssignments: 0,
    };
    setRecoilState((prev) => ({
      ...prev,
      userShiftData: [newUser, ...(prev.userShiftData || [])],
      manuallyEditedSlots: prev.manuallyEditedSlots || {},
      customCellDisplayNames: prev.customCellDisplayNames || {},
    }));
  };

  const updateUserConstraints = (
    userId: string,
    newConstraints: Constraint[][]
  ) => {
    // Print only the user availability object
    console.log(JSON.stringify(newConstraints, null, 2));

    setRecoilState((prev) => ({
      ...prev,
      userShiftData: (prev.userShiftData || []).map((userData) =>
        userData.user.id === userId
          ? { ...userData, constraints: newConstraints }
          : userData
      ),
      manuallyEditedSlots: prev.manuallyEditedSlots || {},
      customCellDisplayNames: prev.customCellDisplayNames || {},
    }));
  };

  const updateUserName = (userId: string, newName: string) => {
    console.log("1 - newName: ", newName);
    setRecoilState((prev) => ({
      ...prev,
      userShiftData: (prev.userShiftData || []).map((userData) =>
        userData.user.id === userId
          ? { ...userData, user: { ...userData.user, name: newName } }
          : userData
      ),
      manuallyEditedSlots: prev.manuallyEditedSlots || {},
      customCellDisplayNames: prev.customCellDisplayNames || {},
    }));
  };

  const removeUsers = (userIds: string[]) => {
    setRecoilState((prev) => ({
      ...prev,
      userShiftData: (prev.userShiftData || []).filter(
        (userData) => !userIds.includes(userData.user.id)
      ),
      manuallyEditedSlots: prev.manuallyEditedSlots || {},
      customCellDisplayNames: prev.customCellDisplayNames || {},
    }));
  };

  const addPost = () => {
    const postName =
      newPostName.trim() || `New Post ${(recoilState.posts?.length || 0) + 1}`;

    const newPostData: UniqueString = {
      id: `post-${Date.now()}`,
      value: postName,
    };

    setNewPostName("");

    // Update assignments and posts in Recoil state
    setRecoilState((prev) => {
      const newAssignments = prev.assignments ? [...prev.assignments] : [];
      newAssignments.push((prev.hours || defaultHours).map(() => null)); // Add a new row for the new post

      const updatedUserShiftData = (prev.userShiftData || []).map(
        (userData) => {
          const newConstraints = [...userData.constraints];
          newConstraints.push(
            (prev.hours || defaultHours).map((hour) => ({
              postID: newPostData.id,
              hourID: hour.id,
              availability: true,
            }))
          );
          return { ...userData, constraints: newConstraints };
        }
      );

      return {
        ...prev,
        posts: [...(prev.posts || []), newPostData],
        assignments: newAssignments,
        userShiftData: updatedUserShiftData,
        manuallyEditedSlots: prev.manuallyEditedSlots || {},
        customCellDisplayNames: prev.customCellDisplayNames || {},
      };
    });
  };

  const handleConstraintsChanged = (newConstraints: Constraint[][]) => {
    if (!selectedUser) return;

    console.log("===== HANDLE CONSTRAINTS CHANGED =====");
    console.log(
      `Processing constraints for user: ${selectedUser.user.name} (${selectedUser.user.id})`
    );
    console.log(
      "New constraints structure:",
      newConstraints.map((row) => row.length)
    );

    // Log detailed post/hour mapping
    console.log("Posts and hours mapping:");
    recoilState.posts?.forEach((post, postIndex) => {
      console.log(`  Post ${postIndex}: ${post.value} (${post.id})`);
    });
    (recoilState.hours || defaultHours).forEach((hour, hourIndex) => {
      console.log(`  Hour ${hourIndex}: ${hour.value} (${hour.id})`);
    });

    // Detailed constraints logging
    console.log("Constraint details:");
    newConstraints.forEach((postConstraints, postIndex) => {
      const postName =
        postIndex < (recoilState.posts?.length || 0)
          ? recoilState.posts[postIndex].value
          : `Unknown(${postIndex})`;
      console.log(`  Post ${postIndex} (${postName}):`);
      postConstraints.forEach((constraint, hourIndex) => {
        const hourName =
          hourIndex < (recoilState.hours?.length || defaultHours.length)
            ? (recoilState.hours || defaultHours)[hourIndex].value
            : `Unknown(${hourIndex})`;
        console.log(
          `    Hour ${hourIndex} (${hourName}): Availability=${constraint.availability}, PostID=${constraint.postID}, HourID=${constraint.hourID}`
        );
      });
    });

    setShiftMap((prev) => {
      const newShiftMap = prev.copy();
      console.log("BEFORE UPDATE - User constraints in ShiftMap:");
      newShiftMap.debugUserConstraints(selectedUser.user.id);

      const userShiftData = prev.getUser(selectedUser.user.id);
      if (userShiftData) {
        userShiftData.constraints = newConstraints;
        newShiftMap.updateUser(userShiftData);
        console.log("Updated shift map with new constraints");
        console.log("AFTER UPDATE - User constraints in ShiftMap:");
        newShiftMap.debugUserConstraints(selectedUser.user.id);
      } else {
        console.warn("User shift data not found in shift map");
      }
      return newShiftMap;
    });

    console.log("======================================");
  };

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
      let newAssignments: (string | null)[][] = (recoilState.posts || []).map(
        () => (recoilState.hours || defaultHours).map(() => null)
      );

      if (optimizedResult.isOptim) {
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
                  newAssignments[postIndex][shiftIndex] =
                    recoilState.userShiftData?.[assignedUserIndex]?.user.id ||
                    null;
                } else {
                  newAssignments[postIndex][shiftIndex] = null;
                }
              }
            });
          }
        });
      }
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
    }
  };

  const handlePostEdit = (postId: string, newName: string) => {
    // Update assignments and posts in Recoil state
    setRecoilState((prev) => ({
      ...prev,
      posts: (prev.posts || []).map((post) =>
        post.id === postId ? { ...post, value: newName } : post
      ),
      manuallyEditedSlots: prev.manuallyEditedSlots || {},
      customCellDisplayNames: prev.customCellDisplayNames || {},
    }));
  };

  const handlePostRemove = (postIdToRemove: string) => {
    const postIndexToRemove =
      recoilState.posts?.findIndex((p) => p.id === postIdToRemove) || -1;

    if (postIndexToRemove !== -1) {
      setRecoilState((prev) => {
        const updatedAssignments = prev.assignments
          ? [...prev.assignments]
          : [];
        if (postIndexToRemove < updatedAssignments.length) {
          updatedAssignments.splice(postIndexToRemove, 1); // Remove the row
        }
        return {
          ...prev,
          posts: (prev.posts || []).filter(
            (post) => post.id !== postIdToRemove
          ),
          assignments: updatedAssignments,
          manuallyEditedSlots: prev.manuallyEditedSlots || {},
          customCellDisplayNames: prev.customCellDisplayNames || {},
        };
      });
    }
  };

  const startEditingPost = (post: UniqueString) => {
    setEditingPostId(post.id);
    setEditingPostName(post.value);
  };

  const savePostEdit = () => {
    if (!editingPostId || !editingPostName.trim()) return;

    // Update assignments and posts in Recoil state
    setRecoilState((prev) => ({
      ...prev,
      posts: (prev.posts || []).map((post) =>
        post.id === editingPostId
          ? { ...post, value: editingPostName.trim() }
          : post
      ),
      manuallyEditedSlots: prev.manuallyEditedSlots || {},
      customCellDisplayNames: prev.customCellDisplayNames || {},
    }));
    setEditingPostId(null);
    setEditingPostName("");
  };

  const handlePostNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      savePostEdit();
    } else if (e.key === "Escape") {
      setEditingPostId(null);
      setEditingPostName("");
    }
  };

  const handleAssignmentChange = (
    postIndex: number,
    hourIndex: number,
    userId: string | null
  ) => {
    setRecoilState((prevState) => {
      const newAssignments = prevState.assignments.map((row) => [...row]);
      const originalUserIdInSlot = newAssignments[postIndex][hourIndex];
      newAssignments[postIndex][hourIndex] = userId;

      console.log(
        "[handleAssignmentChange] Prev manuallyEditedSlots:",
        prevState.manuallyEditedSlots
      );
      const newManuallyEditedSlots = { ...prevState.manuallyEditedSlots };
      const slotKey = `${postIndex}-${hourIndex}`;

      // Since this function is now only for assigning EXISTING users,
      // we always clear any custom display name for this slot.
      const newCustomCellDisplayNames = { ...prevState.customCellDisplayNames };
      if (newCustomCellDisplayNames[slotKey]) {
        delete newCustomCellDisplayNames[slotKey];
        console.log(
          `[handleAssignmentChange] Cleared customDisplayName for ${slotKey}`
        );
      }

      // Update manuallyEditedSlots based on the change in the official assignments grid
      if (originalUserIdInSlot !== userId) {
        // If there's an actual change
        const existingEdit = newManuallyEditedSlots[slotKey];
        if (existingEdit) {
          // Slot was already manually edited, update currentUserId
          // If the new userId is the same as the very original one, remove the entry
          if (userId === existingEdit.originalUserId) {
            delete newManuallyEditedSlots[slotKey];
          } else {
            newManuallyEditedSlots[slotKey] = {
              ...existingEdit,
              currentUserId: userId,
            };
          }
        } else {
          // First manual edit for this slot
          newManuallyEditedSlots[slotKey] = {
            originalUserId: originalUserIdInSlot,
            currentUserId: userId,
          };
        }
      } else {
        // If the change results in originalUserId === userId (e.g., an edit was undone indirectly)
        // we might still want to remove it if it existed, though the above if should handle it.
        // This specific case might be redundant if the above logic (userId === existingEdit.originalUserId) is hit.
      }

      console.log("Assignments updated:", newAssignments);
      console.log(
        "[handleAssignmentChange] Next manuallyEditedSlots:",
        newManuallyEditedSlots
      );

      return {
        ...prevState,
        assignments: newAssignments,
        manuallyEditedSlots: newManuallyEditedSlots,
        customCellDisplayNames: newCustomCellDisplayNames, // Include updated custom names
      };
    });
  };

  const handleUserSelect = (userId: string | null) => {
    console.log("handleUserSelect called with userId:", userId);
    setSelectedUserId(userId);
  };

  const handlePostCheck = (postId: string) => {
    setCheckedPostIds([...checkedPostIds, postId]);
  };

  const handlePostUncheck = (postId: string) => {
    setCheckedPostIds((ids) => ids.filter((id) => id !== postId));
  };

  const handlePostCheckAll = (allWasClicked: boolean) => {
    if (allWasClicked) {
      setCheckedPostIds(recoilState.posts?.map((post) => post.id) || []);
    } else {
      setCheckedPostIds([]);
    }
  };

  const handleAssignmentNameUpdate = (
    postIndex: number,
    hourIndex: number,
    newUserName: string
  ) => {
    const userToAssign = recoilState.userShiftData?.find(
      (userData) => userData.user.name === newUserName
    );
    const slotKey = `${postIndex}-${hourIndex}`;

    if (userToAssign) {
      // User found, this is an assignment to an existing worker
      console.log(
        `[handleAssignmentNameUpdate] User "${newUserName}" found. Assigning userId: ${userToAssign.user.id}`
      );
      handleAssignmentChange(postIndex, hourIndex, userToAssign.user.id);
    } else {
      // User not found, this is a custom text entry for display purposes
      console.log(
        `[handleAssignmentNameUpdate] User "${newUserName}" not found. Setting as custom display name for slot ${slotKey}.`
      );
      setRecoilState((prevState) => {
        const newCustomCellDisplayNames = {
          ...prevState.customCellDisplayNames,
          [slotKey]: newUserName,
        };

        // How should manuallyEditedSlots be handled here?
        // Option: If we set a custom name, we are essentially saying the "official" assignment for this slot is null (or its previous official value).
        // The custom name overrides display. Let's record the change against the *underlying official assignment*.
        const officialAssignmentInSlot =
          prevState.assignments[postIndex][hourIndex];
        const newManuallyEditedSlots = { ...prevState.manuallyEditedSlots };

        // Check if this custom name reverts a previous manual edit to the original state.
        // This is tricky because the "original" might have been an actual user.
        // For now, if it's a custom name, it's a manual edit differing from the official assignment grid.
        const existingEdit = newManuallyEditedSlots[slotKey];
        if (existingEdit) {
          // If an edit record exists, and we are now setting a custom name which is different from the original user of that edit record
          // (or if original was null and custom name is not effectively 'empty')
          // We are essentially saying: the official slot still holds 'existingEdit.originalUserId' (or null),
          // but display is now 'newUserName'.
          // The 'currentUserId' in manuallyEditedSlots should reflect what's in the *assignments* grid if this was a custom name.
          // This part needs more thought if manuallyEditedSlots' currentUserId is to mean the UserID of the *displayed* user.
          // For simplicity: if we set a custom name, we are overriding. Record this fact.
          // If the underlying assignment was 'worker-A', and we type 'Custom Name',
          // originalUserId: 'worker-A', currentUserId: null (because 'Custom Name' isn't a user in assignments grid)
          // OR currentUserId: 'worker-A' (what IS in the assignments grid)
          // Let's stick to originalUserId vs currentUserId in the *assignments* grid for manuallyEditedSlots.
          // So, if we set a custom name, the assignments grid for this slot does NOT change from its previous official value.

          if (
            newUserName ===
            prevState.userShiftData?.find(
              (u) => u.user.id === existingEdit.originalUserId
            )?.user.name
          ) {
            // Custom name IS the name of the original user for this manual edit, so remove manual edit marker for this slot.
            delete newManuallyEditedSlots[slotKey];
            // Also remove from customCellDisplayNames as it's now effectively reverted to an official (though perhaps original) assignment.
            delete newCustomCellDisplayNames[slotKey];
          } else {
            newManuallyEditedSlots[slotKey] = {
              originalUserId: existingEdit.originalUserId,
              currentUserId: officialAssignmentInSlot, // What's in the main assignments grid
            };
          }
        } else if (officialAssignmentInSlot !== null || newUserName !== "") {
          // Only add if there was something or custom name is not empty
          // First manual override for this slot (setting a custom name)
          newManuallyEditedSlots[slotKey] = {
            originalUserId: officialAssignmentInSlot,
            currentUserId: officialAssignmentInSlot, // The assignments grid doesn't change for a custom name
          };
        }

        console.log(
          "[handleAssignmentNameUpdate] Prev assignments:",
          prevState.assignments
        );
        console.log(
          "[handleAssignmentNameUpdate] Prev customCellDisplayNames:",
          prevState.customCellDisplayNames
        );
        console.log(
          "[handleAssignmentNameUpdate] Prev manuallyEditedSlots:",
          prevState.manuallyEditedSlots
        );

        return {
          ...prevState,
          // assignments grid does NOT change when setting a custom name that doesn't match a user
          customCellDisplayNames: newCustomCellDisplayNames,
          manuallyEditedSlots: newManuallyEditedSlots,
        };
      });
    }
  };

  const handleRemovePosts = (postIdsToRemove: string[]) => {
    setRecoilState((prev) => {
      const indicesToRemove = (prev.posts || [])
        .map((p, index) => (postIdsToRemove.includes(p.id) ? index : -1))
        .filter((index) => index !== -1)
        .sort((a, b) => b - a); // Sort descending to splice correctly

      if (indicesToRemove.length === 0) {
        return prev; // No posts found to remove
      }

      let updatedAssignments = prev.assignments
        ? prev.assignments.map((row) => [...row])
        : [];
      indicesToRemove.forEach((index) => {
        if (index < updatedAssignments.length) {
          updatedAssignments.splice(index, 1);
        }
      });

      const updatedUserShiftData = (prev.userShiftData || []).map(
        (userData) => {
          const newConstraints = userData.constraints.filter(
            (_, index) => !indicesToRemove.includes(index)
          );
          return { ...userData, constraints: newConstraints };
        }
      );

      const updatedPosts = (prev.posts || []).filter(
        (post) => !postIdsToRemove.includes(post.id)
      );

      return {
        ...prev,
        posts: updatedPosts,
        assignments: updatedAssignments,
        userShiftData: updatedUserShiftData,
        manuallyEditedSlots: prev.manuallyEditedSlots || {},
        customCellDisplayNames: prev.customCellDisplayNames || {},
      };
    });
    setCheckedPostIds([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div
        id="header"
        className="grid grid-cols-[auto_1fr] gap-x-4 items-start mb-4"
      >
        <img
          src={tumbleweedIcon}
          alt="Tumbleweed Icon"
          className="w-16 h-full"
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Tumbleweed</h1>
          <h2 className="text-md text-gray-400">Shift Manager</h2>
        </div>
      </div>
      <div id="content" className="flex-1 overflow-auto">
        <Card className="h-full flex flex-row">
          <Card className="h-full flex flex-col gap-2 p-2">
            <VerticalActionGroup className="flex-none gap-3">
              <SyncStatusIcon status={syncStatus} size={18} />
              <EditButton
                isEditing={isEditing}
                onToggle={() => setIsEditing(!isEditing)}
              />
            </VerticalActionGroup>
          </Card>
          <CardContent className="p-4 flex flex-1 flex-col gap-2">
            <div className="flex-none flex flex-col" id="assignments-table">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Shift Assignments</h3>
                <PostListActions
                  isEditing={isEditing}
                  onAddPost={addPost}
                  onRemovePosts={handleRemovePosts}
                  checkedPostIds={checkedPostIds}
                  onCheckAll={handlePostCheckAll}
                />
              </div>
              <AvailabilityTableView
                key={`assignments-${
                  recoilState.userShiftData
                    ?.map((u) => u.user.name)
                    .join("-") || "no-users"
                }-${
                  recoilState.posts?.map((p) => p.id).join("-") || "no-posts"
                }`}
                className="border-primary-rounded-lg flex-1"
                posts={recoilState.posts}
                hours={recoilState.hours || defaultHours}
                users={
                  recoilState.userShiftData?.map((userData) => userData.user) ||
                  []
                }
                mode="assignments"
                assignments={assignments}
                customCellDisplayNames={recoilState.customCellDisplayNames}
                selectedUserId={selectedUserId}
                onConstraintsChange={(newConstraints) => {
                  const newAssignmentsGrid = newConstraints.map((postCons) =>
                    postCons.map((c) => c.assignedUser || null)
                  );
                  newAssignmentsGrid.forEach((postAssignments, postIndex) => {
                    postAssignments.forEach((userId, hourIndex) => {});
                  });
                }}
                isEditing={isEditing}
                onPostEdit={handlePostEdit}
                checkedPostIds={checkedPostIds}
                onPostCheck={handlePostCheck}
                onPostUncheck={handlePostUncheck}
                onPostRemove={(postIds) => handleRemovePosts([postIds])}
                onAssignmentEdit={handleAssignmentNameUpdate}
              />
              <Button
                id="optimize-button"
                onClick={handleOptimize}
                variant="default"
                className="w-full mt-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isOptimizeDisabled}
                title={optimizeButtonTitle}
              >
                Optimize
              </Button>
            </div>

            <SplitScreen
              id="worker-info"
              leftWidth="30%"
              rightWidth="70%"
              leftPanel={
                <WorkerList
                  users={
                    recoilState.userShiftData?.map(
                      (userData) => userData.user
                    ) || []
                  }
                  selectedUserId={selectedUserId}
                  onSelectUser={handleUserSelect}
                  onEditUser={setEditingUserId}
                  onAddUser={addUser}
                  onUpdateUserName={updateUserName}
                  onRemoveUsers={removeUsers}
                  isEditing={isEditing}
                />
              }
              rightPanel={
                <AvailabilityTableView
                  key={`availability-${selectedUserId}-${
                    recoilState.userShiftData
                      ?.map((u) => u.user.name)
                      .join("-") || "no-users"
                  }`}
                  className="border-primary-rounded-lg"
                  user={
                    selectedUserId
                      ? recoilState.userShiftData?.find(
                          (u) => u.user.id === selectedUserId
                        )?.user
                      : undefined
                  }
                  availabilityConstraints={selectedUser?.constraints}
                  posts={recoilState.posts}
                  hours={recoilState.hours || defaultHours}
                  mode="availability"
                  onConstraintsChange={(newConstraints) => {
                    if (selectedUser) {
                      updateUserConstraints(
                        selectedUser.user.id,
                        newConstraints
                      );
                    }
                  }}
                  isEditing={isEditing}
                  onPostEdit={handlePostEdit}
                  selectedUserId={selectedUserId}
                  users={
                    recoilState.userShiftData?.map(
                      (userData) => userData.user
                    ) || []
                  }
                  checkedPostIds={checkedPostIds}
                  onPostCheck={handlePostCheck}
                  onPostUncheck={handlePostUncheck}
                  onPostRemove={(postIds) => handleRemovePosts([postIds])}
                />
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getDefaultConstraints(
  posts: UniqueString[],
  hours: UniqueString[]
): Constraint[][] {
  // First level represents posts (changed from hours-first to posts-first)
  return posts.map((post) => {
    // For each post, create constraints for all hours
    return hours.map((hour) => ({
      postID: post.id,
      hourID: hour.id,
      availability: true,
    }));
  });
}

function deriveUserDataMap(
  users: UserShiftData[] | undefined,
  defaultConstraints: Constraint[][],
  oldMap: ShiftMap
): ShiftMap {
  const newMap = new ShiftMap();
  users?.forEach((userShiftData) => {
    const existingShiftData = oldMap.getUser(userShiftData.user.id);
    let newUserConstraints = JSON.parse(JSON.stringify(defaultConstraints));

    newUserConstraints.forEach(
      (postConstraints: Constraint[], postIndex: number) => {
        postConstraints.forEach((hourConstraint, hourIndex: number) => {
          const id =
            userShiftData.user.id +
            hourConstraint.postID +
            hourConstraint.hourID;
          const oldShift = oldMap.getShift(id);
          hourConstraint.availability =
            (oldShift && oldShift.availability) ?? hourConstraint.availability;
        });
      }
    );

    const totalAssignments = existingShiftData
      ? existingShiftData.totalAssignments
      : 0;

    const updatedUserData = {
      user: userShiftData.user,
      constraints: newUserConstraints,
      totalAssignments,
    };

    newMap.addUser(updatedUserData);
  });

  return newMap;
}

const styles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

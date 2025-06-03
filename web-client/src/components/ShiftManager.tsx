import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React, { useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import { Constraint, ShiftMap, User, UserShiftData } from "../models";
import { UniqueString } from "../models/index";
import {
  shiftState,
  ShiftState as RecoilShiftState,
  initialLoadState,
  PersistedShiftData,
} from "../stores/shiftStore";
import { AvailabilityTableView } from "./AvailabilityTableView";
import { EditButton } from "./EditButton";
import { SplitScreen } from "./SplitScreen";
import { WorkerList } from "./WorkerList";
import { optimizeShift } from "@/service/shiftOptimizedService";
import { PostListActions } from "./PostListActions";
import { SyncStatus, SyncStatusIcon } from "./ui/SyncStatusIcon";
import { VerticalActionGroup } from "./ui/VerticalActionGroup";
import {
  loadStateFromLocalStorage,
  LOCAL_STORAGE_KEY,
} from "../lib/localStorageUtils";

interface ShiftState {
  userShiftData: UserShiftData[];
  hasInitialized: boolean;
  syncStatus: SyncStatus;
  assignments: (string | null)[][];
}

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
  const [shiftMap, setShiftMap] = useState<ShiftMap>(new ShiftMap());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [recoilState, setRecoilState] = useRecoilState(shiftState);
  const [isEditing, setIsEditing] = useState(false);
  const [completeShiftData, setCompleteShiftData] = useState<Constraint[][]>(
    getDefaultConstraints(defaultPosts, defaultHours)
  );
  const [posts, setPosts] = useState<UniqueString[]>(defaultPosts);
  const [newPostName, setNewPostName] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostName, setEditingPostName] = useState("");
  const [checkedPostIds, setCheckedPostIds] = useState<string[]>([]);

  // Effect for initial loading from localStorage AND setting default workers if needed
  useEffect(() => {
    let isMounted = true;
    console.log(
      "[ShiftManager useEffect] Initial data setup. Current recoilState:",
      recoilState
    );

    const setupInitialData = async () => {
      console.log("[ShiftManager useEffect] setupInitialData: Starting.");
      // 1. Set to syncing
      if (isMounted) {
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
          };
        });
      }

      try {
        // 2. Try loading from localStorage
        console.log(
          "[ShiftManager useEffect] setupInitialData: Attempting to load from localStorage."
        );
        const savedData = await loadStateFromLocalStorage<PersistedShiftData>(
          LOCAL_STORAGE_KEY
        );
        console.log(
          "[ShiftManager useEffect] setupInitialData: Data from localStorage:",
          savedData
        );

        if (!isMounted) return;

        if (savedData) {
          console.log(
            "[ShiftManager useEffect] setupInitialData: Found saved data. Setting state."
          );
          // Ensure posts and assignments from savedData are consistent, or re-initialize assignments if structure mismatch
          // For now, assume savedData.assignments is valid if present
          const currentPosts =
            savedData.userShiftData.length > 0 ? posts : defaultPosts; // Simplified: use current posts or default if no users (might need refinement)
          const finalAssignments =
            savedData.assignments &&
            savedData.assignments.length === currentPosts.length
              ? savedData.assignments
              : currentPosts.map(() => defaultHours.map(() => null));

          setRecoilState({
            ...savedData, // This includes userShiftData, hasInitialized
            assignments: finalAssignments, // Use assignments from savedData or re-initialized
            hasInitialized: true,
            syncStatus: "synced",
          });
        } else {
          // 3. No saved data, so set default workers and initial assignments
          console.log(
            "[ShiftManager useEffect] setupInitialData: No saved data. Setting default workers and assignments."
          );
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
          const initialAssignments = defaultPosts.map(() =>
            defaultHours.map(() => null)
          );
          setRecoilState({
            userShiftData: defaultWorkers,
            hasInitialized: true,
            syncStatus: "synced",
            assignments: initialAssignments,
          });
          console.log(
            "[ShiftManager useEffect] setupInitialData: Default workers and assignments set. State updated."
          );
        }
      } catch (error) {
        console.error(
          "[ShiftManager useEffect] setupInitialData: Error during initial data setup:",
          error
        );
        if (isMounted) {
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
          }));
        }
      }
    };

    if (!recoilState.hasInitialized) {
      console.log(
        "[ShiftManager useEffect] Initial data setup: hasInitialized is false. Running setup."
      );
      setupInitialData();
    } else {
      console.log(
        "[ShiftManager useEffect] Initial data setup: hasInitialized is true. Skipping setup. Current assignments length:",
        recoilState.assignments?.length
      );
      // Ensure assignments are consistent with posts if already initialized
      if (
        recoilState.assignments &&
        recoilState.assignments.length !== posts.length
      ) {
        console.log(
          "[ShiftManager useEffect] Post length changed, re-initializing assignments structure."
        );
        const adjustedAssignments = posts.map((post, i) =>
          recoilState.assignments[i] &&
          recoilState.assignments[i].length === defaultHours.length
            ? recoilState.assignments[i]
            : defaultHours.map(() => null)
        );
        // Ensure new posts get new assignment rows
        const currentAssignmentsLength = recoilState.assignments
          ? recoilState.assignments.length
          : 0;
        for (let i = currentAssignmentsLength; i < posts.length; i++) {
          adjustedAssignments.push(defaultHours.map(() => null));
        }
        setRecoilState((prev) => ({
          ...prev,
          assignments: adjustedAssignments.slice(0, posts.length),
        }));
      } else if (!recoilState.assignments && posts.length > 0) {
        // Case: assignments is null/undefined but posts exist (e.g. initial state before full init)
        console.log(
          "[ShiftManager useEffect] Initializing assignments structure as it was null/undefined."
        );
        const initialAssignments = posts.map(() =>
          defaultHours.map(() => null)
        );
        setRecoilState((prev) => ({
          ...prev,
          assignments: initialAssignments,
        }));
      }
    }

    return () => {
      console.log(
        "[ShiftManager useEffect] Cleanup: Component unmounting or deps changed. isMounted was:",
        isMounted
      );
      isMounted = false;
    };
    // Key dependency: recoilState.hasInitialized.
    // setRecoilState is stable and doesn't need to be a dependency.
    // defaultPosts and defaultHours are used for default data but should be stable or memoized.
    // If they change and we want to re-init, this logic would need adjustment, but for initial load this is fine.
  }, [
    recoilState.hasInitialized,
    posts,
    defaultHours,
    setRecoilState,
    recoilState.assignments,
  ]); // Added posts, defaultHours, recoilState.assignments

  const defaultConstraints = useMemo(
    () => getDefaultConstraints(posts, defaultHours),
    [posts, defaultHours] // Added defaultHours
  );

  const assignments =
    recoilState.assignments ||
    defaultPosts.map(() => defaultHours.map(() => null));

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
      ? recoilState.userShiftData.find(
          (userData) => userData.user.id === selectedUserId
        )
      : undefined;
  }, [selectedUserId, recoilState.userShiftData]);

  const addUser = () => {
    const newUser: UserShiftData = {
      user: {
        id: `worker-${recoilState.userShiftData.length + 1}`,
        name: "New User",
      },
      constraints: getDefaultConstraints(posts, defaultHours),
      totalAssignments: 0,
    };
    setRecoilState((prev) => ({
      ...prev,
      userShiftData: [newUser, ...prev.userShiftData],
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
      userShiftData: prev.userShiftData.map((userData) =>
        userData.user.id === userId
          ? { ...userData, constraints: newConstraints }
          : userData
      ),
    }));
  };

  const updateUserName = (userId: string, newName: string) => {
    console.log("1 - newName: ", newName);
    setRecoilState((prev) => ({
      ...prev,
      userShiftData: prev.userShiftData.map((userData) =>
        userData.user.id === userId
          ? { ...userData, user: { ...userData.user, name: newName } }
          : userData
      ),
    }));
  };

  const removeUsers = (userIds: string[]) => {
    setRecoilState((prev) => ({
      ...prev,
      userShiftData: prev.userShiftData.filter(
        (userData) => !userIds.includes(userData.user.id)
      ),
    }));
  };

  const addPost = () => {
    const postName = newPostName.trim() || `New Post ${posts.length + 1}`;

    const newPostData: UniqueString = {
      id: `post-${Date.now()}`,
      value: postName,
    };

    setPosts((prevPosts) => [...prevPosts, newPostData]);
    setNewPostName("");

    // Update assignments in Recoil state
    setRecoilState((prev) => {
      const newAssignments = prev.assignments ? [...prev.assignments] : [];
      newAssignments.push(defaultHours.map(() => null)); // Add a new row for the new post
      return { ...prev, assignments: newAssignments };
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
    posts.forEach((post, postIndex) => {
      console.log(`  Post ${postIndex}: ${post.value} (${post.id})`);
    });
    defaultHours.forEach((hour, hourIndex) => {
      console.log(`  Hour ${hourIndex}: ${hour.value} (${hour.id})`);
    });

    // Detailed constraints logging
    console.log("Constraint details:");
    newConstraints.forEach((postConstraints, postIndex) => {
      const postName =
        postIndex < posts.length
          ? posts[postIndex].value
          : `Unknown(${postIndex})`;
      console.log(`  Post ${postIndex} (${postName}):`);
      postConstraints.forEach((constraint, hourIndex) => {
        const hourName =
          hourIndex < defaultHours.length
            ? defaultHours[hourIndex].value
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
    console.log("Starting optimization process...");
    console.log("Current state:", {
      posts: posts,
      hours: defaultHours,
      userShiftData: recoilState.userShiftData,
    });

    try {
      const optimizedResult = await optimizeShift(recoilState.userShiftData);
      let newAssignments: (string | null)[][] = posts.map(() =>
        defaultHours.map(() => null)
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
                  assignedUserIndex < recoilState.userShiftData.length
                ) {
                  newAssignments[postIndex][shiftIndex] =
                    recoilState.userShiftData[assignedUserIndex].user.id;
                } else {
                  newAssignments[postIndex][shiftIndex] = null;
                }
              }
            });
          }
        });
      }
      setRecoilState((prev) => ({ ...prev, assignments: newAssignments }));
    } catch (error) {
      console.error("Error during optimization:", error);
      setRecoilState((prev) => ({
        ...prev,
        assignments: posts.map(() => defaultHours.map(() => null)),
      }));
    }
  };

  const handlePostEdit = (postId: string, newName: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, value: newName } : post
      )
    );
  };

  const handlePostRemove = (postIdToRemove: string) => {
    const postIndexToRemove = posts.findIndex((p) => p.id === postIdToRemove);

    setPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== postIdToRemove)
    );

    if (postIndexToRemove !== -1) {
      setRecoilState((prev) => {
        const updatedAssignments = prev.assignments
          ? [...prev.assignments]
          : [];
        if (postIndexToRemove < updatedAssignments.length) {
          updatedAssignments.splice(postIndexToRemove, 1); // Remove the row
        }
        return { ...prev, assignments: updatedAssignments };
      });
    }
  };

  const startEditingPost = (post: UniqueString) => {
    setEditingPostId(post.id);
    setEditingPostName(post.value);
  };

  const savePostEdit = () => {
    if (!editingPostId || !editingPostName.trim()) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === editingPostId
          ? { ...post, value: editingPostName.trim() }
          : post
      )
    );
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
    setRecoilState((prev) => {
      // Deep copy assignments to ensure we're not mutating the previous state directly
      const newAssignments = prev.assignments
        ? prev.assignments.map((row) => [...row])
        : posts.map(() => defaultHours.map(() => null));

      if (
        postIndex < newAssignments.length &&
        hourIndex < (newAssignments[postIndex]?.length || 0)
      ) {
        newAssignments[postIndex][hourIndex] = userId || null;
      } else {
        // This case should ideally not happen if `posts` and `assignments` are in sync.
        // Might indicate a need to resize `newAssignments` if `posts` grew and `useEffect` hasn't caught up.
        console.warn(
          "handleAssignmentChange: postIndex or hourIndex out of bounds. Assignments might be stale."
        );
        // Defensive: Ensure the row exists
        while (newAssignments.length <= postIndex) {
          newAssignments.push(defaultHours.map(() => null));
        }
        // Ensure the cell exists
        while (newAssignments[postIndex].length <= hourIndex) {
          newAssignments[postIndex].push(null);
        }
        newAssignments[postIndex][hourIndex] = userId || null;
      }
      return { ...prev, assignments: newAssignments };
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
      setCheckedPostIds(posts.map((post) => post.id));
    } else {
      setCheckedPostIds([]);
    }
  };

  const handleRemovePosts = (postIdsToRemove: string[]) => {
    // Get indices of posts to remove BEFORE updating the posts state
    const indicesToRemove = postIdsToRemove
      .map((id) => posts.findIndex((p) => p.id === id))
      .filter((index) => index !== -1)
      .sort((a, b) => b - a); // Sort descending to splice correctly

    setPosts((prevPosts) =>
      prevPosts.filter((post) => !postIdsToRemove.includes(post.id))
    );

    setRecoilState((prev) => {
      let updatedAssignments = prev.assignments
        ? prev.assignments.map((row) => [...row])
        : [];
      indicesToRemove.forEach((index) => {
        if (index < updatedAssignments.length) {
          updatedAssignments.splice(index, 1);
        }
      });
      return { ...prev, assignments: updatedAssignments };
    });
    setCheckedPostIds([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div
        id="header"
        className="flex-none flex flex-col justify-start items-start mb-4"
      >
        <h1 className="text-2xl font-bold">Tumbleweed</h1>
        <h2 className="text-md text-gray-400">Shift Manager</h2>
      </div>
      <div id="content" className="flex-1 overflow-auto">
        <Card className="h-full flex flex-row">
          <Card className="h-full flex flex-col gap-2 p-2">
            <VerticalActionGroup className="flex-none">
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
                key={`assignments-${recoilState.userShiftData
                  .map((u) => u.user.name)
                  .join("-")}-${posts.map((p) => p.id).join("-")}`}
                className="border-primary-rounded-lg flex-1"
                user={{ id: "shift-assignments", name: "Shift Assignments" }}
                constraints={assignments.map((postAssignments, postIndex) =>
                  (postAssignments || []).map((userId, hourIndex) => ({
                    postID: posts[postIndex]?.id || "",
                    hourID: defaultHours[hourIndex]?.id || "",
                    availability: !!userId,
                    assignedUser: userId || undefined,
                  }))
                )}
                posts={posts}
                hours={defaultHours}
                users={recoilState.userShiftData.map(
                  (userData) => userData.user
                )}
                mode="assignments"
                selectedUserId={selectedUserId}
                onConstraintsChange={(newConstraints) => {
                  // Convert constraints back to assignments (user IDs)
                  const newAssignments = newConstraints.map(
                    (postConstraints, postIndex) =>
                      postConstraints.map(
                        (constraint, hourIndex) =>
                          constraint.assignedUser || null
                      )
                  );
                  // Update assignments
                  newAssignments.forEach((postAssignments, postIndex) => {
                    postAssignments.forEach((userId, hourIndex) => {
                      handleAssignmentChange(postIndex, hourIndex, userId);
                    });
                  });
                }}
                isEditing={isEditing}
                onPostEdit={handlePostEdit}
                checkedPostIds={checkedPostIds}
                onPostCheck={handlePostCheck}
                onPostUncheck={handlePostUncheck}
                onPostRemove={(postIds) => handleRemovePosts([postIds])}
              />
              <Button
                id="optimize-button"
                onClick={handleOptimize}
                variant="default"
                className="w-full mt-2"
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
                  users={recoilState.userShiftData.map(
                    (userData) => userData.user
                  )}
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
                  key={`availability-${selectedUserId}-${recoilState.userShiftData
                    .map((u) => u.user.name)
                    .join("-")}`}
                  className="border-primary-rounded-lg"
                  user={
                    selectedUserId
                      ? recoilState.userShiftData.find(
                          (u) => u.user.id === selectedUserId
                        )?.user
                      : undefined
                  }
                  constraints={selectedUser?.constraints}
                  posts={posts}
                  hours={defaultHours}
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
                  users={recoilState.userShiftData.map(
                    (userData) => userData.user
                  )}
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

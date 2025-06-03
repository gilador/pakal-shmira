import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React, { useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import { Constraint, ShiftMap, User, UserShiftData } from "../models";
import { UniqueString } from "../models/index";
import { shiftState } from "../stores/shiftStore";
import { AvailabilityTableView } from "./AvailabilityTableView";
import { EditButton } from "./EditButton";
import { SplitScreen } from "./SplitScreen";
import { WorkerList } from "./WorkerList";
import { optimizeShift } from "@/service/shiftOptimizedService";

interface ShiftState {
  userShiftData: UserShiftData[];
  hasInitialized: boolean;
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
  const [state, setState] = useRecoilState(shiftState);
  const [isEditing, setIsEditing] = useState(false);
  const [completeShiftData, setCompleteShiftData] = useState<Constraint[][]>(
    getDefaultConstraints(defaultPosts, defaultHours)
  );
  const [posts, setPosts] = useState<UniqueString[]>(defaultPosts);
  const [newPostName, setNewPostName] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostName, setEditingPostName] = useState("");
  const [checkedPostIds, setCheckedPostIds] = useState<string[]>([]);

  const defaultConstraints = useMemo(
    () => getDefaultConstraints(posts, defaultHours),
    [posts]
  );

  const [assignments, setAssignments] = useState<(string | null)[][]>(() => {
    // Start with empty assignments - user must click "Optimize" to populate
    return posts.map(() => defaultHours.map(() => null));
  });

  useEffect(() => {
    setShiftMap((oldMap) =>
      deriveUserDataMap(state.userShiftData, defaultConstraints, oldMap)
    );
  }, [state.userShiftData, defaultConstraints]);

  // Initialize store with default workers if empty
  useEffect(() => {
    if (state.userShiftData.length === 0 && !state.hasInitialized) {
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
      setState((prev) => ({
        ...prev,
        userShiftData: defaultWorkers,
        hasInitialized: true,
      }));
    }
  }, [state.userShiftData.length, setState]);

  const selectedUser = useMemo(() => {
    return selectedUserId
      ? state.userShiftData.find(
          (userData) => userData.user.id === selectedUserId
        )
      : undefined;
  }, [selectedUserId, state.userShiftData]);

  const addUser = () => {
    const newUser: UserShiftData = {
      user: {
        id: `worker-${state.userShiftData.length + 1}`,
        name: "New User",
      },
      constraints: getDefaultConstraints(posts, defaultHours),
      totalAssignments: 0,
    };
    setState((prev) => ({
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

    setState((prev) => ({
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
    setState((prev) => ({
      ...prev,
      userShiftData: prev.userShiftData.map((userData) =>
        userData.user.id === userId
          ? { ...userData, user: { ...userData.user, name: newName } }
          : userData
      ),
    }));
  };

  const removeUsers = (userIds: string[]) => {
    setState((prev) => ({
      ...prev,
      userShiftData: prev.userShiftData.filter(
        (userData) => !userIds.includes(userData.user.id)
      ),
    }));
  };

  const addPost = () => {
    if (!newPostName.trim()) return;

    const newPost: UniqueString = {
      id: `post-${Date.now()}`,
      value: newPostName.trim(),
    };

    setPosts((prev) => [...prev, newPost]);
    setNewPostName("");

    // Update complete shift data with new post
    setCompleteShiftData((prev) => {
      const newConstraints = [...prev];
      const newPostConstraints = defaultHours.map((hour) => ({
        availability: true,
        postID: newPost.id,
        hourID: hour.id,
      }));
      newConstraints.push(newPostConstraints);
      return newConstraints;
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
      userShiftData: state.userShiftData,
    });

    try {
      const optimizedResult = await optimizeShift(state.userShiftData);

      // Initialize assignments with null values
      const newAssignments: (string | null)[][] = posts.map(() =>
        defaultHours.map(() => null)
      );

      // Only process the result if optimization was successful
      if (optimizedResult.isOptim) {
        // Convert the boolean result to user assignments
        // The result is in format [posts][shifts][users]
        optimizedResult.result.forEach((postAssignments, postIndex) => {
          postAssignments.forEach((shiftAssignments, shiftIndex) => {
            // Find the first assigned user for this shift
            const assignedUserIndex = shiftAssignments.findIndex(
              (isAssigned) => isAssigned
            );

            if (
              assignedUserIndex >= 0 &&
              assignedUserIndex < state.userShiftData.length
            ) {
              newAssignments[postIndex][shiftIndex] =
                state.userShiftData[assignedUserIndex].user.id;
            } else {
              newAssignments[postIndex][shiftIndex] = null;
            }
          });
        });
      }

      setAssignments(newAssignments);
    } catch (error) {
      console.error("Error during optimization:", error);
      // Reset assignments to all null values
      setAssignments(posts.map(() => defaultHours.map(() => null)));
    }
  };

  const handlePostEdit = (postId: string, newName: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, value: newName } : post
      )
    );
  };

  const handlePostRemove = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setAssignments((prev) => {
      const postIndex = posts.findIndex((post) => post.id === postId);
      if (postIndex === -1) return prev;
      const newAssignments = [...prev];
      newAssignments.splice(postIndex, 1);
      return newAssignments;
    });
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
    setAssignments((prev) => {
      const newAssignments = [...prev];
      if (!newAssignments[postIndex]) {
        newAssignments[postIndex] = [];
      }
      newAssignments[postIndex][hourIndex] = userId || null;
      return newAssignments;
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

  const handleRemovePosts = (postIds: string[]) => {
    // Remove posts from the posts array
    setPosts((prev) => prev.filter((post) => !postIds.includes(post.id)));

    // Remove assignments for removed posts
    setAssignments((prev) => {
      const newAssignments = [...prev];
      const remainingPosts = posts.filter((post) => !postIds.includes(post.id));
      return remainingPosts.map((post) => {
        const postIndex = posts.findIndex((p) => p.id === post.id);
        return postIndex !== -1
          ? prev[postIndex]
          : defaultHours.map(() => null);
      });
    });

    // Clear checked post IDs
    setCheckedPostIds([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div
        id="header"
        className="flex-none flex justify-start items-start mb-4"
      >
        <h1 className="text-2xl font-bold">Shift Manager</h1>
      </div>
      <div id="content" className="flex-1 overflow-auto">
        <Card className="h-full flex flex-row">
          <Card className="h-full flex flex-col gap-2">
            <EditButton
              className="flex-none"
              isEditing={isEditing}
              onToggle={() => setIsEditing(!isEditing)}
            />
          </Card>
          <CardContent className="p-4 flex flex-1 flex-col gap-2">
            <div className="flex-none" id="assignments-table">
              <h3 className="text-lg font-semibold mb-2">Shift Assignments</h3>
              <AvailabilityTableView
                key={`assignments-${state.userShiftData
                  .map((u) => u.user.name)
                  .join("-")}`}
                className="border-primary-rounded-lg"
                user={{ id: "shift-assignments", name: "Shift Assignments" }}
                constraints={assignments.map((postAssignments, postIndex) =>
                  postAssignments.map((userId, hourIndex) => ({
                    postID: posts[postIndex]?.id || "",
                    hourID: defaultHours[hourIndex]?.id || "",
                    availability: !!userId,
                    assignedUser: userId || undefined,
                  }))
                )}
                posts={posts}
                hours={defaultHours}
                users={state.userShiftData.map((userData) => userData.user)}
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
            </div>

            <Button
              id="optimize-button"
              onClick={handleOptimize}
              variant="default"
              className="flex-none w-full"
            >
              Optimize
            </Button>

            <SplitScreen
              id="worker-info"
              leftWidth="30%"
              rightWidth="70%"
              leftPanel={
                <WorkerList
                  users={state.userShiftData.map((userData) => userData.user)}
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
                  key={`availability-${selectedUserId}-${state.userShiftData
                    .map((u) => u.user.name)
                    .join("-")}`}
                  className="border-primary-rounded-lg"
                  user={
                    selectedUserId
                      ? state.userShiftData.find(
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
                  users={state.userShiftData.map((userData) => userData.user)}
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

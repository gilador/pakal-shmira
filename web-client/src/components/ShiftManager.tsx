import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React, { useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import { mockShiftAssignments } from "../mocks/shiftAssignments";
import { Constraint, ShiftMap, User, UserShiftData } from "../models";
import { UniqueString } from "../models/index";
import { shiftState } from "../stores/shiftStore";
import { AvailabilityTableView } from "./AvailabilityTableView";
import { EditButton } from "./EditButton";
import { SplitScreen } from "./SplitScreen";
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

  console.log("ShiftManager rendered with selectedUserId:", selectedUserId);

  const defaultConstraints = useMemo(
    () => getDefaultConstraints(posts, defaultHours),
    [posts]
  );

  const [assignments, setAssignments] = useState<(User | null)[][]>(() => {
    // Initialize assignments from mock data
    return posts.map((post, postIndex) =>
      defaultHours.map((hour, hourIndex) => {
        const assignmentKey = `${post.id}-${hour.id}`;
        const assignedUserId = mockShiftAssignments[assignmentKey];
        return assignedUserId
          ? state.userShiftData.find((u) => u.user.id === assignedUserId)
              ?.user || null
          : null;
      })
    );
  });

  useEffect(() => {
    setShiftMap((oldMap) =>
      deriveUserDataMap(state.userShiftData, defaultConstraints, oldMap)
    );
  }, [state.userShiftData, defaultConstraints]);

  // Initialize store with default workers if empty
  useEffect(() => {
    if (state.userShiftData.length === 0) {
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
      ];
      setState((prev) => ({
        ...prev,
        userShiftData: defaultWorkers,
      }));
    }
  }, [state.userShiftData.length, setState]);

  const selectedUser = useMemo(() => {
    return state.userShiftData.find(
      (userData) => userData.user.id === selectedUserId
    );
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
    setState((prev) => ({
      ...prev,
      userShiftData: prev.userShiftData.map((userData) =>
        userData.user.id === userId
          ? { ...userData, user: { ...userData.user, name: newName } }
          : userData
      ),
    }));
  };

  const removeUser = (userId: string) => {
    setState((prev) => ({
      ...prev,
      userShiftData: prev.userShiftData.filter(
        (userData) => userData.user.id !== userId
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

    console.log(
      `Updating availability for user: ${selectedUser.user.name} (${selectedUser.user.id})`
    );
    console.log("New constraints:", newConstraints);

    setShiftMap((prev) => {
      const newShiftMap = prev.copy();
      const userShiftData = prev.getUser(selectedUser.user.id);
      if (userShiftData) {
        userShiftData.constraints = newConstraints;
        newShiftMap.updateUser(userShiftData);
        console.log("Updated shift map with new constraints");
      } else {
        console.warn("User shift data not found in shift map");
      }
      return newShiftMap;
    });
  };

  const handleOptimize = async () => {
    console.log("Starting optimization process...");
    console.log("Current state:", {
      posts: posts,
      hours: defaultHours,
      userShiftData: state.userShiftData,
    });

    try {
      // Create a cycling pattern of assignments
      const optimizedData = posts.map((post, postIndex) =>
        defaultHours.map((hour, hourIndex) => {
          // Calculate which user should be assigned based on the cycle
          const cycleIndex =
            (hourIndex * posts.length + postIndex) % state.userShiftData.length;
          return state.userShiftData[cycleIndex].user;
        })
      );

      console.log("Optimized data created:", optimizedData);
      setAssignments(optimizedData);
      console.log("Optimization complete - shift data updated");
    } catch (error) {
      console.error("Error during optimization:", error);
    }
  };

  const handlePostEdit = (postId: string, newName: string) => {
    console.log("Editing post:", postId, newName);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, value: newName } : post
      )
    );
  };

  const handlePostRemove = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
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
      newAssignments[postIndex][hourIndex] = userId
        ? state.userShiftData.find((u) => u.user.id === userId)?.user || null
        : null;
      return newAssignments;
    });
  };

  const handleUserSelect = (userId: string | null) => {
    console.log("handleUserSelect called with userId:", userId);
    setSelectedUserId(userId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Shift Manager</h1>
        <EditButton
          isEditing={isEditing}
          onToggle={() => setIsEditing(!isEditing)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Shift Assignments</h3>
              <AvailabilityTableView
                user={{ id: "shift-assignments", name: "Shift Assignments" }}
                constraints={assignments.map((postAssignments) =>
                  postAssignments.map((user) => ({
                    postID: posts[0].id,
                    hourID: defaultHours[0].id,
                    availability: !!user,
                    assignedUser: user?.id,
                  }))
                )}
                posts={posts}
                hours={defaultHours}
                users={state.userShiftData.map((userData) => userData.user)}
                mode="assignments"
                selectedUserId={selectedUserId}
                onConstraintsChange={(newConstraints) => {
                  // Convert constraints back to assignments
                  const newAssignments = newConstraints.map((postConstraints) =>
                    postConstraints.map((constraint) =>
                      constraint.assignedUser
                        ? state.userShiftData.find(
                            (u) => u.user.id === constraint.assignedUser
                          )?.user || null
                        : null
                    )
                  );
                  // Update assignments
                  newAssignments.forEach((postAssignments, postIndex) => {
                    postAssignments.forEach((user, hourIndex) => {
                      handleAssignmentChange(
                        postIndex,
                        hourIndex,
                        user?.id || null
                      );
                    });
                  });
                }}
                isEditing={isEditing}
                onPostEdit={handlePostEdit}
                onPostRemove={handlePostRemove}
              />
            </div>

            <Button
              onClick={handleOptimize}
              variant="default"
              className="w-full mb-4"
            >
              Optimize
            </Button>

            <SplitScreen
              leftWidth="30%"
              rightWidth="70%"
              className="h-[400px]"
              leftPanel={
                <WorkerList
                  users={state.userShiftData.map((userData) => userData.user)}
                  selectedUserId={selectedUserId}
                  onSelectUser={handleUserSelect}
                  onEditUser={setEditingUserId}
                  onAddUser={addUser}
                  onRemoveUser={removeUser}
                  isEditing={isEditing}
                />
              }
              rightPanel={
                selectedUser ? (
                  <AvailabilityTableView
                    user={selectedUser.user}
                    constraints={selectedUser.constraints}
                    posts={posts}
                    hours={defaultHours}
                    mode="availability"
                    onConstraintsChange={(newConstraints) =>
                      updateUserConstraints(
                        selectedUser.user.id,
                        newConstraints
                      )
                    }
                    isEditing={isEditing}
                    onPostEdit={handlePostEdit}
                    onPostRemove={handlePostRemove}
                    selectedUserId={selectedUserId}
                  />
                ) : (
                  <Card className="h-full">
                    <CardContent className="flex items-center justify-center h-full">
                      <CardTitle className="text-center">
                        Select a worker to view their availability
                      </CardTitle>
                    </CardContent>
                  </Card>
                )
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
  // First level represents hours
  return hours.map((hour) => {
    // For each hour, create constraints for all posts
    return posts.map((post) => ({
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

    newUserConstraints.forEach((newHourConstraint: Constraint[]) => {
      newHourConstraint.forEach((newPostConstraint) => {
        const id =
          userShiftData.user.id +
          newPostConstraint.postID +
          newPostConstraint.hourID;
        const oldShift = oldMap.getShift(id);
        newPostConstraint.availability =
          (oldShift && oldShift.availability) ?? newPostConstraint.availability;
      });
    });

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

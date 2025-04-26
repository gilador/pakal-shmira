import { Input } from "@/components/ui/input";
import { colors } from "@/constants/colors";
import React, { useEffect, useState } from "react";
import { Constraint, User } from "../models";
import { UniqueString } from "../models/index";
import { withActions, WithActionsProps } from "./hoc/withActions";

export interface AvailabilityTableViewProps {
  user: User;
  constraints: Constraint[][];
  posts: UniqueString[];
  hours: UniqueString[];
  onConstraintsChange: (newConstraints: Constraint[][]) => void;
  isEditing?: boolean;
  onPostEdit?: (postId: string, newName: string) => void;
  onPostRemove?: (postId: string) => void;
  users?: User[]; // Add this prop for shift assignments
  mode?: "availability" | "assignments"; // Add mode prop to distinguish between views
  selectedUserId?: string | null; // Add selectedUserId prop
  className?: string; // Add className prop
}

const AssignmentCell = ({
  isEditing,
  onNameChange,
  onCheck: onDelete,
  userId,
  isSelected,
  onClick,
  name,
  isAssigned,
}: WithActionsProps & {
  isSelected: boolean;
  onClick: () => void;
  name?: string;
  isAssigned: boolean;
}) => {
  return (
    <div className={`flex items-center gap-2 w-full `}>
      <span className={`cursor-pointer pl-3 `} onClick={onClick}>
        {name}
      </span>
    </div>
  );
};

const AssignmentCellWithActions = withActions(AssignmentCell);

export function AvailabilityTableView({
  user,
  constraints,
  posts,
  hours,
  onConstraintsChange,
  isEditing = false,
  onPostEdit,
  onPostRemove,
  users = [], // Default to empty array
  mode = "availability", // Default to availability mode
  selectedUserId = null, // Add selectedUserId prop with default value
  className = "", // Add className prop with default value
}: AvailabilityTableViewProps) {
  useEffect(() => {
    console.log(
      "AvailabilityTableView selectedUserId changed to:",
      selectedUserId
    );
  }, [selectedUserId]);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostName, setEditingPostName] = useState("");

  const toggleAvailability = (postIndex: number, hourIndex: number) => {
    // Validate input data
    if (!constraints || !Array.isArray(constraints)) {
      console.warn("Invalid constraints data");
      return;
    }

    // Ensure the post index is valid
    if (postIndex < 0 || postIndex >= constraints.length) {
      console.warn("Invalid post index:", postIndex);
      return;
    }

    // Ensure the hour index is valid
    if (hourIndex < 0 || hourIndex >= hours.length) {
      console.warn("Invalid hour index:", hourIndex);
      return;
    }

    console.log("===== TOGGLE AVAILABILITY =====");
    console.log(`User: ${user.name} (${user.id})`);
    console.log(
      `Post: ${posts[postIndex].value} (${posts[postIndex].id}) at index ${postIndex}`
    );
    console.log(
      `Hour: ${hours[hourIndex].value} (${hours[hourIndex].id}) at index ${hourIndex}`
    );
    console.log(
      "Current availability:",
      constraints[postIndex][hourIndex].availability
    );
    console.log(
      "Constraints structure:",
      constraints.map((row) => row.length)
    );

    // Create a new constraints array with the correct structure
    const newConstraints = constraints.map((postConstraints, pIndex) => {
      if (pIndex === postIndex) {
        // Create a new array for this post's constraints
        const updatedPostConstraints = [...postConstraints];

        // If we need more hours, add them
        while (updatedPostConstraints.length < hours.length) {
          updatedPostConstraints.push({
            postID: posts[pIndex].id,
            hourID: hours[updatedPostConstraints.length].id,
            availability: true,
          });
        }

        // Toggle the availability for the specified hour
        return updatedPostConstraints.map((constraint, hIndex) => {
          if (hIndex === hourIndex) {
            return {
              ...constraint,
              availability: !constraint.availability,
            };
          }
          return constraint;
        });
      }
      return postConstraints;
    });

    // Print the new constraints structure
    console.log("USER CONSTRAINTS (AFTER):");
    console.log(JSON.stringify(newConstraints, null, 2));
    console.log(
      `Toggled [${postIndex}][${hourIndex}] from ${constraints[postIndex]?.[hourIndex]?.availability} to ${newConstraints[postIndex][hourIndex].availability}`
    );

    onConstraintsChange(newConstraints);
  };

  // Initialize constraints if not provided
  const safeConstraints =
    constraints || posts.map(() => hours.map(() => ({ availability: true })));

  const handlePostEdit = (post: UniqueString) => {
    if (!isEditing) return;
    setEditingPostId(post.id);
    setEditingPostName(post.value);
  };

  const savePostEdit = () => {
    if (!isEditing || !editingPostId || !editingPostName.trim()) return;
    onPostEdit?.(editingPostId, editingPostName.trim());
    setEditingPostId(null);
    setEditingPostName("");
  };

  const handlePostNameKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditing) return;
    if (e.key === "Enter") {
      savePostEdit();
    } else if (e.key === "Escape") {
      setEditingPostId(null);
      setEditingPostName("");
    }
  };

  const handlePostNameChange = (postId: string, newName: string) => {
    console.log("handlePostNameChange called with:", { postId, newName });
    onPostEdit?.(postId, newName);
  };

  const handlePostRemove = (postId: string) => {
    onPostRemove?.(postId);
  };

  return (
    <div className={`w-full h-full ${className}`}>
      {mode === "availability" && (
        <h3 className="text-lg font-semibold mb-4">
          {user.name}'s Availability
        </h3>
      )}
      <div
        className="grid grid-cols-[auto_repeat(var(--hours),1fr)] gap-1 w-full"
        style={{ "--hours": hours.length } as React.CSSProperties}
      >
        {/* Header Row */}
        <div className="font-semibold p-2 text-center">Post</div>
        {hours.map((hour) => (
          <div key={hour.id} className="font-semibold p-2 text-center">
            {hour.value}
          </div>
        ))}

        {/* Assignment Table */}
        {posts.map((post, postIndex) => (
          <React.Fragment key={post.id}>
            <div className="font-semibold p-2">
              {mode === "assignments" ? (
                <AssignmentCellWithActions
                  isEditing={isEditing}
                  onNameChange={handlePostNameChange}
                  onCheck={handlePostRemove}
                  onUncheck={handlePostRemove}
                  userId={post.id}
                  isSelected={false}
                  onClick={() => {}}
                  isAssigned={false}
                  name={post.value}
                />
              ) : mode === "availability" && isEditing ? (
                <div className="flex items-center gap-2">
                  {editingPostId === post.id ? (
                    <Input
                      value={editingPostName}
                      onChange={(e) => setEditingPostName(e.target.value)}
                      onBlur={savePostEdit}
                      onKeyDown={handlePostNameKeyDown}
                      className="h-6 w-24"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() => handlePostEdit(post)}
                    >
                      {post.value}
                    </span>
                  )}
                </div>
              ) : (
                post.value
              )}
            </div>
            {hours.map((hour, hourIndex) => {
              const constraint = safeConstraints[postIndex]?.[hourIndex];
              const assignedUser = constraint?.assignedUser
                ? users.find((u) => u.id === constraint.assignedUser)
                : null;

              if (mode === "assignments") {
                if (assignedUser) {
                  return (
                    <div
                      key={`${post.id}-${hour.id}`}
                      className={`p-2 text-center ${
                        selectedUserId === assignedUser.id
                          ? colors.selected.default
                          : ""
                      }`}
                    >
                      <div className="relative group">
                        <AssignmentCell
                          isEditing={false}
                          onNameChange={(userId: string, newName: string) => {}}
                          onCheck={() => {}}
                          onUncheck={() => {}}
                          userId={assignedUser.id}
                          isSelected={selectedUserId === assignedUser.id}
                          onClick={() => {}}
                          name={assignedUser.name}
                          isAssigned={true}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${post.id}-${hour.id}`}
                    className="p-2 text-center"
                  >
                    <div className="relative group">
                      <AssignmentCell
                        isEditing={false}
                        onNameChange={(userId: string, newName: string) => {}}
                        onCheck={() => {}}
                        onUncheck={() => {}}
                        userId=""
                        isSelected={false}
                        onClick={() => {}}
                        name="-"
                        isAssigned={false}
                      />
                    </div>
                  </div>
                );
              } else {
                // Availability mode
                const isAvailable = constraint?.availability ?? true;
                return (
                  <div
                    key={`${post.id}-${hour.id}`}
                    className={`p-2 text-center cursor-pointer ${
                      isAvailable
                        ? `${colors.available.default} ${colors.available.hover}`
                        : `${colors.unavailable.default} ${colors.unavailable.hover}`
                    }`}
                    onClick={() => toggleAvailability(postIndex, hourIndex)}
                  >
                    {isAvailable ? "✓" : "✗"}
                  </div>
                );
              }
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

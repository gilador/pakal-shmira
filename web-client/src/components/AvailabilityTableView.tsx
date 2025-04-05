import React, { useState } from "react";
import { User, Constraint, UniqueString } from "../models";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { withActions, WithActionsProps } from "./withActions";
import { colors } from "@/constants/colors";

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
}

const AssignmentCell = ({
  isEditing,
  onNameChange,
  onDelete,
  initialName,
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
}) => (
  <div className="flex items-center gap-2 w-full">
    <span
      className={`cursor-pointer pl-3 mr-10 ${
        isSelected ? "font-semibold" : ""
      } ${isAssigned ? "bg-primary/10" : ""}`}
      onClick={onClick}
    >
      {name}
    </span>
  </div>
);

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
}: AvailabilityTableViewProps) {
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

  return (
    <div className="w-full h-full">
      {mode === "availability" && (
        <h3 className="text-lg font-semibold mb-4">
          {user.name}'s Availability
        </h3>
      )}
      <div
        className="grid grid-cols-[auto_repeat(var(--hours),1fr)] gap-1 w-full"
        style={{ "--hours": hours.length } as React.CSSProperties}
      >
        {/* Header row */}
        <div className="font-semibold p-2">Post</div>
        {hours.map((hour) => (
          <div key={hour.id} className="font-semibold p-2 text-center">
            {hour.value}
          </div>
        ))}

        {/* Data rows */}
        {posts.map((post, postIndex) => (
          <React.Fragment key={post.id}>
            <div className="font-semibold p-2">
              {isEditing ? (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onPostRemove?.(post.id)}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
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
                      className="p-2 text-center"
                    >
                      <div className="relative group">
                        <AssignmentCellWithActions
                          isEditing={isEditing}
                          onNameChange={(userId, newName) => {
                            // Handle name change if needed
                          }}
                          onDelete={(userId) => {
                            const newConstraints = [...safeConstraints];
                            newConstraints[postIndex][hourIndex] = {
                              ...newConstraints[postIndex][hourIndex],
                              assignedUser: undefined,
                            };
                            onConstraintsChange(newConstraints);
                          }}
                          initialName={assignedUser.name}
                          userId={assignedUser.id}
                          isSelected={false}
                          onClick={() => {
                            if (isEditing) {
                              const newConstraints = [...safeConstraints];
                              newConstraints[postIndex][hourIndex] = {
                                ...newConstraints[postIndex][hourIndex],
                                assignedUser: undefined,
                              };
                              onConstraintsChange(newConstraints);
                            }
                          }}
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
                    -
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
                        ? colors.available.default
                        : colors.unavailable.default
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

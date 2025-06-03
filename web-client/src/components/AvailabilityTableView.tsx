import { colors } from "@/constants/colors";
import React, { useEffect, useState } from "react";
import { Constraint, User } from "../models";
import { UniqueString } from "../models/index";
import { EditableText } from "./ui/EditableText";
import { Checkbox } from "@/components/ui/checkbox";
import { EditButton } from "./EditButton";

export interface AvailabilityTableViewProps {
  user?: User;
  constraints?: Constraint[][];
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
  checkedPostIds?: string[]; // Add checked posts
  onPostCheck?: (postId: string) => void; // Add post check handler
  onPostUncheck?: (postId: string) => void; // Add post uncheck handler
}

const AssignmentCell = ({
  name,
  isSelected,
  onClick,
  isAssigned,
}: {
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

const PostNameComp = ({
  post,
  isEditing,
  onUpdatePostName,
  onPostRemove,
  isChecked,
  onCheck,
  onUncheck,
}: {
  post: UniqueString;
  isEditing: boolean;
  onUpdatePostName: (postId: string, newName: string) => void;
  onPostRemove?: (postId: string) => void;
  isChecked: boolean;
  onCheck: () => void;
  onUncheck: () => void;
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="flex items-center gap-2 w-full h-[32px]">
      {/* Editing controls */}
      <div
        className={`flex items-center gap-2 transition-all duration-100 ease-in-out ${
          isEditing ? "translate-x-0" : "-translate-x-5"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isEditing && (
          <>
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => (checked ? onCheck() : onUncheck())}
              className="h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
            <EditButton
              isEditing={isEditMode}
              onToggle={() => setIsEditMode(!isEditMode)}
              className="h-[32px]"
              onClick={(e) => e.stopPropagation()}
            />
          </>
        )}
      </div>

      {/* Name display/edit */}
      <div className="flex-1 h-[32px] w-full flex items-center">
        <EditableText
          value={post.value}
          onSave={(newName) => onUpdatePostName(post.id, newName)}
          isEditing={isEditMode}
          onEditingChange={setIsEditMode}
          className="w-full"
          inputClassName="h-8"
          displayClassName="font-semibold"
        >
          {(name, editing) => (
            <span
              className="font-semibold"
              onClick={editing ? undefined : undefined}
            >
              {name}
            </span>
          )}
        </EditableText>
      </div>
    </div>
  );
};

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
  checkedPostIds = [], // Default to empty array
  onPostCheck,
  onPostUncheck,
}: AvailabilityTableViewProps) {
  useEffect(() => {
    console.log(
      "AvailabilityTableView selectedUserId changed to:",
      selectedUserId
    );
  }, [selectedUserId]);

  // Add debugging for users prop changes
  useEffect(() => {
    console.log(
      "AvailabilityTableView users prop changed:",
      users.map((u) => ({ id: u.id, name: u.name }))
    );
  }, [users]);

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
    console.log(`User: ${user?.name} (${user?.id})`);
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
    constraints ||
    posts.map(() =>
      hours.map(() => ({ availability: true, assignedUser: null }))
    );

  const handlePostNameChange = (postId: string, newName: string) => {
    console.log("handlePostNameChange called with:", { postId, newName });
    onPostEdit?.(postId, newName);
  };

  const handlePostRemove = (postId: string) => {
    onPostRemove?.(postId);
  };

  return (
    <div className={`w-full h-full flex flex-col`}>
      {mode === "availability" && (
        <h3 className="text-lg font-semibold h-10 flex items-center">
          {constraints ? `${user?.name}'s Availability` : "\b"}
        </h3>
      )}
      {mode === "availability" && !constraints ? (
        <div className="h-full flex-1 justify-center flex border-primary-rounded-lg">
          <div className="font-semibold text-center self-center ">
            Select a worker to view their availability
          </div>
        </div>
      ) : (
        <div className={`flex-1 ${className}`}>
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
                  <PostNameComp
                    post={post}
                    isEditing={isEditing}
                    onUpdatePostName={handlePostNameChange}
                    onPostRemove={handlePostRemove}
                    isChecked={checkedPostIds.includes(post.id)}
                    onCheck={() => onPostCheck?.(post.id)}
                    onUncheck={() => onPostUncheck?.(post.id)}
                  />
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
      )}
    </div>
  );
}

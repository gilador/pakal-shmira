import { colors } from "@/constants/colors";
import React, { useEffect, useState, useRef } from "react";
import { IconRotateClockwise2 } from "@tabler/icons-react";
import tumbleweedAnimation from "../../assets/tumbleweed-anim.gif";
import { Constraint, User, UserShiftData } from "../models";
import { UniqueString } from "../models/index";
import { EditButton } from "./EditButton";
import { EditableText } from "./EditableText";
import { ShiftInfoSettingsView } from "./ShiftInfoSettingsView";
import { ActionableText } from "./VerticalActionGroup";

export interface AvailabilityTableViewProps {
  user?: User;
  availabilityConstraints?: Constraint[][];
  assignments?: (string | null)[][];
  posts: UniqueString[];
  hours: UniqueString[];
  onConstraintsChange?: (newConstraints: Constraint[][]) => void;
  isEditing?: boolean;
  onPostEdit?: (postId: string, newName: string) => void;
  users?: User[];
  userShiftData?: UserShiftData[];
  mode?: "availability" | "assignments";
  selectedUserId?: string | null;
  className?: string;
  checkedPostIds?: string[];
  onPostCheck?: (postId: string) => void;
  onPostUncheck?: (postId: string) => void;
  onAssignmentEdit?: (
    postIndex: number,
    hourIndex: number,
    newUserName: string
  ) => void;
  customCellDisplayNames?: { [slotKey: string]: string };
  // Shift information for edit mode
  restTime?: number;
  startHour?: string;
  endHour?: string;
  onStartTimeChange?: (startTime: string) => void;
  onEndTimeChange?: (endTime: string) => void;
  onIntensityChange?: (intensity: number) => void;
}

const AssignmentCell = ({
  name,
  isAssigned,
  isShiftEditing,
  onSaveName,
}: {
  name: string;
  isAssigned: boolean;
  isShiftEditing: boolean;
  onSaveName: (newName: string) => void;
}) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [optimisticName, setOptimisticName] = useState<string | null>(null);
  const previousNameProp = useRef(name);

  useEffect(() => {
    if (previousNameProp.current !== name) {
      previousNameProp.current = name;
    }
  }, [name]);

  const nameValueForEditableText =
    optimisticName !== null ? optimisticName : name;

  const handleSave = (newName: string) => {
    // Always exit edit mode first
    setIsEditingLocal(false);

    // If the new name is the same as the original name, just reset optimistic state
    if (newName === name) {
      setOptimisticName(null);
      return;
    }

    // If there's no actual change from what's currently displayed, reset optimistic state
    if (newName === nameValueForEditableText) {
      setOptimisticName(null);
      return;
    }

    // Set optimistic name and call the save handler
    setOptimisticName(newName);
    onSaveName(newName);
  };

  const handleCancel = () => {
    // Reset to original state when canceling
    setOptimisticName(null);
    setIsEditingLocal(false);
  };

  if (!isAssigned) {
    return (
      <div className={`flex items-center w-full h-[32px]`}>
        <span className={` w-full truncate cursor-default`}>-</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center w-full h-[32px] relative`}>
      <EditableText
        value={nameValueForEditableText}
        onSave={handleSave}
        isEditing={isEditingLocal}
        onEditingChange={(editing) => {
          if (!editing) {
            // If editing is being turned off externally (like via Escape key), handle cancel
            handleCancel();
          }
        }}
        className="w-full truncate"
      >
        {(displayName, editing) => (
          <span
            className={`w-full truncate ${
              editing ? "cursor-text" : "cursor-pointer"
            }`}
            onClick={editing ? undefined : () => setIsEditingLocal(true)}
          >
            {displayName}
          </span>
        )}
      </EditableText>
      {isShiftEditing && !isEditingLocal && (
        <EditButton
          isEditing={isEditingLocal}
          onToggle={() => setIsEditingLocal(!isEditingLocal)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
        />
      )}
    </div>
  );
};

export function AvailabilityTableView({
  user,
  availabilityConstraints,
  assignments,
  posts,
  hours,
  onConstraintsChange,
  isEditing = false,
  onPostEdit,
  users = [],
  userShiftData = [],
  mode = "availability",
  selectedUserId,
  className = "",
  checkedPostIds = [],
  onPostCheck,
  onPostUncheck,
  onAssignmentEdit,
  customCellDisplayNames = {},
  restTime,
  startHour,
  endHour,
}: AvailabilityTableViewProps) {
  const [optimisticLocalConstraints, setOptimisticLocalConstraints] = useState<
    Constraint[][] | null
  >(null);

  const handlePostNameChange = (postId: string, newName: string) => {
    onPostEdit?.(postId, newName);
  };

  const handleAssignmentNameChange = (
    postIndex: number,
    hourIndex: number,
    newUserName: string
  ) => {
    onAssignmentEdit?.(postIndex, hourIndex, newUserName);
  };

  // Determine which constraints to use for display
  const effectiveAvailabilityConstraints =
    optimisticLocalConstraints || availabilityConstraints;

  // Helper function to check if making a user unavailable would create an infeasible slot
  const wouldCreateInfeasibleSlot = (
    postIndex: number,
    hourIndex: number
  ): boolean => {
    if (!userShiftData || !availabilityConstraints) return false;

    // Check if this user is currently available for this slot
    const currentConstraint = availabilityConstraints[postIndex]?.[hourIndex];
    const isCurrentlyAvailable = currentConstraint?.availability ?? true;

    // If they're already unavailable, toggling won't create infeasibility
    if (!isCurrentlyAvailable) return false;

    // Count how many users are currently available for this slot
    const availableUsersCount = userShiftData.filter((userData) => {
      const userConstraints = userData.constraints;
      if (!userConstraints || !userConstraints[postIndex]) return true; // Default to available
      const slotConstraint = userConstraints[postIndex][hourIndex];
      return slotConstraint?.availability ?? true;
    }).length;

    // If only 1 user is available and we're about to make them unavailable, it's infeasible
    if (availableUsersCount <= 1) {
      return availableUsersCount <= 1;
    }

    return false;
  };

  const toggleAvailability = (postIndex: number, hourIndex: number) => {
    if (
      mode !== "availability" ||
      !onConstraintsChange ||
      !availabilityConstraints
    )
      return;

    // Check if this would create an infeasible situation
    if (wouldCreateInfeasibleSlot(postIndex, hourIndex)) {
      alert(
        "Cannot make this user unavailable - at least one user must be available for each time slot to allow optimization."
      );
      return;
    }

    // Base the toggle on the most current view (optimistic or prop)
    // Ensure that we only proceed if actual availabilityConstraints prop is present (meaning data is loaded for a user)
    const baseConstraints =
      optimisticLocalConstraints || availabilityConstraints;
    if (!baseConstraints || !availabilityConstraints) return;

    const currentConstraints = baseConstraints; // currentConstraints is now effectively baseConstraints
    if (postIndex < 0 || postIndex >= currentConstraints.length) return;
    if (hourIndex < 0 || hourIndex >= hours.length) return;

    const newConstraints = currentConstraints.map((postCons, pIndex) => {
      if (pIndex === postIndex) {
        const updatedPostCons = [...postCons];
        while (updatedPostCons.length < hours.length) {
          updatedPostCons.push({
            availability: true,
            postID: posts[pIndex]?.id || "",
            hourID: hours[updatedPostCons.length]?.id || "",
          });
        }
        return updatedPostCons.map((constraint, hIndex) => {
          if (hIndex === hourIndex) {
            return {
              ...constraint,
              availability: !constraint.availability,
            };
          }
          return constraint;
        });
      }
      return postCons;
    });

    setOptimisticLocalConstraints(newConstraints); // Optimistically update UI
    onConstraintsChange(newConstraints); // Notify parent
  };

  // Reset optimistic state when props change
  useEffect(() => {
    setOptimisticLocalConstraints(null);
  }, [availabilityConstraints, user?.id]);

  // Determine if we should show border - only for availability mode
  const shouldShowBorder = mode === "availability";

  return (
    <div
      className={`w-full h-full flex flex-col ${
        shouldShowBorder ? "border-primary-rounded-lg" : ""
      } overflow-hidden ${className}`}
    >
      {mode === "availability" && (
        <div className="h-10 flex items-center px-2 flex-none">
          <h3 className="text-lg font-semibold">
            {/* Show user name if user and availabilityConstraints are present, else show generic or nothing */}
            {user && availabilityConstraints
              ? `${user.name}'s Availability`
              : availabilityConstraints
              ? `Availability`
              : "\b"}
          </h3>
        </div>
      )}
      {/* Show empty state with GIF only if mode is availability AND no availabilityConstraints are passed (i.e., no user selected) */}
      {mode === "availability" && !availabilityConstraints ? (
        <div className="h-full flex-1 justify-center flex flex-col items-center">
          <div className="font-semibold text-center self-center ">
            It's a bit empty in here...
          </div>
          <img
            src={tumbleweedAnimation}
            alt="Tumbleweed"
            className="h-12 mb-2 m-2 rounded-[10px]"
          />
          <div className="font-semibold text-center self-center ">
            Pick a staff member to view their availability.
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {/* Show edit mode view for assignments */}
          {mode === "assignments" && isEditing ? (
            <div className="flex gap-4 p-2">
              {/* Posts column */}
              <div className="flex flex-col gap-1 min-w-[200px]">
                <div className="relative">
                  <div className="font-semibold p-2 text-center absolute inset-0 flex items-center justify-center">
                    Posts
                  </div>
                  <div className="h-12 w-full"></div>
                </div>
                {posts.map((post) => (
                  <div key={post.id} className="py-2 pr-2">
                    <ActionableText
                      id={post.id}
                      value={post.value}
                      isEditing={isEditing}
                      isChecked={checkedPostIds.includes(post.id)}
                      onCheck={() => onPostCheck?.(post.id)}
                      onUncheck={() => onPostUncheck?.(post.id)}
                      onUpdate={(id, newValue) =>
                        handlePostNameChange(id, newValue)
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Shift settings */}
              <div className="flex-1">
                <ShiftInfoSettingsView
                  restTime={restTime ?? 2}
                  startHour={startHour ?? "08:00"}
                  endHour={endHour ?? "16:00"}
                />
              </div>
            </div>
          ) : (
            /* Normal table view */
            <div className="p-2">
              <div
                className={`grid gap-1 w-full ${
                  mode === "assignments"
                    ? "grid-cols-[auto_repeat(var(--hours),1fr)]"
                    : "grid-cols-[repeat(var(--hours),1fr)]"
                }`}
                style={{ "--hours": hours.length } as React.CSSProperties}
              >
                {mode === "assignments" && (
                  <div className="font-semibold p-2 text-center">Post</div>
                )}
                {hours.map((hour) => (
                  <div key={hour.id} className="font-semibold p-2 text-center">
                    {hour.value}
                  </div>
                ))}

                {mode === "assignments"
                  ? posts.map((post, postIndex) => (
                      <React.Fragment key={post.id}>
                        <div className="py-2 pr-2">
                          <ActionableText
                            id={post.id}
                            value={post.value}
                            isEditing={isEditing}
                            isChecked={checkedPostIds.includes(post.id)}
                            onCheck={() => onPostCheck?.(post.id)}
                            onUncheck={() => onPostUncheck?.(post.id)}
                            onUpdate={(id, newValue) =>
                              handlePostNameChange(id, newValue)
                            }
                          />
                        </div>
                        {hours.map((hour, hourIndex) => {
                          if (mode === "assignments") {
                            if (!assignments) return null;
                            const slotKey = `${postIndex}-${hourIndex}`;
                            const customDisplayName =
                              customCellDisplayNames[slotKey];
                            const officialAssignedUserId =
                              assignments[postIndex]?.[hourIndex] || null;
                            const assignedWorker = officialAssignedUserId
                              ? users.find(
                                  (u) => u.id === officialAssignedUserId
                                )
                              : null;
                            let finalDisplayNameForCell = "-";
                            if (customDisplayName !== undefined) {
                              finalDisplayNameForCell = customDisplayName;
                            } else if (assignedWorker) {
                              finalDisplayNameForCell = assignedWorker.name;
                            }
                            const isCellSelected =
                              selectedUserId === officialAssignedUserId &&
                              officialAssignedUserId !== null;
                            return (
                              <div
                                key={`${post.id}-${hour.id}`}
                                className={`p-2 text-center rounded-md ${
                                  isCellSelected ? colors.selected.default : ""
                                }`}
                              >
                                <AssignmentCell
                                  name={finalDisplayNameForCell}
                                  isAssigned={officialAssignedUserId !== null}
                                  isShiftEditing={isEditing}
                                  onSaveName={(newName) =>
                                    handleAssignmentNameChange(
                                      postIndex,
                                      hourIndex,
                                      newName
                                    )
                                  }
                                />
                              </div>
                            );
                          } else {
                            // Availability mode
                            if (!effectiveAvailabilityConstraints) return null;
                            const currentCellConstraint =
                              effectiveAvailabilityConstraints[postIndex]?.[
                                hourIndex
                              ];
                            const isAvailable =
                              currentCellConstraint?.availability ?? true;
                            return (
                              <div
                                key={`${post.id}-${hour.id}`}
                                className={`p-2 cursor-pointer flex items-center justify-center ${
                                  isAvailable
                                    ? `${colors.available.default} ${colors.available.hover}`
                                    : `${colors.unavailable.default} ${colors.unavailable.hover}`
                                } rounded-md`}
                                onClick={() =>
                                  toggleAvailability(postIndex, hourIndex)
                                }
                              >
                                <div className="w-4 h-4 flex items-center justify-center">
                                  {isAvailable ? (
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                  ) : (
                                    <IconRotateClockwise2 className="w-3 h-3 text-red-600" />
                                  )}
                                </div>
                              </div>
                            );
                          }
                        })}
                      </React.Fragment>
                    ))
                  : // Availability mode - show only hours for the selected user
                    posts.map((post, postIndex) => (
                      <React.Fragment key={post.id}>
                        {hours.map((hour, hourIndex) => {
                          if (!effectiveAvailabilityConstraints) return null;
                          const currentCellConstraint =
                            effectiveAvailabilityConstraints[postIndex]?.[
                              hourIndex
                            ];
                          const isAvailable =
                            currentCellConstraint?.availability ?? true;
                          const toggleAvailability = (
                            postIdx: number,
                            hourIdx: number
                          ) => {
                            if (!effectiveAvailabilityConstraints) return;
                            const newConstraints = [
                              ...effectiveAvailabilityConstraints,
                            ];
                            newConstraints[postIdx] = [
                              ...newConstraints[postIdx],
                            ];
                            newConstraints[postIdx][hourIdx] = {
                              ...newConstraints[postIdx][hourIdx],
                              availability:
                                !newConstraints[postIdx][hourIdx]?.availability,
                            };
                            setOptimisticLocalConstraints(newConstraints);
                            onConstraintsChange?.(newConstraints);
                          };
                          return (
                            <div
                              key={`${post.id}-${hour.id}`}
                              className={`p-2 cursor-pointer flex items-center justify-center ${
                                isAvailable
                                  ? `${colors.available.default} ${colors.available.hover}`
                                  : `${colors.unavailable.default} ${colors.unavailable.hover}`
                              } rounded-md`}
                              onClick={() =>
                                toggleAvailability(postIndex, hourIndex)
                              }
                            >
                              <div className="w-4 h-4 flex items-center justify-center">
                                {isAvailable ? (
                                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                ) : (
                                  <IconRotateClockwise2 className="w-3 h-3 text-red-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

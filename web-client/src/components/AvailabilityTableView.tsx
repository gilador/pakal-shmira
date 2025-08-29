import { Checkbox } from "@/components/ui/checkbox";
import { colors } from "@/constants/colors";
import React, { useEffect, useState, useRef } from "react";
import { IconRotateClockwise2 } from "@tabler/icons-react";
import tumbleweedAnimation from "../../assets/tumbleweed-anim.gif";
import { Constraint, User } from "../models";
import { UniqueString } from "../models/index";
import { EditButton } from "./EditButton";
import { EditableText } from "./ui/EditableText";
import { ShiftInfoView } from "./ShiftInfoView";

export interface AvailabilityTableViewProps {
  user?: User;
  availabilityConstraints?: Constraint[][];
  assignments?: (string | null)[][];
  posts: UniqueString[];
  hours: UniqueString[];
  onConstraintsChange?: (newConstraints: Constraint[][]) => void;
  isEditing?: boolean;
  onPostEdit?: (postId: string, newName: string) => void;
  onPostRemove?: (postId: string) => void;
  users?: User[];
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
}

const AssignmentCell = ({
  name,
  isAssigned,
  isShiftEditing,
  onSaveName,
}: {
  name?: string;
  isAssigned: boolean;
  assignedUserId?: string;
  isShiftEditing?: boolean;
  onSaveName?: (newUserName: string) => void;
  isSelected: boolean;
  mode: "assignments";
}) => {
  const [isNameEditingLocal, setIsNameEditingLocal] = useState(false);
  const [optimisticName, setOptimisticName] = useState<string | null>(null);
  const previousNameProp = useRef(name);

  useEffect(() => {
    previousNameProp.current = name;
  }, [name]);

  useEffect(() => {
    if (isNameEditingLocal) {
      setOptimisticName(null);
      return;
    }
    if (optimisticName !== null) {
      if (name === optimisticName) {
        setOptimisticName(null);
      } else if (name !== previousNameProp.current && name !== undefined) {
        setOptimisticName(null);
      }
    }
  }, [isNameEditingLocal, name, optimisticName]);

  const handleSave = (newName: string) => {
    onSaveName?.(newName);
    setOptimisticName(newName);
  };

  const turnOnEditing = () => {
    if (isShiftEditing && (isAssigned || (name && name !== "-"))) {
      setIsNameEditingLocal(true);
    }
  };

  const nameValueForEditableText =
    name && name !== "-" ? name : isAssigned ? "" : "-";
  const displayValueInSpan =
    !isNameEditingLocal && optimisticName !== null
      ? optimisticName
      : nameValueForEditableText;

  if (
    !isAssigned &&
    displayValueInSpan === "-" &&
    !isNameEditingLocal &&
    !optimisticName
  ) {
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
        isEditing={isNameEditingLocal}
        onEditingChange={setIsNameEditingLocal}
        className="w-full"
        inputClassName="h-8 text-center"
        disabled={!isShiftEditing}
      >
        {(_etValue, _etEditing) => (
          <span
            className={`w-full truncate text-center ${
              isShiftEditing && (isAssigned || (name && name !== "-"))
                ? "cursor-pointer hover:underline"
                : "cursor-default"
            }`}
            onClick={turnOnEditing}
          >
            {displayValueInSpan}
          </span>
        )}
      </EditableText>
      {!isNameEditingLocal && optimisticName !== null && (
        <IconRotateClockwise2
          size={12}
          className="absolute top-1 right-1 text-gray-500"
        />
      )}
    </div>
  );
};

const PostNameComp = ({
  post,
  isEditing,
  onUpdatePostName,
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
  availabilityConstraints,
  assignments,
  posts,
  hours,
  onConstraintsChange,
  isEditing = false,
  onPostEdit,
  onPostRemove,
  users = [],
  mode = "availability",
  selectedUserId = null,
  className = "",
  checkedPostIds = [],
  onPostCheck,
  onPostUncheck,
  onAssignmentEdit,
  customCellDisplayNames = {},
  restTime = 6,
  startHour = "08:00",
  endHour = "18:00",
}: AvailabilityTableViewProps) {
  const [optimisticLocalConstraints, setOptimisticLocalConstraints] = useState<
    Constraint[][] | null
  >(null);

  useEffect(() => {
    // When the source of truth (props) changes, it overrides any optimistic state.
    // This also handles initial load and user switching correctly.
    setOptimisticLocalConstraints(null);
  }, [availabilityConstraints]); // availabilityConstraints is the prop from ShiftManager

  useEffect(() => {
    console.log(
      "AvailabilityTableView selectedUserId changed to:",
      selectedUserId
    );
  }, [selectedUserId]);

  useEffect(() => {
    console.log(
      "AvailabilityTableView users prop changed:",
      users.map((u) => ({ id: u.id, name: u.name }))
    );
  }, [users]);

  const toggleAvailability = (postIndex: number, hourIndex: number) => {
    if (
      mode !== "availability" ||
      !onConstraintsChange ||
      !availabilityConstraints
    )
      return;

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
            postID: posts[pIndex].id,
            hourID: hours[updatedPostCons.length].id,
            availability: true,
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

  const handlePostNameChange = (postId: string, newName: string) => {
    onPostEdit?.(postId, newName);
  };

  // Determine the constraints to use for rendering in availability mode.
  // If availabilityConstraints is provided, use it. Otherwise, if posts/hours exist,
  // create a default structure for rendering the table grid, but this doesn't mean data is "loaded".
  const effectiveAvailabilityConstraints =
    mode === "availability"
      ? optimisticLocalConstraints || // Prioritize optimistic updates for display
        availabilityConstraints ||
        posts.map(() =>
          hours.map(
            () => ({ availability: true, postID: "", hourID: "" } as Constraint)
          )
        )
      : null;

  return (
    <div className={`w-full h-full flex flex-col`}>
      {mode === "availability" && (
        <h3 className="text-lg font-semibold h-10 flex items-center">
          {/* Show user name if user and availabilityConstraints are present, else show generic or nothing */}
          {user && availabilityConstraints
            ? `${user.name}'s Availability`
            : availabilityConstraints
            ? `Availability`
            : "\b"}
        </h3>
      )}
      {/* Show empty state with GIF only if mode is availability AND no availabilityConstraints are passed (i.e., no user selected) */}
      {mode === "availability" && !availabilityConstraints ? (
        <div className="h-full flex-1 justify-center flex flex-col items-center border-primary-rounded-lg">
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
        <div className={`flex-1 ${className}`}>
          {/* Show edit mode view for assignments */}
          {mode === "assignments" && isEditing ? (
            <div className="flex gap-4 h-full">
              {/* Posts column */}
              <div className="flex flex-col gap-1 min-w-[200px]">
                <div className="font-semibold p-2 text-center">Posts</div>
                {posts.map((post) => (
                  <div key={post.id} className="font-semibold p-2">
                    <PostNameComp
                      post={post}
                      isEditing={isEditing}
                      onUpdatePostName={handlePostNameChange}
                      onPostRemove={onPostRemove}
                      isChecked={checkedPostIds.includes(post.id)}
                      onCheck={() => onPostCheck?.(post.id)}
                      onUncheck={() => onPostUncheck?.(post.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Shift info view */}
              <div className="flex-1">
                <ShiftInfoView
                  restTime={restTime}
                  startHour={startHour}
                  endHour={endHour}
                  className="h-full"
                />
              </div>
            </div>
          ) : (
            /* Normal table view */
            <div
              className="grid grid-cols-[auto_repeat(var(--hours),1fr)] gap-1 w-full"
              style={{ "--hours": hours.length } as React.CSSProperties}
            >
              <div className="font-semibold p-2 text-center">Post</div>
              {hours.map((hour) => (
                <div key={hour.id} className="font-semibold p-2 text-center">
                  {hour.value}
                </div>
              ))}

              {posts.map((post, postIndex) => (
                <React.Fragment key={post.id}>
                  <div className="font-semibold p-2">
                    <PostNameComp
                      post={post}
                      isEditing={isEditing}
                      onUpdatePostName={handlePostNameChange}
                      onPostRemove={onPostRemove}
                      isChecked={checkedPostIds.includes(post.id)}
                      onCheck={() => onPostCheck?.(post.id)}
                      onUncheck={() => onPostUncheck?.(post.id)}
                    />
                  </div>
                  {hours.map((hour, hourIndex) => {
                    if (mode === "assignments") {
                      if (!assignments) return null;
                      const slotKey = `${postIndex}-${hourIndex}`;
                      const customDisplayName = customCellDisplayNames[slotKey];
                      const officialAssignedUserId =
                        assignments[postIndex]?.[hourIndex] || null;
                      const assignedWorker = officialAssignedUserId
                        ? users.find((u) => u.id === officialAssignedUserId)
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
                          <div className="relative group">
                            <AssignmentCell
                              name={finalDisplayNameForCell}
                              isAssigned={!!assignedWorker}
                              assignedUserId={assignedWorker?.id}
                              isShiftEditing={isEditing}
                              onSaveName={(newUserNameFromEdit) => {
                                if (onAssignmentEdit) {
                                  onAssignmentEdit(
                                    postIndex,
                                    hourIndex,
                                    newUserNameFromEdit
                                  );
                                }
                              }}
                              isSelected={isCellSelected}
                              mode="assignments"
                            />
                          </div>
                        </div>
                      );
                    } else {
                      // Availability Mode
                      // Use effectiveAvailabilityConstraints for rendering the grid if no specific constraints are loaded for a user
                      // but we still want to show the table structure.
                      if (!effectiveAvailabilityConstraints) return null;
                      const currentCellConstraint =
                        effectiveAvailabilityConstraints[postIndex]?.[
                          hourIndex
                        ];
                      const isAvailable =
                        currentCellConstraint?.availability ?? true; // Default to available if somehow undefined
                      return (
                        <div
                          key={`${post.id}-${hour.id}`}
                          className={`p-2 cursor-pointer flex items-center justify-center ${
                            isAvailable
                              ? `${colors.available.default} ${colors.available.hover}`
                              : `${colors.unavailable.default} ${colors.unavailable.hover}`
                          }`}
                          // Only allow toggle if actual availabilityConstraints are present (meaning a user is selected and their data is loaded)
                          onClick={() =>
                            availabilityConstraints &&
                            onConstraintsChange &&
                            toggleAvailability(postIndex, hourIndex)
                          }
                        >
                          {isAvailable ? "✓" : "✗"}
                        </div>
                      );
                    }
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

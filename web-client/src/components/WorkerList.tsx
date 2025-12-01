import { IconUser } from "@tabler/icons-react";
import { User } from "../models";
import { ActionableText } from "./VerticalActionGroup";
import { colors } from "@/constants/colors";

export interface WorkerListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  onEditUser: (userId: string | null) => void;
  isEditing: boolean;
  onUpdateUserName: (userId: string, newName: string) => void;
  checkedUserIds: string[];
  onCheckUser: (userId: string) => void;
  onUncheckUser: (userId: string) => void;
  assignments?: (string | null)[][];
}

export function WorkerList({
  users,
  selectedUserId,
  onSelectUser,
  // onEditUser,
  isEditing,
  onUpdateUserName,
  checkedUserIds,
  onCheckUser,
  onUncheckUser,
  assignments,
}: WorkerListProps) {
  const handleUserClick = (userId: string) => {
    console.log("handleUserClick called with userId:", userId);
    console.log("Current selectedUserId:", selectedUserId);
    const newSelectedUserId = selectedUserId === userId ? null : userId;
    console.log("Calling onSelectUser with:", newSelectedUserId);
    onSelectUser(newSelectedUserId);
  };

  // Helper to check if any assignments exist
  const hasAnyAssignments = () => {
    if (!assignments) return false;
    for (const postAssignments of assignments) {
      for (const assignedUserId of postAssignments) {
        if (assignedUserId !== null) {
          return true;
        }
      }
    }
    return false;
  };

  // Helper to count assignments for a user
  const getAssignmentCount = (userId: string) => {
    if (!assignments) return 0;
    let count = 0;
    for (const postAssignments of assignments) {
      for (const assignedUserId of postAssignments) {
        if (assignedUserId === userId) {
          count++;
        }
      }
    }
    return count;
  };

  return (
    <div className="flex flex-col h-full border-primary-rounded-lg overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="flex flex-col">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-4 h-full">
              <IconUser className="w-12 h-12 text-gray-400 mb-2" />
              <p className="font-semibold text-gray-900">
                No workers added yet
              </p>
              <p className="font-semibold text-sm text-gray-500">
                Click the + button to add a new worker
              </p>
            </div>
          ) : (
            users.map((user) => {
              const assignmentCount = getAssignmentCount(user.id);
              return (
                <div
                  key={user.id}
                  data-testid="staff-member"
                  className={`px-2 pb-1 pt-1 gap-1 rounded-md ${
                    selectedUserId === user.id
                      ? colors.cell.selected
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center w-full">
                    {assignments && hasAnyAssignments() && (
                      <div
                        className={`mr-2 min-w-[1.5rem] text-center text-xs font-semibold rounded-full px-1 py-0.5 ${
                          selectedUserId === user.id
                            ? "bg-white text-black"
                            : "bg-black text-white"
                        }`}
                      >
                        {assignmentCount}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <ActionableText
                        id={user.id}
                        value={user.name}
                        isSelected={selectedUserId === user.id}
                        isEditing={isEditing}
                        isChecked={checkedUserIds.includes(user.id)}
                        onCheck={() => onCheckUser(user.id)}
                        onUncheck={() => onUncheckUser(user.id)}
                        onUpdate={onUpdateUserName}
                        onClick={() => handleUserClick(user.id)}
                        allowClickWhenNotEditing={true}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

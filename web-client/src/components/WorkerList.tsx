import { colors } from "@/constants/colors";
import { IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { User } from "../models";
import { Checkbox } from "@/components/ui/checkbox";
import { EditButton } from "./EditButton";
import { EditableText } from "./ui/EditableText";
import { WorkerListActions } from "./WorkerListActions";

export interface WorkerListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  onEditUser: (userId: string | null) => void;
  onAddUser: () => void;
  onRemoveUsers: (userIds: string[]) => void;
  isEditing: boolean;
  onUpdateUserName: (userId: string, newName: string) => void;
}

const UserNameComp = ({
  user,
  isSelected,
  onClick,
  isEditing,
  onUpdateUserName,
  isChecked,
  onCheck,
  onUncheck,
}: {
  user: User;
  isSelected: boolean;
  onClick: () => void;
  isEditing: boolean;
  onUpdateUserName: (userId: string, newName: string) => void;
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
          isEditing ? "w-16 opacity-100" : "w-0 opacity-0"
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
          value={user.name}
          onSave={(newName) => onUpdateUserName(user.id, newName)}
          isEditing={isEditMode}
          onEditingChange={setIsEditMode}
          className="w-full"
          inputClassName="h-8"
          displayClassName={`cursor-pointer ${
            isSelected ? "font-semibold" : ""
          }`}
        >
          {(name, editing) => (
            <span
              className={`cursor-pointer truncate ${
                isSelected ? "font-semibold" : ""
              }`}
              onClick={editing ? undefined : onClick}
            >
              {name}
            </span>
          )}
        </EditableText>
      </div>
    </div>
  );
};

export function WorkerList({
  users,
  selectedUserId,
  onSelectUser,
  onEditUser,
  onAddUser,
  onRemoveUsers: onRemoveUsers,
  isEditing,
  onUpdateUserName,
}: WorkerListProps) {
  const [checkedUserIds, setCheckedUserIds] = useState<string[]>([]);

  const handleUserClick = (userId: string) => {
    console.log("handleUserClick called with userId:", userId);
    console.log("Current selectedUserId:", selectedUserId);
    const newSelectedUserId = selectedUserId === userId ? null : userId;
    console.log("Calling onSelectUser with:", newSelectedUserId);
    onSelectUser(newSelectedUserId);
  };
  console.log("WorkerList- >checkedUserIds:", checkedUserIds.length);

  useEffect(() => {
    // Filter out checked user IDs that no longer exist in the users list
    setCheckedUserIds((currentCheckedUserIds) =>
      currentCheckedUserIds.filter((id) => users.some((user) => user.id === id))
    );
  }, [users]);

  const handleCheck = (userId: string) => {
    setCheckedUserIds([...checkedUserIds, userId]);
  };

  const handleUncheck = (userId: string) => {
    setCheckedUserIds((ids) => ids.filter((id) => id !== userId));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-10">
        <h3 className="text-lg font-semibold">Staff</h3>
        <WorkerListActions
          isEditing={isEditing}
          onAddUser={onAddUser}
          onRemoveUsers={onRemoveUsers}
          onCheckAll={(allWasClicked) => {
            console.log("onCheckAll called");
            setCheckedUserIds(
              allWasClicked ? users.map((user) => user.id) : []
            );
          }}
          checkedUserIds={checkedUserIds}
        />
      </div>
      <div className="flex-1 overflow-y-scroll border-primary-rounded-lg">
        <div className="flex flex-col gap-1 min-h-full">
          {users.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <IconUser className="w-12 h-12 text-gray-400 mb-2" />
              <p className="font-semibold">No workers added yet</p>
              <p className="font-semibold text-sm text-gray-500">
                Click the + button to add a new worker
              </p>
            </div>
          ) : (
            users.map((user) => {
              return (
                <div
                  key={user.id}
                  data-testid="staff-member"
                  className={`p-2 rounded-md cursor-pointer ${
                    selectedUserId === user.id
                      ? colors.selected.default
                      : colors.background.hover
                  }`}
                  onClick={() => handleUserClick(user.id)}
                >
                  <UserNameComp
                    user={user}
                    isSelected={selectedUserId === user.id}
                    onClick={() => handleUserClick(user.id)}
                    isEditing={isEditing}
                    onUpdateUserName={onUpdateUserName}
                    isChecked={checkedUserIds.includes(user.id)}
                    onCheck={() => handleCheck(user.id)}
                    onUncheck={() => handleUncheck(user.id)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

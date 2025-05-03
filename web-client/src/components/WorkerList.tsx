import { colors } from "@/constants/colors";
import { IconUser } from "@tabler/icons-react";
import { useState } from "react";
import { User } from "../models";
import { withActions, WithActionsProps } from "./hoc/withActions";
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
  onCheck: onDelete,
  isSelected,
  onClick,
  name,
}: WithActionsProps & {
  isSelected: boolean;
  onClick: () => void;
}) => {
  console.log("UserNameComp-> name:", name);
  return (
    <div className="flex items-center gap-2 w-full">
      <span
        className={`cursor-pointer pl-3 mr-10 ${
          isSelected ? "font-semibold" : ""
        }`}
        onClick={onClick}
      >
        {name}
      </span>
    </div>
  );
};

const UserNameWithActions = withActions(UserNameComp);

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
  // const checkedUserIdsRef = useRef<string[]>([]);
  const [checkedUserIds, setCheckedUserIds] = useState<string[]>([]);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleUserClick = (userId: string) => {
    console.log("handleUserClick called with userId:", userId);
    console.log("Current selectedUserId:", selectedUserId);
    const newSelectedUserId = selectedUserId === userId ? null : userId;
    console.log("Calling onSelectUser with:", newSelectedUserId);
    onSelectUser(newSelectedUserId);
  };
  console.log("WorkerList- >checkedUserIds:", checkedUserIds.length);

  const handleCheck = (userId: string) => {
    // checkedUserIdsRef.current = [...checkedUserIdsRef.current, userId];
    setCheckedUserIds([...checkedUserIds, userId]);
  };

  const handleUncheck = (userId: string) => {
    // checkedUserIdsRef.current = checkedUserIdsRef.current.filter(
    //   (id) => id !== userId
    // );
    setCheckedUserIds((ids) => ids.filter((id) => id !== userId));
  };

  const handleDeleteAll = () => {
    const allUserIds = users.map((user) => user.id);
    console.log("Deleting all users with IDs:", allUserIds);
    onRemoveUsers(allUserIds);
    setIsDeleteAllDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-10">
        <h3 className="text-lg font-semibold">Personals</h3>
        <WorkerListActions
          isEditing={isEditing}
          onAddUser={onAddUser}
          onRemoveUsers={onRemoveUsers}
          onCheckAll={() => {
            console.log("onCheckAll called");
            setCheckedUserIds(users.map((user) => user.id));
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
                  className={`p-2 rounded-md cursor-pointer ${
                    selectedUserId === user.id
                      ? colors.selected.default
                      : colors.background.hover
                  }`}
                  onClick={() => handleUserClick(user.id)}
                >
                  <UserNameWithActions
                    isEditing={isEditing}
                    onNameChange={onUpdateUserName}
                    onCheck={() => handleCheck(user.id)}
                    onUncheck={() => handleUncheck(user.id)}
                    userId={user.id}
                    isSelected={selectedUserId === user.id}
                    isCheckedProp={checkedUserIds.includes(user.id)}
                    onClick={() => handleUserClick(user.id)}
                    name={user.name}
                    leftPadding={"pl-5"}
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

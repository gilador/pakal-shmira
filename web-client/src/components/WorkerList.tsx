import { User } from "../models";
import { withActions, WithActionsProps } from "./hoc/withActions";
import { colors } from "@/constants/colors";
import {
  IconUserPlus,
  IconUser,
  IconUserMinus,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
        className={`cursor-pointer pl-3 mr-10 ${isSelected ? "font-semibold" : ""
          }`}
        onClick={onClick}
      >
        {name}
      </span>
    </div>
  )
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
  const checkedUserIdsRef = useRef<string[]>([]);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleUserClick = (userId: string) => {
    console.log("handleUserClick called with userId:", userId);
    console.log("Current selectedUserId:", selectedUserId);
    const newSelectedUserId = selectedUserId === userId ? null : userId;
    console.log("Calling onSelectUser with:", newSelectedUserId);
    onSelectUser(newSelectedUserId);
  };

  const handleCheck = (userId: string) => {
    checkedUserIdsRef.current = [...checkedUserIdsRef.current, userId];
  };

  const handleUncheck = (userId: string) => {
    checkedUserIdsRef.current = checkedUserIdsRef.current.filter(
      (id) => id !== userId
    );
  };

  const handleDeleteAll = () => {
    const allUserIds = users.map((user) => user.id);
    console.log("Deleting all users with IDs:", allUserIds);
    onRemoveUsers(allUserIds);
    setIsDeleteAllDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full border-primary-rounded-lg">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Personals</h3>
        <div
          className={`flex rounded-md transition-all duration-100 ease-in-out flex-initial gap-2 ${
            isEditing ? "translate-y-0" : "-translate-y-12"
          }`}
        >
          <button
            onClick={onAddUser}
            aria-label="Add user"
            title="Add user"
            className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover}`}
          >
            <IconUserPlus size={15} />
          </button>
          <button
            onClick={() => onRemoveUsers(checkedUserIdsRef.current)}
            aria-label="Delete selected users"
            title="Delete selected users"
            className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover_negative}`}
          >
            <IconUserMinus size={15} />
          </button>
          <Dialog
            open={isDeleteAllDialogOpen}
            onOpenChange={setIsDeleteAllDialogOpen}
          >
            <DialogTrigger asChild>
              <button
                aria-label="Delete all users"
                title="Delete all users"
                className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover_negative}`}
              >
                <IconTrash size={15} />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete All Users</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <p>
                  Are you sure you want to delete all users? This action cannot
                  be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteAllDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAll}>
                    Delete All
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex-1 overflow-y-scroll">
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

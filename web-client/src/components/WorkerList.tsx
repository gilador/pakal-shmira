import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "../models";
import { withActions, WithActionsProps } from "./withActions";
import { colors } from "@/constants/colors";

export interface WorkerListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  onEditUser: (userId: string | null) => void;
  onAddUser: () => void;
  onRemoveUser: (userId: string) => void;
  isEditing: boolean;
}

const UserName = ({
  isEditing,
  onNameChange,
  onDelete,
  initialName,
  userId,
  isSelected,
  onClick,
  name,
}: WithActionsProps & {
  isSelected: boolean;
  onClick: () => void;
  name?: string;
}) => (
  <div className="flex items-center gap-2 w-full">
    <span
      className={`cursor-pointer pl-3 mr-10 ${
        isSelected ? "font-semibold" : ""
      }`}
      onClick={onClick}
    >
      {isEditing ? initialName : name}
    </span>
  </div>
);

const UserNameWithActions = withActions(UserName);

export function WorkerList({
  users,
  selectedUserId,
  onSelectUser,
  onEditUser,
  onAddUser,
  onRemoveUser,
  isEditing,
}: WorkerListProps) {
  console.log("WorkerList rendered with selectedUserId:", selectedUserId);

  const handleUserClick = (userId: string) => {
    console.log("handleUserClick called with userId:", userId);
    console.log("Current selectedUserId:", selectedUserId);
    const newSelectedUserId = selectedUserId === userId ? null : userId;
    console.log("Calling onSelectUser with:", newSelectedUserId);
    onSelectUser(newSelectedUserId);
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold mb-2">Personals</h3>
      {users.map((user) => {
        console.log("Rendering user:", {
          userId: user.id,
          selectedUserId,
          isSelected: selectedUserId === user.id,
        });
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
              onNameChange={onEditUser}
              onDelete={onRemoveUser}
              initialName={user.name}
              userId={user.id}
              isSelected={selectedUserId === user.id}
              onClick={() => handleUserClick(user.id)}
              name={user.name}
            />
          </div>
        );
      })}
      {isEditing && (
        <button
          className="p-2 rounded-md bg-primary/10 hover:bg-primary/20"
          onClick={onAddUser}
        >
          Add Worker
        </button>
      )}
    </div>
  );
}

import { IconUserPlus, IconUserMinus, IconSelectAll } from "@tabler/icons-react";
import { colors } from "@/constants/colors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface WorkerListActionsProps {
  isEditing: boolean;
  onAddUser: () => void;
  onRemoveUsers: (userIds: string[]) => void;
  checkedUserIds: string[];
  onCheckAll: () => void;
}

export function WorkerListActions({
  isEditing,
  onAddUser,
  onRemoveUsers,
  checkedUserIds,
  onCheckAll,
}: WorkerListActionsProps) {
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleDeleteAll = () => {
    onRemoveUsers(checkedUserIds);
    setIsDeleteAllDialogOpen(false);
  };

  return (
    <div
      className={`flex rounded-md transition-all duration-100 ease-in-out flex-initial gap-2 mx-1 ${
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
        onClick={() => onRemoveUsers(checkedUserIds)}
        aria-label="Delete selected users"
        title="Delete selected users"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover_negative}`}
      >
        <IconUserMinus size={15} />
      </button>
      <button
        aria-label="Select all users"
        title="Select all users"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover}`}
      >
        <IconSelectAll size={15} strokeWidth={2} onClick={onCheckAll} />
      </button>
      <Dialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Users</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>
              Are you sure you want to delete all users? This action cannot be
              undone.
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
  );
}

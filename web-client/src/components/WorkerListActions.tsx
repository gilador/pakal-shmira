import {
  IconUserPlus,
  IconUserMinus,
  IconSelectAll,
  IconDeselect,
} from "@tabler/icons-react";
import { colors } from "@/constants/colors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface WorkerListActionsProps {
  isEditing: boolean;
  onAddUser: () => void;
  onRemoveUsers: (userIds: string[]) => void;
  checkedUserIds: string[];
  onCheckAll: (allWasClicked: boolean) => void;
}

export function WorkerListActions({
  isEditing,
  onAddUser,
  onRemoveUsers,
  checkedUserIds,
  onCheckAll,
}: WorkerListActionsProps) {
  const [isDeleteManyDialogOpen, setIsDeleteManyDialogOpen] = useState(false);
  const [checkAllEnabled, setCheckAllEnabled] = useState(false);
  
  const handleDelete = () => {
    if (checkedUserIds.length < 2) {
      onRemoveUsers(checkedUserIds);
    } else {
      if (!isDeleteManyDialogOpen) {
        setIsDeleteManyDialogOpen(true);
      } else {
        onRemoveUsers(checkedUserIds);
        setIsDeleteManyDialogOpen(false);
      }
    }
    setCheckAllEnabled(false);
  };

  const handleCheckAll = () => {
    setCheckAllEnabled((prev) => {
      const newValue = !prev;
      onCheckAll(newValue);
      return newValue;
    });
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
        onClick={handleDelete}
        aria-label="Delete selected users"
        title="Delete selected users"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover_negative}`}
      >
        <IconUserMinus size={15} />
      </button>
      <button
        onClick={handleCheckAll}
        aria-label="Select all users"
        title="Select all users"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover}`}
      >
        {checkAllEnabled ? (
          <IconDeselect size={15} strokeWidth={2} />
        ) : (
          <IconSelectAll size={15} strokeWidth={2} />
        )}
      </button>
      <Dialog
        open={isDeleteManyDialogOpen}
        onOpenChange={setIsDeleteManyDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Users</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>
              Are you sure you want to delete {checkedUserIds.length} users?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteManyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete anyway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

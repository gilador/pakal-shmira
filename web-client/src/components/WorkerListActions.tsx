import {
  IconUserPlus,
  IconUserMinus,
  IconSelectAll,
  IconDeselect,
  IconRefresh,
} from "@tabler/icons-react";
import { colors } from "@/constants/colors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/elements/dialog";
import { Button } from "@/components/elements/button";
import { useState } from "react";

interface WorkerListActionsProps {
  isEditing: boolean;
  onAddUser: () => void;
  onRemoveUsers: (userIds: string[]) => void;
  checkedUserIds: string[];
  onCheckAll: (allWasClicked: boolean) => void;
  onResetAllAvailability?: () => void;
}

export function WorkerListActions({
  isEditing,
  onAddUser,
  onRemoveUsers,
  checkedUserIds,
  onCheckAll,
  onResetAllAvailability,
}: WorkerListActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetAvailabilityDialogOpen, setIsResetAvailabilityDialogOpen] =
    useState(false);
  const [checkAllEnabled, setCheckAllEnabled] = useState(false);

  const handleDelete = () => {
    if (checkedUserIds.length === 0) {
      return; // No users selected
    }
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onRemoveUsers(checkedUserIds);
    setIsDeleteDialogOpen(false);
    setCheckAllEnabled(false);
  };

  const handleCheckAll = () => {
    setCheckAllEnabled((prev) => {
      const newValue = !prev;
      onCheckAll(newValue);
      return newValue;
    });
  };

  const handleResetAvailability = () => {
    if (onResetAllAvailability) {
      onResetAllAvailability();
      setIsResetAvailabilityDialogOpen(false);
    }
  };

  return (
    <div
      id="worker-list-actions"
      className={`flex rounded-md transition-all duration-100 ease-in-out flex-initial gap- mx-1 ${
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
      {onResetAllAvailability && (
        <button
          onClick={() => setIsResetAvailabilityDialogOpen(true)}
          aria-label="Reset all user availability"
          title="Reset all user availability to available"
          className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover}`}
        >
          <IconRefresh size={15} />
        </button>
      )}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete {checkedUserIds.length}{" "}
              {checkedUserIds.length === 1 ? "staff member" : "staff members"}?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Once deleted, it can't be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                No
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Yes, please!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isResetAvailabilityDialogOpen}
        onOpenChange={setIsResetAvailabilityDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Availability</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>
              Are you sure you want to reset all users' availability to
              "available" for all time slots? This will clear any custom
              availability settings you may have configured.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetAvailabilityDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleResetAvailability}
              >
                Reset All Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

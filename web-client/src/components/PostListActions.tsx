import {
  IconCirclePlus,
  IconCircleMinus,
  IconSelectAll,
  IconDeselect,
  IconAdjustments,
  IconAdjustmentsFilled,
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

interface PostListActionsProps {
  isEditing: boolean;
  onAddPost: () => void;
  onRemovePosts: (postIds: string[]) => void;
  checkedPostIds: string[];
  onCheckAll: (allWasClicked: boolean) => void;
  onToggleShiftSettings?: () => void;
  showShiftSettings?: boolean;
}

export function PostListActions({
  isEditing,
  onAddPost,
  onRemovePosts,
  checkedPostIds,
  onCheckAll,
  onToggleShiftSettings,
  showShiftSettings = false,
}: PostListActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [checkAllEnabled, setCheckAllEnabled] = useState(false);

  const handleDelete = () => {
    if (checkedPostIds.length === 0) {
      return; // No posts selected
    }
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onRemovePosts(checkedPostIds);
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

  return (
    <div
      className={`flex rounded-md transition-all duration-100 ease-in-out flex-initial gap-2 mx-1 ${
        isEditing ? "translate-y-0" : "-translate-y-12"
      }`}
    >
      {onToggleShiftSettings && (
        <button
          onClick={onToggleShiftSettings}
          aria-label={
            showShiftSettings
              ? "Hide shift adjustment"
              : "Show shift adjustment"
          }
          title={
            showShiftSettings
              ? "Hide shift adjustment"
              : "Show shift adjustment"
          }
          className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover}`}
        >
          {showShiftSettings ? (
            <IconAdjustmentsFilled size={15} strokeWidth={2} />
          ) : (
            <IconAdjustments size={15} strokeWidth={2} />
          )}
        </button>
      )}
      <button
        onClick={onAddPost}
        aria-label="Add post"
        title="Add post"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover}`}
      >
        <IconCirclePlus size={15} />
      </button>
      <button
        onClick={handleDelete}
        aria-label="Delete selected posts"
        title="Delete selected posts"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover_negative}`}
      >
        <IconCircleMinus size={15} />
      </button>
      <button
        onClick={handleCheckAll}
        aria-label="Select all posts"
        title="Select all posts"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover}`}
      >
        {checkAllEnabled ? (
          <IconDeselect size={15} strokeWidth={2} />
        ) : (
          <IconSelectAll size={15} strokeWidth={2} />
        )}
      </button>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete {checkedPostIds.length}{" "}
              {checkedPostIds.length === 1 ? "post" : "posts"}?
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
    </div>
  );
}

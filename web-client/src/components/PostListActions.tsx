import {
  IconArmchair,
  IconArmchairOff,
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
import { useState } from "react";

interface PostListActionsProps {
  isEditing: boolean;
  onAddPost: () => void;
  onRemovePosts: (postIds: string[]) => void;
  checkedPostIds: string[];
  onCheckAll: (allWasClicked: boolean) => void;
}

export function PostListActions({
  isEditing,
  onAddPost,
  onRemovePosts,
  checkedPostIds,
  onCheckAll,
}: PostListActionsProps) {
  const [isDeleteManyDialogOpen, setIsDeleteManyDialogOpen] = useState(false);
  const [checkAllEnabled, setCheckAllEnabled] = useState(false);

  const handleDelete = () => {
    if (checkedPostIds.length < 2) {
      onRemovePosts(checkedPostIds);
    } else {
      if (!isDeleteManyDialogOpen) {
        setIsDeleteManyDialogOpen(true);
      } else {
        onRemovePosts(checkedPostIds);
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
        onClick={onAddPost}
        aria-label="Add post"
        title="Add post"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover}`}
      >
        <IconArmchair size={15} />
      </button>
      <button
        onClick={handleDelete}
        aria-label="Delete selected posts"
        title="Delete selected posts"
        className={`p-2 rounded-md ${colors.button.default} ${colors.button.hover_negative}`}
      >
        <IconArmchairOff size={15} />
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
      <Dialog
        open={isDeleteManyDialogOpen}
        onOpenChange={setIsDeleteManyDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Posts</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>
              Are you sure you want to delete {checkedPostIds.length} posts?
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

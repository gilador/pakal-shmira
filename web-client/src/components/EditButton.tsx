import { Button } from "@/components/elements/button";
import { Pencil } from "lucide-react";
import React from "react";

interface EditButtonProps {
  isEditing: boolean;
  onToggle: () => void;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function EditButton({
  isEditing,
  onToggle,
  className = "",
  onClick,
}: EditButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    onToggle();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      data-testid="edit-toggle-button"
      aria-label={isEditing ? "Exit edit mode" : "Enter edit mode"}
      className={` ease-in-out transform hover:scale-100 ${
        isEditing
          ? "bg-primary text-primary-foreground hover:bg-primary h-8 w-8"
          : "bg-transparent hover:bg-transparent h-8 w-8"
      } ${className}`}
    >
      <Pencil
        className={`h-4 w-4 transition-transform duration-100 animate-in slide-in-from-left-2 duration-200 ${
          isEditing
            ? "-rotate-90 text-primary-foreground"
            : "hover:text-foreground/80"
        }`}
      />
    </Button>
  );
}

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import React, { useRef } from "react";

interface EditButtonProps {
  isEditing: boolean;
  onToggle: () => void;
  className?: string;
  debounceMs?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export function EditButton({
  isEditing,
  onToggle,
  className = "",
  debounceMs = 300,
  onClick,
}: EditButtonProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      return;
    }

    onClick?.(e);
    onToggle();

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
    }, debounceMs);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={` ease-in-out transform hover:scale-100 ${
        isEditing
          ? "bg-primary text-primary-foreground hover:bg-primary"
          : "bg-transparent hover:bg-transparent"
      } ${className}`}
    >
      <Pencil
        className={`h-4 w-4 transition-transform duration-100 ${
          isEditing
            ? "-rotate-90 text-primary-foreground"
            : "hover:text-foreground/80"
        }`}
      />
    </Button>
  );
}

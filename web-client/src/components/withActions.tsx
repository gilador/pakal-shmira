import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { EditButton } from "./EditButton";

export interface WithActionsProps {
  isEditing: boolean;
  onNameChange: (userId: string, newName: string) => void;
  onDelete: (userId: string) => void;
  initialName: string;
  userId: string;
  children?: React.ReactNode;
}

export function withActions<T extends WithActionsProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function WithActionsComponent(props: T) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [name, setName] = useState(props.initialName);
    const [isHovered, setIsHovered] = useState(false);

    // Reset state when edit mode changes
    useEffect(() => {
      setIsEditMode(false);
      setIsHovered(false);
    }, [props.isEditing]);

    const handleNameChange = (newName: string) => {
      setName(newName);
      props.onNameChange(props.userId, newName);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    return (
      <div
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center w-full">
          <div
            className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
              props.isEditing ? "translate-x-0" : "-translate-x-12"
            }`}
          >
            {props.isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => props.onDelete(props.userId)}
                className="h-8 w-8 p-0"
              >
                <MinusCircle className="h-4 w-4 text-destructive" />
              </Button>
            )}
            {props.isEditing && (
              <EditButton
                isEditing={isEditMode}
                onToggle={() => setIsEditMode(!isEditMode)}
              />
            )}
          </div>
          <div className="flex-1 pl-2">
            {isEditMode ? (
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => setTimeout(() => setIsEditMode(false), 200)}
                className="h-8"
                autoFocus
              />
            ) : (
              <WrappedComponent {...props} />
            )}
          </div>
        </div>
      </div>
    );
  };
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil } from "lucide-react";
import React, { useEffect, useState, useCallback, memo } from "react";
import { EditButton } from "../EditButton";

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
  const WithActionsComponent = memo(function WithActionsComponent(props: T) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [name, setName] = useState(props.initialName);
    const [isHovered, setIsHovered] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    // Reset state when edit mode changes
    useEffect(() => {
      setIsEditMode(false);
      setIsHovered(false);
    }, [props.isEditing]);

    // Update name when initialName changes
    useEffect(() => {
      if (props.initialName !== name) {
        setName(props.initialName);
      }
    }, [props.initialName]);

    const handleNameChange = useCallback(
      (newName: string) => {
        setName(newName);
        props.onNameChange(props.userId, newName);
      },
      [props.userId, props.onNameChange]
    );

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    const handleBlur = useCallback(() => {
      if (name !== props.initialName) {
        props.onNameChange(props.userId, name);
      }
      setIsEditMode(false);
    }, [name, props.initialName, props.userId, props.onNameChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleBlur();
        } else if (e.key === "Escape") {
          setName(props.initialName);
          setIsEditMode(false);
        }
      },
      [handleBlur, props.initialName]
    );

    const handleCheckboxChange = useCallback(
      (checked: boolean) => {
        setIsChecked(checked);
        if (checked) {
          props.onDelete(props.userId);
        }
      },
      [props.userId, props.onDelete]
    );

    // Skip rendering for empty cells
    if (!props.userId) {
      return <WrappedComponent {...props} />;
    }

    return (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center w-full h-[32px]">
          <div
            className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
              props.isEditing ? "translate-x-0" : "-translate-x-12"
            }`}
          >
            {props.isEditing && (
              <Checkbox
                checked={isChecked}
                onCheckedChange={handleCheckboxChange}
                className="h-4 w-4"
              />
            )}
            {props.isEditing && (
              <EditButton
                isEditing={isEditMode}
                onToggle={() => setIsEditMode(!isEditMode)}
                className="h-[32px]"
              />
            )}
          </div>
          <div className="flex-1 pl-2 h-[32px] flex items-center">
            {isEditMode ? (
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="h-8 w-full"
                autoFocus
              />
            ) : (
              <div className="w-full">
                <WrappedComponent {...props} name={name} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  WithActionsComponent.displayName = `WithActions(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithActionsComponent;
}

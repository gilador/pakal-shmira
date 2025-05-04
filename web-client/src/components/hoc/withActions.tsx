import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { EditButton } from "../EditButton";

export interface WithActionsProps {
  isEditing: boolean;
  onNameChange: (userId: string, newName: string) => void;
  onCheck: (userId: string) => void;
  onUncheck: (userId: string) => void;
  isCheckedProp: boolean;
  name: string;
  userId: string;
  children?: React.ReactNode;
  leftPadding?: string;
  shouldFocus?: boolean;
}

export function withActions<T extends WithActionsProps>(
  WrappedComponent: React.ComponentType<T>
) {
  const WithActionsComponent = memo(function WithActionsComponent(props: T) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [controlledName, setControlledName] = useState(props.name);
    const [isHovered, setIsHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Set initial focus if shouldFocus is true
    useEffect(() => {
      if (isEditMode && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditMode]);

    // Reset state when edit mode changes
    useEffect(() => {
      setIsEditMode(false);
      setIsHovered(false);
    }, []);

    // Update name when initialName changes
    useEffect(() => {
      if (props.name !== controlledName) {
        setControlledName(props.name);
      }
    }, [props.name]);

    const handleNameChange = useCallback(
      (newName: string) => {
        setControlledName(newName);
        // props.onNameChange(props.userId, newName);
      },
      [props.userId]
    );

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    const handleBlur = useCallback(() => {
      if (controlledName !== props.name) {
        setControlledName(controlledName);
        props.onNameChange(props.userId, controlledName);
      }
      setIsEditMode(false);
    }, [controlledName, props.name, props.userId, props.onNameChange]);

    const handleFocus = useCallback(() => {
      setIsEditMode(true);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleBlur();
        } else if (e.key === "Escape") {
          setControlledName(props.name);
          setIsEditMode(false);
        }
      },
      [handleBlur, props.name]
    );

    const handleCheckboxChange = useCallback(
      (checked: boolean) => {
        if (checked) {
          props.onCheck(props.userId);
        } else {
          props.onUncheck(props.userId);
        }
      },
      [props.userId, props.onCheck]
    );

    // Skip rendering for empty cells
    if (!props.userId) {
      return <WrappedComponent {...props} />;
    }

    return (
      <div
        className={`relative transition-all duration-100 ease-in-out ${
          props.isEditing ? "translate-x-0" : "-translate-x-5"
        } ${props.leftPadding || ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center w-full h-[32px]">
          <div
            className={"flex items-center gap-2"}
            onClick={(e) => e.stopPropagation()}
          >
            {props.isEditing && (
              <Checkbox
                checked={props.isCheckedProp}
                onCheckedChange={handleCheckboxChange}
                className="h-4 w-4"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {props.isEditing && (
              <EditButton
                isEditing={isEditMode}
                onToggle={() => setIsEditMode(!isEditMode)}
                className="h-[32px]"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
          <div className="flex-1 h-[32px] w-full flex items-center transition-all duration-300 ease-in-out">
            {isEditMode ? (
              <Input
                ref={inputRef}
                value={controlledName}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={isEditMode && handleBlur}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                className="h-8 w-full transition-all duration-300 ease-in-out"
                autoFocus
              />
            ) : (
              <div className="w-full transition-all duration-300 ease-in-out">
                <WrappedComponent {...props} name={controlledName} />
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

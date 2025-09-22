import React, { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/elements/checkbox";
import { EditButton } from "./EditButton";
import { Input } from "@/components/elements/input";

export interface ActionableTextProps {
  id: string;
  value: string;
  isSelected?: boolean;
  isEditing: boolean;
  isChecked: boolean;
  onCheck: () => void;
  onUncheck: () => void;
  onUpdate: (id: string, newValue: string) => void;
  onClick?: () => void;
  className?: string;
  allowClickWhenNotEditing?: boolean;
}

export function ActionableText({
  id,
  value,
  isSelected = false,
  isEditing,
  isChecked,
  onCheck,
  onUncheck,
  onUpdate,
  onClick,
  className = "",
  allowClickWhenNotEditing = false,
}: ActionableTextProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempValue, setTempValue] = useState(value); // For input field
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync tempValue with prop value when it changes externally
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  // Handle click outside to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditMode &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Save the value and exit edit mode
        onUpdate(id, tempValue.trim());
        setIsEditMode(false);
      }
    };

    if (isEditMode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditMode, tempValue, onUpdate, id]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center gap-0 w-full min-h-[32px] ${
        (isEditing && !isEditMode) || allowClickWhenNotEditing
          ? "cursor-pointer"
          : "cursor-default"
      }`}
      onClick={
        (isEditing && !isEditMode) || allowClickWhenNotEditing
          ? onClick
          : undefined
      }
    >
      {/* Editing controls - always reserve space but hide when not editing */}
      <div
        className="flex items-center gap-1  flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center gap-2 transition-opacity duration-100 ease-in-out ${
            isEditing ? "opacity-100" : "opacity-0"
          }`}
        >
          <Checkbox
            className="flex-shrink-0 w-4 h-4"
            checked={isChecked}
            onCheckedChange={(checked) => {
              if (checked) {
                onCheck();
              } else {
                onUncheck();
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />

          <EditButton
            isEditing={isEditMode}
            onToggle={() => {
              if (isEditMode) {
                // Exiting edit mode - save the value
                onUpdate(id, tempValue.trim());
                setIsEditMode(false);
              } else {
                // Entering edit mode - reset temp value
                setTempValue(value);
                setIsEditMode(true);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="flex-shrink-0"
          />
        </div>
      </div>

      {/* Text content */}
      <div
        className="flex-1 min-w-0"
        onClick={isEditMode ? (e) => e.stopPropagation() : undefined}
      >
        {isEditMode ? (
          <Input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdate(id, tempValue.trim());
                setIsEditMode(false);
              } else if (e.key === "Escape") {
                setTempValue(value); // Reset to original value on escape
                setIsEditMode(false);
              }
            }}
            autoFocus
            className="h-8 text-sm truncate text-gray-900"
          />
        ) : (
          <span
            className={`truncate text-gray-900 ${
              isSelected ? "font-semibold" : ""
            } ${className}`}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

// Original VerticalActionGroup component

interface VerticalActionGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function VerticalActionGroup({
  children,
  className = "",
}: VerticalActionGroupProps) {
  return (
    <div
      className={`flex flex-col items-center gap-1 p-1 rounded-md ${className}`}
    >
      {children}
    </div>
  );
}

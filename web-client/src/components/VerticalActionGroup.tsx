import React from "react";

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

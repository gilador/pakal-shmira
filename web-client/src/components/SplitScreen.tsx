import React from "react";

interface SplitScreenProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({
  leftPanel,
  rightPanel,
  leftWidth = "30%",
  rightWidth = "70%",
  className = "",
  style,
}) => {
  return (
    <div className={`flex gap-4 w-full h-full ${className}`} style={style}>
      <div style={{ width: leftWidth }} className="h-full">
        {leftPanel}
      </div>
      <div style={{ width: rightWidth }} className="h-full">
        {rightPanel}
      </div>
    </div>
  );
};

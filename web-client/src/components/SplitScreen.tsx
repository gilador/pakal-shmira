import React from "react";

interface SplitScreenProps {
  id?: string;
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
    <div
      className={`flex gap-4 w-full h-full ${className} overflow-scroll`}
      style={style}
    >
      <div
        style={{ width: leftWidth }}
        className="h-full flex flex-col"
        id="left-panel"
      >
        {leftPanel}
      </div>
      <div
        style={{ width: rightWidth }}
        className="h-full flex flex-col"
        id="right-panel"
      >
        <div className="h-full flex flex-col ">
          <div className="h-full flex flex-col">{rightPanel}</div>
        </div>
      </div>
    </div>
  );
};

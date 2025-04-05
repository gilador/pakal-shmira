export const colors = {
  // Background colors
  background: {
    default: "bg-background",
    hover: "hover:bg-muted",
  },
  // Available but unassigned cells
  available: {
    default: "bg-[#9dffbf]",
    hover: "hover:bg-[#9dffbf]/50",
  },
  // Unavailable cells
  unavailable: {
    default: "bg-red-200",
    hover: "hover:bg-red-100",
  },
  // Selected user cells
  selected: {
    default: "bg-gray-300",
    hover: "hover:bg-blue-200",
  },
  // Text colors
  text: {
    default: "text-gray-600",
  },
} as const;

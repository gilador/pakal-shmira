export const colors = {
  // Background colors
  background: {
    default: "bg-background",
    hover: "hover:bg-muted",
  },
  // Available but unassigned cells
  available: {
    default: `bg-[#9dffbf]`,
    hover: `hover:bg-[#9dffbf]/50`,
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
  subtitle: {
    default: "text-gray-400",
  },
  // Button colors
  button: {
    default: "bg-primary/5",
    hover: `hover:bg-[#9dffbf]/80`,
    hover_negative: `hover:bg-[#ff9d9d]/80`,
  },
} as const;

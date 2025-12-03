import {
  IconCircleDashedCheck,
  IconAlertCircle,
  IconRefresh,
  IconClockHour4,
  IconCircleDashedMinus,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SyncStatus = "synced" | "out-of-sync" | "syncing" | "idle" | "no-optimised";

interface SyncStatusIconProps {
  status: SyncStatus;
  size?: number;
}

export function SyncStatusIcon({ status, size = 18 }: SyncStatusIconProps) {
  const renderIcon = () => {
    switch (status) {
      case "synced":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconCircleDashedCheck
                size={size}
                aria-label="Status: Synced"
                className="text-green-600 cursor-help"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Synced - All changes saved and optimized</p>
            </TooltipContent>
          </Tooltip>
        );
      case "out-of-sync":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconAlertCircle
                size={size}
                aria-label="Status: Out of sync"
                className="text-red-600 cursor-help animate-pulse-error"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Out of sync - Failed to save changes</p>
            </TooltipContent>
          </Tooltip>
        );
      case "syncing":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconRefresh
                size={size}
                className="animate-spin cursor-help"
                aria-label="Status: Syncing"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Syncing - Saving changes...</p>
            </TooltipContent>
          </Tooltip>
        );
      case "idle":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconClockHour4
                size={size}
                aria-label="Status: Idle"
                className="text-gray-400 cursor-help"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Idle - No data loaded yet</p>
            </TooltipContent>
          </Tooltip>
        );
      case "no-optimised":
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <IconCircleDashedMinus
                size={size}
                aria-label="Status: No optimised"
                className="text-yellow-500 cursor-help"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Not optimized - Click Optimize to generate assignments</p>
            </TooltipContent>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return renderIcon();
}

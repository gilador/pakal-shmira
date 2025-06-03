import {
  IconCircleDashedCheck,
  IconAlertCircle,
  IconRefresh,
} from "@tabler/icons-react";

export type SyncStatus = "synced" | "out-of-sync" | "syncing";

interface SyncStatusIconProps {
  status: SyncStatus;
  size?: number;
}

export function SyncStatusIcon({ status, size = 18 }: SyncStatusIconProps) {
  switch (status) {
    case "synced":
      return (
        <IconCircleDashedCheck
          size={size}
          title="Status: Synced"
          aria-label="Status: Synced"
          className="text-green-600 cursor-help"
        />
      );
    case "out-of-sync":
      return (
        <IconAlertCircle
          size={size}
          title="Status: Out of sync"
          aria-label="Status: Out of sync"
          className="text-red-600 cursor-help"
        />
      );
    case "syncing":
      return (
        <IconRefresh
          size={size}
          className="animate-spin cursor-help"
          title="Status: Syncing"
          aria-label="Status: Syncing"
        />
      );
    default:
      return null;
  }
}

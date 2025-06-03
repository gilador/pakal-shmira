import { atom } from "recoil";
import { UserShiftData } from "../models";
import { SyncStatus } from "../components/ui/SyncStatusIcon";

export interface ShiftState {
  userShiftData: UserShiftData[];
  hasInitialized: boolean;
  syncStatus: SyncStatus;
}

export const shiftState = atom<ShiftState>({
  key: "shiftState",
  default: {
    userShiftData: [],
    hasInitialized: false,
    syncStatus: "synced",
  },
});

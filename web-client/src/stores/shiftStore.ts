import { atom } from "recoil";
import { UserShiftData } from "../models";

interface ShiftState {
  userShiftData: UserShiftData[];
}

export const shiftState = atom<ShiftState>({
  key: "shiftState",
  default: {
    userShiftData: [],
  },
});

import { atom, AtomEffect, DefaultValue } from "recoil";
import { UserShiftData } from "../models";
import { SyncStatus } from "../components/ui/SyncStatusIcon";
import {
  saveStateToLocalStorage,
  LOCAL_STORAGE_KEY,
} from "../lib/localStorageUtils";

// Data structure for persistence, excluding syncStatus
export interface PersistedShiftData {
  userShiftData: UserShiftData[];
  hasInitialized: boolean;
  assignments: (string | null)[][];
}

// Full state including syncStatus
export interface ShiftState extends PersistedShiftData {
  syncStatus: SyncStatus;
}

// This is the true initial state before any localStorage interaction from component
export const initialLoadState: ShiftState = {
  userShiftData: [],
  hasInitialized: false,
  syncStatus: "idle", // New status: idle, until component loads from storage
  assignments: [],
};

// Define the persistence effect
const persistenceEffect: AtomEffect<ShiftState> = ({
  setSelf,
  onSet,
  trigger,
}) => {
  // trigger === 'get' is no longer responsible for async loading here.
  // The atom will initialize with its `default` value synchronously.
  // A component (e.g., App or ShiftManager) will handle async loading in useEffect.

  onSet(async (newValue, oldValue) => {
    if (newValue instanceof DefaultValue) {
      // Atom was reset. Save the initialLoadState (or clear storage).
      console.log("[shiftStore] onSet: Atom reset to DefaultValue.");
      try {
        const { syncStatus, ...persistableDefault } = initialLoadState;
        console.log(
          "[shiftStore] onSet (DefaultValue): Attempting to save initialLoadState to localStorage."
        );
        await saveStateToLocalStorage(LOCAL_STORAGE_KEY, persistableDefault);
        console.log(
          "[shiftStore] onSet (DefaultValue): Successfully saved initialLoadState."
        );
        // setSelf({...initialLoadState, syncStatus: 'synced'}); // or 'idle' after reset
      } catch (error) {
        console.error(
          "[shiftStore] onSet (DefaultValue): Error saving default state on reset:",
          error
        );
        // Consider how to set syncStatus if reset save fails
      }
      return;
    }

    const oldConcreteValue =
      oldValue instanceof DefaultValue ? initialLoadState : oldValue;

    console.log(
      `[shiftStore] onSet: Triggered. Old status: ${oldConcreteValue.syncStatus}, New status (from incoming value): ${newValue.syncStatus}`
    );

    const { syncStatus: newSS, ...newPersistedData } = newValue;
    const { syncStatus: oldSS, ...oldPersistedData } = oldConcreteValue;

    // Only save if the actual data part has changed, and if the new status isn't an interim one from this effect.
    if (JSON.stringify(newPersistedData) !== JSON.stringify(oldPersistedData)) {
      console.log("[shiftStore] onSet: Data changed, proceeding with save.");
      // Set to syncing BEFORE the async operation
      setSelf((current) => {
        const base =
          current instanceof DefaultValue ? initialLoadState : current;
        const nextState = {
          ...newPersistedData,
          syncStatus: "syncing" as SyncStatus,
        };
        console.log(
          '[shiftStore] onSet: Setting status to "syncing". Current state syncStatus:',
          base.syncStatus,
          "New state syncStatus:",
          nextState.syncStatus
        );
        return nextState; // Use newPersistedData as base
      });

      try {
        console.log(
          "[shiftStore] onSet: Attempting to save to localStorage. Data:",
          newPersistedData
        );
        await saveStateToLocalStorage(LOCAL_STORAGE_KEY, newPersistedData);
        console.log("[shiftStore] onSet: Successfully saved to localStorage.");
        setSelf((currentState) => {
          const base =
            currentState instanceof DefaultValue
              ? initialLoadState
              : currentState;
          // Ensure we are updating based on the data that was just saved (newPersistedData)
          const nextState = {
            ...newPersistedData,
            syncStatus: "synced" as SyncStatus,
          };
          console.log(
            '[shiftStore] onSet: Setting status to "synced". Current state syncStatus:',
            base.syncStatus,
            "New state syncStatus:",
            nextState.syncStatus
          );
          return nextState;
        });
      } catch (error) {
        console.error(
          "[shiftStore] onSet: Error saving state to localStorage:",
          error
        );
        setSelf((currentState) => {
          const base =
            currentState instanceof DefaultValue
              ? initialLoadState
              : currentState;
          // Ensure we are updating based on the data that was attempted to be saved (newPersistedData)
          const nextState = {
            ...newPersistedData,
            syncStatus: "out-of-sync" as SyncStatus,
          };
          console.log(
            '[shiftStore] onSet: Setting status to "out-of-sync" due to error. Current state syncStatus:',
            base.syncStatus,
            "New state syncStatus:",
            nextState.syncStatus
          );
          return nextState;
        });
      }
    } else {
      console.log(
        "[shiftStore] onSet: Data has not changed, or syncStatus change is internal. No save needed now. New syncStatus:",
        newSS,
        "Old syncStatus:",
        oldSS
      );
    }
  });
};

export const shiftState = atom<ShiftState>({
  key: "shiftState",
  default: initialLoadState, // Initialize synchronously
  effects: [persistenceEffect],
});

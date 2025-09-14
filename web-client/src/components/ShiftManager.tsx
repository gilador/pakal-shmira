import { Button } from "@/components/elements/button";
import { Card, CardContent } from "@/components/elements/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/elements/dialog";
import { useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import tumbleweedIcon from "../../assets/tumbleweed.svg";
import { shiftState } from "../stores/shiftStore";
import { AvailabilityTableView } from "./AvailabilityTableView";
import { EditButton } from "./EditButton";
import { PostListActions } from "./PostListActions";
import { SplitScreen } from "./SplitScreen";
import { SyncStatusIcon } from "./SyncStatusIcon";
import { VerticalActionGroup } from "./VerticalActionGroup";
import { WorkerList } from "./WorkerList";
import { WorkerListActions } from "./WorkerListActions";
import { useShiftManagerInitialization } from "../hooks/useShiftManagerInitialization";
import { useShiftOptimization } from "../hooks/useShiftOptimization";
import { useUserHandlers } from "../hooks/useUserHandlers";
import { usePostHandlers } from "../hooks/usePostHandlers";
import { useAssignmentHandlers } from "../hooks/useAssignmentHandlers";
import { defaultHours } from "../constants/shiftManagerConstants";

export function ShiftManager() {
  const [recoilState] = useRecoilState(shiftState);
  const [isEditing, setIsEditing] = useState(false);
  const [checkedUserIds, setCheckedUserIds] = useState<string[]>([]);

  // Initialize the component and get the constraints signature ref
  const { lastAppliedConstraintsSignature } = useShiftManagerInitialization();

  // Use optimization hook
  const {
    isOptimizeDisabled,
    optimizeButtonTitle,
    optimizationDialog,
    setOptimizationDialog,
    handleOptimize,
  } = useShiftOptimization(isEditing, lastAppliedConstraintsSignature);

  // Use user handlers
  const {
    selectedUserId,
    addUser,
    updateUserConstraints,
    updateUserName,
    removeUsers,
    handleUserSelect,
    resetAllAvailability,
  } = useUserHandlers();

  // Use post handlers
  const {
    checkedPostIds,
    addPost,
    handlePostEdit,
    handlePostCheck,
    handlePostUncheck,
    handlePostCheckAll,
    handleRemovePosts,
  } = usePostHandlers();

  // Use assignment handlers
  const { handleAssignmentNameUpdate } = useAssignmentHandlers();

  const assignments =
    recoilState.assignments ||
    (recoilState.posts || []).map(() =>
      (recoilState.hours || defaultHours).map(() => null)
    );

  const syncStatus = recoilState.syncStatus;
  console.log(
    "[ShiftManager Render] Current syncStatus:",
    syncStatus,
    "Full recoilState:",
    recoilState
  );

  // Debug shift settings sync
  console.log("🚀 [ShiftManager] Shift Settings Debug:", {
    "recoilState.startTime": recoilState.startTime,
    "recoilState.endTime": recoilState.endTime,
    "recoilState.restTime": recoilState.restTime,
    "recoilState.hours.length": recoilState.hours?.length || 0,
    "recoilState.hours": recoilState.hours?.map((h) => h.value) || [],
    "using defaultHours": !recoilState.hours || recoilState.hours.length === 0,
  });

  const selectedUser = useMemo(() => {
    return selectedUserId
      ? recoilState.userShiftData?.find(
          (userData) => userData.user.id === selectedUserId
        )
      : undefined;
  }, [selectedUserId, recoilState.userShiftData]);

  return (
    <div className="flex flex-col h-full">
      <div
        id="header"
        className="grid grid-cols-[auto_1fr] gap-x-4 items-start mb-4 flex-none"
      >
        <img
          src={tumbleweedIcon}
          alt="Tumbleweed Icon"
          className="w-16 h-full"
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Tumbleweed</h1>
          <h2 className="text-md text-gray-400">Shift Manager</h2>
        </div>
      </div>
      <div id="content" className="flex-1 min-h-0">
        <Card className="flex flex-row h-full overflow-hidden">
          <div className="flex flex-col p-2">
            <VerticalActionGroup className="flex-none gap-3">
              <SyncStatusIcon status={syncStatus} size={18} />
              <EditButton
                isEditing={isEditing}
                onToggle={() => setIsEditing(!isEditing)}
              />
            </VerticalActionGroup>
          </div>
          <CardContent className="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Shift Assignments - 50% */}
            <div
              className="flex flex-col min-h-0 overflow-hidden mb-2"
              style={{ height: "50%" }}
              id="assignments-table"
            >
              <div className="flex items-center gap-2 mb-2 flex-none">
                <h3 className="text-lg font-semibold">Shift Assignments</h3>
                <PostListActions
                  isEditing={isEditing}
                  onAddPost={addPost}
                  onRemovePosts={handleRemovePosts}
                  checkedPostIds={checkedPostIds}
                  onCheckAll={handlePostCheckAll}
                />
              </div>
              <div className="flex-1 border-primary-rounded-lg overflow-hidden">
                <AvailabilityTableView
                  key={`assignments-${
                    recoilState.userShiftData
                      ?.map((u) => u.user.name)
                      .join("-") || "no-users"
                  }-${
                    recoilState.posts?.map((p) => p.id).join("-") || "no-posts"
                  }`}
                  className="h-full"
                  posts={recoilState.posts}
                  hours={recoilState.hours || defaultHours}
                  users={
                    recoilState.userShiftData?.map(
                      (userData) => userData.user
                    ) || []
                  }
                  userShiftData={recoilState.userShiftData || []}
                  mode="assignments"
                  assignments={assignments}
                  customCellDisplayNames={recoilState.customCellDisplayNames}
                  selectedUserId={selectedUserId}
                  onConstraintsChange={() => {
                    // Assignment changes handled by table component directly
                  }}
                  isEditing={isEditing}
                  onPostEdit={handlePostEdit}
                  checkedPostIds={checkedPostIds}
                  onPostCheck={handlePostCheck}
                  onPostUncheck={handlePostUncheck}
                  onPostRemove={(postIds) => handleRemovePosts([postIds])}
                  onAssignmentEdit={handleAssignmentNameUpdate}
                  restTime={recoilState.restTime}
                  startHour={recoilState.startTime}
                  endHour={recoilState.endTime}
                />
              </div>
            </div>

            {/* Optimize Button - 10% */}
            <div
              className="flex items-center justify-center mb-2 flex-none"
              style={{ height: "10%" }}
            >
              <Button
                id="optimize-button"
                onClick={handleOptimize}
                variant="default"
                className="w-full disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isOptimizeDisabled}
                title={optimizeButtonTitle}
              >
                Optimize
              </Button>
            </div>

            {/* Staff Section - 40% */}
            <div
              className="flex flex-col min-h-0 overflow-hidden"
              style={{ height: "40%" }}
            >
              <div className="flex items-center gap-2 mb-2 flex-none">
                <h3 className="text-lg font-semibold">Staff</h3>
                <WorkerListActions
                  isEditing={isEditing}
                  onAddUser={addUser}
                  onRemoveUsers={removeUsers}
                  onCheckAll={(allWasClicked) => {
                    setCheckedUserIds(
                      allWasClicked
                        ? recoilState.userShiftData?.map(
                            (userData) => userData.user.id
                          ) || []
                        : []
                    );
                  }}
                  checkedUserIds={checkedUserIds}
                  onResetAllAvailability={resetAllAvailability}
                />
              </div>
              <div className="flex-1 min-h-0">
                <SplitScreen
                  id="worker-info"
                  leftWidth="40%"
                  rightWidth="60%"
                  className="h-full overflow-hidden"
                  leftPanel={
                    <WorkerList
                      users={
                        recoilState.userShiftData?.map(
                          (userData) => userData.user
                        ) || []
                      }
                      selectedUserId={selectedUserId}
                      onSelectUser={handleUserSelect}
                      onEditUser={() => {}} // Temporarily disabled
                      onUpdateUserName={updateUserName}
                      isEditing={isEditing}
                      checkedUserIds={checkedUserIds}
                      onCheckUser={(userId) =>
                        setCheckedUserIds([...checkedUserIds, userId])
                      }
                      onUncheckUser={(userId) =>
                        setCheckedUserIds(
                          checkedUserIds.filter((id) => id !== userId)
                        )
                      }
                    />
                  }
                  rightPanel={
                    <AvailabilityTableView
                      key={`availability-${selectedUserId}-${
                        recoilState.userShiftData
                          ?.map((u) => u.user.name)
                          .join("-") || "no-users"
                      }`}
                      user={
                        selectedUserId
                          ? recoilState.userShiftData?.find(
                              (u) => u.user.id === selectedUserId
                            )?.user
                          : undefined
                      }
                      availabilityConstraints={selectedUser?.constraints}
                      posts={recoilState.posts}
                      hours={recoilState.hours || defaultHours}
                      userShiftData={recoilState.userShiftData || []}
                      mode="availability"
                      onConstraintsChange={(newConstraints) => {
                        if (selectedUser) {
                          updateUserConstraints(
                            selectedUser.user.id,
                            newConstraints
                          );
                        }
                      }}
                      isEditing={isEditing}
                      onPostEdit={handlePostEdit}
                      selectedUserId={selectedUserId}
                      users={
                        recoilState.userShiftData?.map(
                          (userData) => userData.user
                        ) || []
                      }
                      checkedPostIds={checkedPostIds}
                      onPostCheck={handlePostCheck}
                      onPostUncheck={handlePostUncheck}
                      onPostRemove={(postIds) => handleRemovePosts([postIds])}
                    />
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Feedback Dialog */}
      <Dialog
        open={optimizationDialog.isOpen}
        onOpenChange={(open) =>
          setOptimizationDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              className={
                optimizationDialog.type === "success"
                  ? "text-green-600"
                  : optimizationDialog.type === "warning"
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {optimizationDialog.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-700">{optimizationDialog.message}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Button } from "@/components/elements/button";
import { IconBrandGithub } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/elements/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/elements/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo, useState } from "react";
import { useRecoilState } from "recoil";
import tumbleweedIcon from "../../assets/tumbleweed.svg";
import { shiftState } from "../stores/shiftStore";
import { AvailabilityTableView } from "./AvailabilityTableView";
import { EditButton } from "./EditButton";
import { PostListActions } from "./PostListActions";
import { ShiftInfoSettingsView } from "./ShiftInfoSettingsView";
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
import { useToast } from "../hooks/useToast";
import { ToastManager } from "./Toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { defaultHours } from "../constants/shiftManagerConstants";
import { getOptimalShiftDuration } from "../service/shiftHourHelperService";

export function ShiftManager() {
  const [recoilState] = useRecoilState(shiftState);
  const [isEditing, setIsEditing] = useState(false);
  const [checkedUserIds, setCheckedUserIds] = useState<string[]>([]);
  const [showShiftSettings, setShowShiftSettings] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  // Initialize the component and get the constraints signature ref
  const { lastAppliedConstraintsSignature } = useShiftManagerInitialization();

  // Use toast system
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  // Use optimization hook
  const { isOptimizeDisabled, optimizeButtonTitle, handleOptimize } =
    useShiftOptimization(
      isEditing,
      lastAppliedConstraintsSignature,
      showSuccess,
      showError,
      showInfo
    );

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
  const { handleAssignmentNameUpdate, handleClearAllAssignments } =
    useAssignmentHandlers();

  // Handle shift settings toggle
  const handleToggleShiftSettings = () => {
    setShowShiftSettings(!showShiftSettings);
  };

  const handleCloseShiftSettings = () => {
    console.log("🔄 [ShiftManager] Closing shift settings");
    setShowShiftSettings(false);
  };

  // Enhanced addPost with toast notification
  const handleAddPost = () => {
    const postName = addPost();
    showSuccess(`${postName} was added`, 3000, postName);
  };

  // Enhanced addUser with toast notification
  const handleAddUser = () => {
    const userName = addUser();
    showSuccess(`${userName} was added to staff list`, 3000, userName);
  };

  const assignments =
    recoilState.assignments ||
    (recoilState.posts || []).map(() =>
      (recoilState.hours || defaultHours).map(() => null)
    );

  const syncStatus = recoilState.syncStatus;

  // Debug shift settings sync
  console.log("🚀 [ShiftManager] Shift Adjustment Debug:", {
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
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
      <div
        id="header"
        className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-start mb-4 flex-none"
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
        <a
          href="https://github.com/gilador/pakal-shmira"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-black transition-colors"
          title="View on GitHub"
        >
          <IconBrandGithub size={24} />
        </a>
      </div>
      <div id="content" className="flex-1 min-h-0">
        <Card className="flex flex-row h-full overflow-hidden">
          <div className="flex flex-col p-2">
            <VerticalActionGroup className="flex-none gap-3">
              <SyncStatusIcon status={syncStatus} size={18} />
              <EditButton
                isEditing={isEditing}
                onToggle={() => {
                  const newIsEditing = !isEditing;
                  setIsEditing(newIsEditing);
                  if (newIsEditing) {
                    handleUserSelect(null);
                  }
                }}
              />
            </VerticalActionGroup>
          </div>
          <CardContent className="p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Shift Assignments - 50% */}
            <div
              className="flex flex-col min-h-0 overflow-hidden mb-2"
              style={{ height: "65%" }}
              id="assignments-table"
            >
              <div className="flex items-center gap-2 mb-2 flex-none">
                <h3 className="text-lg font-semibold">Shift Assignments</h3>
                <div className="flex items-center gap-3 text-sm bg-gray-100 px-3 py-1 rounded-md">
                  <span className="font-medium">
                    {recoilState.posts?.length || 0} posts
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="font-medium">
                    {(() => {
                      let totalShifts = 0;
                      for (const postAssignments of assignments) {
                        for (const assignedUserId of postAssignments) {
                          if (assignedUserId !== null) {
                            totalShifts++;
                          }
                        }
                      }
                      return `${totalShifts} shifts`;
                    })()}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="font-medium">
                    {(() => {
                      const shiftDuration = getOptimalShiftDuration(
                        recoilState.startTime || "08:00",
                        recoilState.endTime || "16:00",
                        recoilState.posts?.length || 0,
                        recoilState.userShiftData?.length || 0,
                        recoilState.restTime || 2
                      );
                      return `${shiftDuration.toFixed(1)}h shift duration`;
                    })()}
                  </span>
                </div>
                <PostListActions
                  isEditing={isEditing}
                  onAddPost={handleAddPost}
                  onRemovePosts={handleRemovePosts}
                  checkedPostIds={checkedPostIds}
                  onCheckAll={handlePostCheckAll}
                  onToggleShiftSettings={handleToggleShiftSettings}
                  showShiftSettings={showShiftSettings}
                />
              </div>
              <div className="flex-1 border-primary-rounded-lg overflow-hidden relative">
                {/* AvailabilityTableView - positioned at top left */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <AvailabilityTableView
                    key={`assignments-${
                      recoilState.userShiftData
                        ?.map((u) => u.user.name)
                        .join("-") || "no-users"
                    }-${
                      recoilState.posts?.map((p) => p.id).join("-") ||
                      "no-posts"
                    }`}
                    className="h-full"
                    posts={recoilState.posts}
                    hours={recoilState.hours || defaultHours}
                    endTime={recoilState.endTime}
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
                    onAssignmentEdit={handleAssignmentNameUpdate}
                  />
                </div>

                {/* Glass overlay for Post column header and content */}
                <div
                  className={`absolute top-0 left-0 w-[200px] bottom-0 backdrop-blur-sm bg-white/20 transition-all duration-300 ${
                    showShiftSettings
                      ? "visible opacity-100"
                      : "invisible opacity-0"
                  }`}
                  onClick={() => handleCloseShiftSettings()}
                ></div>

                {/* Glass overlay for assignment content area */}
                <div
                  className={`absolute top-[3rem] left-[200px] right-0 bottom-0 backdrop-blur-sm bg-white/20 transition-all duration-300 ${
                    showShiftSettings
                      ? "visible opacity-100"
                      : "invisible opacity-0"
                  }`}
                  onClick={() => handleCloseShiftSettings()}
                ></div>

                {/* Shift Adjustment - positioned below hours headers */}
                <div
                  className={`flex justify-center items-start w-full h-full transition-all duration-300 relative z-10 ${
                    showShiftSettings
                      ? "visible opacity-100"
                      : "invisible opacity-0"
                  }`}
                  onClick={() => handleCloseShiftSettings()}
                  style={{ paddingTop: "2rem" }}
                >
                  <div
                    className="w-[40rem] max-w-[calc(100%-4rem)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ShiftInfoSettingsView
                      restTime={recoilState.restTime ?? 2}
                      startHour={recoilState.startTime ?? "08:00"}
                      endHour={recoilState.endTime ?? "16:00"}
                      posts={recoilState.posts || []}
                      onClose={handleCloseShiftSettings}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optimize and Clear Buttons - 10% */}
            <div
              id="buttons"
              className="flex self-center items-center justify-center flex-none gap-2"
              style={{ height: "10%", width: "15%" }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <Button
                      id="optimize-button"
                      onClick={handleOptimize}
                      variant="default"
                      className="w-full disabled:cursor-not-allowed disabled:opacity-80 rounded-lg"
                      disabled={isOptimizeDisabled}
                    >
                      Optimize
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{optimizeButtonTitle}</p>
                </TooltipContent>
              </Tooltip>
              <Button
                id="clear-button"
                onClick={() => setIsClearDialogOpen(true)}
                variant="outline"
                className="flex-1 bg-white border-black text-black hover:bg-gray-50 rounded-lg"
                title="Clear all assignments"
              >
                Clear
              </Button>

              <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear All Assignments?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete all
                      shift assignments.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:space-x-0">
                    <Button
                      variant="outline"
                      onClick={() => setIsClearDialogOpen(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleClearAllAssignments();
                        setIsClearDialogOpen(false);
                      }}
                      size="sm"
                    >
                      Clear
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Staff Section - 40% */}
            <div
              id="staff_section"
              className="flex flex-col min-h-0 overflow-hidden -mt-7"
              style={{ height: "40%" }}
            >
              <div className="flex items-center gap-2 flex-none mb-2">
                <h3 className="text-lg font-semibold">Staff</h3>
                <div className="flex items-center gap-3 text-sm bg-gray-100 px-3 py-1 rounded-md">
                  <span className="font-medium">
                    {recoilState.userShiftData?.length || 0} staff
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="font-medium">
                    {(() => {
                      const staffCount = recoilState.userShiftData?.length || 0;
                      if (staffCount === 0) return "0 avg shifts";
                      
                      let totalAssignments = 0;
                      for (const postAssignments of assignments) {
                        for (const assignedUserId of postAssignments) {
                          if (assignedUserId !== null) {
                            totalAssignments++;
                          }
                        }
                      }
                      const avgShifts = (totalAssignments / staffCount).toFixed(1);
                      return `${avgShifts} avg shifts`;
                    })()}
                  </span>
                </div>
                <WorkerListActions
                  isEditing={isEditing}
                  onAddUser={handleAddUser}
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
                  leftWidth="25%"
                  rightWidth="75%"
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
                      assignments={assignments}
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
                      endTime={recoilState.endTime}
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
                      onPostCheck={handlePostCheck}
                      onPostUncheck={handlePostUncheck}
                      onShowToast={(message, type) => {
                        if (type === "success") showSuccess(message);
                        else if (type === "error") showError(message);
                        else showInfo(message);
                      }}
                    />
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notifications */}
      <ToastManager toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </TooltipProvider>
  );
}

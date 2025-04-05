import { UniqueString } from "../models";

// Mock shift assignments
// Format: { "postId-hourId": "userId" }
export const mockShiftAssignments: Record<string, string> = {
  // Post 1 assignments
  "post-1-hour-1": "worker-1", // First worker assigned to Post 1 at Hour 1
  "post-1-hour-2": "worker-2", // Second worker assigned to Post 1 at Hour 2
  "post-1-hour-3": "worker-3", // Third worker assigned to Post 1 at Hour 3
  "post-1-hour-4": "worker-4", // Fourth worker assigned to Post 1 at Hour 4
  "post-1-hour-5": "worker-5", // Fifth worker assigned to Post 1 at Hour 5

  // Post 2 assignments
  "post-2-hour-1": "worker-2", // Second worker assigned to Post 2 at Hour 1
  "post-2-hour-2": "worker-3", // Third worker assigned to Post 2 at Hour 2
  "post-2-hour-3": "worker-4", // Fourth worker assigned to Post 2 at Hour 3
  "post-2-hour-4": "worker-5", // Fifth worker assigned to Post 2 at Hour 4
  "post-2-hour-5": "worker-1", // First worker assigned to Post 2 at Hour 5

  // Post 3 assignments
  "post-3-hour-1": "worker-3", // Third worker assigned to Post 3 at Hour 1
  "post-3-hour-2": "worker-4", // Fourth worker assigned to Post 3 at Hour 2
  "post-3-hour-3": "worker-5", // Fifth worker assigned to Post 3 at Hour 3
  "post-3-hour-4": "worker-1", // First worker assigned to Post 3 at Hour 4
  "post-3-hour-5": "worker-2", // Second worker assigned to Post 3 at Hour 5
};

// Helper function to get user name from assignment
export const getUserNameFromAssignment = (
  assignment: string,
  users: UniqueString[]
) => {
  const user = users.find((u) => u.id === assignment);
  return user ? user.value : "Unassigned";
};

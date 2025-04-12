export interface User {
  id: string;
  name: string;
}

export interface Constraint {
  postID: string;
  hourID: string;
  availability: boolean;
  assignedUser?: string;
}

export interface UserShiftData {
  user: User;
  constraints: Constraint[][];
  totalAssignments: number;
}

export interface OptimizeShiftSolution {
  result: boolean[][][]; // 3D array indicating user assignments for each post and hour
  isOptim: boolean; // Whether the solution is optimal
}

export class ShiftMap {
  private map: Map<string, UserShiftData>;

  constructor() {
    this.map = new Map();
  }

  addUser(userData: UserShiftData) {
    this.map.set(userData.user.id, userData);
  }

  getUser(userId: string): UserShiftData | undefined {
    return this.map.get(userId);
  }

  updateUser(userData: UserShiftData) {
    this.map.set(userData.user.id, userData);
  }

  getShift(id: string): Constraint | undefined {
    for (const userData of this.map.values()) {
      for (const postConstraints of userData.constraints) {
        for (const constraint of postConstraints) {
          if (constraint.postID + constraint.hourID === id) {
            return constraint;
          }
        }
      }
    }
    return undefined;
  }

  copy(): ShiftMap {
    const newMap = new ShiftMap();
    this.map.forEach((value) => {
      newMap.addUser(JSON.parse(JSON.stringify(value)));
    });
    return newMap;
  }

  // Debug utility to log the constraints for a user
  debugUserConstraints(userId: string): void {
    const userData = this.getUser(userId);
    if (!userData) {
      console.log(`User ${userId} not found in ShiftMap`);
      return;
    }

    console.log(`===== SHIFT MAP DEBUG: ${userData.user.name} =====`);
    console.log(`User ID: ${userData.user.id}`);
    console.log(
      `Constraints structure: ${userData.constraints.map((row) => row.length)}`
    );

    userData.constraints.forEach((postConstraints, postIndex) => {
      console.log(`Post ${postIndex}:`);
      postConstraints.forEach((constraint, hourIndex) => {
        console.log(
          `  Hour ${hourIndex}: Availability=${constraint.availability}, PostID=${constraint.postID}, HourID=${constraint.hourID}`
        );
      });
    });

    console.log("==========================================");
  }
}

export interface UniqueString {
  id: string;
  value: string;
}

export interface User {
  id: string;
  name: string;
}

export interface Constraint {
  availability: boolean;
  postID: string;
  hourID: string;
  assignedUser?: string;
}

export interface UserShiftData {
  user: User;
  constraints: Constraint[][];
  assignments?: boolean[][];
  totalAssignments: number;
}

export class ShiftMap {
  private users: Map<string, UserShiftData> = new Map<string, UserShiftData>();
  private shifts: Map<string, Constraint> = new Map<string, Constraint>();

  constructor(users?: UserShiftData[]) {
    this.users = new Map<string, UserShiftData>();
    this.shifts = new Map<string, Constraint>();

    users?.forEach((user) => {
      this.addUser(user);
    });
  }
    
  addUser(userData: UserShiftData) {
    this.users.set(userData.user.id, userData);
  }

  getUser(userId: string): UserShiftData | undefined {
    return this.users.get(userId);
  }

  getShift(shiftId: string): Constraint | undefined {
    return this.shifts.get(shiftId);
  }

  updateUser(userData: UserShiftData) {
    this.users.set(userData.user.id, userData);
  }

  usersSize(): number {
    return this.users.size;
  }

  copy(): ShiftMap {
    const newMap = new ShiftMap();
    this.users.forEach((userData) => {
      newMap.addUser({
        ...userData,
        constraints: JSON.parse(JSON.stringify(userData.constraints)),
      });
    });
    return newMap;
  }
}

export type OptimizeShiftSolution = {
  result: boolean[][][];
  isOptim: boolean;
};

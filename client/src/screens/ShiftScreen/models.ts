export type User = {
    name: string
    id: string
}

export type Constraint = {
    availability: boolean
    postID: string
    hourID: string
}

export type UserShiftData = {
    user: User
    assignments?: boolean[][]
    constraints: Constraint[][]
    totalAssignments: number
}

export type ShiftBoard = {
    users: UserShiftData[]
    posts: UniqueString[]
    hours: UniqueString[]
    shifts?: User[][]
}

export type UniqueString = {
    id: string
    value: string
}

export class ShiftMap {
    private userMap: Map<string, UserShiftData> = new Map<string, UserShiftData>()
    private constraintIndex: Map<string, Constraint> = new Map<string, Constraint>()

    constructor(users?: UserShiftData[]) {
        this.userMap = new Map<string, UserShiftData>()
        this.constraintIndex = new Map<string, Constraint>()

        users?.forEach((user) => {
            this.addUser(user)
        })
    }

    public copy(): ShiftMap {
        const users = Array.from(this.userMap.values()).map((user) => {
            const newUser = JSON.parse(JSON.stringify(user))
            newUser.constraints = user.constraints.map((hourConstraint) => {
                return hourConstraint.map((postConstraint) => {
                    return { ...postConstraint }
                })
            })
            return newUser
        })
        return new ShiftMap(users)
    }

    public addUser(user: UserShiftData) {
        this.userMap.set(user.user.id, user)
        user.constraints.forEach((hourConstraint) => {
            hourConstraint.forEach((postConstraint) => {
                this.constraintIndex.set(user.user.id + postConstraint.postID + postConstraint.hourID, postConstraint)
            })
        })
    }

    public updateUser(user: UserShiftData) {
        this.removeUser(user.user.id)
        this.addUser(user)
    }

    public removeUser(userId: string) {
        const user = this.userMap.get(userId)
        if (user) {
            user.constraints.forEach((hourConstraint) => {
                hourConstraint.forEach((postConstraint) => {
                    this.constraintIndex.delete(userId + postConstraint.postID + postConstraint.hourID)
                })
            })
        }
        this.userMap.delete(userId)
    }

    public getUser(userId: string): UserShiftData | undefined {
        return this.userMap.get(userId)
    }

    public getShift(shiftId: string): Constraint | undefined {
        return this.constraintIndex.get(shiftId)
    }

    public usersSize(): number {
        return this.userMap.size
    }

    public constraintsSize(): number {
        return this.constraintIndex.size
    }

    public userValues(): UserShiftData[] {
        return Array.from(this.userMap.values())
    }

    public print(prefix?: string) {
        console.log(`${prefix}->ShiftMap->userMap: ${JSON.stringify(this.userMap.get('1אלון'))}`)
        console.log(
            `${prefix}->ShiftMap->constraintIndex: ${this.constraintIndex.keys().next().value} : ${JSON.stringify(this.constraintIndex.get(this.constraintIndex.keys().next().value))}`
        )
    }
}

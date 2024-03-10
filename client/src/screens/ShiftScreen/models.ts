export type User = {
    name: string
    id: string
}

export type UserShiftData = {
    user: User
    assignments: boolean[][]
    totalAssignments: number
}

export type ShiftBoard = {
    users: UserShiftData[]
    constraints: boolean[][][]
    posts: (string | undefined)[]
    hours: string[]
    shifts?: User[][]
}

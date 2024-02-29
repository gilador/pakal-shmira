export type User ={
    name: string,
    id: string
}

export type UserShiftData = {
    user: User,
    assignments: boolean[][]
    constraints: boolean[][]
    totalAssignments: number
}

export type ShiftBoard = {
    users: UserShiftData[]
    posts: string[]
    hours: string[]
    shifts?: User[][]
}
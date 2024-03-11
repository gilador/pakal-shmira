export type User = {
    name: string
    id: string
}

export type UserShiftData = {
    user: User
    assignments?: boolean[][]
    constraints: boolean[][]
    totalAssignments: number
}

export type ShiftBoard = {
    users: UserShiftData[]
    posts: (string | undefined)[]
    hours: string[]
    shifts?: User[][]
}

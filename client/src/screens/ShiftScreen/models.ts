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

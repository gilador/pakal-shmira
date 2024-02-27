export type UserInfo ={
    name: string,
    id: string
}

export type UserAssigments = {
    user: UserInfo,
    assignments: number[][]
    total: number
}

export type ShiftBoard = {
    personals: UserAssigments[]
    posts: string[]
    hours: string[]
    shifts?: UserInfo[][]
}
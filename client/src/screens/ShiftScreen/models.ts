import { UserConstraints } from "@app/services/optimizeService/models"

export type ShiftBoard = {
    personals: UserConstraints[]
    posts: string[]
    hours: string[]
    shifts: string[][]
}
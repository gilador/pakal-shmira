export type OptimizeShiftRequest = {
    constraints: number[][][]
}

export type OptimizeShiftResponse = {
    result: string[][]
    isOptim: boolean
}
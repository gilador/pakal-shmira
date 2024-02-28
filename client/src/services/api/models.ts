export type OptimizeShiftRequest = {
    constraints: number[][][]
}

export type OptimizeShiftResponse = {
    result: boolean[][][]
    isOptim: boolean
}
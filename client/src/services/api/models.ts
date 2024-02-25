export type OptimizeShiftRequest = {
    constraints: number[][][]
}

export type OptimizeShiftResponse = {
    result: number[][][]
    isOptim: boolean
}
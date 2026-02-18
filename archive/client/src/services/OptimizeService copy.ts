import { Constraint } from '@app/screens/shiftScreen/models'
import { OptimizeShiftResponse } from './api/models'
import ApiService from './api'

//Todo export class
function transformConstraintsToBool(constraints: Constraint[][][] | undefined): boolean[][][] {
    const boolConstraints: boolean[][][] | undefined = constraints?.map((constraint1: Constraint[][]) =>
        constraint1.map((constraint2: Constraint[]) =>
            constraint2.map((constraint3: Constraint) => Boolean(constraint3.availability))
        )
    )
    return boolConstraints ?? []
}

export async function optimize2(constraints: Constraint[][][] | undefined): Promise<OptimizeShiftResponse | undefined> {
    const boolConstraints = transformConstraintsToBool(constraints)

    const ret = await ApiService.optimizeShift(boolConstraints)
    return constraints ? ret : undefined
}

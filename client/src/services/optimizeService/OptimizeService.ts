import { Constraint } from '@app/screens/shiftScreen/models'
import { OptimizeShiftResponse } from '../api/models'
import ApiService from '../api'

function transformConstraintsToBool(constraints: Constraint[][][] | undefined): boolean[][][] {
    const boolConstraints: boolean[][][] | undefined = constraints?.map((constraint1: Constraint[][]) =>
        constraint1.map((constraint2: Constraint[]) =>
            constraint2.map((constraint3: Constraint) => Boolean(constraint3.availability))
        )
    )
    return boolConstraints ?? []
}

export async function optimize(constraints: Constraint[][][] | undefined): Promise<OptimizeShiftResponse | undefined> {
    console.log(`optimize-> constraints: ${constraints}`)
    const boolConstraints = transformConstraintsToBool(constraints)
    console.log(`optimize-> boolConstraints: ${boolConstraints}`)
    const ret = await ApiService.optimizeShift(boolConstraints)
    return constraints ? ret : undefined
}

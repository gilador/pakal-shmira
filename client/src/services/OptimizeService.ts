import { Constraint } from '@app/screens/shiftScreen/models'
import { OptimizeShiftResponse } from './api/models'
import { PyodideService } from './PyodideService'
import ApiService from './api'

function transformConstraintsToOptimizationRequest(constraints: Constraint[][][]): any {
    const shifts = []
    const workers = []
    const worker_preferences = []

    for (let i = 0; i < constraints.length; i++) {
        const workerId = `worker${i}`
        workers.push({ id: workerId, name: `Worker ${i}` })

        for (let j = 0; j < constraints[i].length; j++) {
            const shiftId = `shift${j}`
            if (j >= shifts.length) {
                shifts.push({ id: shiftId })
            }

            for (let k = 0; k < constraints[i][j].length; k++) {
                worker_preferences.push({
                    worker_id: workerId,
                    shift_id: shiftId,
                    preference_score: constraints[i][j][k].availability ? 1 : 0,
                })
            }
        }
    }

    return {
        shifts,
        workers,
        worker_preferences,
        min_shifts_per_worker: 1,
        max_shifts_per_worker: 3,
    }
}

function transformConstraintsToBool(constraints: Constraint[][][] | undefined): boolean[][][] {
    const boolConstraints: boolean[][][] | undefined = constraints?.map((constraint1: Constraint[][]) =>
        constraint1.map((constraint2: Constraint[]) =>
            constraint2.map((constraint3: Constraint) => Boolean(constraint3.availability))
        )
    )
    return boolConstraints ?? []
}

export async function optimize(constraints: Constraint[][][] | undefined): Promise<OptimizeShiftResponse | undefined> {
    if (!constraints) {
        console.log('Optimization skipped: No constraints provided')
        return undefined
    }

    try {
        console.log('Starting optimization process...')
        console.log('Input constraints:', JSON.stringify(constraints, null, 2))

        const pyodide = await PyodideService.initialize()
        console.log('Pyodide initialized successfully')

        // Check if all dependencies are available
        const dependenciesOk = await PyodideService.checkDependencies()
        if (!dependenciesOk) {
            console.error('Missing required Python dependencies')
            throw new Error('Missing required Python dependencies')
        }
        console.log('All dependencies verified')

        const optimizationRequest = transformConstraintsToOptimizationRequest(constraints)
        console.log('Transformed optimization request:', JSON.stringify(optimizationRequest, null, 2))

        console.log('Running Python optimization...')
        const result = await pyodide.runPython(`
            optimizer = ShiftOptimizer()
            request = ShiftRequest(**${JSON.stringify(optimizationRequest)})
            optimizer.optimize(request)
        `)

        const jsResult = result.toJs()
        console.log('Optimization complete. Result:', JSON.stringify(jsResult, null, 2))

        if (jsResult.status === 'success') {
            console.log('Optimization successful, returning assignments')
            return {
                assignments: jsResult.assignments.map((assignment: any) => ({
                    workerId: assignment.worker_id,
                    shiftId: assignment.shift_id,
                })),
            }
        } else {
            console.error('Optimization failed:', jsResult.message)
            throw new Error(jsResult.message)
        }
    } catch (error) {
        console.error('Client-side optimization failed:', error)
        console.log('Falling back to server optimization...')
        return await ApiService.optimizeShift(transformConstraintsToBool(constraints))
    }
}

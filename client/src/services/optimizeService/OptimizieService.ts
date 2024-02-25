import ApiService from "../api";
import { OptimizeShiftResponse } from "../api/models";
import { UserAssigedShifts, UserConstraints } from "./models";


// export async function optimize(users: UserConstraints[]): Promise<number[][][]> {
//   const constraints = translateUserShiftToConstraints(users)
//   const optResponse = await ApiService.optimizeShift(constraints)
//   //TODO add isOptim:false promise rejection 
//   return optResponse.result
// }
export async function optimize(users: UserConstraints[]): Promise<UserAssigedShifts[]> {
  const constraints = translateUserShiftToConstraints(users)
  const optResponse = await ApiService.optimizeShift(constraints)
  //TODO add isOptim:false promise rejection 
  return OptimizeShiftResponseToUserAssigedShifts(optResponse, users)
}

export function translateUserShiftToConstraints(users: UserConstraints[]): number[][][] {
  const constraints = users.reduce(function (pV: number[][][], cV: UserConstraints, cI) {
    console.log("pv: ", pV, `cV: ${JSON.stringify(cV)}`);
    pV.push(cV.assignments);
    return pV; // *********  Important ******
  }, []);

  console.log(`constraints: ${JSON.stringify(constraints)}`)
  return constraints
}

async function OptimizeShiftResponseToUserAssigedShifts(optResponse: OptimizeShiftResponse, users: UserConstraints[]): Promise<UserAssigedShifts[]> {
  // console.log(`OptimizeShiftResponseToUserAssigedShifts->optResponse: ${JSON.stringify(optResponse)}`)
  const userAssigedShifts: UserAssigedShifts[] = users.reduce((acum, current, index) => {
    const assignedShift = {...current}
    assignedShift.assignments = [...optResponse.result[index]]
    acum.push(assignedShift)
    return acum
  },[] as UserAssigedShifts[])

  console.log(`OptimizeShiftResponseToUserAssigedShifts->userAssigedShifts: ${JSON.stringify(userAssigedShifts)}`)

  return Promise.resolve(userAssigedShifts)
  // throw new Error("Function not implemented.");
}

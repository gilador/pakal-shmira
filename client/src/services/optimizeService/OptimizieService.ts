import { UserAssigments } from "@app/screens/shiftScreen/models";
import ApiService from "../api";
import { OptimizeShiftResponse } from "../api/models";


// export async function optimize(users: UserConstraints[]): Promise<number[][][]> {
//   const constraints = translateUserShiftToConstraints(users)
//   const optResponse = await ApiService.optimizeShift(constraints)
//   //TODO add isOptim:false promise rejection 
//   return optResponse.result
// }
export async function optimize(users: UserAssigments[]): Promise<UserAssigments[]> {
  const constraints = translateUserShiftToConstraints(users)
  const optResponse = await ApiService.optimizeShift(constraints)
  //TODO add isOptim:false promise rejection 
  return OptimizeShiftResponseToUserAssigedShifts(optResponse, users)
}

export function translateUserShiftToConstraints(users: UserAssigments[]): number[][][] {
  const constraints = users.reduce(function (pV: number[][][], cV: UserAssigments) {
    // console.log("pv: ", pV, `cV: ${JSON.stringify(cV)}`);
    pV.push(cV.assignments.map(val=>val.map(inner=>+inner)));
    return pV;
  }, []);

  console.log(`constraints: ${JSON.stringify(constraints)}`)
  return constraints
}

async function OptimizeShiftResponseToUserAssigedShifts(optResponse: OptimizeShiftResponse, users: UserAssigments[]): Promise<UserAssigments[]> {
  // console.log(`OptimizeShiftResponseToUserAssigedShifts->optResponse: ${JSON.stringify(optResponse)}, users: ${JSON.stringify(users)}`)
  const userAssigedShifts: UserAssigments[] = users.reduce((acum, current, index) => {
    const assignedShift = {...current}
    assignedShift.assignments = [...optResponse.result[index]]
    acum.push(assignedShift)
    return acum
  },[] as UserAssigments[])

  console.log(`OptimizeShiftResponseToUserAssigedShifts->userAssigedShifts: ${JSON.stringify(userAssigedShifts)}`)

  return Promise.resolve(userAssigedShifts)
  // throw new Error("Function not implemented.");
}

import { UserShiftData } from "@app/screens/shiftScreen/models";
import ApiService from "../api";
import { OptimizeShiftResponse } from "../api/models";


// export async function optimize(users: UserConstraints[]): Promise<number[][][]> {
//   const constraints = translateUserShiftToConstraints(users)
//   const optResponse = await ApiService.optimizeShift(constraints)
//   //TODO add isOptim:false promise rejection 
//   return optResponse.result
// }
export async function optimize(users: UserShiftData[]): Promise<UserShiftData[]> {
  const constraints = translateUserShiftToConstraints(users)
  const optResponse = await ApiService.optimizeShift(constraints)
  //TODO add isOptim:false promise rejection 
  return OptimizeShiftResponseToUserAssignedShifts(optResponse, users)
}

export function translateUserShiftToConstraints(users: UserShiftData[]): number[][][] {
  const constraints = users.reduce(function (pV: number[][][], cV: UserShiftData) {
    // console.log("pv: ", pV, `cV: ${JSON.stringify(cV)}`);
    pV.push(cV.constraints.map(val=>val.map(inner=>+inner)));
    return pV;
  }, []);

  console.log(`constraints: ${JSON.stringify(constraints)}`)
  return constraints
}

async function OptimizeShiftResponseToUserAssignedShifts(optResponse: OptimizeShiftResponse, users: UserShiftData[]): Promise<UserShiftData[]> {
  const userAssignedShifts: UserShiftData[] = users.reduce((acum, current, index) => {
    const assignedShift = {...current}
    assignedShift.assignments = [...optResponse.result[index]]
    acum.push(assignedShift)
    return acum
  },[] as UserShiftData[])

  console.log(`OptimizeShiftResponseToUserAssignedShifts->userAssignedShifts: ${JSON.stringify(userAssignedShifts)}`)

  return Promise.resolve(userAssignedShifts)
  // throw new Error("Function not implemented.");
}

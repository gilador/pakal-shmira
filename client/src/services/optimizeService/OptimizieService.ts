import ApiService from "../api/ApiService";
import { UserAssigedShifts, UserConstraints } from "./models";


export async function optimize(users: UserConstraints[]): Promise<UserAssigedShifts[]> {
  const constraints = translateUserShiftToConstraints(users)
  const optResponse = await ApiService.optimizeShift(constraints)

  return new Promise(() => {
    return {
      name: "test",
      shifts: [[1], [2]]
    }
  }
  )
}

export function translateUserShiftToConstraints(users: UserConstraints[]): number[][][] {
  const constraints = users.reduce(function (pV: number[][][], cV: UserConstraints, cI) {
    console.log("pv: ", pV, `cV: ${JSON.stringify(cV)}`);
    pV.push(cV.constraints);
    return pV; // *********  Important ******
  }, []);

  console.log(`constraints: ${JSON.stringify(constraints)}`)
  return constraints
}
import ApiService from "../api/ApiService";
import { UserAssigedShifts, UserConstraints } from "./models";


export async function optimize(users: UserConstraints[]): Promise<UserAssigedShifts[]>{
    const constraints = users.reduce(function(pV: number[][][], cV: UserConstraints, cI){
        console.log("pv: ", pV);
        pV.push(cV.constraints);
        return pV; // *********  Important ******
      }, []);
      
    console.log(`constraints: ${constraints}`)
    // const optResponse = await ApiService.optimizeShift(users)
    
    return new Promise(() => {
      return {
        name: "test", 
        shifts: [[1],[2]]}}
    )
} 
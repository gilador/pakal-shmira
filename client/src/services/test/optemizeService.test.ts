import { translateUserShiftToConstraints } from "../optimizeService/OptimizieService";
import { UserConstraints } from "../optimizeService/models";

describe('Name of the group', () => {
    it('should translateUserShiftToConstraints transform correct', () => {
        const mockedUsersConstraints: UserConstraints[] = [{
            name: "Yosi",
            assignments: [[1,1,0,0],[1,1,1,1]],
            total:0
        },
        {
            name: "Matan",
            assignments: [[1,0,0,0],[0,0,1,1]],
            total:0
        }] 

        const result = translateUserShiftToConstraints(mockedUsersConstraints)
            
        expect(result).toEqual([[[1,1,0,0],[1,1,1,1]],[[1,0,0,0],[0,0,1,1]]]) 
    });
});
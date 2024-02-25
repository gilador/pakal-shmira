import { translateUserShiftToConstraints } from "../optimizeService/OptimizieService";
import { UserConstraints } from "../optimizeService/models";

describe('Name of the group', () => {
    it('should translateUserShiftToConstraints transform correct', () => {
        const mockedUsersConstraints: UserConstraints[] = [{
            name: "Yosi",
            assigemnts: [[1,1,0,0],[1,1,1,1]]
        },
        {
            name: "Matan",
            assigemnts: [[1,0,0,0],[0,0,1,1]]
        }] 

        const result = translateUserShiftToConstraints(mockedUsersConstraints)
            
        expect(result).toEqual([[[1,1,0,0],[1,1,1,1]],[[1,0,0,0],[0,0,1,1]]]) 
    });
});
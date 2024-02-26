import { UserAssigments } from "@app/screens/shiftScreen/models";
import { translateUserShiftToConstraints } from "../optimizeService/OptimizieService";

describe('Name of the group', () => {
    it('should translateUserShiftToConstraints transform correct', () => {
        const mockedUsersConstraints: UserAssigments[] = [{
            user: {name: "Yosi", id:'Yosi+0'},
            assignments: [[1,1,0,0],[1,1,1,1]],
            total:0
        },
        {
            user: {name: "Matan", id:'Matan+1'},
            assignments: [[1,0,0,0],[0,0,1,1]],
            total:0
        }] 

        const result = translateUserShiftToConstraints(mockedUsersConstraints)
            
        expect(result).toEqual([[[1,1,0,0],[1,1,1,1]],[[1,0,0,0],[0,0,1,1]]]) 
    });
});
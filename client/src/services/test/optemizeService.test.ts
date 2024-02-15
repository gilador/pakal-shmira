import { optimize } from "../optimizeService/OptimizieService";
import { UserConstraints } from "../optimizeService/models";

describe('Name of the group', () => {
    it('should ', () => {
        const mockedUsersConstraints: UserConstraints[] = [{
            name: "Yosi",
            constraints: [[1,1,0,0],[1,1,1,1]]
        },
        {
            name: "Matan",
            constraints: [[1,0,0,0],[0,0,1,1]]
        }] 

        const result = optimize(mockedUsersConstraints)

        expect(mockedUsersConstraints).not.toBe(undefined)
    });
});
import { ShiftMap, UserShiftData } from './models'
import { deriveUserDataMap } from './ShiftScreen'

describe('shiftMap', () => {
    let shiftMapInstance: ShiftMap
    const mockedUser = [
        { name: 'Yosi', id: 'Yosi+0' },
        { name: 'Matan', id: 'Matan+1' },
    ]
    const mockedUserData: UserShiftData[] = [
        {
            user: { name: 'Yosi', id: 'Yosi+0' },
            assignments: [],
            constraints: [
                [
                    { postID: '1', hourID: '1', availability: true },
                    { postID: '1', hourID: '2', availability: true },
                ],
                [
                    { postID: '2', hourID: '1', availability: true },
                    { postID: '2', hourID: '2', availability: true },
                ],
            ],
            totalAssignments: 0,
        },
        {
            user: { name: 'Matan', id: 'Matan+1' },
            assignments: [],
            constraints: [
                [
                    { postID: '1', hourID: '1', availability: true },
                    { postID: '1', hourID: '2', availability: true },
                ],
                [
                    { postID: '2', hourID: '1', availability: true },
                    { postID: '2', hourID: '2', availability: true },
                ],
            ],
            totalAssignments: 0,
        },
    ]

    beforeEach(() => {
        shiftMapInstance = new ShiftMap(mockedUserData)
    })

    it('should add a user to the shiftMap', () => {
        const newUser = {
            user: { name: 'John', id: 'John+2' },
            assignments: [],
            constraints: [
                [
                    { postID: '1', hourID: '1', availability: true },
                    { postID: '1', hourID: '2', availability: true },
                ],
                [
                    { postID: '2', hourID: '1', availability: true },
                    { postID: '2', hourID: '2', availability: true },
                ],
            ],
            totalAssignments: 0,
        }

        shiftMapInstance.addUser(newUser)

        expect(shiftMapInstance.getUser(newUser.user.id)).toEqual(newUser)
    })

    it('should update a user to in shiftMap deep clone', () => {
        const newConstraints = [
            [
                { postID: '1', hourID: '1', availability: false },
                { postID: '1', hourID: '2', availability: true },
            ],
            [
                { postID: '2', hourID: '1', availability: true },
                { postID: '2', hourID: '2', availability: true },
            ],
        ]

        const newShiftMap = shiftMapInstance.copy()

        const uerShiftData = newShiftMap.getUser('Yosi+0')
        if (uerShiftData) {
            uerShiftData.constraints = newConstraints
            // shiftMapInstance.updateUser(uerShiftData)
        }
        expect(newShiftMap.getUser('Yosi+0')?.constraints).toEqual(newConstraints)

        const updatedUser = {
            user: { name: 'Yosi', id: 'Yosi+0' },
            assignments: [],
            constraints: [
                [
                    { postID: '1', hourID: '1', availability: false },
                    { postID: '1', hourID: '2', availability: true },
                ],
                [
                    { postID: '2', hourID: '1', availability: true },
                    { postID: '2', hourID: '2', availability: true },
                ],
            ],
            totalAssignments: 0,
        }
        newShiftMap.updateUser(updatedUser)
        expect(newShiftMap.getShift('Yosi+011')).toEqual({ postID: '1', hourID: '1', availability: false })
    })
    it('should deriveUserDataMap apply past constraints', () => {
        const updatedYosi = JSON.parse(JSON.stringify(shiftMapInstance.getUser('Yosi+0')))
        updatedYosi.constraints[0][0].availability = false
        shiftMapInstance.updateUser(updatedYosi)
        const defaultConstraints = [
            [
                { postID: '1', hourID: '1', availability: true },
                { postID: '1', hourID: '2', availability: true },
            ],
            [
                { postID: '2', hourID: '1', availability: true },
                { postID: '2', hourID: '2', availability: true },
            ],
        ]
        const derived = deriveUserDataMap(mockedUser, defaultConstraints, shiftMapInstance)
        expect(derived.getShift('Yosi+011')).toEqual({ postID: '1', hourID: '1', availability: false })
    })

    // it('should remove a user from the shiftMap', () => {
    //     const userId = 'Yosi+0'+

    //     shiftMapInstance.removeUser(userId)

    //     expect(shiftMapInstance.getUser(userId)).toBeUndefined()
    // })
})

// it('should return the correct number of users in the shiftMap', () => {
//     const expectedSize = 2

//     expect(shiftMapInstance.userSize()).toEqual(expectedSize)
// })

// it('should return an array of all users in the shiftMap', () => {
//     const expectedUsers = [
//         {
//             user: { name: 'Yosi', id: 'Yosi+0' },
//             assignments: [],
//             constraints: [
//                 [
//                     { postID: '1', hourID: '1', availability: true },
//                     { postID: '1', hourID: '2', availability: true },
//                 ],
//                 [
//                     { postID: '2', hourID: '1', availability: true },
//                     { postID: '2', hourID: '2', availability: true },
//                 ],
//             ],
//             totalAssignments: 0,
//         },
//         {
//             user: { name: 'Matan', id: 'Matan+1' },
//             assignments: [],
//             constraints: [
//                 [
//                     { postID: '1', hourID: '1', availability: true },
//                     { postID: '1', hourID: '2', availability: true },
//                 ],
//                 [
//                     { postID: '2', hourID: '1', availability: true },
//                     { postID: '2', hourID: '2', availability: true },
//                 ],
//             ],
//             totalAssignments: 0,
//         },
//     ]

//     expect(shiftMapInstance.userValues()).toEqual(expectedUsers)
// })

// it('should have ', () => {
// })

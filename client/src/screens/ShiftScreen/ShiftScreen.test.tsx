import { deriveUserDataMap } from './ShiftScreen'
import { UserShiftData } from './models'

describe('deriveUserDataMap', () => {
    it('should derive user data map correctly', () => {
        // Arrange
        const names = [
            { id: '1', name: 'John' },
            { id: '2', name: 'Jane' },
        ]
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
        const oldMap = new Map<string, UserShiftData>([
            [
                '1',
                {
                    user: { id: '1', name: 'John' },
                    constraints: [
                        [
                            { postID: '1', hourID: '1', availability: true },
                            { postID: '1', hourID: '3', availability: true },
                        ],
                    ],
                    totalAssignments: 1,
                },
            ],
        ])

        // Act

        const result = deriveUserDataMap(names, defaultConstraints, oldMap)

        // Assert
        expect(result.size).toBe(2)
        expect(result.get('1')).toEqual({
            user: { id: '1', name: 'John' },
            constraints: [[{ postID: '1', hourID: '1', availability: true }]],
            totalAssignments: 1,
        })
        expect(result.get('2')).toEqual({
            user: { id: '2', name: 'Jane' },
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
        })
    })
})

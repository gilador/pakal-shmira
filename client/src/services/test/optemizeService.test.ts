import { translateUserShiftToConstraints } from "../optimizeService/OptimizeService"
import { UserShiftData } from "@app/screens/shiftScreen/models"

describe("Name of the group", () => {
  it("should translateUserShiftToConstraints transform correct", () => {
    const mockedUsersConstraints: UserShiftData[] = [
      {
        user: { name: "Yosi", id: "Yosi+0" },
        assignments: [],
        constraints: [
          [true, true, false, false],
          [true, true, true, true],
        ],
        totalAssignments: 0,
      },
      {
        user: { name: "Matan", id: "Matan+1" },
        assignments: [],
        constraints: [
          [true, false, false, false],
          [false, false, true, true],
        ],
        totalAssignments: 0,
      },
    ]

    const result = translateUserShiftToConstraints(mockedUsersConstraints)

    expect(result).toEqual([
      [
        [1, 1, 0, 0],
        [1, 1, 1, 1],
      ],
      [
        [1, 0, 0, 0],
        [0, 0, 1, 1],
      ],
    ])
  })
})

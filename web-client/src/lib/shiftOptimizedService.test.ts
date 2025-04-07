import { optimizeShift } from "./shiftOptimizedService";
import { UserShiftData } from "@/models";
import { runPythonCode } from "./pythonService";

// Mock the pythonService module
jest.mock("./pythonService", () => ({
  runPythonCode: jest.fn(),
}));

describe("optimizeShift", () => {
  beforeEach(() => {
    // Clear mock before each test
    (runPythonCode as jest.Mock).mockClear();
  });

  it("should return empty result when no users are provided", async () => {
    const mockUserData: UserShiftData[] = [];
    const expectedResult = {
      result: [],
      isOptim: true,
    };

    (runPythonCode as jest.Mock).mockResolvedValue(expectedResult);

    const result = await optimizeShift(mockUserData);
    expect(result).toEqual(expectedResult);
  });

  it("should handle single user with single shift and time slot", async () => {
    const mockUserData: UserShiftData[] = [
      {
        user: { id: "1", name: "John" },
        constraints: [[{ postID: "1", hourID: "1", availability: true }]],
        totalAssignments: 0,
      },
    ];

    const expectedResult = {
      result: [[[true]]],
      isOptim: true,
    };

    (runPythonCode as jest.Mock).mockResolvedValue(expectedResult);

    const result = await optimizeShift(mockUserData);
    expect(result).toEqual(expectedResult);
  });

  it("should handle multiple users with multiple shifts and time slots", async () => {
    const mockUserData: UserShiftData[] = [
      {
        user: { id: "1", name: "John" },
        constraints: [
          [
            { postID: "1", hourID: "1", availability: true },
            { postID: "1", hourID: "2", availability: false },
          ],
          [
            { postID: "2", hourID: "1", availability: true },
            { postID: "2", hourID: "2", availability: true },
          ],
        ],
        totalAssignments: 0,
      },
      {
        user: { id: "2", name: "Jane" },
        constraints: [
          [
            { postID: "1", hourID: "1", availability: false },
            { postID: "1", hourID: "2", availability: true },
          ],
          [
            { postID: "2", hourID: "1", availability: true },
            { postID: "2", hourID: "2", availability: false },
          ],
        ],
        totalAssignments: 0,
      },
    ];

    const expectedResult = {
      result: [
        [
          [true, false],
          [true, true],
        ],
        [
          [false, true],
          [true, false],
        ],
      ],
      isOptim: true,
    };

    (runPythonCode as jest.Mock).mockResolvedValue(expectedResult);

    const result = await optimizeShift(mockUserData);
    expect(result).toEqual(expectedResult);
  });

  it("should handle error from Python code", async () => {
    const mockUserData: UserShiftData[] = [
      {
        user: { id: "1", name: "John" },
        constraints: [[{ postID: "1", hourID: "1", availability: true }]],
        totalAssignments: 0,
      },
    ];

    (runPythonCode as jest.Mock).mockRejectedValue(
      new Error("Python execution failed")
    );

    await expect(optimizeShift(mockUserData)).rejects.toThrow(
      "Failed to optimize shifts"
    );
  });
});

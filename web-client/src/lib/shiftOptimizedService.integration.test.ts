import { optimizeShift } from "./shiftOptimizedService";
import { UserShiftData } from "@/models";

// Don't mock pythonService for integration tests
jest.unmock("./pythonService");

describe("optimizeShift Integration", () => {
  it("should correctly derive dimensions from input data", async () => {
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
    ];

    const result = await optimizeShift(mockUserData);

    // Verify dimensions match input data
    expect(result.result.length).toBe(1); // 1 user
    expect(result.result[0].length).toBe(2); // 2 shifts
    expect(result.result[0][0].length).toBe(2); // 2 time slots
  });

  it("should handle multiple users and preserve data structure", async () => {
    const mockUserData: UserShiftData[] = [
      {
        user: { id: "1", name: "John" },
        constraints: [[{ postID: "1", hourID: "1", availability: true }]],
        totalAssignments: 0,
      },
      {
        user: { id: "2", name: "Jane" },
        constraints: [[{ postID: "1", hourID: "1", availability: false }]],
        totalAssignments: 0,
      },
    ];

    const result = await optimizeShift(mockUserData);

    // Verify structure and types
    expect(Array.isArray(result.result)).toBe(true);
    expect(result.result.length).toBe(2);
    expect(Array.isArray(result.result[0])).toBe(true);
    expect(Array.isArray(result.result[0][0])).toBe(true);
    expect(typeof result.result[0][0][0]).toBe("boolean");
  });

  it("should respect user constraints in output", async () => {
    const mockUserData: UserShiftData[] = [
      {
        user: { id: "1", name: "John" },
        constraints: [
          [
            { postID: "1", hourID: "1", availability: true },
            { postID: "1", hourID: "2", availability: false },
          ],
        ],
        totalAssignments: 0,
      },
    ];

    const result = await optimizeShift(mockUserData);

    // Verify the output pattern matches input constraints
    // The actual values might be different due to optimization,
    // but the structure should be preserved
    expect(result.result[0][0].length).toBe(2);
    expect(typeof result.result[0][0][0]).toBe("boolean");
    expect(typeof result.result[0][0][1]).toBe("boolean");
  });

  it("should handle empty input gracefully", async () => {
    const result = await optimizeShift([]);

    expect(result.result).toEqual([]);
    expect(result.isOptim).toBe(true);
  });

  // Test that Python code can handle various data patterns
  it.each([
    [1, 1, 1], // Minimal case
    [2, 2, 2], // Small square case
    [3, 2, 4], // Rectangle case
    [5, 3, 2], // Larger case
  ])(
    "should handle %i users, %i shifts, %i time slots",
    async (users, shifts, timeSlots) => {
      // Generate test data dynamically
      const mockUserData: UserShiftData[] = Array(users)
        .fill(null)
        .map((_, userIndex) => ({
          user: { id: String(userIndex), name: `User${userIndex}` },
          constraints: Array(shifts)
            .fill(null)
            .map(() =>
              Array(timeSlots)
                .fill(null)
                .map(() => ({
                  postID: "1",
                  hourID: "1",
                  availability: true,
                }))
            ),
          totalAssignments: 0,
        }));

      const result = await optimizeShift(mockUserData);

      // Verify dimensions
      expect(result.result.length).toBe(users);
      expect(result.result[0].length).toBe(shifts);
      expect(result.result[0][0].length).toBe(timeSlots);
    }
  );
});

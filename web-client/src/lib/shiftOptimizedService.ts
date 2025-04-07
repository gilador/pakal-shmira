import { runPythonCode } from "./pythonService";
import { UserShiftData } from "@/models";

export interface OptimizedShiftResult {
  result: boolean[][][];
  isOptim: boolean;
}

export async function optimizeShift(
  userData: UserShiftData[]
): Promise<OptimizedShiftResult> {
  try {
    // Convert user data to Python-compatible format
    const pythonUserData = userData.map((user) => ({
      user: {
        id: user.user.id,
        name: user.user.name,
      },
      constraints: user.constraints.map((shift) =>
        shift.map((slot) => ({
          postID: slot.postID,
          hourID: slot.hourID,
          availability: slot.availability,
        }))
      ),
      totalAssignments: user.totalAssignments,
    }));

    // Log the data before stringification
    console.log("Python user data before stringification:", pythonUserData);

    // Stringify the data and convert boolean values
    const jsonString = JSON.stringify(pythonUserData)
      .replace(/"true"/g, "True")
      .replace(/"false"/g, "False");

    // Import and run the optimizer
    const code = `
import json

# Convert the JSON string to Python data structure
user_data = json.loads('${jsonString}')
print("Python received data:", user_data)
result = generate_solution(user_data)
print("Python result:", result)
json.dumps(result)
`;

    console.log("Python code to be executed:", code);
    const result = await runPythonCode(code);
    console.log("Python returned result:", result);

    // Parse the result and convert boolean values back to JavaScript format
    const parsedResult = JSON.parse(
      result.replace(/True/g, "true").replace(/False/g, "false")
    );
    return parsedResult;
  } catch (error) {
    console.error("Error running Python optimizer:", error);
    throw new Error("Failed to optimize shifts");
  }
}

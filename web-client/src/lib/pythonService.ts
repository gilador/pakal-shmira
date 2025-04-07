import { loadPyodide } from "pyodide";

let pyodideInstance: any = null;

export async function initializePython() {
  console.log("Starting Python initialization...");
  if (!pyodideInstance) {
    console.log("Creating new Pyodide instance...");
    pyodideInstance = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
    });
    console.log("Pyodide instance created");

    // Redirect Python print to browser console
    console.log("Setting up Python print redirection...");
    pyodideInstance.runPython(`
      import sys
      import js
      def print_to_console(*args, **kwargs):
          js.console.log('Python:', *args)
      sys.stdout.write = print_to_console
      sys.stderr.write = print_to_console
      print = print_to_console
      print("Python print redirection test")  # Test print
    `);
    console.log("Python print redirection setup complete");

    // Load the optimizer module
    console.log("Loading micropip...");
    await pyodideInstance.loadPackage("micropip");
    console.log("Installing numpy and pulp...");
    await pyodideInstance.runPythonAsync(`
      import micropip
      await micropip.install(["numpy", "pulp"], keep_going=True)
      print("Python packages installed successfully")
    `);
    console.log("Packages installed");

    // Load local Python files
    console.log("Loading optimizer code...");
    const optimizerCode = await fetch("/src/lib/python/optimizer.py").then(
      (res) => res.text()
    );
    console.log("Optimizer code loaded, executing...");
    await pyodideInstance.runPythonAsync(optimizerCode);
    console.log("Optimizer code executed");
  }
  return pyodideInstance;
}

export async function runPythonCode(code: string, data?: any): Promise<any> {
  console.log("Running Python code...");
  const pyodide = await initializePython();

  if (data) {
    console.log("Processing input data...");
    // Convert the data to a format Python can understand
    const pythonData = JSON.stringify(data)
      .replace(/"true"/g, "True")
      .replace(/"false"/g, "False");
    await pyodide.runPythonAsync(`
import json
input_data = json.loads('${pythonData}')
print("Input data loaded:", input_data)
    `);
  }

  console.log("Executing Python code...");
  // Convert boolean values in the code string
  const pythonCode = code
    .replace(/"true"/g, "True")
    .replace(/"false"/g, "False");

  const result = await pyodide.runPythonAsync(pythonCode);
  console.log("Python code execution complete");
  return result;
}

from pulp import *
from typing import List, Dict, Any
from pydantic import BaseModel

class ShiftRequest(BaseModel):
    shifts: List[Dict[str, Any]]
    workers: List[Dict[str, Any]]
    worker_preferences: List[Dict[str, Any]]
    min_shifts_per_worker: int
    max_shifts_per_worker: int

class ShiftOptimizer:
    def __init__(self):
        print("Initializing ShiftOptimizer")

    def optimize(self, request: ShiftRequest) -> Dict[str, Any]:
        print("Starting optimization process")
        print(f"Number of workers: {len(request.workers)}")
        print(f"Number of shifts: {len(request.shifts)}")
        print(f"Number of preferences: {len(request.worker_preferences)}")

        # Create the model
        model = LpProblem(name="shift_assignment", sense=LpMaximize)
        print("Created optimization model")

        shifts = request.shifts
        workers = request.workers
        worker_preferences = request.worker_preferences
        min_shifts = request.min_shifts_per_worker
        max_shifts = request.max_shifts_per_worker

        # Create variables
        print("Creating decision variables...")
        assignments = LpVariable.dicts(
            "assign",
            ((w["id"], s["id"]) for w in workers for s in shifts),
            cat="Binary"
        )
        print(f"Created {len(assignments)} decision variables")

        # Objective function
        print("Setting up objective function...")
        preference_scores = {
            (pref["worker_id"], pref["shift_id"]): pref["preference_score"]
            for pref in worker_preferences
        }
        
        model += lpSum(
            preference_scores.get((w["id"], s["id"]), 0) * assignments[(w["id"], s["id"])]
            for w in workers
            for s in shifts
        )
        print("Objective function set up")

        # Constraints
        print("Adding constraints...")
        for s in shifts:
            model += lpSum(assignments[(w["id"], s["id"])] for w in workers) == 1

        for w in workers:
            model += min_shifts <= lpSum(assignments[(w["id"], s["id"])] for s in shifts) <= max_shifts
        print("Constraints added")

        # Solve
        print("Solving optimization problem...")
        status = model.solve()
        print(f"Solution status: {status}")

        if status == 1:
            print("Optimal solution found")
            assignments_result = []
            for w in workers:
                for s in shifts:
                    if value(assignments[(w["id"], s["id"])]) == 1:
                        assignments_result.append({
                            "worker_id": w["id"],
                            "shift_id": s["id"]
                        })

            print(f"Found {len(assignments_result)} assignments")
            return {
                "status": "success",
                "assignments": assignments_result,
                "objective_value": value(model.objective)
            }
        else:
            print("No optimal solution found")
            return {
                "status": "error",
                "message": "No optimal solution found"
            } 
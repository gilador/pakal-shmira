from flask import jsonify
from pulp import *
import numpy as np
from modules.model.optim_result import OptimReult

def solve_shift_optimization(availability_matrix) -> OptimReult:
    flatten_matrix = flatten_availability_matrix(availability_matrix)
    np_matrix = np.array(flatten_matrix)
    num_employees, num_slots = np_matrix.shape
    posts_amount = len(availability_matrix[0])
    num_abs_shifts = num_slots // posts_amount

    # Create binary variables for shift assignments
    x = LpVariable.dicts("shift_assignment", ((i, j) for i in range(num_employees) for j in range(num_slots)), cat='Binary')

    # Create the linear programming problem
    prob = LpProblem("Shift_Optimization", LpMinimize)

    # Availability and consecutivity constraints
    for i in range(num_employees):
        for j in range(num_slots):
            if not np_matrix[i][j]:
                prob += x[(i, j)] == 0, f"Availability_Constraint_{i}_{j}"

    for e in range(num_employees):
        for s in range(num_abs_shifts - 1):
            temp_constraints = [x[(e, s + p * num_abs_shifts)] + x[(e, s + 1 + p * num_abs_shifts)] for p in range(posts_amount)]
            prob += lpSum(temp_constraints) <= 1, f"Employee_Consecutivity_Constraint_{e}_{s}"

    # Shift coverage constraint 
    for s in range(num_slots):
        temp_constraints = [x[(e, s)] for e in range(num_employees)]
        prob += lpSum(temp_constraints) == 1, f"Shift_Coverage_Constraint{s}"

    # Calculate absolute shift differences
    shift_of_employees_diff = [LpVariable(f"Absolute_Value_Variable_{i}", cat='Binary') for i in range(num_employees)]
    target_avg_shifts = num_slots / num_employees

    # Positive and negative aisle difference constraints
    for employee in range(num_employees):
        prob += shift_of_employees_diff[employee] >= lpSum(x[(employee, shift)] for shift in range(num_slots)) - target_avg_shifts, f"Dist_Diff_Positive_Constraint_{employee}"
        prob += shift_of_employees_diff[employee] >= target_avg_shifts - lpSum(x[(employee, shift)] for shift in range(num_slots)), f"Dist_Diff_Negative_Constraint_{employee}"

    # Minimize the total diff (same as min avg diff)
    prob += lpSum(shift_of_employees_diff)

    # Solve the problem
    prob.solve()

    # Extract and return the results
    result_matrix = np.array([[x[(i, j)].varValue for j in range(num_slots)] for i in range(num_employees)])
    reformed_list = reform_availability_matrix(result_matrix.tolist(), num_abs_shifts)
    return OptimReult(reformed_list, prob.status == 1)

def flatten_availability_matrix(original_list):
    transformed_list = []

    for nested_list in original_list:
        flattened_inner_lists = [item for sublist in nested_list for item in sublist]
        transformed_list.append(flattened_inner_lists)


    return transformed_list

def reform_availability_matrix(original_list, k):
    transformed_list = []
    for inner_list in original_list:
        num_chunks = len(inner_list) // k
        chunks = [[bool(value) for value in inner_list[i * k : (i + 1) * k]] for i in range(num_chunks)]
        transformed_list.append(chunks)

    return transformed_list
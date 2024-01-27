from pulp import *
import numpy as np

def solve_shift_optimization(availability_matrix, equal_distribution_tolerance=0.1):
    num_employees, num_shifts = availability_matrix.shape

    # Create a binary variable for each employee-shift assignment
    x = LpVariable.dicts("shift_assignment", ((i, j) for i in range(num_employees) for j in range(num_shifts)), cat='Binary')

    # Create the linear programming problem
    prob = LpProblem("Shift_Optimization", LpMinimize)

    # No cost as each employee has the same cost

    # Availability constraints
    for i in range(num_employees):
        for j in range(num_shifts):
            if not availability_matrix[i][j]:
                prob += x[(i, j)] == 0, f"Availability_Constraint_{i}_{j}"

    # Shift coverage constraint 
    for j in range(num_shifts):
        prob += lpSum(x[(i, j)] for i in range(num_employees)) == 1, f"Shift_Coverage_Constraint_{j}"
        
        
    # # Create binary variables for absolute values
    # y = pulp.LpVariable.dicts("Absolute_Value_Variable", ((i, j) for i in range(num_employees) for j in range(num_shifts)), cat='Binary')

    # # Objective function to minimize deviation from equal distribution
    # target_avg_shifts = num_shifts / num_employees
    # deviation_expr = pulp.LpAffineExpression()

    # for i in range(num_employees):
    #     for j in range(num_shifts):
    #         deviation_expr += pulp.lpSum([y[(i, j)] - target_avg_shifts, target_avg_shifts - x[(i, j)]])

    # prob += deviation_expr, "Minimize_Deviation_Objective"
    
    shift_of_employees_diff = LpVariable.dicts("Absolute_Value_Variable", ((i) for i in range(num_employees)), cat='Binary')
    target_avg_shifts = num_shifts / num_employees

    # constraint:  the "positive" aisle difference side of the ABS
    for employee in range(num_employees):
        prob += shift_of_employees_diff[employee] >= \
               lpSum(x[(employee, shift)] for shift in range(num_shifts)) - target_avg_shifts, f"Dist_Diff_Positive_Constarint_{employee}"
               
    # constraint:  the "negative" aisle difference side of the ABS
    for employee in range(num_employees):
        prob += shift_of_employees_diff[employee] >= \
               target_avg_shifts - lpSum(x[(employee, shift)] for shift in range(num_shifts)), f"Dist_Diff_Negative_Constarint_{employee}"

    # OBJ:  minimize the total diff (same as min avg diff)
    prob += lpSum(shift_of_employees_diff[employee] for employee in range(num_employees))
    
    print("==++==")
    print(prob)
    print("==--==")
    
    # Solve the problem
    prob.solve()

    # Extract and return the results
    result_matrix = np.zeros((num_employees, num_shifts))
    for i in range(num_employees):
        for j in range(num_shifts):
            result_matrix[i][j] = x[(i, j)].varValue

    return result_matrix

# Example usage
availability_matrix = np.array([[1, 1, 1, 1], [1, 0, 1, 1]])

result = solve_shift_optimization(availability_matrix)
print("Optimal Shift Assignment:")
print(result)

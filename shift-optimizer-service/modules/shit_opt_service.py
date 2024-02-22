from flask import jsonify
from pulp import *
import numpy as np
from modules.model.optim_result import OptimReult

def solve_shift_optimization(availability_matrix) -> OptimReult :
    # 4X2X2 => 8X2
    #[[[1,1,0,0],[1,1,1,1]],[[1,0,0,0],[0,0,1,1]]] =>  [[1,1,0,0,1,1,1,1],[1,0,0,0,0,0,1,1]]
    # user shifts per post => user shifts

    flatten_matrix = flatten_availability_matrix(availability_matrix)
    np_matrix = np.array(flatten_matrix)
    num_employees, num_slots = np_matrix.shape
    posts_amount = len(availability_matrix[0])
    num_abs_shifts = int(num_slots / posts_amount)

    # distinct_shift = len(flatten_matrix[0])

    print(f"solve_shift_optimization -> availability_matrix: {json.dumps(availability_matrix)}")
    print(f"solve_shift_optimization -> flatten_matrix: {json.dumps(flatten_matrix)}")
    print(f'solve_shift_optimization -> num_employees:{num_employees}, posts_amount: {posts_amount}, num_abs_shifts:{num_abs_shifts}')
    
    print(f"num_employees: {num_employees}, num_slots: {num_slots}")

    # Create a binary variable for each employee-shift assignment
    x = LpVariable.dicts("shift_assignment", ((i, j) for i in range(num_employees) for j in range(num_slots)),cat='Binary')

    # Create the linear programming problem
    prob = LpProblem("Shift_Optimization", LpMinimize)

    # Availability constraints
    for i in range(num_employees):
        for j in range(num_slots):
            if not np_matrix[i][j]:
                prob += x[(i, j)] == 0, f"Availability_Constraint_{i}_{j}"                  
    
    # Consecutivity  constraints
    for e in range(num_employees):
        print(f'e:{e}')
        for s in range(num_abs_shifts - 1):
            temp_constraints = []
            #build the constraint for the current and the next absalute shift
            for p in range(posts_amount):
                post_offset = p * (num_abs_shifts)
                shift_pos = s + post_offset
                ele1_pos = (e, shift_pos)
                ele2_pos = (e, shift_pos + 1)
                print(f'solve_shift_optimization->Consecutivity_Constraint->e:{e}, s:{s}, ele1_pos:{ele1_pos}, ele2_pos:{ele2_pos}')
                temp_constraints.append(x[ele1_pos]+x[ele2_pos])
            lp_sum = lpSum(temp_constraints) <= 1, f"Employee_Consecutivity_Constraint_{e}_{s}"
            print(f'solve_shift_optimization->Consecutivity_Constraint->lp_sum: {lp_sum}')
            prob += lp_sum


    # Shift coverage constraint 
    for s in range(num_slots):
        temp_constraints = []
        #build the constraint for each absalute shift
        for e in range(num_employees):
            ele1_pos = (e, s)
            temp_constraints.append(x[ele1_pos])
            print(f'solve_shift_optimization->Shift_Coverage_Constraint->e:{e}, s:{s}, ele1_pos:{ele1_pos}, ele1_value:{x[ele1_pos]}')
        lp_sum = lpSum(temp_constraints) == 1, f"Shift_Coverage_Constraint{s}"
        print(f'solve_shift_optimization->Shift_Coverage_Constraint->lp_sum: {lp_sum}')
        prob += lp_sum
    
    shift_of_employees_diff = LpVariable.dicts("Absolute_Value_Variable", ((i) for i in range(num_employees)), cat='Binary')
    target_avg_shifts = num_slots / num_employees

    # constraint:  the "positive" aisle difference side of the ABS
    for employee in range(num_employees):
        prob += shift_of_employees_diff[employee] >= \
               lpSum(x[(employee, shift)] for shift in range(num_slots)) - target_avg_shifts, f"Dist_Diff_Positive_Constarint_{employee}"
               
    # constraint:  the "negative" aisle difference side of the ABS
    for employee in range(num_employees):
        prob += shift_of_employees_diff[employee] >= \
               target_avg_shifts - lpSum(x[(employee, shift)] for shift in range(num_slots)), f"Dist_Diff_Negative_Constarint_{employee}"

    # OBJ:  minimize the total diff (same as min avg diff)
    prob += lpSum(shift_of_employees_diff[employee] for employee in range(num_employees))
    
    print("==++==")
    print(prob)
    print("==--==")
    
    # Solve the problem
    prob.solve()

    
    print(f"prob.status: {prob.status}")

    # Extract and return the results
    result_matrix = np.zeros((num_employees, num_slots)).astype(int)
    for i in range(num_employees):
        for j in range(num_slots):
            result_matrix[i][j] = x[(i, j)].varValue
    
    reformed_list = reform_availability_matrix(result_matrix.tolist(), num_abs_shifts)
    return OptimReult(reformed_list, prob.status==1)


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
        chunks = [inner_list[i * k : (i + 1) * k] for i in range(num_chunks)]
        transformed_list.append(chunks)

    return transformed_list
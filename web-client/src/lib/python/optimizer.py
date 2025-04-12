from js import console
from pulp import LpProblem, LpVariable, LpMinimize, lpSum, value

def generate_solution(availability_matrix):
    """
    Generate a solution based on availability matrix using PuLP's LpProblem.
    
    Args:
        availability_matrix (list): 3D list of boolean values representing availability
            First dimension: users
            Second dimension: shifts
            Third dimension: time slots
        
    Returns:
        dict: Solution containing result array and optimization status
    """
    try:
        import numpy as np
        
        # Convert to numpy array
        availability = np.array(availability_matrix, dtype=bool)
        
        # Get dimensions
        num_users, num_shifts, num_time_slots = availability.shape
        if num_users == 0:
            return {"result": [], "isOptim": True}
        
        # Create the problem
        prob = LpProblem("Shift_Assignment", LpMinimize)
        
        # Create binary variables for each user-shift-time_slot combination
        x = {}
        for user in range(num_users):
            for shift in range(num_shifts):
                for time_slot in range(num_time_slots):
                    x[(user, shift, time_slot)] = LpVariable(
                        f"x_{user}_{shift}_{time_slot}", 
                        cat='Binary'
                    )
        
        # Add availability constraints
        for user in range(num_users):
            for shift in range(num_shifts):
                for time_slot in range(num_time_slots):
                    if not availability[user, shift, time_slot]:
                        prob += x[(user, shift, time_slot)] == 0
        
        # Add coverage constraints (each shift-time_slot must have exactly one user)
        for shift in range(num_shifts):
            for time_slot in range(num_time_slots):
                prob += lpSum(x[(user, shift, time_slot)] for user in range(num_users)) == 1
        
        # Add consecutivity constraints
        for user in range(num_users):
            for shift in range(num_shifts - 1):
                for time_slot in range(num_time_slots):
                    prob += x[(user, shift, time_slot)] + x[(user, shift + 1, time_slot)] <= 1
        
        # Calculate target shifts per user
        total_slots = num_shifts * num_time_slots
        target_shifts = total_slots / num_users
        
        # Create variables for positive and negative differences
        d_pos = {}
        d_neg = {}
        for user in range(num_users):
            d_pos[user] = LpVariable(f"d_pos_{user}", lowBound=0)
            d_neg[user] = LpVariable(f"d_neg_{user}", lowBound=0)
            
            # Add constraints for differences
            total_user_shifts = lpSum(x[(user, shift, time_slot)] 
                                    for shift in range(num_shifts) 
                                    for time_slot in range(num_time_slots))
            prob += total_user_shifts - d_pos[user] + d_neg[user] == target_shifts
        
        # Set objective: minimize total difference
        prob += lpSum(d_pos[user] + d_neg[user] for user in range(num_users))
        
        # Solve the problem
        prob.solve()
        
        # Extract results
        solution = np.zeros((num_users, num_shifts, num_time_slots), dtype=bool)
        for user in range(num_users):
            for shift in range(num_shifts):
                for time_slot in range(num_time_slots):
                    if value(x[(user, shift, time_slot)]) == 1:
                        solution[user, shift, time_slot] = True
        
        # Convert to list format
        result = solution.tolist()
        
        return {
            "result": result,
            "isOptim": prob.status == 1
        }
        
    except Exception as e:
        console.log(f"Error in optimization: {str(e)}")
        return {"result": [], "isOptim": False} 
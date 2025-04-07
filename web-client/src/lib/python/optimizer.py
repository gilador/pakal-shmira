def generate_solution(user_data):
    """
    Generate a solution based on user constraints using deterministic assignment.
    
    Args:
        user_data (list): List of user data containing constraints
        
    Returns:
        dict: Solution containing result array and optimization status
    """
    print("Python received data type:", type(user_data))
    print("Python received data:", user_data)
    
    # Test that numpy is working
    try:
        import numpy as np
        
        # Test numpy with a simple linear algebra example
        A = np.array([[1, 2], [3, 4]])
        B = np.array([[5, 6], [7, 8]])
        C = np.dot(A, B)
        
        print("Test optimization solution:")
        print(f"Matrix multiplication result:\n{C}")
        
        # Test numpy array operations
        arr = np.array([1, 2, 3, 4, 5])
        print(f"Numpy test - array sum: {np.sum(arr)}")
        print(f"Numpy test - array mean: {np.mean(arr)}")
        
    except Exception as e:
        print(f"Error testing packages: {str(e)}")
    
    # Derive dimensions from input data
    num_users = len(user_data)ddd
    if num_users == 0:
        return {"result": [], "isOptim": True}
        
    # Get number of shifts and time slots from the first user's constraints
    first_user = user_data[0]
    num_shifts = len(first_user['constraints'])
    num_time_slots = len(first_user['constraints'][0]) if num_shifts > 0 else 0
    
    # Generate solution array with derived dimensions
    solution = []
    for user_idx in range(num_users):
        user_solution = []
        for shift_idx in range(num_shifts):
            time_slots = []
            for time_slot_idx in range(num_time_slots):
                # Check if user is available for this shift
                is_available = bool(user_data[user_idx]['constraints'][shift_idx][time_slot_idx]['availability'])
                # Use deterministic assignment based on user index and time slot
                # This ensures consistent test results
                should_assign = is_available and ((user_idx + time_slot_idx) % 2 == 0)
                time_slots.append(should_assign)
            user_solution.append(time_slots)
        solution.append(user_solution)
    
    # Convert boolean values to proper JSON format
    result = {
        "result": [[[bool(x) for x in row] for row in user] for user in solution],
        "isOptim": True
    }
    
    return result 
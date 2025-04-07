import unittest

def generate_mock_solution(user_data):
    # Derive dimensions from input data
    num_users = len(user_data)
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
                # Use actual constraints from input data
                is_available = user_data[user_idx]['constraints'][shift_idx][time_slot_idx]['availability']
                time_slots.append(is_available)
            user_solution.append(time_slots)
        solution.append(user_solution)
    
    return {
        "result": solution,
        "isOptim": True
    }

class TestOptimizer(unittest.TestCase):
    def test_empty_input(self):
        result = generate_mock_solution([])
        self.assertEqual(result, {"result": [], "isOptim": True})

    def test_single_user_single_slot(self):
        user_data = [{
            "user": {"id": "1", "name": "John"},
            "constraints": [[{"postID": "1", "hourID": "1", "availability": True}]],
            "totalAssignments": 0
        }]
        result = generate_mock_solution(user_data)
        self.assertEqual(result["result"], [[[True]]])
        self.assertTrue(result["isOptim"])

    def test_multiple_users_multiple_slots(self):
        user_data = [
            {
                "user": {"id": "1", "name": "John"},
                "constraints": [
                    [
                        {"postID": "1", "hourID": "1", "availability": True},
                        {"postID": "1", "hourID": "2", "availability": False}
                    ],
                    [
                        {"postID": "2", "hourID": "1", "availability": True},
                        {"postID": "2", "hourID": "2", "availability": True}
                    ]
                ],
                "totalAssignments": 0
            },
            {
                "user": {"id": "2", "name": "Jane"},
                "constraints": [
                    [
                        {"postID": "1", "hourID": "1", "availability": False},
                        {"postID": "1", "hourID": "2", "availability": True}
                    ],
                    [
                        {"postID": "2", "hourID": "1", "availability": True},
                        {"postID": "2", "hourID": "2", "availability": False}
                    ]
                ],
                "totalAssignments": 0
            }
        ]
        result = generate_mock_solution(user_data)
        expected_result = [
            [
                [True, False],
                [True, True]
            ],
            [
                [False, True],
                [True, False]
            ]
        ]
        self.assertEqual(result["result"], expected_result)
        self.assertTrue(result["isOptim"])

    def test_dimensions(self):
        # Test various dimension combinations
        test_cases = [
            (1, 1, 1),  # Minimal case
            (2, 2, 2),  # Square case
            (3, 2, 4),  # Rectangle case
            (5, 3, 2),  # Larger case
        ]
        
        for users, shifts, time_slots in test_cases:
            # Generate test data
            user_data = []
            for i in range(users):
                constraints = []
                for _ in range(shifts):
                    shift_constraints = []
                    for _ in range(time_slots):
                        shift_constraints.append({
                            "postID": "1",
                            "hourID": "1",
                            "availability": True
                        })
                    constraints.append(shift_constraints)
                user_data.append({
                    "user": {"id": str(i), "name": f"User{i}"},
                    "constraints": constraints,
                    "totalAssignments": 0
                })
            
            result = generate_mock_solution(user_data)
            
            # Check dimensions
            self.assertEqual(len(result["result"]), users)
            if users > 0:
                self.assertEqual(len(result["result"][0]), shifts)
                if shifts > 0:
                    self.assertEqual(len(result["result"][0][0]), time_slots)

if __name__ == '__main__':
    unittest.main() 
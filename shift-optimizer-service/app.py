from flask import Flask, request
from flask_cors import CORS
from modules import shit_opt_service
from pydantic import BaseModel
from typing import List, Optional



app = Flask(__name__)
CORS(app)



@app.route('/')
def index():
    """
    This function returns a string representing a web app with Python Flask.
    """
    return 'Web App with Python Flask!'

class ShiftRequest(BaseModel):
    start_date: str
    end_date: str
    employees: List[str]
    shift_preferences: Optional[dict] = None

class ShiftResponse(BaseModel):
    schedule: dict
    status: str
    message: Optional[str] = None

@app.route('/api/getOptimizedShift', methods=['POST'])
def get_optimized_shift():
    """
    Retrieves the optimized shift based on the provided constraints.

    Returns:
        JSON: The optimized shift as a JSON object.
    """
    print(f'app->get_optimized_Shift->request.json:{request.json}')
    availability_matrix = request.json.get('constraints')
    # print(f'app->get_optimized_shift->availability_matrix: {availability_matrix}')
    optim_result = shit_opt_service.solve_shift_optimization(availability_matrix)

    return optim_result.toJSON()

@app.route('/api/optimizeShift', methods=['POST'])
def optimize_shift():
    try:
        shift_request = ShiftRequest(**request.json)
        # Extract data from request
        employees = shift_request.employees
        start_date = shift_request.start_date
        end_date = shift_request.end_date
        preferences = shift_request.shift_preferences or {}

        # Call optimization service
        optimized_schedule = shit_opt_service.solve_shift_optimization(
            employees=employees,
            start_date=start_date, 
            end_date=end_date,
            preferences=preferences
        )

        if not optimized_schedule:
            raise Exception("Failed to generate optimized schedule")

    except Exception as e:
        return ShiftResponse(
            schedule={},
            status="error",
            message=str(e)
        )
    
    return ShiftResponse(
        schedule=optimized_schedule,
        status="success"
    )

app.run(host='0.0.0.0', port=8190)

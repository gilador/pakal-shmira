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

def get_optimized_shift(shift_request: ShiftRequest) -> ShiftResponse:
    # ... existing optimization logic ...
    
    return ShiftResponse(
        schedule=optimized_schedule,
        status="success"
    )

app.run(host='0.0.0.0', port=8190)

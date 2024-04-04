from flask import Flask, request
from flask_cors import CORS
from modules import shit_opt_service



app = Flask(__name__)
CORS(app)



@app.route('/')
def index():
    """
    This function returns a string representing a web app with Python Flask.
    """
    return 'Web App with Python Flask!'

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

app.run(host='0.0.0.0', port=8190)

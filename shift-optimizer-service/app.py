from flask import Flask, jsonify, request
import json
from modules import shit_opt_service


app = Flask(__name__)


@app.route('/')
def index():
    return 'Web App with Python Flask!'

@app.route('/getOptimizedShift', methods=['POST'])
def get_optimized_Shift():
    print(f'request.json:{request.json}')
    availability_matrix = request.json.get('mat')
    print(f'start2')
    print(f'availability_matrix: {availability_matrix}')
    result = shit_opt_service.solve_shift_optimization(availability_matrix)
    array_as_list = result.tolist()

    # Return the array as JSON in the response
    print(f'result: {result}')
    # return json.dumps(result)
    return jsonify({'array': array_as_list})

    

app.run(host='0.0.0.0', port=81)
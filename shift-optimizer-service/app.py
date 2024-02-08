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
    posts_amount = request.json.get('posts')

    print(f'start2')
    print(f'availability_matrix: {availability_matrix}')
    optim_result = shit_opt_service.solve_shift_optimization(availability_matrix, posts_amount)

    # Return the array as JSON in the response
    print(f'optim_result: {optim_result.toJSON()}')

    return optim_result.toJSON()

    

app.run(host='0.0.0.0', port=81)
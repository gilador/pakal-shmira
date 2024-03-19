from flask import Flask, jsonify, request
import json
from modules import shit_opt_service
from flask_cors import CORS, cross_origin



app = Flask(__name__)
# app.run(host='127.0.0.1', port=8080)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'



@app.route('/')
def index():
    return 'Web App with Python Flask!'

# @app.route('/api/old/getOptimizedShift', methods=['POST'])
# def get_optimized_Shift_old():
#     print(f'request.json:{request.json}')
#     posts_amount = request.json.get('posts')
#     availability_matrix = request.json.get('mat')

#     print(f'start2')
#     print(f'availability_matrix: {availability_matrix}')
#     optim_result = shit_opt_service.solve_shift_optimization(availability_matrix, posts_amount)

#     # Return the array as JSON in the response
#     print(f'optim_result: {optim_result.toJSON()}')

#     return optim_result.toJSON()

@app.route('/api/getOptimizedShift', methods=['POST'])
def get_optimized_shift():
    print(f'app->get_optimized_Shift->request.json:{request.json}')
    availability_matrix = request.json.get('constraints')
    # print(f'app->get_optimized_shift->availability_matrix: {availability_matrix}')
    optim_result = shit_opt_service.solve_shift_optimization(availability_matrix)

    # Return the array as JSON in the response
    # print(f'app->get_optimized_Shift->optim_result: {optim_result.toJSON()}')

    return optim_result.toJSON()

app.run(host='0.0.0.0', port=8190)
# app.run(host='127.0.0.1', port=8190)